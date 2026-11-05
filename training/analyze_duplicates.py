import pandas as pd
from pathlib import Path

inventory = pd.read_csv("dataset/reports/mwcd_inventory.csv")

groups = inventory.groupby("sha256")

cross_category = []
same_category = []

for sha256, group in groups:
    if len(group) <= 1:
        continue

    categories = sorted(group["category"].unique())

    record = {
        "sha256": sha256,
        "duplicate_count": len(group),
        "categories": ", ".join(categories),
        "image_paths": " | ".join(group["image_path"])
    }

    if len(categories) > 1:
        cross_category.append(record)
    else:
        same_category.append(record)

cross_df = pd.DataFrame(cross_category)
same_df = pd.DataFrame(same_category)

cross_df.to_csv(
    "dataset/reports/cross_category_duplicates.csv",
    index=False
)

same_df.to_csv(
    "dataset/reports/same_category_duplicates.csv",
    index=False
)

print("\n========== DUPLICATE ANALYSIS ==========")
print("Total duplicate groups:", len(cross_category) + len(same_category))
print("Same-category duplicate groups:", len(same_category))
print("Cross-category duplicate groups:", len(cross_category))

if not cross_df.empty:
    print("\nCross-category duplicate examples:")
    print(cross_df[["duplicate_count", "categories"]].head(20).to_string(index=False))

print("\nReports saved:")
print("dataset/reports/cross_category_duplicates.csv")
print("dataset/reports/same_category_duplicates.csv")
