import pandas as pd

df = pd.read_csv("dataset/reports/mwcd_inventory.csv")

unique_images = df.drop_duplicates(subset="sha256", keep="first")

cross = df.groupby("sha256")["category"].nunique()
conflicting_hashes = set(cross[cross > 1].index)

clean = unique_images[
    ~unique_images["sha256"].isin(conflicting_hashes)
].copy()

clean.to_csv(
    "dataset/reports/mwcd_clean_candidate.csv",
    index=False
)

print("\n========== CLEAN DATASET ESTIMATE ==========")
print("Original images:", len(df))
print("Unique exact images:", len(unique_images))
print("Conflicting unique images:", len(conflicting_hashes))
print("Estimated usable images:", len(clean))

print("\nUsable images by category:")
print(clean.groupby("category").size().to_string())

print("\nManifest saved:")
print("dataset/reports/mwcd_clean_candidate.csv")
