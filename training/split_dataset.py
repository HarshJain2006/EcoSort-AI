from pathlib import Path
import pandas as pd
import random

SEED = 42

INPUT = Path("dataset/reports/mwcd_grouped_manifest.csv")
OUTPUT = Path("dataset/splits/mwcd_splits.csv")

df = pd.read_csv(INPUT)
rng = random.Random(SEED)

df["split"] = ""

for category in sorted(df["category"].unique()):
    category_df = df[df["category"] == category]

    groups = [
        (group_id, group.index.tolist())
        for group_id, group in category_df.groupby("group_id")
    ]

    rng.shuffle(groups)
    groups.sort(key=lambda item: len(item[1]), reverse=True)

    total = len(category_df)

    targets = {
        "train": total * 0.80,
        "validation": total * 0.10,
        "test": total * 0.10
    }

    counts = {name: 0 for name in targets}

    for group_id, indices in groups:
        # Choose the split with the largest proportional deficit.
        split = max(
            targets,
            key=lambda name: (targets[name] - counts[name]) / targets[name]
        )

        df.loc[indices, "split"] = split
        counts[split] += len(indices)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUTPUT, index=False)

print("\n========== DATASET SPLIT SUMMARY ==========")
print("Total images:", len(df))
print("Random seed:", SEED)

print("\nOverall distribution:")
print(df["split"].value_counts().to_string())

print("\nCategory-wise distribution:")
print(pd.crosstab(df["category"], df["split"]).to_string())

# Verify no group crosses splits
group_split_counts = df.groupby("group_id")["split"].nunique()
assert group_split_counts.max() == 1

print("\nGroup leakage check: PASSED")
print("Split manifest saved:", OUTPUT)
