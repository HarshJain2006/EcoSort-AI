
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <chrono>
#include <string>
#include <fstream>

#include <executorch/extension/module/module.h>
#include <executorch/extension/tensor/tensor_ptr_maker.h>
#include <executorch/runtime/core/evalue.h>

using executorch::extension::Module;
using executorch::extension::from_blob;
using executorch::runtime::EValue;

// Model and file paths
const std::string MODEL_PATH =
    "/home/hj/waste-ai/models/mobilenet_pretrained.pte";

const std::string LABELS_PATH =
    "/home/hj/waste-ai/models/imagenet_classes.txt";

const std::string DEFAULT_IMAGE =
    "/home/hj/waste-ai/test_images/test.jpg";

// ImageNet normalization values
const float MEAN[3] = {0.485f, 0.456f, 0.406f};
const float STD[3]  = {0.229f, 0.224f, 0.225f};

// Bilinear image resizing
void resize_image(
    const unsigned char* src,
    int src_w,
    int src_h,
    unsigned char* dst,
    int dst_w,
    int dst_h
) {
    for (int y = 0; y < dst_h; y++) {

        float sy = (y + 0.5f) * src_h / dst_h - 0.5f;
        sy = std::max(0.0f, std::min(sy, float(src_h - 1)));

        int y0 = static_cast<int>(sy);
        int y1 = std::min(y0 + 1, src_h - 1);
        float fy = sy - y0;

        for (int x = 0; x < dst_w; x++) {

            float sx = (x + 0.5f) * src_w / dst_w - 0.5f;
            sx = std::max(0.0f, std::min(sx, float(src_w - 1)));

            int x0 = static_cast<int>(sx);
            int x1 = std::min(x0 + 1, src_w - 1);
            float fx = sx - x0;

            for (int c = 0; c < 3; c++) {

                float p00 = src[(y0 * src_w + x0) * 3 + c];
                float p01 = src[(y0 * src_w + x1) * 3 + c];
                float p10 = src[(y1 * src_w + x0) * 3 + c];
                float p11 = src[(y1 * src_w + x1) * 3 + c];

                float top = p00 + fx * (p01 - p00);
                float bottom = p10 + fx * (p11 - p10);

                float value = top + fy * (bottom - top);

                dst[(y * dst_w + x) * 3 + c] =
                    static_cast<unsigned char>(
                        std::round(value)
                    );
            }
        }
    }
}

// Load ImageNet labels
bool load_labels(
    const std::string& path,
    std::vector<std::string>& labels
) {
    std::ifstream file(path);

    if (!file.is_open()) {
        std::cerr << "Error: Cannot open labels file: "
                  << path << std::endl;
        return false;
    }

    std::string line;

while (std::getline(file, line)) {

    // Remove Windows carriage return (CRLF)
    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }

    labels.push_back(line);
}
    file.close();

    if (labels.size() != 1000) {
        std::cerr << "Error: Expected 1000 labels, found "
                  << labels.size() << std::endl;
        return false;
    }

    return true;
}

int main(int argc, char* argv[]) {

    // Use command-line image path if provided
    const std::string image_path =
        (argc > 1) ? argv[1] : DEFAULT_IMAGE;

    constexpr int INPUT_SIZE = 224;

    // --------------------------------
    // 1. Load image
    // --------------------------------

    int width = 0;
    int height = 0;
    int channels = 0;

    unsigned char* image = stbi_load(
        image_path.c_str(),
        &width,
        &height,
        &channels,
        3
    );

    if (image == nullptr) {
        std::cerr << "Error: Could not load image: "
                  << image_path << std::endl;
        return 1;
    }

    if (width <= 0 || height <= 0) {
        std::cerr << "Error: Invalid image dimensions."
                  << std::endl;
        stbi_image_free(image);
        return 1;
    }

    std::cout << "Image loaded: " << image_path << std::endl;
    std::cout << "Original dimensions: "
              << width << " x " << height << std::endl;

    // --------------------------------
    // 2. Resize shorter edge to 256
    // --------------------------------

    int resized_w;
    int resized_h;

    if (width < height) {
        resized_w = 256;
        resized_h = static_cast<int>(
            height * 256.0f / width
        );
    } else {
        resized_h = 256;
        resized_w = static_cast<int>(
            width * 256.0f / height
        );
    }

    std::vector<unsigned char> resized(
        static_cast<size_t>(resized_w) * resized_h * 3
    );

    resize_image(
        image,
        width,
        height,
        resized.data(),
        resized_w,
        resized_h
    );

    stbi_image_free(image);

    // --------------------------------
    // 3. Centre crop to 224 x 224
    // --------------------------------

    int crop_x = (resized_w - INPUT_SIZE) / 2;
    int crop_y = (resized_h - INPUT_SIZE) / 2;

    // --------------------------------
    // 4. Convert to normalized NCHW
    // --------------------------------

    std::vector<float> input_data(
        3 * INPUT_SIZE * INPUT_SIZE
    );

    for (int y = 0; y < INPUT_SIZE; y++) {

        for (int x = 0; x < INPUT_SIZE; x++) {

            int src_index =
                ((y + crop_y) * resized_w + (x + crop_x)) * 3;

            for (int c = 0; c < 3; c++) {

                float pixel =
                    resized[src_index + c] / 255.0f;

                float normalized =
                    (pixel - MEAN[c]) / STD[c];

                int dst_index =
                    c * INPUT_SIZE * INPUT_SIZE +
                    y * INPUT_SIZE + x;

                input_data[dst_index] = normalized;
            }
        }
    }

    std::cout << "Preprocessing complete." << std::endl;

    // --------------------------------
    // 5. Load ImageNet labels
    // --------------------------------

    std::vector<std::string> labels;

    if (!load_labels(LABELS_PATH, labels)) {
        return 1;
    }

    std::cout << "ImageNet labels loaded: "
              << labels.size() << std::endl;

    // --------------------------------
    // 6. Load ExecuTorch model
    // --------------------------------

    std::cout << "Loading pretrained MobileNetV3-Small..."
              << std::endl;

    Module module(MODEL_PATH);

    // Create input tensor
    auto input_tensor = from_blob(
        input_data.data(),
        {1, 3, INPUT_SIZE, INPUT_SIZE},
        executorch::aten::ScalarType::Float
    );

    std::vector<EValue> inputs;
    inputs.emplace_back(*input_tensor);

    // --------------------------------
    // 7. Run inference
    // --------------------------------

    std::cout << "Running inference..." << std::endl;

    auto start = std::chrono::steady_clock::now();

    auto result = module.forward(inputs);

    auto end = std::chrono::steady_clock::now();

    if (!result.ok()) {
        std::cerr << "Inference failed. Error code: "
                  << static_cast<int>(result.error())
                  << std::endl;
        return 1;
    }

    auto outputs = result.get();

    if (outputs.empty() || !outputs[0].isTensor()) {
        std::cerr << "Error: Invalid model output."
                  << std::endl;
        return 1;
    }

    const auto& output = outputs[0].toTensor();

    if (output.dim() != 2 ||
        output.size(0) != 1 ||
        output.size(1) != 1000) {

        std::cerr << "Error: Unexpected output shape."
                  << std::endl;
        return 1;
    }

    const float* scores = output.const_data_ptr<float>();

    if (scores == nullptr) {
        std::cerr << "Error: Output data pointer is null."
                  << std::endl;
        return 1;
    }

    // --------------------------------
    // 8. Find top 5 predictions
    // --------------------------------

    std::vector<int> indices(1000);

    for (int i = 0; i < 1000; i++) {
        indices[i] = i;
    }

    std::partial_sort(
        indices.begin(),
        indices.begin() + 5,
        indices.end(),
        [&](int a, int b) {
            return scores[a] > scores[b];
        }
    );

    // --------------------------------
    // 9. Calculate inference time
    // --------------------------------

    double inference_ms =
        std::chrono::duration<double, std::milli>(
            end - start
        ).count();

    // --------------------------------
    // 10. Display results
    // --------------------------------

    std::cout << "\n========== IMAGE INFERENCE =========="
              << std::endl;

    std::cout << "Model: MobileNetV3-Small" << std::endl;
    std::cout << "Input: 224 x 224 RGB" << std::endl;

    std::cout << "\nTop 5 ImageNet predictions:"
              << std::endl;

    for (int i = 0; i < 5; i++) {

        int index = indices[i];

        std::cout << i + 1 << ". "
                  << labels[index]
                  << " (Class " << index << ")"
                  << " | Score: " << scores[index]
                  << std::endl;
    }

    std::cout << "\nInference time: "
              << inference_ms << " ms"
              << std::endl;

    std::cout << "====================================="
              << std::endl;

    return 0;
}
