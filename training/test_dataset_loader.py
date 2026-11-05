
from src.dataset.waste_dataset import WasteDataset, MATERIAL_CLASSES

for split in ["train", "validation", "test"]:

    dataset = WasteDataset(split=split)

    image, label = dataset[0]

    print(f"\nSplit: {split}")
    print("Dataset size:", len(dataset))
    print("Image shape:", image.shape)
    print("Label:", label.item())
    print("Material:", MATERIAL_CLASSES[label.item()])
    print("Image dtype:", image.dtype)
