#pragma once
#include <atomic>
#include <emscripten.h>

std::atomic<bool> keep_alive{false};

void idle_main_loop() {
  // No-op
}

extern "C" {
EMSCRIPTEN_KEEPALIVE void start_keepalive_mainloop() {
  if (!keep_alive.exchange(true)) {
    emscripten_set_main_loop(idle_main_loop, 1, 1);
  }
}

EMSCRIPTEN_KEEPALIVE void stop_keepalive_mainloop() {
  if (keep_alive.exchange(false)) {
    emscripten_cancel_main_loop();
  }
}
}
