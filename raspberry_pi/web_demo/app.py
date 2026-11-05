
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path
import subprocess
import re
import uuid
import time
from collections import deque

app = Flask(__name__)

# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_DIR = Path("/home/hj/waste-ai")
CLASSIFIER = BASE_DIR / "et_cpp_check/build/waste_classifier"
UPLOAD_DIR = BASE_DIR / "web_demo/uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024
CONFIDENCE_THRESHOLD = 0.30

app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_SIZE

# Temporary uploaded images awaiting prediction
uploaded_files = {}

# Keep the latest 50 predictions
result_history = deque(maxlen=50)


# --------------------------------------------------
# Material guidance
# These are general rules, not model predictions.
# --------------------------------------------------

MATERIAL_GUIDANCE = {
    "battery": {
        "biodegradability": "non-biodegradable",
        "recyclability": "conditional",
        "classification": "Non-biodegradable + Recyclable",
        "reason": "Batteries require specialist collection and recycling."
    },
    "cardboard": {
        "biodegradability": "biodegradable",
        "recyclability": "conditional",
        "classification": "Biodegradable + Recyclable",
        "reason": "Clean and dry cardboard is generally recyclable."
    },
    "glass": {
        "biodegradability": "non-biodegradable",
        "recyclability": "yes",
        "classification": "Non-biodegradable + Recyclable",
        "reason": "Glass can generally be recycled where collection facilities accept it."
    },
    "metal": {
        "biodegradability": "non-biodegradable",
        "recyclability": "yes",
        "classification": "Non-biodegradable + Recyclable",
        "reason": "Metal is generally recyclable through suitable collection facilities."
    },
    "organic": {
        "biodegradability": "biodegradable",
        "recyclability": "no",
        "classification": "Biodegradable",
        "reason": "Organic waste is generally suitable for composting, not conventional material recycling."
    },
    "paper": {
        "biodegradability": "biodegradable",
        "recyclability": "conditional",
        "classification": "Biodegradable + Recyclable",
        "reason": "Clean, dry and uncontaminated paper is generally recyclable."
    },
    "plastic": {
        "biodegradability": "non-biodegradable",
        "recyclability": "conditional",
        "classification": "Non-biodegradable + Recyclable",
        "reason": "Plastic recyclability depends on its resin type and local recycling facilities."
    },
    "textile": {
        "biodegradability": "conditional",
        "recyclability": "conditional",
        "classification": "Conditional",
        "reason": "Textile properties depend on fibre composition and its condition."
    },
    "trash": {
        "biodegradability": "conditional",
        "recyclability": "conditional",
        "classification": "Conditional",
        "reason": "Residual or mixed waste may contain different materials."
    }
}


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def run_classifier(image_path):
    if not CLASSIFIER.is_file():
        raise RuntimeError("Classifier executable not found")

    result = subprocess.run(
        [str(CLASSIFIER), str(image_path)],
        capture_output=True,
        text=True,
        timeout=30,
        check=False
    )

    if result.returncode != 0:
        raise RuntimeError(
            "Inference failed: " + result.stderr[-1000:]
        )

    output = result.stdout

    prediction = re.search(
        r"Predicted material:\s*(\w+)", output
    )

    score = re.search(
        r"Model score:\s*([\d.eE+-]+)%", output
    )

    inference = re.search(
        r"Inference time:\s*([\d.eE+-]+)\s*ms", output
    )

    if not prediction or not score or not inference:
        raise RuntimeError("Could not parse classifier output")

    probabilities = {}

    for label, value in re.findall(
        r"^([a-z]+):\s*([\d.eE+-]+)%",
        output,
        re.MULTILINE
    ):
        probabilities[label] = float(value)

    material = prediction.group(1).lower()
    model_score = float(score.group(1))
    confidence = model_score / 100.0
    inference_time = float(inference.group(1))

    if material not in MATERIAL_GUIDANCE:
        raise RuntimeError("Unknown material returned by classifier")

    guidance = MATERIAL_GUIDANCE[material]

    uncertain = confidence < CONFIDENCE_THRESHOLD

    if uncertain:
        detection_status = "uncertain"
        status = "uncertain"
        classification = "Unable to Classify"
        reason = (
            "The model has low confidence. "
            "Please try a clearer image of one waste item."
        )
    else:
        detection_status = "detected"
        status = "success"
        classification = guidance["classification"]
        reason = guidance["reason"]

    return {
        "success": True,
        "status": status,
        "detection_status": detection_status,
        "detected_material": material.capitalize(),
        "predicted_material": material,
        "classification": classification,
        "biodegradability": guidance["biodegradability"],
        "recyclability": guidance["recyclability"],
        "biodegradable": guidance["biodegradability"],
        "recyclable": guidance["recyclability"],
        "confidence": confidence,
        "model_score": model_score,
        "inference_time_ms": inference_time,
        "device": "Raspberry Pi 3 Model B",
        "model": "MobileNetV3-Small - ExecuTorch",
        "dev_mode": False,
        "reason": reason,
        "recommendations": [
            guidance["reason"]
        ],
        "environmental_impact": [
            "Correct waste segregation helps reduce environmental pollution."
        ],
        "composting_guide": (
            ["Consider composting suitable organic waste."]
            if material == "organic" else []
        ),
        "recycling_guide": [
            guidance["reason"]
        ],
        "disposal_guide": (
            ["Take batteries to an authorised battery collection point."]
            if material == "battery" else []
        ),
        "all_scores": probabilities
    }


def save_uploaded_image(file):
    if not file or not file.filename:
        return None, (jsonify({"error": "No file selected"}), 400)

    if not allowed_file(file.filename):
        return None, (
            jsonify({"error": "Only JPG, JPEG and PNG images are supported"}),
            400
        )

    original_name = secure_filename(file.filename)
    extension = Path(original_name).suffix.lower()

    file_id = uuid.uuid4().hex
    image_path = UPLOAD_DIR / f"{file_id}{extension}"

    file.save(image_path)

    return {
        "file_id": file_id,
        "filename": original_name,
        "size": image_path.stat().st_size,
        "path": image_path
    }, None


# --------------------------------------------------
# Health endpoint
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    available = CLASSIFIER.is_file()

    return jsonify({
        "status": "ok" if available else "error",
        "rpi_connected": available,
        "dev_mode": False,
        "rpi_ip": "192.168.29.6",
        "rpi_port": 5000,
        "classifier_available": available,
        "project": "EcoSort AI"
    }), 200 if available else 503


# --------------------------------------------------
# Upload endpoint
# --------------------------------------------------

@app.route("/api/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    saved, error = save_uploaded_image(request.files["image"])

    if error:
        return error

    uploaded_files[saved["file_id"]] = saved["path"]

    return jsonify({
        "file_id": saved["file_id"],
        "filename": saved["filename"],
        "size": saved["size"]
    }), 200


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    file_id = data.get("file_id")

    if not file_id or file_id not in uploaded_files:
        return jsonify({"error": "Uploaded image not found"}), 404

    image_path = uploaded_files.pop(file_id)

    try:
        result = run_classifier(image_path)

        result_history.appendleft({
            **result,
            "timestamp": time.time()
        })

        return jsonify(result), 200

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Inference timed out"}), 504

    except Exception as error:
        app.logger.exception("Prediction error")
        return jsonify({"error": str(error)}), 500

    finally:
        if image_path.exists():
            image_path.unlink()


# --------------------------------------------------
# Legacy direct classification endpoint
# --------------------------------------------------

@app.route("/api/classify", methods=["POST"])
def classify():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    saved, error = save_uploaded_image(request.files["image"])

    if error:
        return error

    image_path = saved["path"]

    try:
        result = run_classifier(image_path)

        result_history.appendleft({
            **result,
            "timestamp": time.time()
        })

        return jsonify(result), 200

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Inference timed out"}), 504

    except Exception as error:
        app.logger.exception("Classification error")
        return jsonify({"error": str(error)}), 500

    finally:
        if image_path.exists():
            image_path.unlink()


# --------------------------------------------------
# Prediction history endpoint
# --------------------------------------------------

@app.route("/api/results", methods=["GET"])
def results():
    return jsonify({
        "results": list(result_history),
        "total": len(result_history)
    }), 200


# --------------------------------------------------
# Start server
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
