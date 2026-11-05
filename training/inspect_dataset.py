
from pathlib import Path
from PIL import Image
import pandas as pd

# Dataset image directory
IMAGE_DIR = Path("dataset/images")
REPORT_DIR = Path("dataset/reports")

REPORT_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

records = []
corrupted = []

image_files = [
    path for path in IMAGE_DIR.rglob("*")
    if path.is_file() and path.suffix.lower() in SUPPORTED_FORMATS
]

print(f"Images found: {len(image_files)}")

for image_path in image_files:
    try:
        with Image.open(image_path) as img:
            img.verify()

        # Reopen after verify to read dimensions
        with Image.open(image_path) as img:
            records.append({
                "filename": image_path.name,
                "path": str(image_path),
                "format": img.format,
                "width": img.width,
                "height": img.height,
                "mode": img.mode,
                "file_size_kb": round(
                    image_path.stat().st_size / 1024, 2
                )
            })

    except Exception as error:
        corrupted.append({
            "filename": image_path.name,
            "error": str(error)
        })

# Save image report
df = pd.DataFrame(records)
report_path = REPORT_DIR / "image_report.csv"
df.to_csv(report_path, index=False)

print("\n========== DATASET REPORT ==========")
print(f"Total images: {len(image_files)}")
print(f"Valid images: {len(records)}")
print(f"Corrupted images: {len(corrupted)}")

if not df.empty:
    print("\nImage formats:")
    print(df["format"].value_counts())

    print("\nImage dimensions:")
    print(df[["width", "height"]].describe())

if corrupted:
    pd.DataFrame(corrupted).to_csv(
        REPORT_DIR / "corrupted_images.csv",
        index=False
    )

print(f"\nReport saved to: {report_path}")
print("Inspection completed.")
