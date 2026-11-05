from pathlib import Path
from PIL import Image, ImageDraw
import pandas as pd

df = pd.read_csv("dataset/reports/mwcd_perceptual_candidates.csv")

matches = df[
    (df["cross_category"] == True) &
    (df["hamming_distance"] <= 2)
].sort_values("hamming_distance")

if matches.empty:
    print("No matches found at distance <= 2")
    raise SystemExit

cell_w, cell_h = 620, 260
rows = len(matches)

sheet = Image.new("RGB", (cell_w, rows * cell_h), "white")
draw = ImageDraw.Draw(sheet)

for i, row in enumerate(matches.itertuples()):
    y = i * cell_h

    draw.text(
        (10, y + 5),
        f"Pair {i+1} | Distance: {row.hamming_distance}",
        fill="black"
    )

    for j, (path, category) in enumerate([
        (row.image_a, row.category_a),
        (row.image_b, row.category_b)
    ]):
        with Image.open(path) as im:
            im = im.convert("RGB")
            im.thumbnail((285, 195))

        x = j * 310 + 10
        sheet.paste(im, (x, y + 35))

        draw.text(
            (x, y + 235),
            f"{category}: {Path(path).name[:25]}",
            fill="black"
        )

output = Path("dataset/reports/strong_cross_category_review.jpg")
sheet.save(output, quality=95)

print("Pairs inspected:", len(matches))
print("Contact sheet:", output)
