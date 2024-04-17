interface WasmModule {
    _malloc(_0: number): number;
    _free(_0: number): void;
    _tinystan_create_model(_0: number, _1: number, _2: number): number;
    _tinystan_destroy_model(_0: number): void;
    _tinystan_model_param_names(_0: number): number;
    _tinystan_model_num_free_params(_0: number): number;
    _tinystan_separator_char(): number;
    _tinystan_sample(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number, _11: number, _12: number, _13: number, _14: number, _15: number, _16: number, _17: number, _18: number, _19: number, _20: number, _21: number, _22: number, _23: number, _24: number, _25: number, _26: number, _27: number): number;
    _tinystan_pathfinder(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number, _11: number, _12: number, _13: number, _14: number, _15: number, _16: number, _17: number, _18: number, _19: number, _20: number, _21: number, _22: number, _23: number): number;
    _tinystan_optimize(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number, _11: number, _12: number, _13: number, _14: number, _15: number, _16: number, _17: number, _18: number, _19: number): number;
    _tinystan_laplace_sample(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number, _11: number, _12: number): number;
    _tinystan_get_error_message(_0: number): number;
    _tinystan_get_error_type(_0: number): number;
    _tinystan_destroy_error(_0: number): void;
    _tinystan_api_version(_0: number, _1: number, _2: number): void;
    _tinystan_stan_version(_0: number, _1: number, _2: number): void;
    _tinystan_set_print_callback(_0: number): void;
    UTF8ToString(ptr: number, max?: number): string;
    stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): number;
    getValue(ptr: number, type: string): number;
    HEAPF64: Float64Array;
}

// manually modified below
export type StanModule = WasmModule;


const lengthBytesUTF8 = (str:string) => {
    let len = 0;
    for (let i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
      // unit, not a Unicode code point of the character! So decode
      // UTF16->UTF32->UTF8.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      const c = str.charCodeAt(i); // possibly a lead surrogate
      if (c <= 0x7F) {
        len++;
      } else if (c <= 0x7FF) {
        len += 2;
      } else if (c >= 0xD800 && c <= 0xDFFF) {
        len += 4; ++i;
      } else {
        len += 3;
      }
    }
    return len;
  };


const NULLPTR = 0;

const stanSample = (module: StanModule, num_chains: number = 4, num_samples: number = 1000) => {

    const seed = Math.floor(Math.random() * 1000000);

    // Define the data
    const data = "{\"N\" : 10, \"y\" : [0,1,0,0,0,0,0,0,0,1]}";

    // Create the model
    const err_ptr = module._malloc(4);

    const data_ptr = module._malloc(lengthBytesUTF8(data) + 1)
    module.stringToUTF8(data, data_ptr, lengthBytesUTF8(data) + 1);
    const model = module._tinystan_create_model(data_ptr, seed, err_ptr);
    module._free(data_ptr);

    if (model == 0) {
        // Get the error code
        const err_code = module.getValue(err_ptr, '*');

        // Get the error message
        const err_msg_ptr = module._tinystan_get_error_message(err_code);
        const err_msg = module.UTF8ToString(err_msg_ptr);

        console.error("Error creating model: ", err_msg);

        module._tinystan_destroy_error(err_code);
        throw new Error();
    }

    // Get the parameter names
    const paramNames = module.UTF8ToString(module._tinystan_model_param_names(model));
    // Get the number of free parameters
    const n_params = paramNames.split(",").length;

    // Allocate memory for the output
    const n_out = 1000 * 4 * (n_params + 7);
    const out_ptr = module._malloc(n_out * 8);

    // Sample from the model
    const result = module._tinystan_sample(model, num_chains, NULLPTR, seed, 1, 2.0, num_samples, num_samples, 2 /* diagonal */, NULLPTR,
        1, 0.8, 0.5, 0.75, 10, 75, 50, 25, 0, 1.0, 0.0, 10, 100,
        num_chains, out_ptr, n_out, NULLPTR, err_ptr);

    // Check for errors
    if (result != 0) {
        // Get the error code
        const err_code = module.getValue(err_ptr, '*');

        // Get the error message
        const err_msg_ptr = module._tinystan_get_error_message(err_code);
        const err_msg = module.UTF8ToString(err_msg_ptr);

        console.error("Error sampling: ", err_msg);

        // Don't forget to free the error message and the error pointer
        module._tinystan_destroy_error(err_code);
        throw new Error();
    }
    module._free(err_ptr);

    // Calculate the average of theta

    const out_buffer = module.HEAPF64.subarray(out_ptr / Float64Array.BYTES_PER_ELEMENT, out_ptr / Float64Array.BYTES_PER_ELEMENT + n_out);
    const x = [];
    for (let i = 0; i < num_chains * num_samples; i++) {
        const elm = out_buffer[i * (n_params + 7) + 7];
        x[i] = elm;
    }


    // Clean up
    module._tinystan_destroy_model(model);
    module._free(out_ptr);

    return x;
}

export default stanSample;
