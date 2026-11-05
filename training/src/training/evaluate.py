
import torch
import pandas as pd
from torch.utils.data import DataLoader

from src.training.config import (
    BEST_MODEL_PATH,
    DEVICE,
    MANIFEST_PATH,
    NUM_THREADS,
    NUM_WORKERS,
    BATCH_SIZE,
)

from src.dataset.waste_dataset import (
    WasteDataset,
    MATERIAL_CLASSES,
)

from src.models import WasteClassifier


def main():

    torch.set_num_threads(NUM_THREADS)

    print("=" * 55)
    print("          WASTE CLASSIFIER TEST EVALUATION")
    print("=" * 55)

    # Load untouched test dataset
    print("\nLoading test dataset...")

    test_dataset = WasteDataset(
        "test",
        manifest_path=MANIFEST_PATH
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=False,
    )

    print(f"Test images: {len(test_dataset)}")

    # Load trained model
    print("\nLoading best checkpoint...")

    model = WasteClassifier(pretrained=False).to(DEVICE)

    checkpoint = torch.load(
        BEST_MODEL_PATH,
        map_location=DEVICE,
        weights_only=False
    )

    if checkpoint["class_names"] != MATERIAL_CLASSES:
        raise ValueError("Checkpoint class order does not match dataset.")

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    print(f"Checkpoint epoch: {checkpoint['epoch']}")
    print("Model loaded successfully.")

    # Evaluate
    num_classes = len(MATERIAL_CLASSES)

    confusion = torch.zeros(
        num_classes,
        num_classes,
        dtype=torch.int64
    )

    correct = 0
    total = 0

    print("\nRunning test inference...")

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)
            predictions = outputs.argmax(dim=1)

            correct += (predictions == labels).sum().item()
            total += labels.size(0)

            indices = labels * num_classes + predictions

            confusion += torch.bincount(
                indices.cpu(),
                minlength=num_classes * num_classes
            ).reshape(num_classes, num_classes)

    # Overall accuracy
    accuracy = correct / total

    # Per-class metrics
    true_positive = confusion.diag().float()

    predicted_count = confusion.sum(dim=0).float()
    actual_count = confusion.sum(dim=1).float()

    precision = (
        true_positive / predicted_count.clamp(min=1)
    )

    recall = (
        true_positive / actual_count.clamp(min=1)
    )

    f1 = (
        2 * precision * recall /
        (precision + recall).clamp(min=1e-8)
    )

    macro_precision = precision.mean().item()
    macro_recall = recall.mean().item()
    macro_f1 = f1.mean().item()

    # Display results
    print("\n" + "=" * 55)
    print("               TEST RESULTS")
    print("=" * 55)

    print(f"Test images: {total}")
    print(f"Test accuracy: {accuracy * 100:.2f}%")
    print(f"Macro precision: {macro_precision * 100:.2f}%")
    print(f"Macro recall: {macro_recall * 100:.2f}%")
    print(f"Macro F1-score: {macro_f1 * 100:.2f}%")

    print("\nPER-CLASS PERFORMANCE")
    print("-" * 75)

    print(
        f"{'Category':<12}"
        f"{'Precision':>13}"
        f"{'Recall':>13}"
        f"{'F1-score':>13}"
        f"{'Samples':>12}"
    )

    rows = []

    for i, category in enumerate(MATERIAL_CLASSES):

        samples = int(actual_count[i].item())

        p = precision[i].item()
        r = recall[i].item()
        score = f1[i].item()

        print(
            f"{category:<12}"
            f"{p * 100:>12.2f}%"
            f"{r * 100:>12.2f}%"
            f"{score * 100:>12.2f}%"
            f"{samples:>12}"
        )

        rows.append({
            "category": category,
            "precision": p,
            "recall": r,
            "f1_score": score,
            "samples": samples,
        })

    # Save evaluation reports
    report = pd.DataFrame(rows)

    report_path = (
        BEST_MODEL_PATH.parent / "test_classification_report.csv"
    )

    report.to_csv(report_path, index=False)

    confusion_path = (
        BEST_MODEL_PATH.parent / "test_confusion_matrix.csv"
    )

    pd.DataFrame(
        confusion.numpy(),
        index=MATERIAL_CLASSES,
        columns=MATERIAL_CLASSES
    ).to_csv(confusion_path)

    print("\nConfusion matrix:")
    print(confusion.numpy())

    print(f"\nClassification report saved: {report_path}")
    print(f"Confusion matrix saved: {confusion_path}")

    print("\nTEST EVALUATION COMPLETED.")


if __name__ == "__main__":
    main()
