
import random
import numpy as np
import torch
import torch.nn as nn

from torch.utils.data import DataLoader

from src.training.config import (
    BATCH_SIZE,
    BEST_MODEL_PATH,
    CHECKPOINT_DIR,
    DEVICE,
    EPOCHS,
    LEARNING_RATE,
    MANIFEST_PATH,
    NUM_THREADS,
    NUM_WORKERS,
    RANDOM_SEED,
    WEIGHT_DECAY,
)

from src.dataset.waste_dataset import (
    WasteDataset,
    MATERIAL_CLASSES,
)

from src.models import WasteClassifier


# --------------------------------------------------
# 1. Reproducibility
# --------------------------------------------------

def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


# --------------------------------------------------
# 2. Class Weight Calculation
# --------------------------------------------------

def calculate_class_weights(dataset):

    counts = (
        dataset.data["category"]
        .value_counts()
        .reindex(MATERIAL_CLASSES, fill_value=0)
    )

    if (counts == 0).any():
        raise ValueError("A class has no training images.")

    # Square-root inverse frequency correction
    weights = 1.0 / np.sqrt(
        counts.to_numpy(dtype=np.float64)
    )

    weights = weights / weights.mean()

    return torch.tensor(
        weights,
        dtype=torch.float32
    )


# --------------------------------------------------
# 3. Dataset and DataLoader
# --------------------------------------------------

def create_loaders():

    train_dataset = WasteDataset(
        "train",
        manifest_path=MANIFEST_PATH
    )

    val_dataset = WasteDataset(
        "validation",
        manifest_path=MANIFEST_PATH
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=False,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=False,
    )

    return train_dataset, train_loader, val_loader


# --------------------------------------------------
# 4. Training for One Epoch
# --------------------------------------------------

def train_one_epoch(model, loader, criterion, optimizer):

    model.train()

    # Keep frozen feature extractor in evaluation mode
    model.backbone.features.eval()

    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        total_loss += loss.item() * labels.size(0)

        predictions = outputs.argmax(dim=1)

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    average_loss = total_loss / total
    accuracy = correct / total

    return average_loss, accuracy


# --------------------------------------------------
# 5. Validation and Macro-F1
# --------------------------------------------------

@torch.no_grad()
def validate(model, loader, criterion):

    model.eval()

    total_loss = 0.0
    correct = 0
    total = 0

    num_classes = len(MATERIAL_CLASSES)

    confusion = torch.zeros(
        num_classes,
        num_classes,
        dtype=torch.int64
    )

    for images, labels in loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(outputs, labels)

        predictions = outputs.argmax(dim=1)

        total_loss += loss.item() * labels.size(0)

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

        # Update confusion matrix
        indices = (
            labels * num_classes + predictions
        )

        confusion += torch.bincount(
            indices.cpu(),
            minlength=num_classes * num_classes
        ).reshape(
            num_classes,
            num_classes
        )

    # Calculate per-class precision and recall
    true_positive = confusion.diag().float()

    precision_denominator = (
        confusion.sum(dim=0).float()
    )

    recall_denominator = (
        confusion.sum(dim=1).float()
    )

    precision = (
        true_positive /
        precision_denominator.clamp(min=1)
    )

    recall = (
        true_positive /
        recall_denominator.clamp(min=1)
    )

    # Calculate per-class F1
    f1 = (
        2 * precision * recall /
        (precision + recall).clamp(min=1e-8)
    )

    # Macro-F1: average F1 across all nine classes
    macro_f1 = f1.mean().item()

    average_loss = total_loss / total
    accuracy = correct / total

    return average_loss, accuracy, macro_f1


# --------------------------------------------------
# 6. Main Training Function
# --------------------------------------------------

def main():

    set_seed(RANDOM_SEED)

    torch.set_num_threads(NUM_THREADS)

    CHECKPOINT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print("=" * 55)
    print("          WASTE CLASSIFIER TRAINING")
    print("=" * 55)

    # Load datasets
    print("\nLoading datasets...")

    train_dataset, train_loader, val_loader = create_loaders()

    print(f"Training images: {len(train_dataset)}")
    print(f"Validation images: {len(val_loader.dataset)}")

    print(f"Number of classes: {len(MATERIAL_CLASSES)}")
    print(f"Classes: {MATERIAL_CLASSES}")

    # Calculate class weights
    class_weights = calculate_class_weights(
        train_dataset
    ).to(DEVICE)

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )

    # Load pretrained model
    print("\nLoading pretrained MobileNetV3-Small...")

    model = WasteClassifier(
        pretrained=True
    ).to(DEVICE)

    # Freeze all parameters
    for parameter in model.parameters():
        parameter.requires_grad = False

    # Unfreeze final classification layer
    for parameter in model.backbone.classifier[3].parameters():
        parameter.requires_grad = True

    trainable_parameters = [
        parameter
        for parameter in model.parameters()
        if parameter.requires_grad
    ]

    # Optimizer
    optimizer = torch.optim.AdamW(
        trainable_parameters,
        lr=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,
    )

    total_trainable = sum(
        parameter.numel()
        for parameter in trainable_parameters
    )

    print("\nModel ready.")

    print(f"Device: {DEVICE}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Epochs: {EPOCHS}")

    print(
        f"Trainable parameters: {total_trainable:,}"
    )

    # Track best validation macro-F1
    best_val_macro_f1 = -1.0

    # --------------------------------------------------
    # Training Loop
    # --------------------------------------------------

    for epoch in range(EPOCHS):

        print("\n" + "=" * 55)
        print(f"EPOCH {epoch + 1}/{EPOCHS}")
        print("=" * 55)

        train_loss, train_accuracy = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer
        )

        val_loss, val_accuracy, val_macro_f1 = validate(
            model,
            val_loader,
            criterion
        )

        # Display metrics
        print("\nTraining Results:")

        print(f"Train Loss: {train_loss:.4f}")

        print(
            f"Train Accuracy: {train_accuracy * 100:.2f}%"
        )

        print("\nValidation Results:")

        print(f"Validation Loss: {val_loss:.4f}")

        print(
            f"Validation Accuracy: {val_accuracy * 100:.2f}%"
        )

        print(
            f"Validation Macro-F1: {val_macro_f1 * 100:.2f}%"
        )

        # Save best model using macro-F1
        if val_macro_f1 > best_val_macro_f1:

            best_val_macro_f1 = val_macro_f1

            checkpoint = {
                "epoch": epoch + 1,
                "model_state_dict": model.state_dict(),
                "class_names": MATERIAL_CLASSES,
                "validation_accuracy": val_accuracy,
                "validation_macro_f1": val_macro_f1,
                "image_size": 224,
                "architecture": "MobileNetV3-Small",
                "optimizer": "AdamW",
            }

            torch.save(
                checkpoint,
                BEST_MODEL_PATH
            )

            print("\nBest checkpoint saved!")

            print(f"Path: {BEST_MODEL_PATH}")

    # --------------------------------------------------
    # Training Summary
    # --------------------------------------------------

    print("\n" + "=" * 55)
    print("             TRAINING COMPLETED")
    print("=" * 55)

    print(
        f"Best Validation Macro-F1: "
        f"{best_val_macro_f1 * 100:.2f}%"
    )

    print(f"Best model: {BEST_MODEL_PATH}")

    print("\nNext step: Evaluate the model on the test dataset.")


# --------------------------------------------------
# 7. Entry Point
# --------------------------------------------------

if __name__ == "__main__":
    main()
