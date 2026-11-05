import torch
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights
)

print("Loading pretrained MobileNetV3-Small...")

weights = MobileNet_V3_Small_Weights.DEFAULT
model = mobilenet_v3_small(weights=weights)

model.eval()

print("\nPretrained model loaded successfully!")
print("Model: MobileNetV3-Small")
print("Weights:", weights)
print("Number of classes:", len(weights.meta["categories"]))
print("First 5 classes:", weights.meta["categories"][:5])