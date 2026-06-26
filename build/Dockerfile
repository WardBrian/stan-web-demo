# Dockerfile
FROM emscripten/emsdk:6.0.0 AS builder

# Set the working directory
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    make \
    wget \
    tar

# Clone the oneTBB library and checkout the specific commit
RUN wget https://github.com/uxlfoundation/oneTBB/archive/refs/tags/v2021.13.0.tar.gz && \
    tar -xvf v2021.13.0.tar.gz && \
    mv oneTBB-2021.13.0 oneTBB


# Clone the TinyStan repository and checkout a specific commit
RUN git clone https://github.com/WardBrian/tinystan.git && \
    cd tinystan && \
    git checkout "52b8825e5ff44c9b703ffdfed3a17dcabf0f7590" && \
    git submodule update --init --recursive

# Build oneTBB with emscripten
RUN mkdir oneTBB/build && cd oneTBB/build && \
    emcmake cmake .. \
    -DCMAKE_CXX_COMPILER=em++ \
    -DCMAKE_C_COMPILER=emcc \
    -DCMAKE_BUILD_TYPE=MinSizeRel \
    -DTBB_STRICT=OFF \
    -DCMAKE_CXX_FLAGS="-fwasm-exceptions -Wno-unused-command-line-argument" \
    -DTBB_DISABLE_HWLOC_AUTOMATIC_SEARCH=ON \
    -DBUILD_SHARED_LIBS=OFF \
    -DTBB_EXAMPLES=OFF \
    -DTBB_TEST=OFF \
    -DEMSCRIPTEN_WITHOUT_PTHREAD=false \
    -DCMAKE_INSTALL_PREFIX=/app/oneTBB/install/ && \
    cmake --build . -j$(nproc) && \
    cmake --install .

# Copy the local configuration file for TinyStan
COPY patch.hpp /app/tinystan/patch.hpp
COPY local.mk /app/tinystan/make/local

# Build the model
RUN cd tinystan && \
    emmake make test_models/bernoulli/bernoulli.js -j$(nproc) && \
    emstrip test_models/bernoulli/bernoulli.wasm

FROM scratch
COPY --from=builder /app/tinystan/test_models/bernoulli/bernoulli.js /app/tinystan/test_models/bernoulli/bernoulli.wasm /
