from pathlib import Path
from PIL import Image, ImageDraw
import pandas as pd

df = pd.read_csv("dataset/reports/mwcd_perceptual_candidates.csv")

matches = df[
    (df["cross_category"] == False) &
    (df["hamming_distance"] <= 2)
].copy()

selected = (
    matches.groupby("category_a", group_keys=False)
    .head(3)
    .reset_index(drop=True)
)
cell_w, cell_h = 620, 260

sheet = Image.new(
    "RGB",
    (cell_w, len(selected) * cell_h),
    "white"
)

draw = ImageDraw.Draw(sheet)

for i, row in enumerate(selected.itertuples()):
    y = i * cell_h

    draw.text(
        (10, y + 5),
        f"Pair {i+1} | {row.category_a} | Distance: {row.hamming_distance}",
        fill="black"
    )

    for j, path in enumerate([row.image_a, row.image_b]):
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((285, 195))

        x = j * 310 + 10
        sheet.paste(img, (x, y + 35))

        draw.text(
            (x, y + 235),
            Path(path).name[:35],
            fill="black"
        )

output = Path("dataset/reports/same_category_review.jpg")
sheet.save(output, quality=95)

print("Pairs selected:", len(selected))
print("Categories:", selected["category_a"].nunique())
print("Saved:", output)
