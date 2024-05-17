// Newtype trick to create distinct types for different kinds of pointers
const brand = Symbol("brand");
type Brand<T, U> = T & {
  [brand]: U;
};

type ptr = Brand<number, "raw pointer">;
type model_ptr = Brand<number, "model pointer">;
type error_ptr = Brand<number, "error object pointer">;
type cstr = Brand<number, "null-terminated char pointer">;

interface WasmModule {
  _malloc(n_bytes: number): ptr;
  _free(pointer: ptr | cstr): void;
  _tinystan_create_model(data: cstr, seed: number, err_ptr: ptr): model_ptr;
  _tinystan_destroy_model(model: model_ptr): void;
  _tinystan_model_param_names(model: model_ptr): cstr;
  _tinystan_model_num_free_params(model: model_ptr): number;
  _tinystan_separator_char(): number;
  // prettier-ignore
  _tinystan_sample(model: model_ptr, num_chains: number, inits: cstr, seed: number, id: number,
    init_radius: number, num_warmup: number, num_samples: number, metric: number, init_inv_metric: ptr,
    adapt: number, delta: number, gamma: number, kappa: number, t0: number, init_buffer: number,
    term_buffer: number, window: number, save_warmup: number, stepsize: number, stepsize_jitter: number,
    max_depth: number, refresh: number, num_threads: number, out: ptr, out_size: number, metric_out: ptr,
    err_ptr: ptr): number;
  // prettier-ignore
  _tinystan_pathfinder(model: model_ptr, num_paths: number, inits: cstr, seed: number, id: number,
    init_radius: number, num_draws: number, max_history_size: number, init_alpha: number, tol_obj: number,
    tol_rel_obj: number, tol_grad: number, tol_rel_grad: number, tol_param: number, num_iterations: number,
    num_elbo_draws: number, num_multi_draws: number, calculate_lp: number, psis_resample: number,
    refresh: number, num_threads: number, out: ptr, out_size: number, err_ptr: ptr): number;
  _tinystan_get_error_message(err_ptr: error_ptr): cstr;
  _tinystan_get_error_type(err_ptr: error_ptr): number;
  _tinystan_destroy_error(err_ptr: error_ptr): void;
  _tinystan_api_version(major: ptr, minor: ptr, patch: ptr): void;
  _tinystan_stan_version(major: ptr, minor: ptr, patch: ptr): void;
  lengthBytesUTF8(str: string): number;
  UTF8ToString(ptr: cstr, max?: number): string;
  stringToUTF8(str: string, outPtr: cstr, maxBytesToWrite: number): number;
  getValue(ptr: number, type: string): number;
  HEAPF64: Float64Array;
}

const NULL = 0 as ptr;

const PTR_SIZE = 4;

const HMC_SAMPLER_VARIABLES = [
  "lp__",
  "accept_stat__",
  "stepsize__",
  "treedepth__",
  "n_leapfrog__",
  "divergent__",
  "energy__",
];

export enum HMCMetric {
  UNIT = 0,
  DENSE = 1,
  DIAGONAL = 2,
}

const PATHFINDER_VARIABLES = ["lp_approx__", "lp__"];

export type PrintCallback = (s: string) => void;

export type StanDraws = {
  paramNames: string[];
  draws: number[][];
};

export type StanVariableInputs = Record<string, unknown>;

export interface SamplerParams {
  data: string | StanVariableInputs;
  num_chains: number;
  inits: string | StanVariableInputs | string[] | StanVariableInputs[];
  seed: number | null;
  id: number;
  init_radius: number;
  num_warmup: number;
  num_samples: number;
  metric: HMCMetric;
  save_metric: boolean;
  init_inv_metric: number[] | number[][] | number[][][] | null;
  adapt: boolean;
  delta: number;
  gamma: number;
  kappa: number;
  t0: number;
  init_buffer: number;
  term_buffer: number;
  window: number;
  save_warmup: boolean;
  stepsize: number;
  stepsize_jitter: number;
  max_depth: number;
  refresh: number;
  num_threads: number;
}

const defaultSamplerParams: SamplerParams = {
  data: "",
  num_chains: 4,
  inits: "",
  seed: null,
  id: 1,
  init_radius: 2.0,
  num_warmup: 1000,
  num_samples: 1000,
  metric: HMCMetric.DIAGONAL,
  save_metric: false,
  init_inv_metric: null, // currently unused
  adapt: true,
  delta: 0.8,
  gamma: 0.05,
  kappa: 0.75,
  t0: 10,
  init_buffer: 75,
  term_buffer: 50,
  window: 25,
  save_warmup: false,
  stepsize: 1.0,
  stepsize_jitter: 0.0,
  max_depth: 10,
  refresh: 100,
  num_threads: -1,
};

interface LBFGSConfig {
  max_history_size: number;
  init_alpha: number;
  tol_obj: number;
  tol_rel_obj: number;
  tol_grad: number;
  tol_rel_grad: number;
  tol_param: number;
  num_iterations: number;
}

interface PathfinderUniqueParams {
  data: string | StanVariableInputs;
  num_paths: number;
  inits: string | StanVariableInputs | string[] | StanVariableInputs[];
  seed: number | null;
  id: number;
  init_radius: number;
  num_draws: number;
  num_elbo_draws: number;
  num_multi_draws: number;
  calculate_lp: boolean;
  psis_resample: boolean;
  refresh: number;
  num_threads: number;
}

export type PathfinderParams = LBFGSConfig & PathfinderUniqueParams;

const defaultPathfinderParams: PathfinderParams = {
  data: "",
  num_paths: 4,
  inits: "",
  seed: null,
  id: 1,
  init_radius: 2.0,
  num_draws: 1000,
  max_history_size: 5,
  init_alpha: 0.001,
  tol_obj: 1e-12,
  tol_rel_obj: 1e4,
  tol_grad: 1e-8,
  tol_rel_grad: 1e7,
  tol_param: 1e-8,
  num_iterations: 1000,
  num_elbo_draws: 25,
  num_multi_draws: 1000,
  calculate_lp: true,
  psis_resample: true,
  refresh: 100,
  num_threads: -1,
};

export default class StanModel {
  private m: WasmModule;
  private printCallback: PrintCallback | null;
  // used to send multiple JSON values in one string
  private sep: string;

  private constructor(m: WasmModule, pc: PrintCallback | null) {
    this.m = m;
    this.printCallback = pc;
    this.sep = String.fromCharCode(m._tinystan_separator_char());
  }

  public static async load(
    createModule: (proto?: object) => Promise<WasmModule>,
    printCallback: PrintCallback | null,
  ): Promise<StanModel> {
    // Create the initial object which will have the rest of the WASM
    // functions attached to it
    // See https://emscripten.org/docs/api_reference/module.html
    const prototype = { print: printCallback };

    const module = await createModule(prototype);
    return new StanModel(module, printCallback);
  }

  private encodeString(s: string): cstr {
    const len = this.m.lengthBytesUTF8(s) + 1;
    const ptr = this.m._malloc(len) as unknown as cstr;
    this.m.stringToUTF8(s, ptr, len);
    return ptr;
  }

  private handleError(err_ptr: ptr): void {
    const err = this.m.getValue(err_ptr, "*") as error_ptr;
    const err_msg_ptr = this.m._tinystan_get_error_message(err);
    const err_msg = "Exception from Stan:\n" + this.m.UTF8ToString(err_msg_ptr);
    this.m._tinystan_destroy_error(err);
    this.printCallback?.(err_msg);
    throw new Error(err_msg);
  }

  private encodeInits(
    inits: string | StanVariableInputs | string[] | StanVariableInputs[],
  ): cstr {
    if (Array.isArray(inits)) {
      return this.encodeString(
        inits.map(i => string_safe_jsonify(i)).join(this.sep),
      );
    } else {
      return this.encodeString(string_safe_jsonify(inits));
    }
  }

  /**
   * withModel serves as something akin to a context manager in
   * Python. It accepts the arguments needed to construct a model
   * (data and seed) and a callback.
   *
   * The callback takes in the model and a deferredFree function.
   * The memory for the allocated model and any pointers which are "registered"
   * by calling deferredFree will be cleaned up when the callback completes,
   * regardless of if this is a normal return or an exception.
   *
   * The result of the callback is then returned or re-thrown.
   */
  private withModel<T>(
    data: string | StanVariableInputs,
    seed: number,
    f: (model: model_ptr, deferredFree: (p: ptr | cstr) => void) => T,
  ): T {
    const data_ptr = this.encodeString(string_safe_jsonify(data));
    const err_ptr = this.m._malloc(PTR_SIZE);
    const model = this.m._tinystan_create_model(data_ptr, seed, err_ptr);
    this.m._free(data_ptr);

    if (model == 0) {
      this.handleError(err_ptr);
    }
    this.m._free(err_ptr);

    const ptrs: (ptr | cstr)[] = [];
    const deferredFree = (p: ptr | cstr) => ptrs.push(p);

    try {
      return f(model, deferredFree);
    } finally {
      ptrs.forEach(p => this.m._free(p));
      this.m._tinystan_destroy_model(model);
    }
  }

  public sample(p: Partial<SamplerParams>): StanDraws {
    const {
      data,
      num_chains,
      inits,
      seed,
      id,
      init_radius,
      num_warmup,
      num_samples,
      metric,
      save_metric,
      adapt,
      delta,
      gamma,
      kappa,
      t0,
      init_buffer,
      term_buffer,
      window,
      save_warmup,
      stepsize,
      stepsize_jitter,
      max_depth,
      refresh,
      num_threads,
    } = { ...defaultSamplerParams, ...p };

    if (num_chains < 1) {
      throw new Error("num_chains must be at least 1");
    }
    if (num_warmup < 0) {
      throw new Error("num_warmup must be non-negative");
    }
    if (num_samples < 1) {
      throw new Error("num_samples must be at least 1");
    }

    const seed_ = seed !== null ? seed : Math.floor(Math.random() * (2 ^ 32));

    return this.withModel(data, seed_, (model, deferredFree) => {
      // Get the parameter names
      const rawParamNames = this.m.UTF8ToString(
        this.m._tinystan_model_param_names(model),
      );
      const paramNames = HMC_SAMPLER_VARIABLES.concat(rawParamNames.split(","));

      const n_params = paramNames.length;

      const free_params = this.m._tinystan_model_num_free_params(model);
      if (free_params === 0) {
        throw new Error("Model has no parameters to sample.");
      }

      // TODO: allow init_inv_metric to be specified
      const init_inv_metric_ptr = NULL;

      let metric_out = NULL;
      if (save_metric) {
        if (metric === HMCMetric.DENSE)
          metric_out = this.m._malloc(
            num_chains *
              free_params *
              free_params *
              Float64Array.BYTES_PER_ELEMENT,
          );
        else
          metric_out = this.m._malloc(
            num_chains * free_params * Float64Array.BYTES_PER_ELEMENT,
          );
      }
      deferredFree(metric_out);

      const inits_ptr = this.encodeInits(inits);
      deferredFree(inits_ptr);

      const n_draws =
        num_chains * (save_warmup ? num_samples + num_warmup : num_samples);
      const n_out = n_draws * n_params;

      // Allocate memory for the output
      const out_ptr = this.m._malloc(n_out * Float64Array.BYTES_PER_ELEMENT);
      deferredFree(out_ptr);

      const err_ptr = this.m._malloc(PTR_SIZE);
      deferredFree(err_ptr);

      // Sample from the model
      const result = this.m._tinystan_sample(
        model,
        num_chains,
        inits_ptr,
        seed_ || 0,
        id,
        init_radius,
        num_warmup,
        num_samples,
        metric.valueOf(),
        init_inv_metric_ptr,
        adapt ? 1 : 0,
        delta,
        gamma,
        kappa,
        t0,
        init_buffer,
        term_buffer,
        window,
        save_warmup ? 1 : 0,
        stepsize,
        stepsize_jitter,
        max_depth,
        refresh,
        num_threads,
        out_ptr,
        n_out,
        metric_out,
        err_ptr,
      );

      if (result != 0) {
        this.handleError(err_ptr);
      }

      const out_buffer = this.m.HEAPF64.subarray(
        out_ptr / Float64Array.BYTES_PER_ELEMENT,
        out_ptr / Float64Array.BYTES_PER_ELEMENT + n_out,
      );

      // copy out parameters of interest
      const draws: number[][] = Array.from({ length: n_params }, (_, i) =>
        Array.from({ length: n_draws }, (_, j) => out_buffer[i + n_params * j]),
      );

      let metric_array: number[][] | number[][][] | null = null;

      if (save_metric) {
        if (metric === HMCMetric.DENSE) {
          const metric_buffer = this.m.HEAPF64.subarray(
            metric_out / Float64Array.BYTES_PER_ELEMENT,
            metric_out / Float64Array.BYTES_PER_ELEMENT +
              num_chains * free_params * free_params,
          );

          metric_array = Array.from({ length: num_chains }, (_, i) =>
            Array.from({ length: free_params }, (_, j) =>
              Array.from(
                { length: free_params },
                (_, k) =>
                  metric_buffer[
                    i * free_params * free_params + j * free_params + k
                  ],
              ),
            ),
          );
        } else {
          const metric_buffer = this.m.HEAPF64.subarray(
            metric_out / Float64Array.BYTES_PER_ELEMENT,
            metric_out / Float64Array.BYTES_PER_ELEMENT +
              num_chains * free_params,
          );
          metric_array = Array.from({ length: num_chains }, (_, i) =>
            Array.from(
              { length: free_params },
              (_, j) => metric_buffer[i * free_params + j],
            ),
          );
        }
      }

      return { paramNames, draws, metric: metric_array };
    });
  }

  public pathfinder(p: Partial<PathfinderParams>): StanDraws {
    const {
      data,
      num_paths,
      inits,
      seed,
      id,
      init_radius,
      num_draws,
      max_history_size,
      init_alpha,
      tol_obj,
      tol_rel_obj,
      tol_grad,
      tol_rel_grad,
      tol_param,
      num_iterations,
      num_elbo_draws,
      num_multi_draws,
      calculate_lp,
      psis_resample,
      refresh,
      num_threads,
    } = { ...defaultPathfinderParams, ...p };

    if (num_paths < 1) {
      throw new Error("num_paths must be at least 1");
    }
    if (num_draws < 1) {
      throw new Error("num_draws must be at least 1");
    }
    if (num_multi_draws < 1) {
      throw new Error("num_multi_draws must be at least 1");
    }

    const output_rows =
      calculate_lp && psis_resample ? num_multi_draws : num_draws * num_paths;

    const seed_ = seed !== null ? seed : Math.floor(Math.random() * (2 ^ 32));

    return this.withModel(data, seed_, (model, deferredFree) => {
      const rawParamNames = this.m.UTF8ToString(
        this.m._tinystan_model_param_names(model),
      );
      const paramNames = PATHFINDER_VARIABLES.concat(rawParamNames.split(","));

      const n_params = paramNames.length;

      const free_params = this.m._tinystan_model_num_free_params(model);
      if (free_params === 0) {
        throw new Error("Model has no parameters.");
      }

      const inits_ptr = this.encodeInits(inits);
      deferredFree(inits_ptr);

      const n_out = output_rows * n_params;
      const out = this.m._malloc(n_out * Float64Array.BYTES_PER_ELEMENT);
      deferredFree(out);
      const err_ptr = this.m._malloc(PTR_SIZE);
      deferredFree(err_ptr);

      const result = this.m._tinystan_pathfinder(
        model,
        num_paths,
        inits_ptr,
        seed_ || 0,
        id,
        init_radius,
        num_draws,
        max_history_size,
        init_alpha,
        tol_obj,
        tol_rel_obj,
        tol_grad,
        tol_rel_grad,
        tol_param,
        num_iterations,
        num_elbo_draws,
        num_multi_draws,
        calculate_lp ? 1 : 0,
        psis_resample ? 1 : 0,
        refresh,
        num_threads,
        out,
        n_out,
        err_ptr,
      );

      if (result != 0) {
        this.handleError(err_ptr);
      }

      const out_buffer = this.m.HEAPF64.subarray(
        out / Float64Array.BYTES_PER_ELEMENT,
        out / Float64Array.BYTES_PER_ELEMENT + n_out,
      );

      const draws: number[][] = Array.from({ length: n_params }, (_, i) =>
        Array.from(
          { length: output_rows },
          (_, j) => out_buffer[i + n_params * j],
        ),
      );

      return { paramNames, draws };
    });
  }

  public stanVersion(): string {
    const major = this.m._malloc(4);
    const minor = this.m._malloc(4);
    const patch = this.m._malloc(4);
    this.m._tinystan_stan_version(major, minor, patch);
    const version =
      this.m.getValue(major, "i32") +
      "." +
      this.m.getValue(minor, "i32") +
      "." +
      this.m.getValue(patch, "i32");
    this.m._free(major);
    this.m._free(minor);
    this.m._free(patch);
    return version;
  }
}

const string_safe_jsonify = (obj: string | unknown): string => {
  if (typeof obj === "string") {
    return obj;
  } else {
    return JSON.stringify(obj);
  }
};
