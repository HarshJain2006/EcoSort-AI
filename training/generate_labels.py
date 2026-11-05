from torchvision.models import MobileNet_V3_Small_Weights

weights = MobileNet_V3_Small_Weights.DEFAULT
categories = weights.meta["categories"]

with open("imagenet_classes.txt", "w", encoding="utf-8") as f:
    for category in categories:
        f.write(category + "\n")

print("ImageNet labels generated successfully!")
print("Total classes:", len(categories))
print("Class 208:", categories[208])