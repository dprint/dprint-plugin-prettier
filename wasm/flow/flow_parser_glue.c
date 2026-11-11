// Runs Flow's parser, the Wasm module that the flow-parser package has, which wasm2c made C of and which is
// compiled into the plugin. The module was built with Emscripten for JavaScript to call; this gives it what
// Emscripten's JavaScript did (its imports and a growing memory) and gives C# functions to call it with.
//
// It is created the first time a file is parsed with it, since its memory starts at 128 MB.
#ifdef _WIN32
// for the probes, which run the plugin natively on Windows
#define _CRT_RAND_S
#define FLOW_EXPORT __declspec(dllexport)
#else
#include <unistd.h>
#define FLOW_EXPORT
#endif
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "flow_parser.h"

struct w2c_a {
  w2c_flow* flow;
};

static w2c_flow instance;
static struct w2c_a imports;
static int started;

/** Creates the parser when it was not yet, and says whether it could be. */
FLOW_EXPORT int flow_start(void) {
  if (started) return 1;
  imports.flow = &instance;
  wasm2c_flow_instantiate(&instance, &imports);
  // what Emscripten's JavaScript does when it starts the module: its constructors and then its main
  w2c_flow_e(&instance);
  w2c_flow_o(&instance, 0, 0);
  started = 1;
  return 1;
}

/** Where the parser's memory is, which moves when it grows, so it is asked for after each call. */
FLOW_EXPORT uint8_t* flow_memory(void) { return w2c_flow_d(&instance)->data; }

FLOW_EXPORT uint32_t flow_memory_size(void) { return (uint32_t)w2c_flow_d(&instance)->size; }

FLOW_EXPORT uint32_t flow_parse(uint32_t source, uint32_t sourceSize, uint32_t filename, uint32_t filenameSize,
                    uint32_t componentSyntax, uint32_t matchSyntax, uint32_t decorators, uint32_t tokens,
                    uint32_t returnOutsideFunction, uint32_t assertOperator, uint32_t enums, uint32_t records,
                    uint32_t types, uint32_t sourceType, uint32_t typesPragmaDetection, uint32_t last) {
  return w2c_flow_f(&instance, source, sourceSize, filename, filenameSize, componentSyntax, matchSyntax, decorators,
                    tokens, returnOutsideFunction, assertOperator, enums, records, types, sourceType,
                    typesPragmaDetection, last);
}

FLOW_EXPORT void flow_result_free(uint32_t result) { w2c_flow_g(&instance, result); }
FLOW_EXPORT uint32_t flow_result_error(uint32_t result) { return w2c_flow_h(&instance, result); }
FLOW_EXPORT uint32_t flow_result_error_column(uint32_t result) { return w2c_flow_i(&instance, result); }
FLOW_EXPORT uint32_t flow_result_error_line(uint32_t result) { return w2c_flow_j(&instance, result); }
FLOW_EXPORT uint32_t flow_result_position_buffer(uint32_t result) { return w2c_flow_k(&instance, result); }
FLOW_EXPORT uint32_t flow_result_position_buffer_size(uint32_t result) { return w2c_flow_l(&instance, result); }
FLOW_EXPORT uint32_t flow_result_program_buffer(uint32_t result) { return w2c_flow_m(&instance, result); }
FLOW_EXPORT uint32_t flow_result_string_buffer(uint32_t result) { return w2c_flow_n(&instance, result); }
FLOW_EXPORT uint32_t flow_malloc(uint32_t size) { return w2c_flow_p(&instance, size); }
FLOW_EXPORT void flow_free(uint32_t address) { w2c_flow_q(&instance, address); }

// the module's imports, as Emscripten's JavaScript has them

/** getentropy */
u32 w2c_a_a(struct w2c_a* imports, u32 buffer, u32 size) {
  wasm_rt_memory_t* memory = w2c_flow_d(imports->flow);
  if ((uint64_t)buffer + size > memory->size) wasm_rt_trap(WASM_RT_TRAP_OOB);
#ifdef _WIN32
  for (u32 i = 0; i < size; i++) {
    unsigned int value;
    if (rand_s(&value) != 0) return 1;
    memory->data[buffer + i] = (uint8_t)value;
  }
  return 0;
#else
  return getentropy(memory->data + buffer, size) == 0 ? 0 : 1;
#endif
}

/** emscripten_memcpy_big */
void w2c_a_b(struct w2c_a* imports, u32 dest, u32 src, u32 num) {
  wasm_rt_memory_t* memory = w2c_flow_d(imports->flow);
  if ((uint64_t)dest + num > memory->size || (uint64_t)src + num > memory->size) wasm_rt_trap(WASM_RT_TRAP_OOB);
  memmove(memory->data + dest, memory->data + src, num);
}

/** emscripten_resize_heap, which grows the memory by as much as Emscripten's JavaScript would */
u32 w2c_a_c(struct w2c_a* imports, u32 requested) {
  wasm_rt_memory_t* memory = w2c_flow_d(imports->flow);
  uint64_t oldSize = memory->size;
  uint64_t maxSize = memory->max_pages * memory->page_size;
  if (requested > maxSize) return 0;
  for (int cutDown = 1; cutDown <= 4; cutDown *= 2) {
    uint64_t overGrown = (uint64_t)(oldSize * (1 + 0.2 / cutDown));
    if (overGrown > (uint64_t)requested + 100663296) overGrown = (uint64_t)requested + 100663296;
    uint64_t newSize = requested > overGrown ? requested : overGrown;
    newSize = (newSize + 65535) / 65536 * 65536;
    if (newSize > maxSize) newSize = maxSize;
    if (wasm_rt_grow_memory(memory, (newSize - oldSize) / memory->page_size) != (uint64_t)-1) return 1;
  }
  return 0;
}

// what wasm2c's runtime has, without what WASI does not have (signals, setjmp)

#if WASM_RT_STACK_DEPTH_COUNT
WASM_RT_THREAD_LOCAL uint32_t wasm_rt_call_stack_depth;
#endif

bool wasm_rt_is_initialized(void) { return true; }

void wasm_rt_trap(wasm_rt_trap_t code) {
  (void)code;
  abort();
}

void wasm_rt_allocate_memory(wasm_rt_memory_t* memory, uint64_t initialPages, uint64_t maxPages, bool is64,
                             uint32_t pageSize) {
  uint64_t size = initialPages * pageSize;
  memory->data = calloc(size, 1);
  if (memory->data == NULL) abort();
  memory->data_end = memory->data + size;
  memory->page_size = pageSize;
  memory->pages = initialPages;
  memory->max_pages = maxPages;
  memory->size = size;
  memory->is64 = is64;
}

uint64_t wasm_rt_grow_memory(wasm_rt_memory_t* memory, uint64_t delta) {
  uint64_t oldPages = memory->pages;
  uint64_t newPages = oldPages + delta;
  if (newPages < oldPages || newPages > memory->max_pages) return (uint64_t)-1;
  uint64_t oldSize = memory->size;
  uint64_t newSize = newPages * memory->page_size;
  if (newSize > SIZE_MAX) return (uint64_t)-1;
  uint8_t* data = realloc(memory->data, (size_t)newSize);
  if (data == NULL) return (uint64_t)-1;
  memset(data + oldSize, 0, (size_t)(newSize - oldSize));
  memory->data = data;
  memory->data_end = data + newSize;
  memory->pages = newPages;
  memory->size = newSize;
  return oldPages;
}

void wasm_rt_free_memory(wasm_rt_memory_t* memory) { free(memory->data); }

void wasm_rt_allocate_funcref_table(wasm_rt_funcref_table_t* table, uint32_t elements, uint32_t maxElements) {
  table->data = calloc(elements, sizeof(wasm_rt_funcref_t));
  if (elements > 0 && table->data == NULL) abort();
  table->size = elements;
  table->max_size = maxElements;
}

void wasm_rt_free_funcref_table(wasm_rt_funcref_table_t* table) { free(table->data); }
