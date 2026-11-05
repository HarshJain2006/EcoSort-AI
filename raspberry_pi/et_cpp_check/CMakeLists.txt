cmake_minimum_required(VERSION 3.28)

project(ExecuTorchCheck LANGUAGES CXX)

find_package(executorch REQUIRED COMPONENTS kernels_optimized)

add_executable(et_test main.cpp)

target_link_libraries(et_test PRIVATE
    executorch::runtime
    executorch::kernels_optimized
    executorch::backend_xnnpack
    executorch::threadpool
)

set_property(TARGET et_test PROPERTY CXX_STANDARD 17)
# MobileNetV3 inference test
add_executable(mobilenet_test mobilenet_test.cpp)

target_link_libraries(mobilenet_test PRIVATE
    executorch::runtime
    executorch::kernels_optimized
    executorch::backend_xnnpack
    executorch::threadpool
)

set_property(TARGET mobilenet_test PROPERTY CXX_STANDARD 17)
# Real image inference test
add_executable(mobilenet_image_test mobilenet_image_test.cpp)

target_link_libraries(mobilenet_image_test PRIVATE
    executorch::runtime
    executorch::kernels_optimized
    executorch::backend_xnnpack
    executorch::threadpool
)

set_property(TARGET mobilenet_image_test PROPERTY CXX_STANDARD 17)

add_executable(waste_classifier waste_classifier.cpp)

target_link_libraries(waste_classifier PRIVATE
    executorch::runtime
    executorch::kernels_optimized
    executorch::backend_xnnpack
    executorch::threadpool
)

set_property(TARGET waste_classifier PROPERTY CXX_STANDARD 17)
