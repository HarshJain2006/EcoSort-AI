
import torch
import torch.nn as nn

from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

from src.dataset.waste_dataset import MATERIAL_CLASSES


class WasteClassifier(nn.Module):

    def __init__(self, pretrained=True):
        super().__init__()

        weights = (
            MobileNet_V3_Small_Weights.DEFAULT
            if pretrained
            else None
        )

        self.backbone = mobilenet_v3_small(weights=weights)

        in_features = self.backbone.classifier[3].in_features

        self.backbone.classifier[3] = nn.Linear(
            in_features,
            len(MATERIAL_CLASSES)
        )

    def forward(self, x):
        return self.backbone(x)
