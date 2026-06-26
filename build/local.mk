# use our wasm-friendly TBB, not Stan's vendored version
TBB_INTERFACE_NEW=1
TBB_INC=/app/oneTBB/install/include/
TBB_LIB=/app/oneTBB/install/lib/
LDFLAGS_TBB ?= -Wl,-L,"$(TBB_LIB)"
LDLIBS_TBB ?= -ltbb

O=2

src/tinystan.o: CPPFLAGS+=-include /app/tinystan/patch.hpp

# could also uses -fexceptions which is more compatible, but slower
CXXFLAGS+=-fwasm-exceptions -pthread
LDFLAGS+=-sMODULARIZE -sFAKE_DYLIBS -sEXPORT_NAME=createModule -sEXPORT_ES6 -sENVIRONMENT=web -sINCOMING_MODULE_JS_API=print,printErr
LDFLAGS+=-sEXIT_RUNTIME=0 -sALLOW_MEMORY_GROWTH=1 -pthread -sPTHREAD_POOL_SIZE=4 # pool size is optional but just lets everything init
# Functions we want. Can add more, with a prepended _, from tinystan.h
EXPORTS=_malloc,_free,_tinystan_api_version,_tinystan_create_model,_tinystan_destroy_error,_tinystan_destroy_model,_tinystan_get_error_message,_tinystan_get_error_type,_tinystan_model_num_free_params,_tinystan_model_param_names,_tinystan_sample,_tinystan_separator_char,_tinystan_stan_version,_stop_keepalive_mainloop,_start_keepalive_mainloop
LDFLAGS+=-sEXPORTED_FUNCTIONS=$(EXPORTS) -sEXPORTED_RUNTIME_METHODS=stringToUTF8,getValue,UTF8ToString,lengthBytesUTF8,HEAPF64
