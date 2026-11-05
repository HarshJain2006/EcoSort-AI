from pathlib import Path
from PIL import Image, ImageDraw
import random

random.seed(42)

root = Path("dataset/mwcd/final_merged_dataset")
output = Path("dataset/reports/mwcd_sample_grid.jpg")
output.parent.mkdir(parents=True, exist_ok=True)

categories = sorted(p for p in root.iterdir() if p.is_dir())

cols = 4
rows = 9
cell_w, cell_h = 240, 210

sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), "white")
draw = ImageDraw.Draw(sheet)

for index, category in enumerate(categories):
    images = [
        p for p in category.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    ]

    samples = random.sample(images, min(4, len(images)))

    for j, path in enumerate(samples):
        with Image.open(path) as im:
            im = im.convert("RGB")
            im.thumbnail((220, 165))

        x = j * cell_w + (cell_w - im.width) // 2
        y = index * cell_h + 30

        sheet.paste(im, (x, y))
        draw.text((j * cell_w + 8, index * cell_h + 8),
                  category.name, fill="black")
        draw.text((j * cell_w + 8, index * cell_h + 190),
                  path.name[:30], fill="black")

sheet.save(output, quality=90)
print(f"Contact sheet saved: {output}")
