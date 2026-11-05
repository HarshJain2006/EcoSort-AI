
#include <iostream>
#include <vector>

#include <executorch/extension/module/module.h>
#include <executorch/extension/tensor/tensor_ptr_maker.h>
#include <executorch/runtime/core/evalue.h>

using executorch::extension::Module;
using executorch::extension::from_blob;
using executorch::runtime::EValue;

int main() {
    // 1. Load the ExecuTorch model
    const std::string model_path =
        "/home/hj/waste-ai/models/add.pte";

    Module module(model_path);

    std::cout << "Loading ExecuTorch model..." << std::endl;

    // 2. Prepare input data
    float input1_data[1] = {1.0f};
    float input2_data[1] = {1.0f};

    // 3. Create input tensors
    auto input1 = from_blob(
        input1_data,
        {1},
        executorch::aten::ScalarType::Float
    );

    auto input2 = from_blob(
        input2_data,
        {1},
        executorch::aten::ScalarType::Float
    );

    // 4. Execute model inference
    std::vector<EValue> inputs;
    inputs.emplace_back(*input1);
    inputs.emplace_back(*input2);

    std::cout << "Running inference..." << std::endl;

    auto result = module.forward(inputs);

    // 5. Check inference result
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

    // 6. Read output tensor
    auto output_tensor = outputs[0].toTensor();

    const float* output_data =
        output_tensor.const_data_ptr<float>();

    if (output_data == nullptr) {
        std::cerr << "Output data pointer is null." << std::endl;
        return 1;
    }

    // 7. Display result
    std::cout << "\n========== INFERENCE RESULT =========="
              << std::endl;

    std::cout << "Input 1 : " << input1_data[0] << std::endl;
    std::cout << "Input 2 : " << input2_data[0] << std::endl;
    std::cout << "Output  : " << output_data[0] << std::endl;

    std::cout << "======================================"
              << std::endl;

    return 0;
}
