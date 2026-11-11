using System.Runtime.InteropServices;
using System.Text;

// Flow's parser, which is a Wasm module in the flow-parser package that is compiled into the plugin as C (see
// wasm/flow), for src/shims/flow-parser.ts, which calls it as the package's JavaScript calls the module.
static unsafe partial class Program
{
    static class flowNative
    {
        private static int _writtenLength;

        /// <summary>Creates the parser the first time that it is used.</summary>
        public static void start() => flow_start();

        /// <summary>
        /// Writes text into the parser's memory as UTF-8 with a zero after it and gives where, or 0 when it has
        /// no room for it. How many bytes that is with the zero is given by <see cref="writtenLength"/>.
        /// </summary>
        public static int writeText(string text)
        {
            int length = Encoding.UTF8.GetByteCount(text);
            uint address = flow_malloc((uint)length + 1);
            if (address == 0) return 0;
            byte* memory = flow_memory();
            int written = Encoding.UTF8.GetBytes(text, new System.Span<byte>(memory + address, length));
            memory[address + written] = 0;
            _writtenLength = written + 1;
            return (int)address;
        }

        public static int writtenLength() => _writtenLength;

        public static void free(int address) => flow_free((uint)address);

        public static int parse(int source, int sourceLength, int filename, int filenameLength, int componentSyntax,
            int matchSyntax, int decorators, int tokens, int returnOutsideFunction, int assertOperator, int enums,
            int records, int types, int sourceType, int typesPragmaDetection, int last) =>
            (int)flow_parse((uint)source, (uint)sourceLength, (uint)filename, (uint)filenameLength,
                (uint)componentSyntax, (uint)matchSyntax, (uint)decorators, (uint)tokens, (uint)returnOutsideFunction,
                (uint)assertOperator, (uint)enums, (uint)records, (uint)types, (uint)sourceType,
                (uint)typesPragmaDetection, (uint)last);

        public static void resultFree(int result) => flow_result_free((uint)result);

        /// <summary>Gets what went wrong in parsing, or nothing when it says nothing.</summary>
        public static string resultError(int result)
        {
            uint address = flow_result_error((uint)result);
            return address == 0 ? null : Marshal.PtrToStringUTF8((nint)(flow_memory() + address));
        }

        public static int resultErrorLine(int result) => (int)flow_result_error_line((uint)result);

        public static int resultErrorColumn(int result) => (int)flow_result_error_column((uint)result);

        public static int resultProgramBuffer(int result) => (int)flow_result_program_buffer((uint)result);

        public static int resultPositionBuffer(int result) => (int)flow_result_position_buffer((uint)result);

        public static int resultPositionBufferSize(int result) => (int)flow_result_position_buffer_size((uint)result);

        public static int resultStringBuffer(int result) => (int)flow_result_string_buffer((uint)result);

        /// <summary>
        /// Gets the parser's memory as Emscripten's HEAPU8, HEAPU32 or HEAPF64 has it (by the size of each element
        /// in bytes, with 8 for numbers), which holds while nothing else is parsed.
        /// </summary>
        public static object heap(int elementSize) => new FlowHeap(flow_memory(), flow_memory_size(), elementSize);

        [DllImport("flowparser")] private static extern int flow_start();
        [DllImport("flowparser")] private static extern byte* flow_memory();
        [DllImport("flowparser")] private static extern uint flow_memory_size();
        [DllImport("flowparser")] private static extern uint flow_malloc(uint size);
        [DllImport("flowparser")] private static extern void flow_free(uint address);
        [DllImport("flowparser")] private static extern uint flow_parse(uint source, uint sourceSize, uint filename,
            uint filenameSize, uint componentSyntax, uint matchSyntax, uint decorators, uint tokens,
            uint returnOutsideFunction, uint assertOperator, uint enums, uint records, uint types, uint sourceType,
            uint typesPragmaDetection, uint last);
        [DllImport("flowparser")] private static extern void flow_result_free(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_error(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_error_line(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_error_column(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_program_buffer(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_position_buffer(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_position_buffer_size(uint result);
        [DllImport("flowparser")] private static extern uint flow_result_string_buffer(uint result);
    }

    /// <summary>A view of the parser's memory as an array of numbers that can only be read.</summary>
    sealed class FlowHeap : JsArrayBase
    {
        private readonly byte* _memory;
        private readonly int _count;
        private readonly int _elementSize;

        public FlowHeap(byte* memory, uint size, int elementSize)
        {
            _memory = memory;
            _count = (int)(size / (uint)elementSize);
            _elementSize = elementSize;
        }

        public override int Count { get => _count; set => throw new Error("The memory of the parser cannot be resized"); }

        public override bool HasObjectElements => false;

        public override object GetItem(int index)
        {
            if ((uint)index >= (uint)_count) return null;
            return _elementSize switch
            {
                1 => JsRuntime.Box(_memory[index]),
                4 => JsRuntime.Box(((uint*)_memory)[index]),
                _ => JsRuntime.Box(((double*)_memory)[index]),
            };
        }

        public override void SetItem(int index, object value) => throw new Error("The memory of the parser cannot be written");

        public override void AddValue(object value) => throw new Error("The memory of the parser cannot be resized");
    }
}
