

function sample() {

    // Define the data
    const data = "{\"N\" : 10, \"y\" : [0,1,0,0,0,0,0,0,0,1]}";

    // Create the model
    const err_ptr = Module._malloc(4);

    const data_ptr = Module._malloc(lengthBytesUTF8(data) + 1)
    Module.stringToUTF8(data, data_ptr, lengthBytesUTF8(data) + 1);
    const model = Module._tinystan_create_model(data_ptr, 123, err_ptr);
    Module._free(data_ptr);

    if (model == 0) {
        // Get the error code
        const err_code = Module.getValue(err_ptr, '*');

        // Get the error message
        const err_msg_ptr = Module._tinystan_get_error_message(err_code);
        const err_msg = Module.UTF8ToString(err_msg_ptr);

        console.error("Error creating model: ", err_msg);

        // Don't forget to free the error message and the error pointer
        Module._tinystan_destroy_error(err_code);
        throw new Error();
    }

    // Get the parameter names
    const paramNames = Module._tinystan_model_param_names(model);
    console.log("Parameters: ", Module.UTF8ToString(paramNames));

    // Get the number of free parameters
    const n_params = Module._tinystan_model_num_free_params(model);

    // Allocate memory for the output
    const n_out = 1000 * 4 * (n_params + 7);
    const out_ptr = Module._malloc(n_out * 8);

    // Sample from the model
    const result = Module._tinystan_sample(model, 4, null, 12345, 1, 2.0, 1000, 1000, 2 /* diagonal */, null,
        1, 0.8, 0.5, 0.75, 10, 75, 50, 25, 0, 1.0, 0.0, 10, 100,
        4, out_ptr, n_out, err_ptr);

    // Check for errors
    if (result != 0) {
        // Get the error code
        const err_code = Module.getValue(err_ptr, '*');

        // Get the error message
        const err_msg_ptr = Module._tinystan_get_error_message(err_code);
        const err_msg = Module.UTF8ToString(err_msg_ptr);

        console.error("Error creating model: ", err_msg);

        // Don't forget to free the error message and the error pointer
        Module._tinystan_destroy_error(err_code);
        throw new Error();
    }

    // Calculate the average of theta

    let out_buffer = Module.HEAPF64.subarray(out_ptr / Float64Array.BYTES_PER_ELEMENT, out_ptr / Float64Array.BYTES_PER_ELEMENT + n_out);


    var x = [];
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
        elm = out_buffer[i * (n_params + 7) + 7];
        x[i] = elm;
        sum += elm;
    }
    const mean_theta = sum / 1000;
    console.log("Mean of theta: ", mean_theta);

    var trace = {
        x: x,
        type: 'histogram',

    };

    var plotdata = [trace];

    Plotly.newPlot('hist', plotdata);

    // Clean up
    Module._free(out_ptr);
    Module._free(err_ptr);
    Module._tinystan_destroy_model(model);

}
