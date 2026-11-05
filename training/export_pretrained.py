import torch
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights
)

from executorch.exir import to_edge_transform_and_lower
from executorch.backends.xnnpack.partition.xnnpack_partitioner import (
    XnnpackPartitioner
)

print("Loading pretrained MobileNetV3-Small...")

weights = MobileNet_V3_Small_Weights.DEFAULT
model = mobilenet_v3_small(weights=weights)
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

output_file = "mobilenet_pretrained.pte"

with open(output_file, "wb") as f:
    f.write(executorch_program.buffer)

import os

size_mb = os.path.getsize(output_file) / (1024 * 1024)

print("\nExport successful!")
print("Model:", output_file)
print(f"Model size: {size_mb:.2f} MB")