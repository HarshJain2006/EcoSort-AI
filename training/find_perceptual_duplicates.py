import pandas as pd
from pathlib import Path
from collections import defaultdict
import imagehash

INPUT = Path("dataset/reports/mwcd_perceptual_hashes.csv")
OUTPUT = Path("dataset/reports/mwcd_perceptual_candidates.csv")

df = pd.read_csv(INPUT)

hashes = [
    (row["image_path"], row["category"], imagehash.hex_to_hash(row["phash"]))
    for _, row in df.iterrows()
]

# BK-tree implementation using Hamming distance
class BKTree:
    def __init__(self):
        self.root = None

    def add(self, item):
        if self.root is None:
            self.root = [item, {}]
            return

        node = self.root

        while True:
            distance = item[2] - node[0][2]

            if distance == 0:
                return

            if distance not in node[1]:
                node[1][distance] = [item, {}]
                return

            node = node[1][distance]

    def search(self, target, threshold):
        results = []
        if self.root is None:
            return results

        stack = [self.root]

        while stack:
            node = stack.pop()
            item = node[0]
            distance = target[2] - item[2]

            if 0 < distance <= threshold:
                results.append((item, distance))

            low = distance - threshold
            high = distance + threshold

            for edge, child in node[1].items():
                if low <= edge <= high:
                    stack.append(child)

        return results

tree = BKTree()

print("Building BK-tree...")
for item in hashes:
    tree.add(item)

print("Searching for similar images...")

pairs = set()
threshold = 6

for i, item in enumerate(hashes):
    for match, distance in tree.search(item, threshold):
        pair = tuple(sorted((item[0], match[0])))

        if pair not in pairs:
            pairs.add(pair)

    if (i + 1) % 5000 == 0:
        print(f"Compared: {i + 1}/{len(hashes)}")

lookup = {path: (category, str(phash)) for path, category, phash in hashes}

records = []

for path_a, path_b in pairs:
    category_a, hash_a = lookup[path_a]
    category_b, hash_b = lookup[path_b]

    records.append({
        "image_a": path_a,
        "category_a": category_a,
        "image_b": path_b,
        "category_b": category_b,
        "hamming_distance": imagehash.hex_to_hash(hash_a) - imagehash.hex_to_hash(hash_b),
        "cross_category": category_a != category_b
    })

result = pd.DataFrame(records)
result.to_csv(OUTPUT, index=False)

print("\n========== PERCEPTUAL DUPLICATE SUMMARY ==========")
print("Candidate pairs:", len(result))

if not result.empty:
    print("Cross-category pairs:", result["cross_category"].sum())
    print("\nDistance distribution:")
    print(result["hamming_distance"].value_counts().sort_index())

print("\nReport saved:", OUTPUT)
