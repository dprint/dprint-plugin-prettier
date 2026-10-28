// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

// The memory functions that the collector of NativeAOT-LLVM calls on WASI, in place of runtimelab's
// src/coreclr/gc/wasm/gcenv.wasm.cpp (10.0.0-rc.1.26357.1), which it defines every function of, so that the linker
// does not take that one from the runtime's library. That one zeroes what it reserves and what is decommitted, where
// this one zeroes what is committed, as committed memory reads as zero from an operating system, and only the part of
// it that may have been written to: a segment is then only written to as far as the collector uses it, rather than
// all of it when it is reserved, which lets the plugin have large segments without the memory of each instance
// growing by their size.
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

extern uint32_t g_pageSizeUnixInl;
#define OS_PAGE_SIZE g_pageSizeUnixInl

// What was reserved, and where in it starts what the module's memory did not reach when it was reserved, which has
// never been written to and reads as zero, as a module's memory does when it grows. Zeroing that when it is committed
// made formatting YAML's large files 3% slower, as the collector commits the memory of a segment as it grows into it.
// The collector never commits the same memory of a reservation twice, as it is never decommitted, so only what was
// written to before it was reserved is zeroed: one reservation holds the segments of all three heaps at once, and
// taking what was committed of one to be written to zeroed what another committed below it, 625 MB for each pass over
// the JSON files. There are only a few reservations at once (the segments and the collector's tables); memory of any
// others is zeroed when it is committed
struct Reservation
{
    uint8_t* start;
    uint8_t* end;
    uint8_t* untouched;
};
static Reservation g_reservations[64];
static size_t g_reservationCount;

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
static Reservation* FindReservation(uint8_t* address);

void* GCToOSInterface::VirtualReserve(size_t size, size_t alignment, uint32_t flags, uint16_t node)
{
    return VirtualReserveInner(size, alignment, flags);
}

// Releases what was reserved, which is all of it however much is given.
bool GCToOSInterface::VirtualRelease(void* address, size_t size)
{
    Reservation* reservation = FindReservation((uint8_t*)address);
    if (reservation != NULL)
    {
        *reservation = g_reservations[--g_reservationCount];
    }
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

// Commits memory, which the collector takes to be zero after, whether it was used before or not. Only what may
// have been written to is zeroed.
bool GCToOSInterface::VirtualCommit(void* address, size_t size, uint16_t node)
{
    uint8_t* start = (uint8_t*)address;
    uint8_t* end = start + size;
    Reservation* reservation = FindReservation(start);
    if (reservation == NULL)
    {
        memset(address, 0, size);
        return true;
    }
    if (start < reservation->untouched)
    {
        memset(start, 0, (end < reservation->untouched ? end : reservation->untouched) - start);
    }
    return true;
}

// Says that memory was not decommitted, as a module's memory can't be given back. The collector then keeps it
// committed, along with what it knows of which part of it was used, rather than zeroing all of it when it commits
// it again.
bool GCToOSInterface::VirtualDecommit(void* address, size_t size)
{
    return false;
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

    // memory past the end of the module's memory has never been written to
    uint8_t* grownFrom = (uint8_t*)(__builtin_wasm_memory_size(0) * 65536);
    void* pRetVal;
    if (posix_memalign(&pRetVal, alignment, size) != 0)
    {
        return NULL;
    }
    if (g_reservationCount < sizeof(g_reservations) / sizeof(g_reservations[0]))
    {
        uint8_t* start = (uint8_t*)pRetVal;
        uint8_t* end = start + size;
        uint8_t* untouched = grownFrom < start ? start : grownFrom > end ? end : grownFrom;
        g_reservations[g_reservationCount++] = { start, end, untouched };
    }
    return pRetVal;
}

static Reservation* FindReservation(uint8_t* address)
{
    for (size_t i = 0; i < g_reservationCount; i++)
    {
        if (address >= g_reservations[i].start && address < g_reservations[i].end)
        {
            return &g_reservations[i];
        }
    }
    return NULL;
}
