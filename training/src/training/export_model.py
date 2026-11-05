
import torch

from executorch.exir import to_edge_transform_and_lower
from executorch.backends.xnnpack.partition.xnnpack_partitioner import (
    XnnpackPartitioner,
)

from src.models import WasteClassifier
from src.training.config import (
    BEST_MODEL_PATH,
    DEVICE,
)

# Output paths
EXPORT_DIR = BEST_MODEL_PATH.parent
OUTPUT_PATH = EXPORT_DIR / "mobilenet_waste.pte"

IMAGE_SIZE = 224


def main():

    print("=" * 55)
    print("       WASTE CLASSIFIER - EXECUTORCH EXPORT")
    print("=" * 55)

    # Load checkpoint
    print("\nLoading trained checkpoint...")

    checkpoint = torch.load(
        BEST_MODEL_PATH,
        map_location=DEVICE,
        weights_only=False,
    )

    class_names = checkpoint["class_names"]

    # Recreate model architecture
    model = WasteClassifier(pretrained=False)

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.eval()

    print("Checkpoint loaded.")
    print("Classes:", class_names)

    # Prepare example input
    example_input = torch.randn(
        1, 3, IMAGE_SIZE, IMAGE_SIZE
    )

    # Export model using torch.export
    print("\nExporting PyTorch model...")

    exported_program = torch.export.export(
        model,
        (example_input,),
    )

    print("PyTorch export successful.")

    # Lower to ExecuTorch with XNNPACK
    print("\nLowering model to ExecuTorch + XNNPACK...")

    edge_program = to_edge_transform_and_lower(
        exported_program,
        partitioner=[XnnpackPartitioner()],
    )

    executorch_program = edge_program.to_executorch()

    # Write PTE file
    print("\nSaving ExecuTorch model...")

    with open(OUTPUT_PATH, "wb") as file:
        file.write(executorch_program.buffer)

    # Report
    size_mb = OUTPUT_PATH.stat().st_size / (1024 * 1024)

    print("\n" + "=" * 55)
    print("             EXPORT COMPLETED")
    print("=" * 55)

    print(f"Model file: {OUTPUT_PATH}")
    print(f"Model size: {size_mb:.2f} MB")
    print(f"Architecture: MobileNetV3-Small")
    print(f"Number of classes: {len(class_names)}")
    print(f"Checkpoint epoch: {checkpoint['epoch']}")
    print(
        f"Validation accuracy: "
        f"{checkpoint['validation_accuracy'] * 100:.2f}%"
    )
    print(
        f"Validation macro-F1: "
        f"{checkpoint['validation_macro_f1'] * 100:.2f}%"
    )

    print("\nClass mapping:")

    for index, name in enumerate(class_names):
        print(f"{index}: {name}")

    print("\nNext: transfer the PTE model to Raspberry Pi.")


if __name__ == "__main__":
    main()
