from pathlib import Path
from PIL import Image
import hashlib
import pandas as pd

ROOT = Path("dataset/mwcd/final_merged_dataset")
REPORTS = Path("dataset/reports")
REPORTS.mkdir(parents=True, exist_ok=True)

EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

records = []
hash_groups = {}

print("Starting dataset inventory...")
print("Scanning images. This may take a few minutes.")

for category_dir in sorted(ROOT.iterdir()):
    if not category_dir.is_dir():
        continue

    category = category_dir.name

    for path in category_dir.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue

        try:
            sha256 = hashlib.sha256(path.read_bytes()).hexdigest()

            with Image.open(path) as img:
                width, height = img.size
                image_format = img.format
                mode = img.mode

            record = {
                "image_path": path.as_posix(),
                "category": category,
                "filename": path.name,
                "width": width,
                "height": height,
                "format": image_format,
                "mode": mode,
                "size_bytes": path.stat().st_size,
                "sha256": sha256,
            }

            records.append(record)
            hash_groups.setdefault(sha256, []).append(path.as_posix())

        except Exception as error:
            print(f"Could not inspect: {path} | {error}")

df = pd.DataFrame(records)

inventory_path = REPORTS / "mwcd_inventory.csv"
df.to_csv(inventory_path, index=False)

duplicates = []

for sha256, paths in hash_groups.items():
    if len(paths) > 1:
        duplicates.append({
            "sha256": sha256,
            "duplicate_count": len(paths),
            "image_paths": " | ".join(paths),
        })

duplicate_df = pd.DataFrame(
    duplicates,
    columns=["sha256", "duplicate_count", "image_paths"]
)

duplicate_path = REPORTS / "mwcd_exact_duplicates.csv"
duplicate_df.to_csv(duplicate_path, index=False)

print("\n========== INVENTORY SUMMARY ==========")
print(f"Total images scanned: {len(df)}")
print(f"Unique image hashes: {df['sha256'].nunique()}")
print(f"Duplicate groups: {len(duplicate_df)}")
print(f"Images involved in duplicate groups: {sum(len(v) for v in hash_groups.values() if len(v) > 1)}")

print("\nImages by category:")
print(df.groupby("category").size().to_string())

print("\nReports saved:")
print(inventory_path)
print(duplicate_path)
