from pathlib import Path
import torch

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = PROJECT_ROOT / "dataset" / "splits" / "mwcd_splits.csv"
CHECKPOINT_DIR = PROJECT_ROOT / "checkpoints"

# Dataset
IMAGE_SIZE = 224
BATCH_SIZE = 16

# Training
EPOCHS = 5
LEARNING_RATE = 0.001
WEIGHT_DECAY = 0.0001

# CPU configuration
DEVICE = torch.device("cpu")
NUM_WORKERS = 0
NUM_THREADS = 4

# Reproducibility
RANDOM_SEED = 42

# Checkpoints
BEST_MODEL_PATH = CHECKPOINT_DIR / "best_waste_classifier.pth"