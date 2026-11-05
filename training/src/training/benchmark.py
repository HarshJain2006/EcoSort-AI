
import time
import torch
import torch.nn as nn

from src.training.config import *
from src.training.train import create_loaders, calculate_class_weights
from src.models import WasteClassifier

def main():
    torch.set_num_threads(NUM_THREADS)

    dataset, loader, _ = create_loaders()

    print("Loading pretrained model...")
    model = WasteClassifier(pretrained=True)

    for p in model.parameters():
        p.requires_grad = False

    for p in model.backbone.classifier[3].parameters():
        p.requires_grad = True

    model.train()
    model.backbone.features.eval()

    criterion = nn.CrossEntropyLoss(
        weight=calculate_class_weights(dataset)
    )

    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad],
        lr=LEARNING_RATE,
    )

    total_batches = len(loader)
    benchmark_batches = min(20, total_batches)

    print(f"Benchmarking {benchmark_batches} batches...")

    start = time.perf_counter()

    for i, (images, labels) in enumerate(loader):
        if i >= benchmark_batches:
            break

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        print(f"Completed batch {i + 1}/{benchmark_batches}")

    elapsed = time.perf_counter() - start

    seconds_per_batch = elapsed / benchmark_batches
    estimated_epoch = seconds_per_batch * total_batches

    print("\n--- Benchmark Results ---")
    print(f"Time for {benchmark_batches} batches: {elapsed:.2f} seconds")
    print(f"Average time per batch: {seconds_per_batch:.2f} seconds")
    print(f"Batches per epoch: {total_batches}")
    print(f"Estimated time per epoch: {estimated_epoch / 60:.1f} minutes")
    print(f"Estimated time for {EPOCHS} epochs: {estimated_epoch * EPOCHS / 60:.1f} minutes")

if __name__ == "__main__":
    main()
