# How to build

The website is built with [Vite](https://vitejs.dev/)
and the `yarn` command.

```shell
$ yarn dev # live-reload preview
$ yarn build # build production website to folder ./dist/
```

## Building the TinyStan module

More interesting is how to (re-)build the `bernoulli.js`
and `bernoulli.wasm` files in `src/model`.

This can be done in a containerized way by running
`docker build ./build/ --output ./stan-web-demo/src/model/`

The following steps should get you up and running:

1. Install the [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html)
2. Download a copy of [TinyStan](https://github.com/WardBrian/tinystan) (C-wrappers around Stan's C++ interfaces)
3. Download a recent version of [Intel's oneTBB library](https://github.com/oneapi-src/oneTBB). It must be at
   least version `2021.13.0`
4. Build oneTBB with emscripten. The commands I used were
   ```shell
   $ mkdir build; cd build
   $ emcmake cmake .. -DCMAKE_CXX_COMPILER=em++ -DCMAKE_C_COMPILER=emcc -DTBB_STRICT=OFF -DCMAKE_CXX_FLAGS="-fwasm-exceptions -Wno-unused-command-line-argument" -DTBB_DISABLE_HWLOC_AUTOMATIC_SEARCH=ON -DBUILD_SHARED_LIBS=ON -DTBB_EXAMPLES=OFF -DTBB_TEST=OFF -DEMSCRIPTEN_WITHOUT_PTHREAD=true
   $ cmake --build .
   ```
   Make note of the path to the folder containing the built `libtbb.a`. For me this is `build/clang_19.0_cxx11_32_relwithdebinfo`
5. Configure TinyStan. The following is what I have placed in `make/local`:
   ```makefile
   # use our wasm-friendly TBB, not Stan's vendored version
   TBB_INTERFACE_NEW=1
   TBB_INC=$(TBB_FROM_STEP_3)/include/ # CHANGE THIS
   TBB_LIB=$(TBB_BUILD_FOLDER_FROM_STEP_4) # CHANGE THIS
   LDFLAGS_TBB ?= -Wl,-L,"$(TBB_LIB)"
   LDLIBS_TBB ?= -ltbb

   CXXFLAGS+=-fwasm-exceptions # could also uses -fexceptions which is more compatible, but slower
   LDFLAGS+=-sMODULARIZE -sEXPORT_NAME=createModule -sEXPORT_ES6 -sENVIRONMENT=web
   LDFLAGS+=-sEXIT_RUNTIME=1 -sALLOW_MEMORY_GROWTH=1
   # Functions we want. Can add more, with a prepended _, from tinystan.h
   EXPORTS=_malloc,_free,_tinystan_api_version,_tinystan_create_model,_tinystan_destroy_error,_tinystan_destroy_model,_tinystan_get_error_message,_tinystan_get_error_type,_tinystan_model_num_free_params,_tinystan_model_param_names,_tinystan_sample,_tinystan_separator_char,_tinystan_stan_version
   LDFLAGS+=-sEXPORTED_FUNCTIONS=$(EXPORTS) -sEXPORTED_RUNTIME_METHODS=stringToUTF8,getValue,UTF8ToString,lengthBytesUTF8
   ```
6. Build the model by running `emmake make test_models/bernoulli/bernoulli.js -j2`
7. Copy `test_models/bernoulli/bernoulli.js` and `test_models/bernoulli/bernoulli.wasm` to `src/tinystan`
