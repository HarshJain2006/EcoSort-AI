
from pathlib import Path
import pandas as pd

IMAGE_DIR = Path("dataset/images")
LABEL_FILE = Path("dataset/annotations/labels.csv")

REQUIRED_COLUMNS = [
    "image_path",
    "recyclable",
    "biodegradable"
]

print("========== DATASET VALIDATION ==========")

# Check annotation file
if not LABEL_FILE.exists():
    print("ERROR: labels.csv not found!")
    raise SystemExit(1)

df = pd.read_csv(LABEL_FILE)

# Check required columns
missing_columns = [
    col for col in REQUIRED_COLUMNS
    if col not in df.columns
]

if missing_columns:
    print("ERROR: Missing columns:", missing_columns)
    raise SystemExit(1)

errors = []

# Check empty values
if df[REQUIRED_COLUMNS].isnull().any().any():
    errors.append("Some annotation fields are empty.")

# Check valid binary labels
for column in ["recyclable", "biodegradable"]:
    valid = df[column].isin([0, 1])
    if not valid.all():
        errors.append(f"Invalid values found in {column}.")

# Check duplicate annotation paths
if df["image_path"].duplicated().any():
    errors.append("Duplicate image annotations found.")

# Check referenced image files
for image_path in df["image_path"].dropna():
    full_path = Path(image_path)

    if not full_path.is_absolute():
        full_path = Path(".") / full_path

    if not full_path.exists():
        errors.append(f"Image not found: {image_path}")

# Check images without annotations
supported = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

all_images = {
    str(path).replace("\\", "/")
    for path in IMAGE_DIR.rglob("*")
    if path.is_file() and path.suffix.lower() in supported
}

labelled_images = {
    str(path).replace("\\", "/")
    for path in df["image_path"].dropna()
}

unlabelled = all_images - labelled_images

print(f"Total annotations: {len(df)}")
print(f"Images found: {len(all_images)}")
print(f"Images without annotations: {len(unlabelled)}")

if unlabelled:
    print("\nUnlabelled images:")
    for image in sorted(unlabelled):
        print("-", image)

if errors:
    print("\nVALIDATION ERRORS:")
    for error in errors:
        print("-", error)
    print("\nDataset validation FAILED.")
else:
    print("\nDataset validation PASSED.")

