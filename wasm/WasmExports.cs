using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;

// The functions dprint calls on a schema version 4 Wasm plugin, around the program that nts compiled from
// src/main.ts, which resolves the configuration and formats. Data goes between the host and the plugin
// through a shared buffer, which the host writes to after calling clear_shared_bytes and reads from with
// get_shared_bytes_ptr after a function gives a length.
static unsafe partial class Program
{
    private const uint FormatResultNoChange = 0;
    private const uint FormatResultChange = 1;
    private const uint FormatResultError = 2;

    private static readonly UTF8Encoding _pluginUtf8 = new UTF8Encoding(false);
    private static byte* _sharedBytes;
    private static int _sharedBytesLength;
    private static string _filePath;
    private static string _overrideConfig;
    private static byte[] _formattedText;
    private static string _errorText;
    private static bool _hasStarted;

    [UnmanagedCallersOnly(EntryPoint = "dprint_plugin_version_4")]
    public static uint DprintPluginVersion4() => 4;

    [UnmanagedCallersOnly(EntryPoint = "get_plugin_info")]
    public static uint GetPluginInfo()
    {
        string version = typeof(Program).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
        return SetSharedBytes(_pluginUtf8.GetBytes(
            "{\"name\":\"dprint-plugin-prettier\",\"version\":\"" + version + "\",\"configKey\":\"prettier\","
            + "\"helpUrl\":\"https://dprint.dev/plugins/prettier\","
            + "\"configSchemaUrl\":\"https://plugins.dprint.dev/dprint/dprint-plugin-prettier/" + version + "/schema.json\","
            + "\"updateUrl\":\"https://plugins.dprint.dev/dprint/dprint-plugin-prettier/latest.json\"}"));
    }

    [UnmanagedCallersOnly(EntryPoint = "get_license_text")]
    public static uint GetLicenseText()
    {
        using var stream = typeof(Program).Assembly.GetManifestResourceStream("LICENSE");
        using var reader = new StreamReader(stream);
        return SetSharedBytes(_pluginUtf8.GetBytes(reader.ReadToEnd()));
    }

    [UnmanagedCallersOnly(EntryPoint = "register_config")]
    public static void RegisterConfig(uint configId)
    {
        string json = _pluginUtf8.GetString(TakeSharedBytes());
        EnsureStarted();
        M_src_main.registerConfig(configId, json);
    }

    [UnmanagedCallersOnly(EntryPoint = "release_config")]
    public static void ReleaseConfig(uint configId)
    {
        EnsureStarted();
        M_src_main.releaseConfig(configId);
    }

    [UnmanagedCallersOnly(EntryPoint = "get_config_diagnostics")]
    public static uint GetConfigDiagnostics(uint configId) => SetSharedJson(() => M_src_main.getConfigDiagnostics(configId));

    [UnmanagedCallersOnly(EntryPoint = "get_resolved_config")]
    public static uint GetResolvedConfig(uint configId) => SetSharedJson(() => M_src_main.getResolvedConfig(configId));

    [UnmanagedCallersOnly(EntryPoint = "get_config_file_matching")]
    public static uint GetConfigFileMatching(uint configId) => SetSharedJson(() => M_src_main.getFileMatching(configId));

    // the plugin has no configuration that changes between versions
    [UnmanagedCallersOnly(EntryPoint = "check_config_updates")]
    public static uint CheckConfigUpdates()
    {
        TakeSharedBytes();
        return SetSharedBytes("""{"kind":"ok","data":[]}"""u8);
    }

    [UnmanagedCallersOnly(EntryPoint = "set_override_config")]
    public static void SetOverrideConfig() => _overrideConfig = _pluginUtf8.GetString(TakeSharedBytes());

    [UnmanagedCallersOnly(EntryPoint = "set_file_path")]
    public static void SetFilePath() => _filePath = _pluginUtf8.GetString(TakeSharedBytes());

    [UnmanagedCallersOnly(EntryPoint = "format")]
    public static uint Format(uint configId) => FormatInner(configId);

    // no support for range formatting
    [UnmanagedCallersOnly(EntryPoint = "format_range")]
    public static uint FormatRange(uint configId, uint rangeStart, uint rangeEnd)
    {
        TakeSharedBytes();
        _filePath = null;
        _overrideConfig = null;
        return FormatResultNoChange;
    }

    [UnmanagedCallersOnly(EntryPoint = "get_formatted_text")]
    public static uint GetFormattedText()
    {
        var bytes = _formattedText ?? throw new InvalidOperationException("Expected to have formatted text.");
        _formattedText = null;
        return SetSharedBytes(bytes);
    }

    [UnmanagedCallersOnly(EntryPoint = "get_error_text")]
    public static uint GetErrorText()
    {
        var text = _errorText ?? throw new InvalidOperationException("Expected to have error text.");
        _errorText = null;
        return SetSharedBytes(_pluginUtf8.GetBytes(text));
    }

    [UnmanagedCallersOnly(EntryPoint = "get_shared_bytes_ptr")]
    public static byte* GetSharedBytesPtr() => _sharedBytes;

    [UnmanagedCallersOnly(EntryPoint = "clear_shared_bytes")]
    public static byte* ClearSharedBytes(uint size)
    {
        NativeMemory.Free(_sharedBytes);
        _sharedBytes = (byte*)NativeMemory.AllocZeroed(size);
        _sharedBytesLength = (int)size;
        return _sharedBytes;
    }

    private static uint FormatInner(uint configId)
    {
        try
        {
            var filePath = _filePath ?? throw new InvalidOperationException("Expected the file path to be set.");
            var overrideConfig = _overrideConfig ?? "";
            _filePath = null;
            _overrideConfig = null;
            var fileBytes = TakeSharedBytes();
            EnsureStarted();
            var formatting = M_src_main.formatFile(configId, overrideConfig, filePath, _pluginUtf8.GetString(fileBytes));
            if (!formatting.IsCompleted) throw new InvalidOperationException("The formatting waits for something.");
            string answer = formatting.GetAwaiter().GetResult();
            switch (answer[0])
            {
                case '0':
                    var formatted = _pluginUtf8.GetBytes(answer, 1, answer.Length - 1);
                    if (formatted.AsSpan().SequenceEqual(fileBytes)) return FormatResultNoChange;
                    _formattedText = formatted;
                    return FormatResultChange;
                default:
                    _errorText = answer.Substring(1);
                    return FormatResultError;
            }
        }
        catch (Exception ex)
        {
            _errorText = ex.ToString();
            return FormatResultError;
        }
    }

    // the modules of the program are set up when the plugin is first used
    private static void EnsureStarted()
    {
        if (!_hasStarted)
        {
            __Run();
            _hasStarted = true;
        }
    }

    private static uint SetSharedJson(Func<string> getJson)
    {
        EnsureStarted();
        return SetSharedBytes(_pluginUtf8.GetBytes(getJson()));
    }

    private static uint SetSharedBytes(ReadOnlySpan<byte> bytes)
    {
        NativeMemory.Free(_sharedBytes);
        _sharedBytes = (byte*)NativeMemory.Alloc((nuint)bytes.Length);
        _sharedBytesLength = bytes.Length;
        bytes.CopyTo(new Span<byte>(_sharedBytes, bytes.Length));
        return (uint)bytes.Length;
    }

    private static byte[] TakeSharedBytes()
    {
        var bytes = new ReadOnlySpan<byte>(_sharedBytes, _sharedBytesLength).ToArray();
        NativeMemory.Free(_sharedBytes);
        _sharedBytes = null;
        _sharedBytesLength = 0;
        return bytes;
    }
}
