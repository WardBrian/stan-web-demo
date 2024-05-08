# Dockerfile
FROM emscripten/emsdk:3.1.59

# Set the working directory
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    make

# Clone the TinyStan repository
RUN git clone https://github.com/WardBrian/tinystan.git --recursive --shallow-submodules --depth 1  

# Clone the oneTBB library and checkout the specific commit
RUN git clone https://github.com/oneapi-src/oneTBB.git && \
    cd oneTBB && \
    git checkout 4a87ca1

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
    -DEMSCRIPTEN_WITHOUT_PTHREAD=true && \
    cmake --build .

# Copy the local configuration file for TinyStan
COPY make/local /app/tinystan/make/local
COPY make/js /app/tinystan/make/js

# Build the model
RUN cd tinystan && ls && \
    echo 'include make/js' >> Makefile && \
    emmake make test_models/bernoulli/bernoulli.js -j2

# Copy the built files to the desired location
RUN cp tinystan/test_models/bernoulli/bernoulli.js src/tinystan && \
    cp tinystan/test_models/bernoulli/bernoulli.wasm src/tinystan
