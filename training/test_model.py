
import torch

from src.models import WasteClassifier
from src.dataset.waste_dataset import MATERIAL_CLASSES

model = WasteClassifier(pretrained=False)

dummy_input = torch.randn(1, 3, 224, 224)

with torch.no_grad():
    output = model(dummy_input)

print("Model initialized successfully!")
print("Input shape:", dummy_input.shape)
print("Output shape:", output.shape)
print("Number of material classes:", len(MATERIAL_CLASSES))
print("Material classes:", MATERIAL_CLASSES)
print("Total parameters:", sum(p.numel() for p in model.parameters()))
