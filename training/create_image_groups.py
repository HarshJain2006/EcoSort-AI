from pathlib import Path
import pandas as pd

MANIFEST = Path("dataset/reports/mwcd_clean_candidate.csv")
PAIRS = Path("dataset/reports/mwcd_perceptual_candidates.csv")

df = pd.read_csv(MANIFEST)
pairs = pd.read_csv(PAIRS)

parent = {}
rank = {}

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]

def union(a, b):
    ra, rb = find(a), find(b)

    if ra == rb:
        return

    if rank[ra] < rank[rb]:
        ra, rb = rb, ra

    parent[rb] = ra

    if rank[ra] == rank[rb]:
        rank[ra] += 1

# Initialize every image as an individual group
for path in df["image_path"]:
    parent[path] = path
    rank[path] = 0

# Group only strong same-category matches
strong = pairs[
    (pairs["cross_category"] == False) &
    (pairs["hamming_distance"] <= 2)
]

for row in strong.itertuples():
    union(row.image_a, row.image_b)

# Assign deterministic group IDs
components = {}

for path in df["image_path"]:
    root = find(path)
    components.setdefault(root, []).append(path)

sorted_groups = sorted(
    components.values(),
    key=lambda paths: min(paths)
)

group_ids = {}

for number, paths in enumerate(sorted_groups, start=1):
    group_id = f"group_{number:05d}"

    for path in paths:
        group_ids[path] = group_id

df["group_id"] = df["image_path"].map(group_ids)

# Save grouped manifest
output = Path("dataset/reports/mwcd_grouped_manifest.csv")
df.to_csv(output, index=False)

# Group statistics
stats = (
    df.groupby(["category", "group_id"])
    .size()
    .reset_index(name="images_in_group")
)

stats.to_csv(
    "dataset/reports/mwcd_group_statistics.csv",
    index=False
)

print("\n========== GROUPING SUMMARY ==========")
print("Total images:", len(df))
print("Strong candidate pairs:", len(strong))
print("Total groups:", len(components))
print("Groups containing multiple images:",
      sum(len(v) > 1 for v in components.values()))
print("Largest group size:",
      max(len(v) for v in components.values()))

print("\nImages grouped by category:")
print(
    df[df.groupby("group_id")["group_id"].transform("size") > 1]
    .groupby("category").size().to_string()
)

print("\nReports saved:")
print(output)
print("dataset/reports/mwcd_group_statistics.csv")
