declare module 'tinystan/bernoulli' {
// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
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
}

// manually modified below
export type StanModule = WasmModule;
export default function createModule (): Promise<StanModule>;
}
