
#include <iostream>
#include <vector>
#include <chrono>
#include <string>

#include <executorch/extension/module/module.h>
#include <executorch/extension/tensor/tensor_ptr_maker.h>
#include <executorch/runtime/core/evalue.h>

using executorch::extension::Module;
using executorch::extension::from_blob;
using executorch::runtime::EValue;

int main() {
    const std::string model_path =
    	"/home/pi/waste-ai/models/mobilenet_pretrained.pte";
    std::cout << "Loading MobileNetV3-Small..." << std::endl;

    Module module(model_path);

    // Input shape: [1, 3, 224, 224]
    constexpr size_t input_size = 1 * 3 * 224 * 224;

    // Dummy image data (all zeros)
    std::vector<float> image_data(input_size, 0.5f);

    // Create ExecuTorch input tensor
    auto input_tensor = from_blob(
        image_data.data(),
        {1, 3, 224, 224},
        executorch::aten::ScalarType::Float
    );

    std::vector<EValue> inputs;
    inputs.emplace_back(*input_tensor);

    std::cout << "Input tensor prepared: [1, 3, 224, 224]"
              << std::endl;

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
        std::cerr << "Invalid model output." << std::endl;
        return 1;
    }

    const auto& output_tensor = outputs[0].toTensor();
    std::cout << "Output tensor shape: ";

    for (int i = 0; i < output_tensor.dim(); i++) {
    std::cout << output_tensor.size(i) << " ";
    }

	std::cout << std::endl;
    const float* output_data =
        output_tensor.const_data_ptr<float>();

    if (output_data == nullptr) {
        std::cerr << "Output data pointer is null."
                  << std::endl;
        return 1;
    }

    const double inference_ms =
        std::chrono::duration<double, std::milli>(
            end - start
        ).count();

    std::cout << "\n========== MOBILENET INFERENCE =========="
              << std::endl;

    std::cout << "Model: MobileNetV3-Small" << std::endl;
    std::cout << "Input: 224 x 224 RGB" << std::endl;
    std::cout << "First 5 output scores:" << std::endl;

    for (int i = 0; i < 5; i++) {
        std::cout << "Output[" << i << "] = "
                  << output_data[i] << std::endl;
    }

    std::cout << "Inference time: "
              << inference_ms << " ms" << std::endl;

    std::cout << "========================================="
              << std::endl;

    return 0;
}
