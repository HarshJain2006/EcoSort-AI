from pathlib import Path
from PIL import Image
import pandas as pd
import imagehash

MANIFEST = Path("dataset/reports/mwcd_clean_candidate.csv")
OUTPUT = Path("dataset/reports/mwcd_perceptual_hashes.csv")

df = pd.read_csv(MANIFEST)
records = []

print(f"Calculating perceptual hashes for {len(df)} images...")

for index, row in df.iterrows():
    path = Path(row["image_path"])

    try:
        with Image.open(path) as img:
            phash = imagehash.phash(img.convert("RGB"))

        records.append({
            "image_path": row["image_path"],
            "category": row["category"],
            "phash": str(phash),
            "phash_int": int(str(phash), 16)
        })

    except Exception as error:
        print(f"Error: {path} | {error}")

    if (index + 1) % 2000 == 0:
        print(f"Processed: {index + 1}/{len(df)}")

result = pd.DataFrame(records)
result.to_csv(OUTPUT, index=False)

print("\n========== pHASH SUMMARY ==========")
print("Images processed:", len(result))
print("Errors:", len(df) - len(result))
print("Report saved:", OUTPUT)
