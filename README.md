# EcoSort AI

EcoSort AI is an image-based waste material classification prototype designed to run on a Raspberry Pi 3 Model B. The project combines a React/Vite frontend, a Flask API, and a MobileNetV3-Small model exported to ExecuTorch for on-device inference.

## Current prototype scope

A user uploads an image through a browser; the Pi runs C++/ExecuTorch inference and returns one of nine dominant-material categories: battery, cardboard, glass, metal, organic, paper, plastic, textile, or trash.

## Model results

Held-out Windows test set (3,269 images): accuracy 89.35%, macro precision 86.37%, macro recall 87.17%, macro F1 86.71%.

A separate Pi sanity run on 45 selected images produced 41/45 correct (91.11%). This small demo sample is not representative and must not be presented as a formal accuracy estimate or compared directly with the held-out test result.

## Hardware and runtime

- Raspberry Pi 3 Model B v1.2
- Debian 13 Trixie, 64-bit ARM (aarch64)
- ExecuTorch 1.5.1 C++ runtime
- MobileNetV3-Small exported model (`mobilenet_waste.pte`, approximately 5.86 MB)
- Flask backend and React/Vite frontend

See [TECHNICAL_HANDOFF.md](TECHNICAL_HANDOFF.md) for the engineering handoff.

## Important limitations

- No dedicated no-waste class: this is not a no-waste detector.
- The model predicts dominant material; it does not detect scenes or object boundaries.
- Biodegradability/recyclability guidance is rule-based, not trained ground truth.
- The 0.30 softmax threshold is provisional, not calibrated out-of-distribution detection.
- E-waste is not a separate class.

## Suggested structure

```text
frontend/                 React + Vite UI
raspberry_pi/backend/      Flask API
raspberry_pi/inference/    C++ ExecuTorch classifier
raspberry_pi/models/       .pte model + labels
training/                 dataset preparation and scripts
README.md
TECHNICAL_HANDOFF.md
.gitignore
```

Do not commit `.env`, credentials, raw datasets, Python virtual environments, `node_modules`, personal uploads, or build output. Add the final model only after checking licensing and GitHub file-size constraints.
