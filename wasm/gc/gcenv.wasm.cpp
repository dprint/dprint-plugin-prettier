// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

// The memory functions that the collector of NativeAOT-LLVM calls on WASI, in place of runtimelab's
// src/coreclr/gc/wasm/gcenv.wasm.cpp (10.0.0-rc.1.26357.1), which it defines every function of, so that the linker
// does not take that one from the runtime's library. That one zeroes what it reserves and what is decommitted, where
// this one zeroes what is committed, as committed memory reads as zero from an operating system: a segment is then
// only written to as far as the collector uses it, rather than all of it when it is reserved, which lets the plugin
// have large segments without the memory of each instance growing by their size.
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

extern uint32_t g_pageSizeUnixInl;
#define OS_PAGE_SIZE g_pageSizeUnixInl

// the functions of the collector's GCToOSInterface that are defined here, as gcenv.os.h declares them
class GCToOSInterface
{
public:
    static void* VirtualReserve(size_t size, size_t alignment, uint32_t flags, uint16_t node);
    static bool VirtualRelease(void* address, size_t size);
    static void* VirtualReserveAndCommitLargePages(size_t size, uint16_t node);
    static bool VirtualCommit(void* address, size_t size, uint16_t node);
    static bool VirtualDecommit(void* address, size_t size);
    static bool VirtualReset(void* address, size_t size, bool unlock);
};

static void* VirtualReserveInner(size_t size, size_t alignment, uint32_t flags);

void* GCToOSInterface::VirtualReserve(size_t size, size_t alignment, uint32_t flags, uint16_t node)
{
    return VirtualReserveInner(size, alignment, flags);
}

// Releases what was reserved, which is all of it however much is given.
bool GCToOSInterface::VirtualRelease(void* address, size_t size)
{
    free(address);
    return true;
}

void* GCToOSInterface::VirtualReserveAndCommitLargePages(size_t size, uint16_t node)
{
    // Wasm has no large pages
    void* pRetVal = VirtualReserveInner(size, OS_PAGE_SIZE, 0);
    if (pRetVal != NULL && VirtualCommit(pRetVal, size, node))
    {
        return pRetVal;
    }

    return NULL;
}

// Commits memory, which the collector takes to be zero after, whether it was used before or not.
bool GCToOSInterface::VirtualCommit(void* address, size_t size, uint16_t node)
{
    memset(address, 0, size);
    return true;
}

// Decommits memory, which is left as it is, as it is zeroed when it is committed again.
bool GCToOSInterface::VirtualDecommit(void* address, size_t size)
{
    return true;
}

bool GCToOSInterface::VirtualReset(void* address, size_t size, bool unlock)
{
    return false;
}

void InitializeCGroup()
{
}

void CleanupCGroup()
{
}

uint64_t GetTotalPhysicalMemory_Wasm()
{
    // WASI has no way to ask for the most memory there may be, so this is the default of --maximum-memory
    return 2 * 1024 * 1024 * 1024ULL;
}

size_t GetRestrictedPhysicalMemoryLimit()
{
    // a module can't "overcommit" memory
    return GetTotalPhysicalMemory_Wasm();
}

bool GetPhysicalMemoryUsed(size_t* val)
{
    *val = __builtin_wasm_memory_size(0) * OS_PAGE_SIZE;
    if (*val == 0)
    {
        // all 4 GB are in use
        *val = GetTotalPhysicalMemory_Wasm();
    }
    return true;
}

// Reserves memory without zeroing it, which is done when it is committed.
static void* VirtualReserveInner(size_t size, size_t alignment, uint32_t flags)
{
    if (alignment < OS_PAGE_SIZE)
    {
        alignment = OS_PAGE_SIZE;
    }

    void* pRetVal;
    if (posix_memalign(&pRetVal, alignment, size) != 0)
    {
        return NULL;
    }
    return pRetVal;
}
