# Stan Web Demo

This shows how one can use [TinyStan](https://github.com/WardBrian/tinystan)
to build a WebAssembly version of a Stan model which can be used from the
browser.

All computation is done locally using the actual Stan implementations
of automatic differentiation and the No-U-Turn Sampler.

This was inspired by
[George Stagg's demos of Fortran in the browser](https://github.com/georgestagg/mnist-classifier-blas-wasm/)
