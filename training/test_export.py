import torch

from executorch.exir import to_edge_transform_and_lower
from executorch.backends.xnnpack.partition.xnnpack_partitioner import (
    XnnpackPartitioner,
)

# A simple test model
class Add(torch.nn.Module):
    def forward(self, x, y):
        return x + y

# Prepare model and sample inputs
model = Add().eval()

sample_inputs = (
    torch.ones(1),
    torch.ones(1),
)

# Export the PyTorch model
exported_program = torch.export.export(
    model,
    sample_inputs
)

# Lower to ExecuTorch using XNNPACK
executorch_program = to_edge_transform_and_lower(
    exported_program,
    partitioner=[XnnpackPartitioner()],
).to_executorch()

# Save the model
with open("add.pte", "wb") as f:
    f.write(executorch_program.buffer)

print("Export successful!")
print("Model saved as add.pte")