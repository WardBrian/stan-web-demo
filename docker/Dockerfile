# Dockerfile
FROM emscripten/emsdk:3.1.59 as builder

# Set the working directory
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    make

# Clone the oneTBB library and checkout the specific commit
RUN git clone https://github.com/oneapi-src/oneTBB.git && \
    cd oneTBB && \
    git checkout 4a87ca1cc562072d1f5bff3d2e12b0b143ecbeec

# Build oneTBB with emscripten
RUN mkdir oneTBB/build && cd oneTBB/build && \
    emcmake cmake .. \
    -DCMAKE_CXX_COMPILER=em++ \
    -DCMAKE_C_COMPILER=emcc \
    -DTBB_STRICT=OFF \
    -DCMAKE_CXX_FLAGS="-fwasm-exceptions -Wno-unused-command-line-argument" \
    -DTBB_DISABLE_HWLOC_AUTOMATIC_SEARCH=ON \
    -DBUILD_SHARED_LIBS=ON \
    -DTBB_EXAMPLES=OFF \
    -DTBB_TEST=OFF \
    -DEMSCRIPTEN_WITHOUT_PTHREAD=true \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/app/oneTBB/install/ && \
    cmake --build . -j4 && \
    cmake --install .

# Clone the TinyStan repository
RUN git clone https://github.com/WardBrian/tinystan.git --recursive && \
    cd tinystan && \
    git checkout f87c75858dcd9c3a944198b44f80cc91d249e7eb && \
    git submodule update --init --recursive

# Copy the local configuration file for TinyStan
COPY make/local /app/tinystan/make/local
COPY make/js /app/tinystan/make/js

# Build the model
RUN cd tinystan && \
    echo 'include make/js' >> Makefile && \
    emmake make test_models/bernoulli/bernoulli.js -j4 && \
    emstrip test_models/bernoulli/bernoulli.wasm

FROM scratch
COPY --from=builder /app/tinystan/test_models/bernoulli/bernoulli.js /app/tinystan/test_models/bernoulli/bernoulli.wasm /
