# EcoSort AI — Technical Handoff

This file records implementation details available from the working prototype. The team should verify exact commands and dependencies against the final source tree before treating them as reproducible build instructions.

## 1. Scope

Browser-based image classification: React frontend uploads an image to a Flask API on Raspberry Pi; Flask invokes a C++ ExecuTorch classifier; the result is shown in the browser. The model predicts one dominant material category, not scenes, multiple objects, object boundaries, or actuator controls.

## 2. Hardware

| Component | Observed configuration |
|---|---|
| SBC | Raspberry Pi 3 Model B v1.2 |
| OS | Debian 13 Trixie, ARM64 / aarch64 |
| Memory | About 905 MiB reported by OS |
| Primary storage | 16 GB microSD |
| Extra storage | 128 GB USB drive |
| Network | Ethernet / Wi-Fi; test IP 192.168.29.6 (DHCP can change) |

A camera is not required for the browser-upload demo.

## 3. Software versions observed

| Layer | Version |
|---|---|
| Pi GCC/G++ | 14.2 |
| CMake | 3.31.6 |
| Pi Python | 3.13.5 |
| ExecuTorch C++ runtime | 1.5.1 |
| Windows PyTorch | 2.15.0+cpu |
| Windows ExecuTorch | 1.5.1 |
| React | 18.3.1 |
| Vite | 5.4.x |
| Windows Node.js | 26.13.0 |
| Windows npm | 11.20.0 |

Exact Flask/Pillow package versions were not recorded. Commit a verified requirements file for the actual backend.

## 4. Dataset and model

- Source: MWCD Mendeley merged dataset.
- Classes: battery, cardboard, glass, metal, organic, paper, plastic, textile, trash.
- Original images: 35,168; clean candidate after duplicate audit/conflicting-label removal: 32,673.
- Group-aware split, seed 42: 26,134 train / 3,270 validation / 3,269 test.
- Perceptual-hash grouping used same-category pairs with distance <= 2; this does not prove all near-duplicates were removed.
- RealWaste was already included in the merged data; do not append another copy without checking.

Training facts:
- MobileNetV3-Small pretrained, classifier replaced with nine outputs.
- Feature extractor frozen; 9,225 trainable parameters.
- Five epochs, batch 16, learning rate 0.001, weight decay 0.0001, CPU.
- Best checkpoint: `checkpoints/best_waste_classifier.pth`.

Held-out Windows test (3,269 images): accuracy 89.35%, macro precision 86.37%, macro recall 87.17%, macro F1 86.71%.

| Class | F1 |
|---|---:|
| Battery | 92.80% |
| Cardboard | 89.00% |
| Glass | 87.09% |
| Metal | 82.67% |
| Organic | 93.77% |
| Paper | 84.34% |
| Plastic | 79.70% |
| Textile | 97.06% |
| Trash | 73.97% |

Exported ExecuTorch file: `mobilenet_waste.pte`, approximately 5.86 MB. Pi C++ inference average was about 107.55 ms across 45 demo images. A separate 45-image Pi sanity sample had 41/45 correct (91.11%); it is not a formal or representative test metric. A single-image run was around 67 ms.

Known error: one plastic sample was predicted as cardboard with approximately 94.3% confidence. Confidence does not guarantee correctness.

## 5. Pi deployment paths observed

In the GitHub repository, these files are stored under `raspberry_pi/`. For the tested Pi layout, copy the contents of that folder into `/home/hj/waste-ai/` so the runtime paths below resolve. The Flask app and C++ classifier currently use absolute paths rooted at `/home/hj/waste-ai`; update both source files if the Linux username or deployment directory changes.

```text
~/waste-ai/
  models/mobilenet_waste.pte
  models/waste_classes.txt
  et_cpp_check/build/waste_classifier
  web_demo/app.py
```

Classifier executable: `/home/hj/waste-ai/et_cpp_check/build/waste_classifier`

Model: `/home/hj/waste-ai/models/mobilenet_waste.pte`

Labels: `/home/hj/waste-ai/models/waste_classes.txt`

The C++ image path resizes to 224x224, converts RGB to NCHW, and applies ImageNet normalization. Its interpolation is close to, but not exactly the same as, torchvision antialias resize.

The checked-in `CMakeLists.txt` finds the installed ExecuTorch package with the `kernels_optimized` component and links `executorch::runtime`, `executorch::kernels_optimized`, `executorch::backend_xnnpack`, and `executorch::threadpool`. The compiled `build/waste_classifier` executable is generated on the Pi and is not stored in GitHub.

## 6. API contract tested

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Backend and classifier health |
| `/api/upload` | POST | Multipart field `image`; returns `file_id` |
| `/api/predict` | POST | JSON body with `file_id`; invokes classifier |
| `/api/results` | GET | Recent in-memory history (up to last 50) |
| `/api/classify` | POST | Compatibility endpoint |

The demo used port 5000 and test IP `192.168.29.6`; this address is temporary unless reserved. The frontend Vite dev server ran on port 3000 and proxied `/api` to the Pi. The checked-in `frontend/vite.config.ts` still contains that development IP; update its proxy target to the current Pi address before running on another network.

The integration response included status/detection state, class, confidence/model score and material guidance. Biodegradability/recyclability fields are rule-based guidance; those labels were not learned from dataset ground truth. Preserve the actual response schema from the final backend files.

The 0.30 low-softmax-confidence cutoff is provisional. It is not a no-waste or calibrated OOD detector.

## 7. Demo startup (verify paths and address)

**Raspberry Pi SSH:**

```bash
cd ~/waste-ai/web_demo
python app.py
```

**Windows PowerShell:**

```powershell
cd "C:\path\to\frontend"
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL printed by the terminal, normally `http://localhost:3000`. Confirm that the Vite proxy points at the current Pi address. Flask's development server was used for the hackathon demo only; do not expose it directly to the public internet.

## 8. Include and exclude

Include frontend source and lock file, final Flask source, C++ classifier and CMake files, labels, training/export scripts, sanitized example configuration, and the distributable `.pte` model only after license review.

Exclude `.env`, credentials, keys, Wi-Fi passwords, `node_modules`, virtual environments, `__pycache__`, build output, raw datasets, temporary logs, user uploads and personal recordings. The dataset license and model redistribution terms must be checked by the team.

## 9. Still to verify

- Keep the Pi deployment copy synchronized with the committed `raspberry_pi/` source when changes are made after the hackathon demo.
- Exact Flask/Pillow dependencies and lockfile.
- Exact ExecuTorch C++ build flags/dependency setup.
- Model and dataset redistribution permissions.
- Stable Pi hostname/IP and final network arrangement.
- Power supply, cooling, camera, enclosure, boot time, power use and sustained thermal performance; not measured/confirmed here.
- Whether prediction history remains in memory or becomes persistent in the final version.
