from pathlib import Path
from PIL import Image, ImageDraw
import pandas as pd

inventory = pd.read_csv("dataset/reports/mwcd_inventory.csv")
groups = inventory.groupby("sha256")

duplicates = []

for sha256, group in groups:
    if len(group) > 1 and group["category"].nunique() > 1:
        duplicates.append(group)

if not duplicates:
    print("No cross-category duplicates found.")
    raise SystemExit

records = pd.concat(duplicates)

cols = 3
cell_w, cell_h = 350, 300
rows = (len(records) + cols - 1) // cols

sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), "white")
draw = ImageDraw.Draw(sheet)

for i, (_, row) in enumerate(records.iterrows()):
    path = Path(row["image_path"])

    with Image.open(path) as img:
        img = img.convert("RGB")
        img.thumbnail((320, 235))

    x = (i % cols) * cell_w
    y = (i // cols) * cell_h

    sheet.paste(img, (x + (cell_w - img.width) // 2, y + 30))
    draw.text((x + 10, y + 8), f"Category: {row['category']}", fill="black")
    draw.text((x + 10, y + 270), path.name[:45], fill="black")

output = Path("dataset/reports/cross_category_review.jpg")
sheet.save(output, quality=95)

print(f"Images inspected: {len(records)}")
print(f"Contact sheet saved: {output}")
