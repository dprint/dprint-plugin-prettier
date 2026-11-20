// wasm-rt.h includes setjmp.h for trapping, which WASI only has with exception handling: traps abort instead
#pragma once
typedef int jmp_buf[1];
