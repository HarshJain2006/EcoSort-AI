#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <algorithm>
#include <cmath>
#include <chrono>

#include <executorch/extension/module/module.h>
#include <executorch/extension/tensor/tensor_ptr_maker.h>
#include <executorch/runtime/core/evalue.h>

using executorch::extension::Module;
using executorch::extension::from_blob;
using executorch::runtime::EValue;

constexpr int INPUT_SIZE = 224;
constexpr int NUM_CLASSES = 9;

const std::string MODEL_PATH =
    "/home/hj/waste-ai/models/mobilenet_waste.pte";

const std::string LABELS_PATH =
    "/home/hj/waste-ai/models/waste_classes.txt";

const float MEAN[3] = {0.485f, 0.456f, 0.406f};
const float STD[3]  = {0.229f, 0.224f, 0.225f};

// Direct bilinear resize to 224 x 224
void resize_image(
    const unsigned char* src,
    int src_w,
    int src_h,
    std::vector<unsigned char>& dst
) {
    dst.resize(INPUT_SIZE * INPUT_SIZE * 3);

    for (int y = 0; y < INPUT_SIZE; y++) {
        float fy = (y + 0.5f) * src_h / INPUT_SIZE - 0.5f;
        fy = std::max(0.0f, std::min(fy, float(src_h - 1)));

        int y0 = int(fy);
        int y1 = std::min(y0 + 1, src_h - 1);
        float dy = fy - y0;

        for (int x = 0; x < INPUT_SIZE; x++) {
            float fx = (x + 0.5f) * src_w / INPUT_SIZE - 0.5f;
            fx = std::max(0.0f, std::min(fx, float(src_w - 1)));

            int x0 = int(fx);
            int x1 = std::min(x0 + 1, src_w - 1);
            float dx = fx - x0;

            for (int c = 0; c < 3; c++) {
                float p00 = src[(y0 * src_w + x0) * 3 + c];
                float p01 = src[(y0 * src_w + x1) * 3 + c];
                float p10 = src[(y1 * src_w + x0) * 3 + c];
                float p11 = src[(y1 * src_w + x1) * 3 + c];

                float top = p00 + dx * (p01 - p00);
                float bottom = p10 + dx * (p11 - p10);

                float value = top + dy * (bottom - top);

                dst[(y * INPUT_SIZE + x) * 3 + c] =
                    static_cast<unsigned char>(
                        std::max(0.0f, std::min(255.0f, value))
                    );
            }
        }
    }
}

bool load_labels(std::vector<std::string>& labels) {
    std::ifstream file(LABELS_PATH);

    if (!file.is_open()) {
        std::cerr << "Cannot open labels file: "
                  << LABELS_PATH << std::endl;
        return false;
    }

    std::string line;

    while (std::getline(file, line)) {
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }

        if (!line.empty()) {
            labels.push_back(line);
        }
    }

    return labels.size() == NUM_CLASSES;
}

int main(int argc, char* argv[]) {

    if (argc < 2) {
        std::cerr << "Usage: ./waste_classifier <image_path>"
                  << std::endl;
        return 1;
    }

    std::string image_path = argv[1];

    std::cout << "\n========== ECOSORT AI ==========\n";

    // 1. Load labels
    std::vector<std::string> labels;

    if (!load_labels(labels)) {
        std::cerr << "Invalid waste labels file." << std::endl;
        return 1;
    }

    // 2. Load image
    int width, height, channels;

    unsigned char* image = stbi_load(
        image_path.c_str(),
        &width,
        &height,
        &channels,
        3
    );

    if (image == nullptr) {
        std::cerr << "Could not load image: "
                  << image_path << std::endl;
        return 1;
    }

    std::cout << "Image: " << image_path << std::endl;
    std::cout << "Original size: "
              << width << " x " << height << std::endl;

    // 3. Resize image
    std::vector<unsigned char> resized;

    resize_image(image, width, height, resized);

    stbi_image_free(image);

    // 4. Convert RGB image to normalized NCHW tensor
    std::vector<float> input_data(1 * 3 * INPUT_SIZE * INPUT_SIZE);

    for (int y = 0; y < INPUT_SIZE; y++) {
        for (int x = 0; x < INPUT_SIZE; x++) {
            for (int c = 0; c < 3; c++) {

                float pixel =
                    resized[(y * INPUT_SIZE + x) * 3 + c] / 255.0f;

                float normalized =
                    (pixel - MEAN[c]) / STD[c];

                int index =
                    c * INPUT_SIZE * INPUT_SIZE +
                    y * INPUT_SIZE + x;

                input_data[index] = normalized;
            }
        }
    }

    // 5. Load ExecuTorch model
    std::cout << "Loading EcoSort AI model..." << std::endl;

    Module module(MODEL_PATH);

    auto input_tensor = from_blob(
        input_data.data(),
        {1, 3, INPUT_SIZE, INPUT_SIZE},
        executorch::aten::ScalarType::Float
    );

    std::vector<EValue> inputs;
    inputs.emplace_back(*input_tensor);

    // 6. Run inference
    std::cout << "Running inference..." << std::endl;

    auto start = std::chrono::steady_clock::now();

    auto result = module.forward(inputs);

    auto end = std::chrono::steady_clock::now();

    if (!result.ok()) {
        std::cerr << "Inference failed. Error: "
                  << static_cast<int>(result.error())
                  << std::endl;
        return 1;
    }

    auto outputs = result.get();

    if (outputs.empty() || !outputs[0].isTensor()) {
        std::cerr << "Invalid model output." << std::endl;
        return 1;
    }

    const auto& output = outputs[0].toTensor();

    if (output.dim() != 2 ||
        output.size(0) != 1 ||
        output.size(1) != NUM_CLASSES) {
        std::cerr << "Unexpected output shape." << std::endl;
        return 1;
    }

    const float* scores = output.const_data_ptr<float>();

    if (scores == nullptr) {
        std::cerr << "Output pointer is null." << std::endl;
        return 1;
    }

    // 7. Convert logits to softmax probabilities
    float max_score = *std::max_element(
        scores, scores + NUM_CLASSES
    );

    std::vector<float> probabilities(NUM_CLASSES);
    float total = 0.0f;

    for (int i = 0; i < NUM_CLASSES; i++) {
        probabilities[i] = std::exp(scores[i] - max_score);
        total += probabilities[i];
    }

    for (float& p : probabilities) {
        p /= total;
    }

    // 8. Find highest prediction
    int best_index = 0;

    for (int i = 1; i < NUM_CLASSES; i++) {
        if (probabilities[i] > probabilities[best_index]) {
            best_index = i;
        }
    }

    double inference_ms =
        std::chrono::duration<double, std::milli>(
            end - start
        ).count();

    // 9. Display result
    std::cout << "\n========== CLASSIFICATION ==========\n";

    std::cout << "Predicted material: "
              << labels[best_index] << std::endl;

    std::cout << "Model score: "
              << probabilities[best_index] * 100.0f
              << "%" << std::endl;

    std::cout << "\nAll class scores:\n";

    for (int i = 0; i < NUM_CLASSES; i++) {
        std::cout << labels[i] << ": "
                  << probabilities[i] * 100.0f
                  << "%\n";
    }

    std::cout << "\nInference time: "
              << inference_ms << " ms" << std::endl;

    std::cout << "====================================\n";

    return 0;
}
