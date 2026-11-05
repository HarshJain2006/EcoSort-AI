
import torch
from torchvision.models import mobilenet_v3_small

from executorch.exir import to_edge_transform_and_lower
from executorch.backends.xnnpack.partition.xnnpack_partitioner import (
    XnnpackPartitioner,
)

print("Creating MobileNetV3-Small...")

model = mobilenet_v3_small(weights=None)
model.eval()

print("Preparing sample input...")

sample_input = (torch.randn(1, 3, 224, 224),)

print("Exporting PyTorch model...")

exported_program = torch.export.export(
    model,
    sample_input
)

print("Converting to ExecuTorch with XNNPACK...")

executorch_program = to_edge_transform_and_lower(
    exported_program,
    partitioner=[XnnpackPartitioner()],
).to_executorch()

output_file = "mobilenet_smoke_test.pte"

with open(output_file, "wb") as f:
    f.write(executorch_program.buffer)

print("\nSUCCESS!")
print("Model:", output_file)
print("Model size:", round(
    __import__("os").path.getsize(output_file) / (1024 * 1024), 2
), "MB")
