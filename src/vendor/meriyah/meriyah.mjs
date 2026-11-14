// @nts-check
var version$1 = "7.4.2";
var packageJson = {
	version: version$1};

const unicodeLookup = ((/** @type {number[]} */ compressed, /** @type {number[]} */ lookup) => {
    const result = new Uint32Array(69632);
    let index = 0;
    let subIndex = 0;
    while (index < 2661) {
        const inst = compressed[index++];
        if (inst < 0) {
            subIndex -= inst;
        }
        else {
            let code = compressed[index++];
            if (inst & 2)
                code = lookup[code];
            if (inst & 1) {
                result.fill(code, subIndex, subIndex += compressed[index++]);
            }
            else {
                result[subIndex++] = code;
            }
        }
    }
    return result;
})([-1, 2, 23, 2, 24, 2, 5, -1, 0, 77595648, 3, 42, 2, 3, 0, 14, 2, 60, 2, 61, 3, 0, 3, 0, 3168796671, 0, 4294956992, 2, 1, 2, 0, 2, 39, 3, 0, 4, 0, 4294966523, 3, 0, 4, 2, 15, 2, 62, 2, 0, 0, 4294842879, 0, 3221225471, 0, 4294902710, 2, 63, 0, 134152192, 3, 0, 2, 0, 4294951935, 3, 0, 2, 0, 2683305983, 0, 2684354047, 2, 16, 2, 0, 0, 4294961151, 3, 0, 2, 2, 17, 2, 0, 0, 608174079, 2, 0, 2, 56, 2, 7, 2, 6, 0, 4286643967, 3, 0, 2, 2, 1, 3, 0, 3, 0, 4294901711, 2, 38, 0, 4089839103, 0, 2961209759, 0, 1342439375, 0, 4294543342, 0, 3547201023, 0, 1577204103, 0, 4194240, 0, 4294688750, 2, 2, 0, 80831, 0, 4261478351, 0, 4294549486, 2, 2, 0, 2969057695, 0, 196559, 0, 3594373100, 0, 3288319768, 0, 8469959, 0, 65472, 2, 3, 0, 4093640191, 0, 929054175, 0, 65487, 0, 4294828015, 0, 4092591615, 0, 1885355487, 0, 982991, 2, 3, 2, 0, 0, 2163244511, 0, 4227923919, 0, 4236247022, 2, 68, 0, 4284449919, 0, 851904, 2, 4, 2, 12, 0, 67076095, -1, 2, 69, 0, 1073741743, 0, 4093607775, -1, 0, 50331649, 0, 3265266687, 2, 32, 0, 4294844415, 0, 4278190047, 2, 18, 2, 139, -1, 3, 0, 2, 2, 28, 2, 0, 2, 10, 2, 0, 2, 14, 2, 20, 3, 0, 10, 2, 71, 2, 0, 2, 72, 2, 73, 2, 74, 2, 0, 2, 75, 2, 0, 2, 11, 0, 261632, 2, 22, 3, 0, 2, 2, 13, 2, 4, 3, 0, 18, 2, 76, 2, 5, 3, 0, 2, 2, 77, 0, 2151677951, 2, 26, 2, 9, 0, 909311, 3, 0, 2, 0, 814743551, 2, 64, 0, 67090432, 3, 0, 2, 2, 40, 2, 0, 2, 6, 2, 0, 2, 29, 2, 8, 0, 268374015, 2, 109, 2, 48, 2, 0, 2, 78, 0, 134153215, -1, 2, 7, 2, 0, 2, 8, 0, 2684354559, 0, 67044351, 0, 3221160064, 2, 0, 2, 27, 3, 0, 2, 2, 50, 0, 1046528, 3, 0, 3, 2, 9, 2, 0, 2, 127, 0, 4294960127, 2, 10, 2, 6, 2, 11, 0, 4294377472, 2, 12, 3, 0, 16, 2, 13, 2, 0, 2, 80, 2, 10, 2, 0, 2, 81, 2, 82, 2, 83, 0, 12288, 2, 51, 0, 1048577, 2, 84, 2, 85, -1, 0, 536805376, 0, 131042, 2, 86, 2, 87, 2, 88, 2, 0, 2, 33, -83, 3, 0, 7, 0, 1046559, 2, 0, 2, 14, 2, 0, 0, 2147516671, 2, 19, 3, 89, 2, 2, 0, -16, 2, 90, 0, 524222462, 2, 4, 2, 0, 0, 4269801471, 2, 4, 3, 0, 2, 2, 25, 2, 15, 3, 0, 2, 2, 57, 2, 0, -1, 2, 16, -16, 3, 0, 206, -2, 3, 0, 692, 2, 70, -1, 2, 16, 2, 10, 3, 0, 8, 2, 92, 2, 133, 2, 0, 0, 3220242431, 3, 0, 3, 2, 17, 2, 93, 2, 94, 3, 0, 2, 2, 95, 2, 0, 2, 10, 2, 96, 2, 0, 0, 4351, 2, 0, 2, 9, 3, 0, 2, 0, 67043391, 0, 3909091327, 2, 0, 2, 21, 2, 9, 2, 18, 3, 0, 2, 0, 67076097, 2, 8, 2, 0, 2, 19, 0, 67059711, 0, 4236247039, 3, 0, 2, 0, 939524103, 0, 8191999, 2, 100, 2, 101, 2, 20, 2, 102, 3, 0, 3, 0, 67057663, 3, 0, 349, 2, 47, 2, 103, 2, 7, -264, 3, 0, 11, 2, 21, 3, 0, 2, 2, 31, -1, 0, 3774349439, 2, 104, 2, 105, 3, 0, 2, 2, 17, 2, 106, 3, 0, 10, 2, 10, 2, 16, 2, 0, 2, 44, 2, 0, 2, 30, 2, 107, 2, 22, 0, 1638399, 0, 57344, 2, 108, 3, 0, 3, 2, 18, 2, 23, 2, 24, 2, 5, 2, 25, 2, 0, 2, 8, 2, 110, -1, 2, 111, 2, 112, 2, 113, -1, 3, 0, 3, 2, 12, -2, 2, 0, 2, 26, -3, 0, 536870912, -4, 2, 18, 2, 0, 2, 27, 0, 1, 2, 0, 2, 55, 2, 6, 2, 12, 2, 10, 2, 0, 2, 114, -1, 3, 0, 4, 2, 10, 2, 28, 2, 115, 2, 7, 2, 0, 2, 116, 2, 0, 2, 117, 2, 118, 2, 119, 2, 0, 2, 9, 3, 0, 9, 2, 19, 2, 29, 2, 30, 2, 120, 2, 46, -2, 2, 121, 2, 122, 2, 29, 2, 19, 2, 8, -2, 2, 123, 2, 29, 3, 31, 2, -1, 2, 0, 2, 37, -2, 0, 4277137519, 0, 2269118463, -1, 3, 18, 2, -1, 2, 32, 2, 36, 2, 0, 3, 29, 2, 2, 34, 2, 17, -3, 3, 0, 2, 2, 33, -1, 2, 0, 2, 34, 2, 0, 2, 34, 2, 0, 2, 45, 2, 0, 0, 4294950463, 2, 35, -7, 2, 0, 0, 203775, 0, 4261476604, 2, 53, 2, 18, 2, 41, 2, 27, 2, 16, 2, 35, 2, 16, 2, 124, 2, 19, 3, 0, 2, 2, 36, 0, 2151677888, 2, 0, 2, 12, 0, 4294901764, 2, 149, 2, 0, 2, 52, 0, 4294902000, 0, 5242879, 3, 0, 2, 0, 402644511, -1, 2, 128, 2, 37, 0, 3, -1, 2, 129, 2, 130, 2, 0, 0, 67045375, 2, 38, 0, 4226678271, 0, 3766565279, 0, 2039759, 2, 132, 2, 39, 0, 1046437, 0, 6, 3, 0, 2, 0, 3288270847, 0, 3, 3, 0, 2, 0, 67043519, -5, 2, 0, 0, 4282384383, 0, 1056964609, -1, 3, 0, 2, 0, 67043345, -1, 2, 0, 2, 40, 2, 28, 2, 79, 2, 11, 2, 58, 2, 36, -5, 2, 0, 2, 12, -3, 3, 0, 2, 0, 2147484671, 2, 134, 0, 4190109695, 2, 49, -2, 2, 135, 0, 4244635647, 0, 27, 2, 0, 2, 8, 2, 41, 2, 0, 2, 65, 2, 16, 2, 0, 2, 40, 2, 136, -2, 2, 30, -2, 2, 0, 2, 43, 2, 54, 2, 42, 2, 43, 2, 137, 2, 44, 0, 8388351, -2, 2, 138, 0, 3028287487, 2, 45, 2, 140, 0, 33259519, 2, 28, 2, 7, 2, 125, -7, 2, 19, 2, 46, 0, 3355443199, 0, 134152199, -2, 2, 66, -2, 3, 0, 28, 2, 31, -3, 3, 0, 3, 2, 141, 3, 0, 6, 2, 47, 3, 0, 9, 2, 36, -71, 2, 16, 3, 0, 2, 2, 27, 3, 0, 33, 2, 22, 2, 29, 3, 0, 124, 2, 12, 3, 0, 18, 2, 36, -213, 2, 0, 2, 31, -54, 3, 0, 17, 2, 40, 2, 8, 2, 28, 2, 0, 2, 8, 2, 28, 2, 48, 2, 0, 2, 19, 2, 49, 2, 142, 2, 22, -13, 2, 0, 2, 50, -6, 3, 0, 2, -1, 2, 143, 2, 9, -1, 3, 0, 2, 0, 4294936575, 2, 0, 0, 4294934783, -2, 0, 8323099, 3, 0, 230, 2, 12, 2, 51, 2, 0, 0, 1, -2, 3, 0, 3, 2, 34, 3, 0, 28, 2, 17, 2, 0, 2, 34, -240, 2, 144, 3, 0, 9, 2, 145, 2, 146, 2, 147, 3, 0, 11, 2, 7, -72, 3, 0, 3, 2, 148, 0, 1677656575, -130, 2, 23, -16, 2, 0, 2, 21, 2, 36, -14, 0, 384, -1, 0, 4161266656, 0, 4071, 0, 15360, -4, 0, 2550595612, -1, 0, 3, -11, 3, 0, 2, 2, 52, 2, 0, 2, 150, 2, 151, 2, 59, 2, 0, 2, 152, 2, 153, 2, 154, 3, 0, 10, 2, 155, 2, 156, 2, 20, 3, 52, 2, 3, 53, 2, 3, 54, 2, 0, 4294954999, 2, 0, -16, 2, 0, 2, 91, 2, 0, 0, 2105343, 0, 4160749584, 0, 65534, -34, 3, 0, 4, 2, 158, -1, 2, 55, 2, 0, 0, 4194303871, 0, 4294903771, 2, 0, 2, 56, 2, 99, -3, 2, 0, 0, 1073684479, 0, 17407, -9, 2, 16, 2, 57, 2, 0, 2, 31, -14, 2, 16, 2, 31, -6, 2, 16, 2, 12, -6, 2, 8, 0, 3225419775, -7, 2, 159, 3, 0, 6, 0, 8323103, -1, 3, 0, 2, 2, 58, -37, 2, 59, 2, 160, 2, 161, 2, 162, 2, 163, 2, 164, -105, 2, 23, -32, 3, 0, 1335, -1, 3, 0, 136, 2, 8, 3, 0, 180, 2, 21, 3, 0, 233, 2, 165, 3, 0, 18, 2, 10, -77, 3, 0, 16, 2, 10, -47, 3, 0, 154, 2, 6, 3, 0, 264, 2, 31, -1244, 3, 0, 354, -20518, 3, 0, 7, 2, 22, -6130, 3, 5, 2, -1, 0, 69207040, 3, 42, 2, 3, 0, 14, 2, 60, 2, 61, -3, 0, 3168731136, 0, 4294956864, 2, 1, 2, 0, 2, 39, 3, 0, 4, 0, 4294966275, 3, 0, 4, 2, 15, 2, 62, 2, 0, 0, 6655, -1, 2, 16, 2, 63, -1, 2, 0, 0, 2047, 0, 4294885376, 3, 0, 2, 0, 3145727, 0, 2617294944, 0, 4294770688, 2, 22, 2, 55, 3, 0, 2, 0, 131135, 2, 97, 0, 70256639, 0, 71303167, 0, 272, 2, 40, 2, 6, 0, 65279, 2, 0, 2, 64, -1, 2, 98, 2, 65, 0, 4278255616, 0, 4294836227, 0, 4294549473, 0, 600178175, 0, 2952806400, 0, 268632067, 0, 4294543328, 0, 57540095, 0, 1577058304, 0, 1835008, 0, 4294688736, 2, 67, 2, 66, 0, 33554435, 2, 131, 2, 67, 0, 2952790016, 0, 131075, 0, 3594373096, 0, 67094296, 2, 66, -1, 0, 4294828000, 0, 603979263, 0, 922746880, 0, 3, 0, 4294828001, 0, 602930687, 0, 1879048192, 0, 393219, 0, 4294828016, 0, 671088639, 0, 2154840064, 0, 4227858435, 0, 4236247008, 2, 68, 2, 36, -1, 2, 4, 0, 917503, 2, 36, -1, 2, 69, 0, 537788335, 0, 4026531935, -1, 0, 1, -1, 2, 32, 2, 70, 0, 7936, -3, 2, 0, 0, 2147485695, 0, 1010761728, 0, 4292984930, 0, 16387, 2, 0, 2, 14, 2, 20, 3, 0, 10, 2, 71, 2, 0, 2, 72, 2, 73, 2, 74, 2, 0, 2, 75, 2, 0, 2, 12, -1, 2, 22, 3, 0, 2, 2, 13, 2, 4, 3, 0, 18, 2, 76, 2, 5, 3, 0, 2, 2, 77, 0, 2147745791, 3, 17, 2, 0, 122879, 2, 0, 2, 9, 0, 276824064, -2, 3, 0, 2, 2, 40, 2, 0, 0, 4294903295, 2, 0, 2, 29, 2, 8, -1, 2, 16, 2, 48, 2, 0, 2, 78, 2, 64, -1, 2, 19, 2, 0, 2, 26, -2, 0, 128, -2, 2, 25, 2, 9, 0, 8160, -1, 2, 126, 0, 4227907585, 2, 0, 2, 35, 2, 0, 2, 79, 0, 4227915776, 2, 10, 2, 6, 2, 11, -1, 0, 74440192, 3, 0, 6, -2, 3, 0, 8, 2, 13, 2, 0, 2, 80, 2, 10, 2, 0, 2, 81, 2, 82, 2, 83, -3, 2, 84, 2, 85, -3, 2, 86, 2, 87, 2, 88, 2, 0, 2, 33, -83, 3, 0, 7, 0, 817183, 2, 0, 2, 14, 2, 0, 0, 33023, 2, 19, 3, 89, 2, -17, 2, 90, 0, 524157950, 2, 4, 2, 0, 2, 91, 2, 4, 2, 0, 2, 20, 2, 25, 2, 15, 3, 0, 2, 2, 57, 2, 0, -1, 2, 16, -16, 3, 0, 206, -2, 3, 0, 692, 2, 70, -1, 2, 16, 2, 10, 3, 0, 8, 2, 92, 0, 3072, 2, 0, 0, 2147516415, 2, 10, 3, 0, 2, 2, 22, 2, 93, 2, 94, 3, 0, 2, 2, 95, 2, 0, 2, 10, 2, 96, 0, 4294965179, 0, 7, 2, 0, 2, 9, 2, 94, 2, 9, -1, 0, 1761345536, 2, 97, 0, 4294901823, 2, 36, 2, 18, 2, 98, 2, 34, 2, 99, 0, 2080440287, 2, 0, 2, 33, 2, 157, 0, 3296722943, 2, 0, 0, 1046675455, 0, 939524101, 0, 1837055, 2, 100, 2, 101, 2, 20, 2, 102, 3, 0, 3, 0, 7, 3, 0, 349, 2, 47, 2, 103, 2, 7, -264, 3, 0, 11, 2, 21, 3, 0, 2, 2, 31, -1, 0, 2700607615, 2, 104, 2, 105, 3, 0, 2, 2, 17, 2, 106, 3, 0, 10, 2, 10, 2, 16, 2, 0, 2, 44, 2, 0, 2, 30, 2, 107, -3, 2, 108, 3, 0, 3, 2, 18, -1, 3, 5, 2, 2, 109, 2, 0, 2, 8, 2, 110, -1, 2, 111, 2, 112, 2, 113, -1, 3, 0, 3, 2, 12, -2, 2, 0, 2, 26, -8, 2, 18, 2, 0, 2, 27, -1, 2, 0, 2, 55, 2, 6, 2, 29, 2, 10, 2, 0, 2, 114, -1, 3, 0, 4, 2, 10, 2, 16, 2, 115, 2, 7, 2, 0, 2, 116, 2, 0, 2, 117, 2, 118, 2, 119, 2, 0, 2, 9, 3, 0, 9, 2, 19, 2, 29, 2, 30, 2, 120, 2, 46, -2, 2, 121, 2, 122, 2, 29, 2, 19, 2, 8, -2, 2, 123, 2, 29, 3, 31, 2, -1, 2, 0, 2, 37, -2, 0, 4277075969, 2, 29, -1, 3, 18, 2, -1, 2, 32, 2, 124, 2, 0, 3, 29, 2, 2, 34, 2, 17, -3, 3, 0, 2, 2, 33, -1, 2, 0, 2, 34, 2, 0, 2, 34, 2, 0, 2, 79, 2, 97, 0, 4294934591, 2, 35, -7, 2, 0, 2, 125, 0, 4261413116, 2, 57, 2, 18, 2, 41, 2, 35, 2, 16, 0, 3, 2, 16, 2, 124, 2, 19, 2, 126, 2, 127, -1, 0, 2490368, 2, 126, 2, 22, 2, 16, 2, 33, 2, 126, 2, 36, 0, 4294901904, 0, 4718591, 2, 126, 2, 34, 0, 335544350, -1, 2, 128, 0, 2147487743, 0, 1, -1, 2, 129, 2, 130, 2, 8, -1, 2, 131, 2, 67, 0, 3758161920, 0, 3, 2, 132, 0, 12582911, 0, 655360, -1, 2, 0, 2, 26, 0, 2147485568, 0, 3, 2, 0, 2, 22, 0, 176, -5, 2, 0, 2, 57, 0, 251658240, -1, 2, 0, 2, 22, 0, 16, -1, 2, 0, 0, 16779263, -2, 2, 12, -1, 2, 36, -5, 2, 0, 2, 133, -3, 3, 0, 2, 2, 51, 2, 134, 0, 2147549183, 0, 2, -2, 2, 135, 2, 27, 0, 10, 0, 4294965249, 0, 67633151, 0, 4026597376, 2, 0, 0, 536871935, 2, 16, 2, 0, 2, 40, 2, 136, -5, 2, 0, 0, 1, 2, 54, 2, 57, 0, 1, 2, 137, 2, 22, -3, 2, 138, 2, 27, 2, 139, 2, 140, 0, 16778239, 2, 16, 2, 7, 0, 131072, -7, 2, 34, 0, 4294836212, 2, 9, -3, 2, 66, -2, 3, 0, 28, 2, 31, -3, 3, 0, 3, 2, 141, 3, 0, 6, 2, 47, 3, 0, 9, 2, 36, -71, 2, 16, 3, 0, 2, 2, 27, 3, 0, 33, 2, 22, 0, 126, 3, 0, 124, 2, 12, 3, 0, 18, 2, 36, -213, 2, 10, -55, 3, 0, 17, 2, 40, 2, 8, 2, 16, 2, 0, 2, 8, 2, 16, 2, 56, 2, 0, 2, 22, 2, 79, 2, 142, 2, 22, -13, 2, 0, 2, 70, -6, 3, 0, 2, -1, 2, 143, 2, 9, -1, 3, 0, 2, 0, 67583, -1, 2, 106, -2, 0, 8126475, 3, 0, 230, 2, 12, 2, 51, 2, 0, 0, 1, -2, 3, 0, 3, 2, 34, 3, 0, 28, 2, 17, 2, 0, 2, 34, -240, 2, 144, 3, 0, 9, 2, 145, 2, 146, 2, 147, 3, 0, 11, 2, 7, -72, 3, 0, 3, 2, 148, 2, 149, -187, 3, 0, 2, 2, 52, 2, 0, 2, 150, 2, 151, 2, 59, 2, 0, 2, 152, 2, 153, 2, 154, 3, 0, 10, 2, 155, 2, 156, 2, 20, 3, 52, 2, 3, 53, 2, 3, 54, 2, 2, 157, -57, 3, 0, 4, 2, 158, -1, 2, 55, 2, 0, -1, 2, 16, 2, 0, 2, 56, -4, 2, 0, 0, 1065361407, 0, 16384, -9, 2, 16, 2, 56, 2, 0, 2, 133, -14, 2, 16, 2, 133, -6, 2, 16, 0, 81919, -6, 2, 8, 0, 3223273399, -7, 2, 159, 3, 0, 6, 2, 124, -1, 3, 0, 2, 0, 2063, -37, 2, 59, 2, 160, 2, 161, 2, 162, 2, 163, 2, 164, -138, 3, 0, 1335, -1, 3, 0, 136, 2, 8, 3, 0, 180, 2, 21, 3, 0, 233, 2, 165, 3, 0, 18, 2, 10, -77, 3, 0, 16, 2, 10, -47, 3, 0, 154, 2, 6, 3, 0, 264, 2, 31, -1244, 3, 0, 354, -26654], [4294967295, 4294967291, 4092460543, 4294828031, 4294967294, 134217726, 4294903807, 268435455, 2147483647, 1048575, 1073741823, 3892314111, 134217727, 1061158911, 4294910143, 4294901759, 4294901760, 262143, 536870911, 8388607, 4160749567, 4294918143, 65535, 67043328, 2281701374, 4294967264, 2097151, 131071, 4294902783, 4194303, 255, 67108863, 4294967039, 511, 524287, 63, 127, 3238002687, 4294549487, 4290772991, 33554431, 4294901888, 4286578687, 67043329, 4294770687, 67043583, 4294836223, 4294901775, 2047999, 67043343, 67051519, 2147483648, 4292870143, 4294934527, 4294966783, 4294959104, 16383, 32767, 67047423, 4294967279, 262083, 20511, 58720255, 493567, 1023, 603979775, 65536, 602799615, 805044223, 4294965206, 8191, 1031749119, 4294917631, 2134769663, 4286578493, 4282253311, 4294942719, 33540095, 4294905855, 15, 2868854591, 1608515583, 265232348, 534519807, 2147614720, 4294934528, 1060109444, 4093640016, 17376, 2139062143, 224, 4169138175, 4294909951, 4286578688, 4294967292, 4294965759, 4294836228, 4294966272, 4294967280, 32768, 8289918, 4294934399, 4294915071, 4294965375, 1602223615, 4294967259, 4294443008, 268369920, 4292804608, 4294967232, 486341884, 4294963199, 3087007615, 1073692671, 4128527, 4279238655, 4294902015, 4160684047, 4290246655, 469499899, 4294967231, 4294966591, 2445279231, 3670015, 31, 197631, 4294967288, 16777215, 4294705151, 3221208447, 4294902271, 4294549472, 4294921215, 4095, 4285526655, 4294966527, 1024, 4294705152, 4294966143, 64, 4294966719, 4292935679, 3774873592, 4194303999, 1877934080, 262655, 2555904, 4294902256, 536807423, 67043839, 3758096383, 3959414372, 3755993023, 2080374783, 4294835295, 4294967167, 4160749565, 4087, 8323075, 2147446655, 184024726, 2862017156, 1593309078, 268434431, 268434414, 4294901761]);
const isIDContinue = /** @returns {boolean} */ (/** @type {number} */ code) => (unicodeLookup[(code >>> 5) + 0] >>> code & 31 & 1) !== 0;
const isIDStart = /** @returns {boolean} */ (/** @type {number} */ code) => (unicodeLookup[(code >>> 5) + 34816] >>> code & 31 & 1) !== 0;

const CharTypes = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8 | 1024,
    0,
    0,
    8 | 2048,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8192,
    0,
    1 | 2,
    0,
    0,
    8192,
    0,
    0,
    0,
    256,
    0,
    256 | 32768,
    0,
    0,
    2 | 16 | 128 | 32 | 64,
    2 | 16 | 128 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 32 | 64,
    2 | 16 | 512 | 64,
    2 | 16 | 512 | 64,
    0,
    0,
    16384,
    0,
    16384,
    0,
    0,
    1 | 2 | 64,
    1 | 2 | 64,
    1 | 2 | 64,
    1 | 2 | 64,
    1 | 2 | 64,
    1 | 2 | 64,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    1 | 2,
    0,
    1,
    0,
    0,
    1 | 2 | 4096,
    0,
    1 | 2 | 4 | 64,
    1 | 2 | 4 | 64,
    1 | 2 | 4 | 64,
    1 | 2 | 4 | 64,
    1 | 2 | 4 | 64,
    1 | 2 | 4 | 64,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    1 | 2 | 4,
    16384,
    0,
    16384,
    0,
    0
];
const isIdStart = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0
];
const isIdPart = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0
];
/** @returns {boolean} */ function isIdentifierStart(/** @type {number} */ code) {
    return code <= 0x7F
        ? isIdStart[code] > 0
        : isIDStart(code);
}
/** @returns {boolean} */ function isIdentifierPart(/** @type {number} */ code) {
    return code <= 0x7F
        ? isIdPart[code] > 0
        : isIDContinue(code) || (code === 8204 || code === 8205);
}

/** @returns {number} */ function advanceChar(/** @type {Parser} */ parser) {
    parser.column++;
    return (parser.currentChar = parser.source.charCodeAt(++parser.index));
}
/** @returns {number} */ function consumePossibleSurrogatePair(/** @type {Parser} */ parser) {
    const hi = parser.currentChar;
    if ((hi & 0xfc00) !== 55296)
        return 0;
    const lo = parser.source.charCodeAt(parser.index + 1);
    if ((lo & 0xfc00) !== 56320)
        return 0;
    return 65536 + ((hi & 0x3ff) << 10) + (lo & 0x3ff);
}
function consumeLineFeed(/** @type {Parser} */ parser, /** @type {number} */ state) {
    parser.currentChar = parser.source.charCodeAt(++parser.index);
    parser.flags |= 1;
    if ((state & 4) === 0) {
        parser.column = 0;
        parser.line++;
    }
}
function scanNewLine(/** @type {Parser} */ parser) {
    parser.flags |= 1;
    parser.currentChar = parser.source.charCodeAt(++parser.index);
    parser.column = 0;
    parser.line++;
}
/** @returns {boolean} */ function isExoticECMAScriptWhitespace(/** @type {number} */ ch) {
    return (ch === 160 ||
        ch === 65279 ||
        ch === 133 ||
        ch === 5760 ||
        (ch >= 8192 && ch <= 8203) ||
        ch === 8239 ||
        ch === 8287 ||
        ch === 12288 ||
        ch === 8201 ||
        ch === 65519);
}
/** @returns {number} */ function toHex(/** @type {number} */ code) {
    return code < 65 ? code - 48 : (code - 65 + 10) & 0xf;
}
/** @returns {string} */ function convertTokenType(/** @type {number} */ t) {
    switch (t) {
        case 134283266:
            return 'NumericLiteral';
        case 134283267:
            return 'StringLiteral';
        case 86021:
        case 86022:
            return 'BooleanLiteral';
        case 86023:
            return 'NullLiteral';
        case 65540:
            return 'RegularExpression';
        case 67174408:
        case 67174409:
        case 132:
            return 'TemplateLiteral';
        default:
            if ((t & 143360) === 143360)
                return 'Identifier';
            if ((t & 4096) === 4096)
                return 'Keyword';
            return 'Punctuator';
    }
}

const CommentTypes = ['SingleLine', 'MultiLine', 'HTMLOpen', 'HTMLClose', 'HashbangComment'];
function skipHashBang(/** @type {Parser} */ parser) {
    const { source } = parser;
    if (parser.currentChar === 35 && source.charCodeAt(parser.index + 1) === 33) {
        advanceChar(parser);
        advanceChar(parser);
        skipSingleLineComment(parser, source, 0, 4, parser.tokenStart);
    }
}
/** @returns {number} */ function skipSingleHTMLComment(/** @type {Parser} */ parser, /** @type {string} */ source, /** @type {number} */ state, /** @type {number} */ context, /** @type {number} */ type, /** @type {MeriyahLocation} */ start) {
    if (context & 2)
        parser.report(0);
    return skipSingleLineComment(parser, source, state, type, start);
}
/** @returns {number} */ function skipSingleLineComment(/** @type {Parser} */ parser, /** @type {string} */ source, /** @type {number} */ state, /** @type {number} */ type, /** @type {MeriyahLocation} */ start) {
    const { index } = parser;
    parser.tokenIndex = parser.index;
    parser.tokenLine = parser.line;
    parser.tokenColumn = parser.column;
    while (parser.index < parser.end) {
        if (CharTypes[parser.currentChar] & 8) {
            const isCR = parser.currentChar === 13;
            scanNewLine(parser);
            if (isCR && parser.index < parser.end && parser.currentChar === 10)
                parser.currentChar = source.charCodeAt(++parser.index);
            break;
        }
        else if ((parser.currentChar ^ 8232) <= 1) {
            scanNewLine(parser);
            break;
        }
        advanceChar(parser);
        parser.tokenIndex = parser.index;
        parser.tokenLine = parser.line;
        parser.tokenColumn = parser.column;
    }
    if (parser.options.onComment) {
        const loc = {
            start: {
                line: start.line,
                column: start.column,
            },
            end: {
                line: parser.tokenLine,
                column: parser.tokenColumn,
            },
        };
        parser.options.onComment(CommentTypes[type & 0xff], source.slice(index, parser.tokenIndex), start.index, parser.tokenIndex, loc);
    }
    return state | 1;
}
/** @returns {number} */ function skipMultiLineComment(/** @type {Parser} */ parser, /** @type {string} */ source, /** @type {number} */ state) {
    const { index } = parser;
    while (parser.index < parser.end) {
        if (parser.currentChar < 0x2b) {
            let skippedOneAsterisk = false;
            while (parser.currentChar === 42) {
                if (!skippedOneAsterisk) {
                    state &= -5;
                    skippedOneAsterisk = true;
                }
                if (advanceChar(parser) === 47) {
                    advanceChar(parser);
                    if (parser.options.onComment) {
                        const loc = {
                            start: {
                                line: parser.tokenLine,
                                column: parser.tokenColumn,
                            },
                            end: {
                                line: parser.line,
                                column: parser.column,
                            },
                        };
                        parser.options.onComment(CommentTypes[1 & 0xff], source.slice(index, parser.index - 2), index - 2, parser.index, loc);
                    }
                    parser.tokenIndex = parser.index;
                    parser.tokenLine = parser.line;
                    parser.tokenColumn = parser.column;
                    return state;
                }
            }
            if (skippedOneAsterisk) {
                continue;
            }
            if (CharTypes[parser.currentChar] & 8) {
                if (parser.currentChar === 13) {
                    state |= 1 | 4;
                    scanNewLine(parser);
                }
                else {
                    consumeLineFeed(parser, state);
                    state = (state & -5) | 1;
                }
            }
            else {
                advanceChar(parser);
            }
        }
        else if ((parser.currentChar ^ 8232) <= 1) {
            state = (state & -5) | 1;
            scanNewLine(parser);
        }
        else {
            state &= -5;
            advanceChar(parser);
        }
    }
    parser.report(18);
}

/** @type {Record<number, string>} */
const errorMessages = {
    [0]: 'Unexpected token',
    [30]: "Unexpected token: '%0'",
    [1]: 'Octal escape sequences are not allowed in strict mode',
    [2]: 'Octal escape sequences are not allowed in template strings',
    [3]: '\\8 and \\9 are not allowed in template strings',
    [4]: 'Private identifier #%0 is not defined',
    [5]: 'Illegal Unicode escape sequence',
    [6]: 'Invalid code point %0',
    [7]: 'Invalid hexadecimal escape sequence',
    [9]: 'Octal literals are not allowed in strict mode',
    [8]: 'Decimal integer literals with a leading zero are forbidden in strict mode',
    [10]: 'Expected number in radix %0',
    [153]: 'Invalid left-hand side assignment to a destructible right-hand side',
    [11]: 'Non-number found after exponent indicator',
    [12]: 'Invalid BigIntLiteral',
    [13]: 'No identifiers allowed directly after numeric literal',
    [14]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
    [15]: 'Escapes \\8 or \\9 are not allowed in strict mode',
    [16]: 'Unterminated string literal',
    [17]: 'Unterminated template literal',
    [18]: 'Multiline comment was not closed properly',
    [19]: 'The identifier contained dynamic unicode escape that was not closed',
    [20]: "Illegal character '%0'",
    [21]: 'Missing hexadecimal digits',
    [22]: 'Invalid implicit octal',
    [23]: 'Invalid line break in string literal',
    [24]: 'Only unicode escapes are legal in identifier names',
    [25]: "Expected '%0'",
    [26]: 'Invalid left-hand side in assignment',
    [27]: 'Invalid left-hand side in async arrow',
    [28]: 'Calls to super must be in the "constructor" method of a class expression or class declaration that has a superclass',
    [29]: 'Member access on super must be in a method',
    [31]: 'Await expression not allowed in formal parameter',
    [32]: 'Yield expression not allowed in formal parameter',
    [95]: "Unexpected token: 'escaped keyword'",
    [33]: 'Unary expressions as the left operand of an exponentiation expression must be disambiguated with parentheses',
    [125]: 'Async functions can only be declared at the top level or inside a block',
    [34]: 'Unterminated regular expression',
    [35]: 'Unexpected regular expression flag',
    [36]: "Duplicate regular expression flag '%0'",
    [37]: '%0 functions must have exactly %1 argument%2',
    [38]: 'Setter function argument must not be a rest parameter',
    [39]: '%0 declaration must have a name in this context',
    [40]: 'Function name may not contain any reserved words or be eval or arguments in strict mode',
    [41]: 'The rest operator is missing an argument',
    [42]: 'A getter cannot be a generator',
    [43]: 'A setter cannot be a generator',
    [44]: 'A computed property name must be followed by a colon or paren',
    [136]: 'Object literal keys that are strings or numbers must be a method or have a colon',
    [46]: 'Found `* async x(){}` but this should be `async * x(){}`',
    [45]: 'Getters and setters can not be generators',
    [47]: "'%0' can not be generator method",
    [48]: "No line break is allowed after '=>'",
    [49]: 'The left-hand side of the arrow can only be destructed through assignment',
    [50]: 'The binding declaration is not destructible',
    [51]: 'Async arrow can not be followed by new expression',
    [52]: "Classes may not have a static property named 'prototype'",
    [53]: 'Class constructor may not be a %0',
    [54]: 'Duplicate constructor method in class',
    [55]: 'Invalid increment/decrement operand',
    [56]: 'Invalid use of `new` keyword on an increment/decrement expression',
    [57]: '`=>` is an invalid assignment target',
    [58]: 'Rest element may not have a trailing comma',
    [59]: 'Missing initializer in %0 declaration',
    [60]: "'for-%0' loop head declarations can not have an initializer",
    [61]: 'Invalid left-hand side in for-%0 loop: Must have a single binding',
    [62]: 'Invalid shorthand property initializer',
    [63]: 'Property name __proto__ appears more than once in object literal',
    [64]: 'Let is disallowed as a lexically bound name',
    [65]: "Invalid use of '%0' inside new expression",
    [66]: "Illegal 'use strict' directive in function with non-simple parameter list",
    [67]: 'Identifier "let" disallowed as left-hand side expression in strict mode',
    [68]: 'Illegal continue statement',
    [69]: 'Illegal break statement',
    [70]: 'Cannot have `let[...]` as a var name in strict mode',
    [71]: 'Invalid destructuring assignment target',
    [72]: 'Rest parameter may not have a default initializer',
    [73]: 'The rest argument must the be last parameter',
    [74]: 'Invalid rest argument',
    [76]: 'In strict mode code, functions can only be declared at top level or inside a block',
    [77]: 'In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement',
    [78]: 'Without web compatibility enabled functions can not be declared at top level, inside a block, or as the body of an if statement',
    [79]: "Class declaration can't appear in single-statement context",
    [80]: 'Invalid left-hand side in for-%0',
    [81]: 'Invalid assignment in for-%0',
    [82]: 'for await (... of ...) is only valid in async functions and async generators',
    [83]: 'The first token after the template expression should be a continuation of the template',
    [85]: '`let` declaration not allowed here and `let` cannot be a regular var name in strict mode',
    [84]: '`let \n [` is a restricted production at the start of a statement',
    [86]: 'Catch clause requires exactly one parameter, not more (and no trailing comma)',
    [87]: 'Catch clause parameter does not support default values',
    [88]: 'Missing catch or finally after try',
    [89]: 'More than one default clause in switch statement',
    [90]: 'Illegal newline after throw',
    [91]: 'Strict mode code may not include a with statement',
    [92]: 'Illegal return statement',
    [93]: 'The left hand side of the for-header binding declaration is not destructible',
    [94]: 'new.target only allowed within functions or static blocks',
    [96]: "'#' not followed by identifier",
    [102]: 'Invalid keyword',
    [101]: "Can not use 'let' as a class name",
    [100]: "'A lexical declaration can't define a 'let' binding",
    [99]: 'Can not use `let` as variable name in strict mode',
    [97]: "'%0' may not be used as an identifier in this context",
    [98]: 'Await is only valid in async functions',
    [103]: 'The %0 keyword can only be used with the module goal',
    [104]: 'Unicode codepoint must not be greater than 0x10FFFF',
    [105]: '%0 source must be string',
    [106]: 'Only a identifier or string can be used to indicate alias',
    [107]: "Only '*' or '{...}' can be imported after default",
    [108]: "'import defer' must be followed by a namespace import",
    [109]: "'import source' must be followed by a default import",
    [110]: 'Trailing decorator may be followed by method',
    [111]: "Decorators can't be used with a constructor",
    [112]: 'Can not use `await` as identifier in module or async func',
    [113]: 'Can not use `await` as identifier in module',
    [114]: 'HTML comments are only allowed with web compatibility (Annex B)',
    [115]: "The identifier 'let' must not be in expression position in strict mode",
    [116]: 'Cannot assign to `eval` and `arguments` in strict mode',
    [117]: "The left-hand side of a for-of loop may not start with 'let'",
    [118]: 'Block body arrows can not be immediately invoked without a group',
    [119]: 'Block body arrows can not be immediately accessed without a group',
    [120]: 'Unexpected strict mode reserved word',
    [121]: 'Unexpected eval or arguments in strict mode',
    [122]: 'Decorators must not be followed by a semicolon',
    [123]: 'Calling delete on expression not allowed in strict mode',
    [124]: 'Pattern can not have a tail',
    [126]: 'Can not have a `yield` expression on the left side of a ternary',
    [127]: 'An arrow function can not have a postfix update operator',
    [128]: 'Invalid object literal key character after generator star',
    [129]: 'Private fields can not be deleted',
    [131]: 'Classes may not have a field called constructor',
    [130]: 'Classes may not have a private element named constructor',
    [132]: 'A class field initializer or static block may not contain arguments',
    [133]: 'Generators can only be declared at the top level or inside a block',
    [134]: 'Async methods are a restricted production and cannot have a newline following it',
    [135]: 'Unexpected character after object literal property name',
    [137]: 'Invalid key token',
    [138]: "Label '%0' has already been declared",
    [139]: "Label '%0' does not denote an iteration statement",
    [140]: "Undefined label '%0'",
    [141]: 'Trailing comma is disallowed inside import(...) arguments',
    [142]: 'Invalid binding in JSON import',
    [143]: 'import() requires exactly one argument',
    [144]: 'Cannot use new with import(...)',
    [145]: '... is not allowed in import()',
    [146]: "Expected '=>'",
    [147]: "Duplicate binding '%0'",
    [148]: 'Duplicate private identifier #%0',
    [149]: "Cannot export a duplicate name '%0'",
    [152]: 'Duplicate %0 for-binding',
    [150]: "Exported binding '%0' needs to refer to a top-level declared variable",
    [151]: 'Unexpected private field',
    [155]: 'Numeric separators are not allowed at the end of numeric literals',
    [154]: 'Only one underscore is allowed as numeric separator',
    [156]: 'JSX value should be either an expression or a quoted JSX text',
    [157]: 'Expected corresponding JSX closing tag for %0',
    [158]: 'Adjacent JSX elements must be wrapped in an enclosing tag',
    [159]: "JSX attributes must only be assigned a non-empty 'expression'",
    [160]: "'%0' has already been declared",
    [161]: "'%0' shadowed a catch clause binding",
    [162]: 'Dot property must be an identifier',
    [163]: 'Encountered invalid input after spread/rest argument',
    [164]: 'Catch without try',
    [165]: 'Finally without try',
    [166]: 'Expected corresponding closing tag for JSX fragment',
    [167]: 'Coalescing and logical operators used together in the same expression must be disambiguated with parentheses',
    [168]: 'Invalid tagged template on optional chain',
    [169]: 'Invalid optional chain from super property',
    [170]: 'Invalid optional chain from new expression',
    [171]: 'Cannot use "import.meta" outside a module',
    [172]: 'Leading decorators must be attached to a class declaration',
    [173]: 'An export name cannot include a lone surrogate',
    [174]: 'A string literal cannot be used as an exported binding without `from`',
    [175]: "Private fields can't be accessed on super",
    [176]: "The only valid meta property for import is 'import.meta'",
    [177]: "'import.meta' must not contain escaped characters",
    [178]: 'cannot use "await" as identifier inside an async function',
    [179]: 'cannot use "await" in static blocks',
    [180]: "Unexpected token `}`. Did you mean `&rbrace;` or `{'}'}`?",
    [181]: "Unexpected token `>`. Did you mean `&gt;` or `{'>'}`?",
};
class ParseError extends SyntaxError {
    /** @type {number} */ start;
    /** @type {number} */ end;
    /** @type {number[]} */ range;
    /** @type {{ start: { line: number, column: number }, end: { line: number, column: number } }} */ loc;
    /** @type {string} */ description;
    constructor(/** @type {MeriyahLocation} */ start, /** @type {MeriyahLocation} */ end, /** @type {number} */ type, ...params) {
        const description = errorMessages[type].replaceAll(/%(\d+)/g, (_, i) => params[i]);
        const message = '[' + start.line + ':' + start.column + '-' + end.line + ':' + end.column + ']: ' + description;
        super(message);
        /** @type {number} */ this.start = start.index;
        /** @type {number} */ this.end = end.index;
        this.range = [start.index, end.index];
        this.loc = {
            start: { line: start.line, column: start.column },
            end: { line: end.line, column: end.column },
        };
        /** @type {string} */ this.description = description;
    }
}
const isParseError = (error) => error instanceof ParseError;

const KeywordDescTable = [
    'end of source',
    'identifier', 'number', 'string', 'regular expression',
    'false', 'true', 'null',
    'template continuation', 'template tail',
    '=>', '(', '{', '.', '...', '}', ')', ';', ',', '[', ']', ':', '?', '\'', '"',
    '++', '--',
    '=', '<<=', '>>=', '>>>=', '**=', '+=', '-=', '*=', '/=', '%=', '^=', '|=',
    '&=', '||=', '&&=', '??=',
    'typeof', 'delete', 'void', '!', '~', '+', '-', 'in', 'instanceof', '*', '%', '/', '**', '&&',
    '||', '===', '!==', '==', '!=', '<=', '>=', '<', '>', '<<', '>>', '>>>', '&', '|', '^',
    'var', 'let', 'const',
    'break', 'case', 'catch', 'class', 'continue', 'debugger', 'default', 'do', 'else', 'export',
    'extends', 'finally', 'for', 'function', 'if', 'import', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'while', 'with',
    'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield',
    'as', 'async', 'await', 'constructor', 'get', 'set', 'accessor', 'from', 'of', 'using',
    'enum', 'eval', 'arguments', 'escaped keyword', 'escaped future reserved keyword', 'reserved if strict', '#',
    'BigIntLiteral', '??', '?.', 'WhiteSpace', 'Illegal', 'LineTerminator', 'PrivateField',
    'Template', '@', 'target', 'meta', 'LineFeed', 'Escaped', 'JSXText'
];
const descKeywordTable = new Map([
    ['this', 86111],
    ['function', 86104],
    ['if', 20569],
    ['return', 20572],
    ['var', 86088],
    ['else', 20563],
    ['for', 20567],
    ['new', 86107],
    ['in', 8673330],
    ['typeof', 16863275],
    ['while', 20578],
    ['case', 20556],
    ['break', 20555],
    ['try', 20577],
    ['catch', 20557],
    ['delete', 16863276],
    ['throw', 86112],
    ['switch', 86110],
    ['continue', 20559],
    ['default', 20561],
    ['instanceof', 8411187],
    ['do', 20562],
    ['void', 16863277],
    ['finally', 20566],
    ['async', 209005],
    ['await', 209006],
    ['class', 86094],
    ['const', 86090],
    ['constructor', 209007],
    ['debugger', 20560],
    ['export', 20564],
    ['extends', 20565],
    ['false', 86021],
    ['from', 209011],
    ['get', 209008],
    ['implements', 36964],
    ['import', 86106],
    ['interface', 36965],
    ['let', 241737],
    ['null', 86023],
    ['of', 471156],
    ['using', 209013],
    ['package', 36966],
    ['private', 36967],
    ['protected', 36968],
    ['public', 36969],
    ['set', 209009],
    ['static', 36970],
    ['super', 86109],
    ['true', 86022],
    ['with', 20579],
    ['yield', 241771],
    ['enum', 86134],
    ['eval', 537079927],
    ['as', 77932],
    ['arguments', 537079928],
    ['target', 209030],
    ['meta', 209031],
    ['accessor', 209010],
]);
const keywordLengths = [...descKeywordTable.keys()].map((keyword) => keyword.length);
const minKeywordLength = Math.min(...keywordLengths);
const maxKeywordLength = Math.max(...keywordLengths);

/** @returns {number} */ function scanIdentifier(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {number} */ isValidAsKeyword) {
    while (isIdPart[advanceChar(parser)])
        ;
    parser.tokenValue = parser.source.slice(parser.tokenIndex, parser.index);
    if (parser.currentChar === 92 || parser.currentChar > 0x7e) {
        return scanIdentifierSlowCase(parser, context, 0, isValidAsKeyword);
    }
    const length = parser.index - parser.tokenIndex;
    if (length < minKeywordLength || length > maxKeywordLength)
        return 208897;
    return descKeywordTable.get(parser.tokenValue) ?? 208897;
}
/** @returns {number} */ function scanUnicodeIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const cookedChar = scanIdentifierUnicodeEscape(parser);
    if (!isIdentifierStart(cookedChar))
        parser.report(5);
    parser.tokenValue = String.fromCodePoint(cookedChar);
    return scanIdentifierSlowCase(parser, context, 1, CharTypes[cookedChar] & 4);
}
/** @returns {number} */ function scanIdentifierSlowCase(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ hasEscape, /** @type {number} */ isValidAsKeyword) {
    let start = parser.index;
    while (parser.index < parser.end) {
        if (parser.currentChar === 92) {
            parser.tokenValue += parser.source.slice(start, parser.index);
            hasEscape = 1;
            const code = scanIdentifierUnicodeEscape(parser);
            if (!isIdentifierPart(code))
                parser.report(5);
            isValidAsKeyword = isValidAsKeyword && CharTypes[code] & 4;
            parser.tokenValue += String.fromCodePoint(code);
            start = parser.index;
        }
        else {
            const merged = consumePossibleSurrogatePair(parser);
            if (merged > 0) {
                if (!isIdentifierPart(merged)) {
                    parser.report(20, String.fromCodePoint(merged));
                }
                parser.currentChar = merged;
                parser.index++;
                parser.column++;
            }
            else if (!isIdentifierPart(parser.currentChar)) {
                break;
            }
            advanceChar(parser);
        }
    }
    if (parser.index <= parser.end) {
        parser.tokenValue += parser.source.slice(start, parser.index);
    }
    const { length } = parser.tokenValue;
    if (isValidAsKeyword && length >= minKeywordLength && length <= maxKeywordLength) {
        const token = descKeywordTable.get(parser.tokenValue);
        if (token === void 0)
            return 208897 | (hasEscape ? -2147483648 : 0);
        if (!hasEscape)
            return token;
        if (token === 209006) {
            if ((context & (2 | 2048)) === 0) {
                return token | -2147483648;
            }
            return -2147483527;
        }
        if (context & 1) {
            if (token === 36970) {
                return -2147483526;
            }
            if ((token & 36864) === 36864) {
                return -2147483526;
            }
            if ((token & 20480) === 20480) {
                if (context & 262144 && (context & 8) === 0) {
                    return token | -2147483648;
                }
                else {
                    return -2147483527;
                }
            }
            return 209019 | -2147483648;
        }
        if (context & 262144 &&
            (context & 8) === 0 &&
            (token & 20480) === 20480) {
            return token | -2147483648;
        }
        if (token === 241771) {
            return context & 262144
                ? 209019 | -2147483648
                : context & 1024
                    ? -2147483527
                    : token | -2147483648;
        }
        if (token === 209005) {
            return 209019 | -2147483648;
        }
        if ((token & 36864) === 36864) {
            return token | 12288 | -2147483648;
        }
        return -2147483527;
    }
    return 208897 | (hasEscape ? -2147483648 : 0);
}
/** @returns {number} */ function scanPrivateIdentifier(/** @type {Parser | undefined} */ parser) {
    let char = advanceChar(parser);
    if (char === 92)
        return 131;
    const merged = consumePossibleSurrogatePair(parser);
    if (merged)
        char = merged;
    if (!isIdentifierStart(char))
        parser.report(96);
    return 131;
}
/** @returns {number} */ function scanIdentifierUnicodeEscape(/** @type {Parser} */ parser) {
    if (parser.source.charCodeAt(parser.index + 1) !== 117) {
        parser.report(5);
    }
    parser.currentChar = parser.source.charCodeAt((parser.index += 2));
    parser.column += 2;
    return scanUnicodeEscape(parser);
}
/** @returns {number} */ function scanUnicodeEscape(/** @type {Parser} */ parser) {
    let codePoint = 0;
    const char = parser.currentChar;
    if (char === 123) {
        const begin = parser.index - 2;
        while (CharTypes[advanceChar(parser)] & 64) {
            codePoint = (codePoint << 4) | toHex(parser.currentChar);
            if (codePoint > 1114111)
                throw new ParseError({ index: begin, line: parser.line, column: parser.column }, parser.currentLocation, 104);
        }
        if (parser.currentChar !== 125) {
            throw new ParseError({ index: begin, line: parser.line, column: parser.column }, parser.currentLocation, 7);
        }
        advanceChar(parser);
        return codePoint;
    }
    if ((CharTypes[char] & 64) === 0)
        parser.report(7);
    const char2 = parser.source.charCodeAt(parser.index + 1);
    if ((CharTypes[char2] & 64) === 0)
        parser.report(7);
    const char3 = parser.source.charCodeAt(parser.index + 2);
    if ((CharTypes[char3] & 64) === 0)
        parser.report(7);
    const char4 = parser.source.charCodeAt(parser.index + 3);
    if ((CharTypes[char4] & 64) === 0)
        parser.report(7);
    codePoint = (toHex(char) << 12) | (toHex(char2) << 8) | (toHex(char3) << 4) | toHex(char4);
    parser.currentChar = parser.source.charCodeAt((parser.index += 4));
    parser.column += 4;
    return codePoint;
}

/** @returns {number} */ function scanNumber(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ kind) {
    let char = parser.currentChar;
    let value = 0;
    let digit = 9;
    let atStart = kind & 64 ? 0 : 1;
    let digits = 0;
    let allowSeparator = 0;
    if (kind & 64) {
        value = '.' + scanDecimalDigitsOrSeparator(parser, char);
        char = parser.currentChar;
        if (char === 110)
            parser.report(12);
    }
    else {
        if (char === 48) {
            char = advanceChar(parser);
            if ((char | 32) === 120) {
                kind = 8 | 128;
                char = advanceChar(parser);
                while (CharTypes[char] & (64 | 4096)) {
                    if (char === 95) {
                        if (!allowSeparator)
                            parser.report(154);
                        allowSeparator = 0;
                        char = advanceChar(parser);
                        continue;
                    }
                    allowSeparator = 1;
                    value = value * 0x10 + toHex(char);
                    digits++;
                    char = advanceChar(parser);
                }
                if (digits === 0 || !allowSeparator) {
                    parser.report(digits === 0 ? 21 : 155);
                }
            }
            else if ((char | 32) === 111) {
                kind = 4 | 128;
                char = advanceChar(parser);
                while (CharTypes[char] & (32 | 4096)) {
                    if (char === 95) {
                        if (!allowSeparator) {
                            parser.report(154);
                        }
                        allowSeparator = 0;
                        char = advanceChar(parser);
                        continue;
                    }
                    allowSeparator = 1;
                    value = value * 8 + (char - 48);
                    digits++;
                    char = advanceChar(parser);
                }
                if (digits === 0 || !allowSeparator) {
                    parser.report(digits === 0 ? 0 : 155);
                }
            }
            else if ((char | 32) === 98) {
                kind = 2 | 128;
                char = advanceChar(parser);
                while (CharTypes[char] & (128 | 4096)) {
                    if (char === 95) {
                        if (!allowSeparator) {
                            parser.report(154);
                        }
                        allowSeparator = 0;
                        char = advanceChar(parser);
                        continue;
                    }
                    allowSeparator = 1;
                    value = value * 2 + (char - 48);
                    digits++;
                    char = advanceChar(parser);
                }
                if (digits === 0 || !allowSeparator) {
                    parser.report(digits === 0 ? 0 : 155);
                }
            }
            else if (CharTypes[char] & 32) {
                if (context & 1)
                    parser.report(1);
                kind = 1;
                while (CharTypes[char] & 16) {
                    if (CharTypes[char] & 512) {
                        kind = 32;
                        atStart = 0;
                        break;
                    }
                    value = value * 8 + (char - 48);
                    char = advanceChar(parser);
                }
            }
            else if (CharTypes[char] & 512) {
                if (context & 1)
                    parser.report(1);
                parser.flags |= 64;
                kind = 32;
            }
            else if (char === 95) {
                parser.report(0);
            }
        }
        if (kind & 48) {
            if (atStart) {
                while (digit >= 0 && CharTypes[char] & (16 | 4096)) {
                    if (char === 95) {
                        char = advanceChar(parser);
                        if (char === 95 || kind & 32) {
                            throw new ParseError(parser.currentLocation, { index: parser.index + 1, line: parser.line, column: parser.column }, 154);
                        }
                        allowSeparator = 1;
                        continue;
                    }
                    allowSeparator = 0;
                    value = 10 * value + (char - 48);
                    char = advanceChar(parser);
                    --digit;
                }
                if (allowSeparator) {
                    throw new ParseError(parser.currentLocation, { index: parser.index + 1, line: parser.line, column: parser.column }, 155);
                }
                if (digit >= 0 && !isIdentifierStart(char) && char !== 46) {
                    parser.tokenValue = value;
                    if (parser.options.raw)
                        parser.tokenRaw = parser.source.slice(parser.tokenIndex, parser.index);
                    return 134283266;
                }
            }
            value += scanDecimalDigitsOrSeparator(parser, char);
            char = parser.currentChar;
            if (char === 46) {
                if (advanceChar(parser) === 95)
                    parser.report(0);
                kind = 64;
                value += '.' + scanDecimalDigitsOrSeparator(parser, parser.currentChar);
                char = parser.currentChar;
            }
        }
    }
    const end = parser.index;
    let isBigInt = 0;
    if (char === 110 && kind & 128) {
        isBigInt = 1;
        char = advanceChar(parser);
    }
    else {
        if ((char | 32) === 101) {
            char = advanceChar(parser);
            if (CharTypes[char] & 256)
                char = advanceChar(parser);
            const { index } = parser;
            if ((CharTypes[char] & 16) === 0)
                parser.report(11);
            value += parser.source.substring(end, index) + scanDecimalDigitsOrSeparator(parser, char);
            char = parser.currentChar;
        }
    }
    if ((parser.index < parser.end && CharTypes[char] & 16) || isIdentifierStart(char)) {
        parser.report(13);
    }
    if (isBigInt) {
        parser.tokenRaw = parser.source.slice(parser.tokenIndex, parser.index);
        parser.tokenValue = BigInt(parser.tokenRaw.slice(0, -1).replaceAll('_', ''));
        return 134283389;
    }
    parser.tokenValue =
        kind & (1 | 2 | 8 | 4)
            ? value
            : kind & 32
                ? parseFloat(parser.source.substring(parser.tokenIndex, parser.index))
                : +value;
    if (parser.options.raw)
        parser.tokenRaw = parser.source.slice(parser.tokenIndex, parser.index);
    return 134283266;
}
/** @returns {string} */ function scanDecimalDigitsOrSeparator(/** @type {Parser} */ parser, /** @type {number} */ char) {
    let allowSeparator = 0;
    let start = parser.index;
    let ret = '';
    while (CharTypes[char] & (16 | 4096)) {
        if (char === 95) {
            const { index } = parser;
            char = advanceChar(parser);
            if (char === 95) {
                throw new ParseError(parser.currentLocation, { index: parser.index + 1, line: parser.line, column: parser.column }, 154);
            }
            allowSeparator = 1;
            ret += parser.source.substring(start, index);
            start = parser.index;
            continue;
        }
        allowSeparator = 0;
        char = advanceChar(parser);
    }
    if (allowSeparator) {
        throw new ParseError(parser.currentLocation, { index: parser.index + 1, line: parser.line, column: parser.column }, 155);
    }
    return ret + parser.source.substring(start, parser.index);
}

var RegexState;
(function (RegexState) {
    RegexState[RegexState["Empty"] = 0] = "Empty";
    RegexState[RegexState["Escape"] = 1] = "Escape";
    RegexState[RegexState["Class"] = 2] = "Class";
})(RegexState || (RegexState = {}));
var RegexFlags;
(function (RegexFlags) {
    RegexFlags[RegexFlags["Empty"] = 0] = "Empty";
    RegexFlags[RegexFlags["IgnoreCase"] = 1] = "IgnoreCase";
    RegexFlags[RegexFlags["Global"] = 2] = "Global";
    RegexFlags[RegexFlags["Multiline"] = 4] = "Multiline";
    RegexFlags[RegexFlags["Unicode"] = 16] = "Unicode";
    RegexFlags[RegexFlags["Sticky"] = 8] = "Sticky";
    RegexFlags[RegexFlags["DotAll"] = 32] = "DotAll";
    RegexFlags[RegexFlags["Indices"] = 64] = "Indices";
    RegexFlags[RegexFlags["UnicodeSets"] = 128] = "UnicodeSets";
})(RegexFlags || (RegexFlags = {}));
/** @returns {number} */ function scanRegularExpression(/** @type {Parser} */ parser) {
    const bodyStart = parser.index;
    let preparseState = RegexState.Empty;
    loop: while (true) {
        const ch = parser.currentChar;
        advanceChar(parser);
        if (preparseState & RegexState.Escape) {
            preparseState &= ~RegexState.Escape;
        }
        else {
            switch (ch) {
                case 47:
                    if (!preparseState)
                        break loop;
                    else
                        break;
                case 92:
                    preparseState |= RegexState.Escape;
                    break;
                case 91:
                    preparseState |= RegexState.Class;
                    break;
                case 93:
                    preparseState &= RegexState.Escape;
                    break;
            }
        }
        if (ch === 13 ||
            ch === 10 ||
            ch === 8232 ||
            ch === 8233) {
            parser.report(34);
        }
        if (parser.index >= parser.source.length) {
            return parser.report(34);
        }
    }
    const bodyEnd = parser.index - 1;
    let mask = RegexFlags.Empty;
    let char = parser.currentChar;
    const { index: flagStart } = parser;
    while (isIdentifierPart(char)) {
        switch (char) {
            case 103:
                if (mask & RegexFlags.Global)
                    parser.report(36, 'g');
                mask |= RegexFlags.Global;
                break;
            case 105:
                if (mask & RegexFlags.IgnoreCase)
                    parser.report(36, 'i');
                mask |= RegexFlags.IgnoreCase;
                break;
            case 109:
                if (mask & RegexFlags.Multiline)
                    parser.report(36, 'm');
                mask |= RegexFlags.Multiline;
                break;
            case 117:
                if (mask & RegexFlags.Unicode)
                    parser.report(36, 'u');
                if (mask & RegexFlags.UnicodeSets)
                    parser.report(36, 'vu');
                mask |= RegexFlags.Unicode;
                break;
            case 118:
                if (mask & RegexFlags.Unicode)
                    parser.report(36, 'uv');
                if (mask & RegexFlags.UnicodeSets)
                    parser.report(36, 'v');
                mask |= RegexFlags.UnicodeSets;
                break;
            case 121:
                if (mask & RegexFlags.Sticky)
                    parser.report(36, 'y');
                mask |= RegexFlags.Sticky;
                break;
            case 115:
                if (mask & RegexFlags.DotAll)
                    parser.report(36, 's');
                mask |= RegexFlags.DotAll;
                break;
            case 100:
                if (mask & RegexFlags.Indices)
                    parser.report(36, 'd');
                mask |= RegexFlags.Indices;
                break;
            default:
                parser.report(35);
        }
        char = advanceChar(parser);
    }
    const flags = parser.source.slice(flagStart, parser.index);
    const pattern = parser.source.slice(bodyStart, bodyEnd);
    parser.tokenRegExp = { pattern, flags };
    if (parser.options.raw)
        parser.tokenRaw = parser.source.slice(parser.tokenIndex, parser.index);
    parser.tokenValue = validate(parser, pattern, flags);
    return 65540;
}
/** @returns {RegExp | undefined | null} */ function validate(/** @type {Parser | undefined} */ parser, /** @type {string | undefined} */ pattern, /** @type {string | undefined} */ flags) {
    try {
        return new RegExp(pattern, flags);
    }
    catch {
        if (!parser.options.validateRegex) {
            return null;
        }
        parser.report(34);
    }
}

/** @returns {number | undefined} */ function scanString(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {number} */ quote) {
    const { index: start } = parser;
    let ret = '';
    let char = advanceChar(parser);
    let marker = parser.index;
    while ((CharTypes[char] & 8) === 0) {
        if (char === quote) {
            ret += parser.source.slice(marker, parser.index);
            advanceChar(parser);
            if (parser.options.raw)
                parser.tokenRaw = parser.source.slice(start, parser.index);
            parser.tokenValue = ret;
            return 134283267;
        }
        if ((char & 8) === 8 && char === 92) {
            ret += parser.source.slice(marker, parser.index);
            char = advanceChar(parser);
            if (char < 0x7f || char === 8232 || char === 8233) {
                const code = parseEscape(parser, context, char);
                if (code >= 0)
                    ret += String.fromCodePoint(code);
                else
                    handleStringError(parser, code, 0);
            }
            else {
                ret += String.fromCodePoint(char);
            }
            marker = parser.index + 1;
        }
        else if (char === 8232 || char === 8233) {
            parser.column = -1;
            parser.line++;
        }
        if (parser.index >= parser.end)
            parser.report(16);
        char = advanceChar(parser);
    }
    parser.report(16);
}
/** @returns {number} */ function parseEscape(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ first, /** @type {undefined | number} */ isTemplate = 0) {
    switch (first) {
        case 98:
            return 8;
        case 102:
            return 12;
        case 114:
            return 13;
        case 110:
            return 10;
        case 116:
            return 9;
        case 118:
            return 11;
        case 13: {
            if (parser.index < parser.end) {
                const nextChar = parser.source.charCodeAt(parser.index + 1);
                if (nextChar === 10) {
                    parser.index = parser.index + 1;
                    parser.currentChar = nextChar;
                }
            }
        }
        case 10:
        case 8232:
        case 8233:
            parser.column = -1;
            parser.line++;
            return -1;
        case 48:
        case 49:
        case 50:
        case 51: {
            let code = first - 48;
            let index = parser.index + 1;
            let column = parser.column + 1;
            if (index < parser.end) {
                const next = parser.source.charCodeAt(index);
                if ((CharTypes[next] & 32) === 0) {
                    if (code !== 0 || CharTypes[next] & 512) {
                        if (context & 1 || isTemplate)
                            return -2;
                        parser.flags |= 64;
                    }
                }
                else if (context & 1 || isTemplate) {
                    return -2;
                }
                else {
                    parser.currentChar = next;
                    code = (code << 3) | (next - 48);
                    index++;
                    column++;
                    if (index < parser.end) {
                        const next = parser.source.charCodeAt(index);
                        if (CharTypes[next] & 32) {
                            parser.currentChar = next;
                            code = (code << 3) | (next - 48);
                            index++;
                            column++;
                        }
                    }
                    parser.flags |= 64;
                }
                parser.index = index - 1;
                parser.column = column - 1;
            }
            return code;
        }
        case 52:
        case 53:
        case 54:
        case 55: {
            if (isTemplate || context & 1)
                return -2;
            let code = first - 48;
            const index = parser.index + 1;
            const column = parser.column + 1;
            if (index < parser.end) {
                const next = parser.source.charCodeAt(index);
                if (CharTypes[next] & 32) {
                    code = (code << 3) | (next - 48);
                    parser.currentChar = next;
                    parser.index = index;
                    parser.column = column;
                }
            }
            parser.flags |= 64;
            return code;
        }
        case 120: {
            const ch1 = advanceChar(parser);
            if ((CharTypes[ch1] & 64) === 0)
                return -4;
            const hi = toHex(ch1);
            const ch2 = advanceChar(parser);
            if ((CharTypes[ch2] & 64) === 0)
                return -4;
            const lo = toHex(ch2);
            return (hi << 4) | lo;
        }
        case 117: {
            const ch = advanceChar(parser);
            if (parser.currentChar === 123) {
                let code = 0;
                let digits = 0;
                while ((CharTypes[advanceChar(parser)] & 64) !== 0) {
                    code = (code << 4) | toHex(parser.currentChar);
                    if (code > 1114111)
                        return -5;
                    digits++;
                }
                if (digits === 0 || parser.currentChar < 1 || parser.currentChar !== 125) {
                    return -4;
                }
                return code;
            }
            else {
                if ((CharTypes[ch] & 64) === 0)
                    return -4;
                const ch2 = parser.source.charCodeAt(parser.index + 1);
                if ((CharTypes[ch2] & 64) === 0)
                    return -4;
                const ch3 = parser.source.charCodeAt(parser.index + 2);
                if ((CharTypes[ch3] & 64) === 0)
                    return -4;
                const ch4 = parser.source.charCodeAt(parser.index + 3);
                if ((CharTypes[ch4] & 64) === 0)
                    return -4;
                parser.index += 3;
                parser.column += 3;
                parser.currentChar = parser.source.charCodeAt(parser.index);
                return (toHex(ch) << 12) | (toHex(ch2) << 8) | (toHex(ch3) << 4) | toHex(ch4);
            }
        }
        case 56:
        case 57:
            if (isTemplate || context & 1)
                return -3;
            parser.flags |= 4096;
        default:
            return first;
    }
}
function handleStringError(/** @type {Parser} */ parser, /** @type {number} */ code, /** @type {number} */ isTemplate) {
    switch (code) {
        case -1:
            return;
        case -2:
            parser.report(isTemplate ? 2 : 1);
        case -3:
            parser.report(isTemplate ? 3 : 14);
        case -4:
            parser.report(7);
        case -5:
            parser.report(104);
    }
}

/** @returns {number} */ function scanTemplate(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { index: start } = parser;
    let token = 67174409;
    let ret = '';
    let hasCarriageReturn = false;
    let char = advanceChar(parser);
    while (char !== 96) {
        if (char === 36 && parser.source.charCodeAt(parser.index + 1) === 123) {
            advanceChar(parser);
            token = 67174408;
            break;
        }
        else if (char === 92) {
            char = advanceChar(parser);
            if (char === 13)
                hasCarriageReturn = true;
            if (char > 0x7e && char !== 8232 && char !== 8233) {
                ret += String.fromCodePoint(char);
            }
            else {
                const { index, line, column } = parser;
                const code = parseEscape(parser, context | 1, char, 1);
                if (code >= 0) {
                    ret += String.fromCodePoint(code);
                }
                else if (code !== -1 && context & 64) {
                    parser.index = index;
                    parser.line = line;
                    parser.column = column;
                    ret = null;
                    char = scanBadTemplate(parser, char, () => {
                        hasCarriageReturn = true;
                    });
                    if (char < 0)
                        token = 67174408;
                    break;
                }
                else {
                    handleStringError(parser, code, 1);
                }
            }
        }
        else if (parser.index < parser.end) {
            if (char === 13)
                hasCarriageReturn = true;
            if (char === 13 && parser.source.charCodeAt(parser.index + 1) === 10) {
                parser.currentChar = parser.source.charCodeAt(++parser.index);
            }
            if (char === 13)
                char = 10;
            if (((char & 83) < 3 && char === 10) || (char ^ 8232) <= 1) {
                parser.column = -1;
                parser.line++;
            }
            ret += String.fromCodePoint(char);
        }
        if (parser.index >= parser.end)
            parser.report(17);
        char = advanceChar(parser);
    }
    advanceChar(parser);
    parser.tokenValue = ret;
    const tokenRaw = parser.source.slice(start + 1, parser.index - (token === 67174409 ? 1 : 2));
    parser.tokenRaw = hasCarriageReturn ? tokenRaw.replaceAll(/\r\n?/g, '\n') : tokenRaw;
    return token;
}
/** @returns {number} */ function scanBadTemplate(/** @type {Parser} */ parser, /** @type {number} */ ch, onCarriageReturn) {
    while (ch !== 96) {
        switch (ch) {
            case 13:
                onCarriageReturn();
                break;
            case 36: {
                const index = parser.index + 1;
                if (index < parser.end && parser.source.charCodeAt(index) === 123) {
                    parser.index = index;
                    parser.column++;
                    return -ch;
                }
                break;
            }
            case 10:
            case 8232:
            case 8233:
                parser.column = -1;
                parser.line++;
        }
        if (parser.index >= parser.end)
            parser.report(17);
        ch = advanceChar(parser);
    }
    return ch;
}
/** @returns {number} */ function scanTemplateTail(/** @type {Parser} */ parser, /** @type {number} */ context) {
    if (parser.index >= parser.end)
        parser.report(0);
    parser.index--;
    parser.column--;
    return scanTemplate(parser, context);
}

const TokenLookup = [
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    128,
    136,
    128,
    128,
    130,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    129,
    128,
    16842798,
    134283267,
    131,
    208897,
    8391477,
    8390213,
    134283267,
    67174411,
    16,
    8391476,
    25233968,
    18,
    25233969,
    67108877,
    8457014,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    134283266,
    21,
    1074790417,
    8456256,
    1077936155,
    8390721,
    22,
    133,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    208897,
    69271571,
    137,
    20,
    8389959,
    208897,
    132,
    4096,
    4096,
    4096,
    4096,
    4096,
    4096,
    4096,
    208897,
    4096,
    208897,
    208897,
    4096,
    208897,
    4096,
    208897,
    4096,
    208897,
    4096,
    4096,
    4096,
    208897,
    4096,
    4096,
    208897,
    4096,
    4096,
    2162700,
    8389702,
    1074790415,
    16842799,
    129,
];
function nextToken(/** @type {Parser | undefined} */ parser, /** @type {number} */ context) {
    parser.flags = (parser.flags | 1) ^ 1;
    parser.startIndex = parser.index;
    parser.startColumn = parser.column;
    parser.startLine = parser.line;
    parser.setToken(scanSingleToken(parser, context, 0));
}
/** @returns {number | undefined} */ function scanSingleToken(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ state) {
    const isStartOfLine = parser.index === 0;
    const { source } = parser;
    while (parser.index < parser.end) {
        parser.tokenIndex = parser.index;
        parser.tokenColumn = parser.column;
        parser.tokenLine = parser.line;
        let char = parser.currentChar;
        if (char <= 0x7e) {
            const token = TokenLookup[char];
            switch (token) {
                case 67174411:
                case 16:
                case 2162700:
                case 1074790415:
                case 69271571:
                case 20:
                case 21:
                case 1074790417:
                case 18:
                case 16842799:
                case 133:
                case 129:
                    advanceChar(parser);
                    return token;
                case 208897:
                    return scanIdentifier(parser, context, 0);
                case 4096:
                    return scanIdentifier(parser, context, 1);
                case 134283266:
                    return scanNumber(parser, context, 16 | 128);
                case 134283267:
                    return scanString(parser, context, char);
                case 132:
                    return scanTemplate(parser, context);
                case 137:
                    return scanUnicodeIdentifier(parser, context);
                case 131:
                    return scanPrivateIdentifier(parser);
                case 128:
                    advanceChar(parser);
                    break;
                case 130:
                    state |= 1 | 4;
                    scanNewLine(parser);
                    break;
                case 136:
                    consumeLineFeed(parser, state);
                    state = (state & -5) | 1;
                    break;
                case 8456256: {
                    const ch = advanceChar(parser);
                    if (parser.index < parser.end) {
                        if (ch === 60) {
                            if (parser.index < parser.end && advanceChar(parser) === 61) {
                                advanceChar(parser);
                                return 4194332;
                            }
                            return 8390978;
                        }
                        else if (ch === 61) {
                            advanceChar(parser);
                            return 8390718;
                        }
                        if (ch === 33) {
                            const index = parser.index + 1;
                            if (parser.options.webcompat &&
                                !(context & 2) &&
                                index + 1 < parser.end &&
                                source.charCodeAt(index) === 45 &&
                                source.charCodeAt(index + 1) == 45) {
                                parser.column += 3;
                                parser.currentChar = source.charCodeAt((parser.index += 3));
                                state = skipSingleHTMLComment(parser, source, state, context, 2, parser.tokenStart);
                                continue;
                            }
                            return 8456256;
                        }
                    }
                    return 8456256;
                }
                case 1077936155: {
                    advanceChar(parser);
                    const ch = parser.currentChar;
                    if (ch === 61) {
                        if (advanceChar(parser) === 61) {
                            advanceChar(parser);
                            return 8390458;
                        }
                        return 8390460;
                    }
                    if (ch === 62) {
                        advanceChar(parser);
                        return 10;
                    }
                    return 1077936155;
                }
                case 16842798:
                    if (advanceChar(parser) !== 61) {
                        return 16842798;
                    }
                    if (advanceChar(parser) !== 61) {
                        return 8390461;
                    }
                    advanceChar(parser);
                    return 8390459;
                case 8391477:
                    if (advanceChar(parser) !== 61)
                        return 8391477;
                    advanceChar(parser);
                    return 4194340;
                case 8391476: {
                    advanceChar(parser);
                    if (parser.index >= parser.end)
                        return 8391476;
                    const ch = parser.currentChar;
                    if (ch === 61) {
                        advanceChar(parser);
                        return 4194338;
                    }
                    if (ch !== 42)
                        return 8391476;
                    if (advanceChar(parser) !== 61)
                        return 8391735;
                    advanceChar(parser);
                    return 4194335;
                }
                case 8389959:
                    if (advanceChar(parser) !== 61)
                        return 8389959;
                    advanceChar(parser);
                    return 4194341;
                case 25233968: {
                    advanceChar(parser);
                    const ch = parser.currentChar;
                    if (ch === 43) {
                        advanceChar(parser);
                        return 33619993;
                    }
                    if (ch === 61) {
                        advanceChar(parser);
                        return 4194336;
                    }
                    return 25233968;
                }
                case 25233969: {
                    advanceChar(parser);
                    const ch = parser.currentChar;
                    if (ch === 45) {
                        advanceChar(parser);
                        if (parser.currentChar === 62 &&
                            (state & 1 ||
                                isStartOfLine ||
                                (parser.getToken() === 1048576 && parser.line > 1))) {
                            if (!parser.options.webcompat)
                                parser.report(114);
                            advanceChar(parser);
                            state = skipSingleHTMLComment(parser, source, state, context, 3, parser.tokenStart);
                            continue;
                        }
                        return 33619994;
                    }
                    if (ch === 61) {
                        advanceChar(parser);
                        return 4194337;
                    }
                    return 25233969;
                }
                case 8457014: {
                    advanceChar(parser);
                    if (parser.index < parser.end) {
                        const ch = parser.currentChar;
                        if (ch === 47) {
                            advanceChar(parser);
                            state = skipSingleLineComment(parser, source, state, 0, parser.tokenStart);
                            continue;
                        }
                        if (ch === 42) {
                            advanceChar(parser);
                            state = skipMultiLineComment(parser, source, state);
                            continue;
                        }
                        if (context & 32) {
                            return scanRegularExpression(parser);
                        }
                        if (ch === 61) {
                            advanceChar(parser);
                            return 4259875;
                        }
                    }
                    return 8457014;
                }
                case 67108877: {
                    const next = advanceChar(parser);
                    if (next >= 48 && next <= 57)
                        return scanNumber(parser, context, 64 | 16);
                    if (next === 46) {
                        const index = parser.index + 1;
                        if (index < parser.end && source.charCodeAt(index) === 46) {
                            parser.column += 2;
                            parser.currentChar = source.charCodeAt((parser.index += 2));
                            return 14;
                        }
                    }
                    return 67108877;
                }
                case 8389702: {
                    advanceChar(parser);
                    const ch = parser.currentChar;
                    if (ch === 124) {
                        advanceChar(parser);
                        if (parser.currentChar === 61) {
                            advanceChar(parser);
                            return 4718632;
                        }
                        return 8913465;
                    }
                    if (ch === 61) {
                        advanceChar(parser);
                        return 4194342;
                    }
                    return 8389702;
                }
                case 8390721: {
                    advanceChar(parser);
                    if (context & 1048576) {
                        return 8390721;
                    }
                    const ch = parser.currentChar;
                    if (ch === 61) {
                        advanceChar(parser);
                        return 8390719;
                    }
                    if (ch !== 62)
                        return 8390721;
                    advanceChar(parser);
                    if (parser.index < parser.end) {
                        const ch = parser.currentChar;
                        if (ch === 62) {
                            if (advanceChar(parser) === 61) {
                                advanceChar(parser);
                                return 4194334;
                            }
                            return 8390980;
                        }
                        if (ch === 61) {
                            advanceChar(parser);
                            return 4194333;
                        }
                    }
                    return 8390979;
                }
                case 8390213: {
                    advanceChar(parser);
                    const ch = parser.currentChar;
                    if (ch === 38) {
                        advanceChar(parser);
                        if (parser.currentChar === 61) {
                            advanceChar(parser);
                            return 4718633;
                        }
                        return 8913720;
                    }
                    if (ch === 61) {
                        advanceChar(parser);
                        return 4194343;
                    }
                    return 8390213;
                }
                case 22: {
                    let ch = advanceChar(parser);
                    if (ch === 63) {
                        advanceChar(parser);
                        if (parser.currentChar === 61) {
                            advanceChar(parser);
                            return 4718634;
                        }
                        return 276824446;
                    }
                    if (ch === 46) {
                        const index = parser.index + 1;
                        if (index < parser.end) {
                            ch = source.charCodeAt(index);
                            if (!(ch >= 48 && ch <= 57)) {
                                advanceChar(parser);
                                return 67108991;
                            }
                        }
                    }
                    return 22;
                }
            }
        }
        else {
            if ((char ^ 8232) <= 1) {
                state = (state & -5) | 1;
                scanNewLine(parser);
                continue;
            }
            const merged = consumePossibleSurrogatePair(parser);
            if (merged > 0)
                char = merged;
            if (isIDStart(char)) {
                parser.tokenValue = '';
                return scanIdentifierSlowCase(parser, context, 0, 0);
            }
            if (isExoticECMAScriptWhitespace(char)) {
                advanceChar(parser);
                continue;
            }
            parser.report(20, String.fromCodePoint(char));
        }
    }
    return 1048576;
}

function matchOrInsertSemicolon(/** @type {Parser} */ parser, /** @type {number} */ context) {
    if ((parser.flags & 1) === 0 && (parser.getToken() & 1048576) !== 1048576) {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
    if (!consumeOpt(parser, context, 1074790417)) {
        parser.options.onInsertedSemicolon?.(parser.startIndex);
    }
}
/** @returns {number} */ function isValidStrictMode(/** @type {Parser} */ parser, /** @type {number} */ index, /** @type {number} */ tokenIndex, /** @type {string} */ tokenValue) {
    if (index - tokenIndex < 13 && tokenValue === 'use strict') {
        if ((parser.getToken() & 1048576) === 1048576 || parser.flags & 1) {
            return 1;
        }
    }
    return 0;
}
/** @returns {number} */ function optionalBit(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if (parser.getToken() !== t)
        return 0;
    nextToken(parser, context);
    return 1;
}
/** @returns {boolean} */ function consumeOpt(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if (parser.getToken() !== t)
        return false;
    nextToken(parser, context);
    return true;
}
function consume(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if (parser.getToken() !== t)
        parser.report(25, KeywordDescTable[t & 255]);
    nextToken(parser, context);
}
function reinterpretToPattern(/** @type {Parser} */ parser, /** @type {MeriyahNode} */ node) {
    const rewritten = node;
    switch (node.type) {
        case 'ArrayExpression': {
            rewritten.type = 'ArrayPattern';
            const { elements } = node;
            for (let i = 0, n = elements.length; i < n; ++i) {
                const element = elements[i];
                if (element)
                    reinterpretToPattern(parser, element);
            }
            return;
        }
        case 'ObjectExpression': {
            rewritten.type = 'ObjectPattern';
            const { properties } = node;
            for (let i = 0, n = properties.length; i < n; ++i) {
                reinterpretToPattern(parser, properties[i]);
            }
            return;
        }
        case 'AssignmentExpression':
            rewritten.type = 'AssignmentPattern';
            if (node.operator !== '=')
                parser.report(71);
            delete rewritten.operator;
            reinterpretToPattern(parser, node.left);
            return;
        case 'Property':
            reinterpretToPattern(parser, node.value);
            return;
        case 'SpreadElement':
            rewritten.type = 'RestElement';
            reinterpretToPattern(parser, node.argument);
    }
}
function validateBindingIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ kind, /** @type {number} */ t, /** @type {number} */ skipEvalArgCheck) {
    if (context & 1) {
        if ((t & 36864) === 36864) {
            parser.report(120);
        }
        if (!skipEvalArgCheck && (t & 537079808) === 537079808) {
            parser.report(121);
        }
    }
    if ((t & 20480) === 20480 || t === -2147483527) {
        parser.report(102);
    }
    if (kind & (8 | 16) && (t & 255) === (241737 & 255)) {
        parser.report(100);
    }
    if (context & (2048 | 2) && t === 209006) {
        parser.report(112);
    }
    if (context & (1024 | 1) && t === 241771) {
        parser.report(97, 'yield');
    }
}
function validateFunctionName(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if (context & 1) {
        if ((t & 36864) === 36864) {
            parser.report(120);
        }
        if ((t & 537079808) === 537079808) {
            parser.report(121);
        }
        if (t === -2147483526) {
            parser.report(95);
        }
        if (t === -2147483527) {
            parser.report(95);
        }
    }
    if ((t & 20480) === 20480) {
        parser.report(102);
    }
    if (context & (2048 | 2) && (t & 2147483647) === 209006) {
        parser.report(112);
    }
    if (context & (1024 | 1) && (t & 2147483647) === 241771) {
        parser.report(97, 'yield');
    }
}
/** @returns {boolean} */ function isStrictReservedWord(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if ((t & 255) === (209006 & 255)) {
        if (context & (2048 | 2))
            parser.report(112);
        if ((parser.destructible & 128) === 0) {
            parser.firstAwaitLocation ??= { start: parser.tokenStart, end: parser.currentLocation };
        }
        parser.destructible |= 128;
    }
    if (t === 241771 && context & 1024)
        parser.report(97, 'yield');
    return ((t & 20480) === 20480 ||
        (t & 36864) === 36864 ||
        t == -2147483526);
}
/** @returns {boolean} */ function isPropertyWithPrivateFieldKey(/** @type {MeriyahNode} */ expr) {
    return expr.type === 'MemberExpression' && expr.property.type === 'PrivateIdentifier';
}
/** @returns {number} */ function isValidLabel(/** @type {Parser} */ parser, labels, /** @type {string} */ name, /** @type {number} */ isIterationStatement) {
    let isIterationLabelSet = 0;
    while (labels) {
        if (labels.names?.has(name)) {
            if (isIterationStatement && !isIterationLabelSet)
                parser.report(139, name);
            return 1;
        }
        isIterationLabelSet = labels.loop ? 1 : 0;
        labels = labels.parent;
    }
    return 0;
}
function validateAndDeclareLabel(/** @type {Parser} */ parser, labels, /** @type {string} */ name) {
    let set = labels;
    while (set) {
        if (set.names?.has(name))
            parser.report(138, name);
        set = set.parent;
    }
    (labels.names ??= new Set()).add(name);
}
/** @returns {string} */ function isEqualTagName(/** @type {MeriyahNode} */ elementName) {
    switch (elementName.type) {
        case 'JSXIdentifier':
            return elementName.name;
        case 'JSXNamespacedName':
            return isEqualTagName(elementName.namespace) + ':' + elementName.name.name;
        case 'JSXMemberExpression':
            return isEqualTagName(elementName.object) + '.' + isEqualTagName(elementName.property);
    }
}
/** @returns {boolean} */ function isValidIdentifier(/** @type {number} */ context, /** @type {number} */ t) {
    if (context & (1 | 1024)) {
        if (context & 2 && t === 209006)
            return false;
        if (context & 1024 && t === 241771)
            return false;
        if (context & 1)
            return (t & 12288) === 12288;
    }
    return (t & 12288) === 12288 || (t & 36864) === 36864;
}
function classifyIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ t) {
    if ((t & 537079808) === 537079808) {
        if (context & 1)
            parser.report(121);
        parser.flags |= 512;
    }
    if (context & 1 && (t & 255) === (241737 & 255)) {
        parser.report(99);
    }
    if (!isValidIdentifier(context, t))
        parser.report(0);
}

const entities = new Map(Object.entries({
    quot: '\u0022',
    amp: '&',
    apos: '\u0027',
    lt: '<',
    gt: '>',
    nbsp: '\u00A0',
    iexcl: '\u00A1',
    cent: '\u00A2',
    pound: '\u00A3',
    curren: '\u00A4',
    yen: '\u00A5',
    brvbar: '\u00A6',
    sect: '\u00A7',
    uml: '\u00A8',
    copy: '\u00A9',
    ordf: '\u00AA',
    laquo: '\u00AB',
    not: '\u00AC',
    shy: '\u00AD',
    reg: '\u00AE',
    macr: '\u00AF',
    deg: '\u00B0',
    plusmn: '\u00B1',
    sup2: '\u00B2',
    sup3: '\u00B3',
    acute: '\u00B4',
    micro: '\u00B5',
    para: '\u00B6',
    middot: '\u00B7',
    cedil: '\u00B8',
    sup1: '\u00B9',
    ordm: '\u00BA',
    raquo: '\u00BB',
    frac14: '\u00BC',
    frac12: '\u00BD',
    frac34: '\u00BE',
    iquest: '\u00BF',
    Agrave: '\u00C0',
    Aacute: '\u00C1',
    Acirc: '\u00C2',
    Atilde: '\u00C3',
    Auml: '\u00C4',
    Aring: '\u00C5',
    AElig: '\u00C6',
    Ccedil: '\u00C7',
    Egrave: '\u00C8',
    Eacute: '\u00C9',
    Ecirc: '\u00CA',
    Euml: '\u00CB',
    Igrave: '\u00CC',
    Iacute: '\u00CD',
    Icirc: '\u00CE',
    Iuml: '\u00CF',
    ETH: '\u00D0',
    Ntilde: '\u00D1',
    Ograve: '\u00D2',
    Oacute: '\u00D3',
    Ocirc: '\u00D4',
    Otilde: '\u00D5',
    Ouml: '\u00D6',
    times: '\u00D7',
    Oslash: '\u00D8',
    Ugrave: '\u00D9',
    Uacute: '\u00DA',
    Ucirc: '\u00DB',
    Uuml: '\u00DC',
    Yacute: '\u00DD',
    THORN: '\u00DE',
    szlig: '\u00DF',
    agrave: '\u00E0',
    aacute: '\u00E1',
    acirc: '\u00E2',
    atilde: '\u00E3',
    auml: '\u00E4',
    aring: '\u00E5',
    aelig: '\u00E6',
    ccedil: '\u00E7',
    egrave: '\u00E8',
    eacute: '\u00E9',
    ecirc: '\u00EA',
    euml: '\u00EB',
    igrave: '\u00EC',
    iacute: '\u00ED',
    icirc: '\u00EE',
    iuml: '\u00EF',
    eth: '\u00F0',
    ntilde: '\u00F1',
    ograve: '\u00F2',
    oacute: '\u00F3',
    ocirc: '\u00F4',
    otilde: '\u00F5',
    ouml: '\u00F6',
    divide: '\u00F7',
    oslash: '\u00F8',
    ugrave: '\u00F9',
    uacute: '\u00FA',
    ucirc: '\u00FB',
    uuml: '\u00FC',
    yacute: '\u00FD',
    thorn: '\u00FE',
    yuml: '\u00FF',
    OElig: '\u0152',
    oelig: '\u0153',
    Scaron: '\u0160',
    scaron: '\u0161',
    Yuml: '\u0178',
    fnof: '\u0192',
    circ: '\u02C6',
    tilde: '\u02DC',
    Alpha: '\u0391',
    Beta: '\u0392',
    Gamma: '\u0393',
    Delta: '\u0394',
    Epsilon: '\u0395',
    Zeta: '\u0396',
    Eta: '\u0397',
    Theta: '\u0398',
    Iota: '\u0399',
    Kappa: '\u039A',
    Lambda: '\u039B',
    Mu: '\u039C',
    Nu: '\u039D',
    Xi: '\u039E',
    Omicron: '\u039F',
    Pi: '\u03A0',
    Rho: '\u03A1',
    Sigma: '\u03A3',
    Tau: '\u03A4',
    Upsilon: '\u03A5',
    Phi: '\u03A6',
    Chi: '\u03A7',
    Psi: '\u03A8',
    Omega: '\u03A9',
    alpha: '\u03B1',
    beta: '\u03B2',
    gamma: '\u03B3',
    delta: '\u03B4',
    epsilon: '\u03B5',
    zeta: '\u03B6',
    eta: '\u03B7',
    theta: '\u03B8',
    iota: '\u03B9',
    kappa: '\u03BA',
    lambda: '\u03BB',
    mu: '\u03BC',
    nu: '\u03BD',
    xi: '\u03BE',
    omicron: '\u03BF',
    pi: '\u03C0',
    rho: '\u03C1',
    sigmaf: '\u03C2',
    sigma: '\u03C3',
    tau: '\u03C4',
    upsilon: '\u03C5',
    phi: '\u03C6',
    chi: '\u03C7',
    psi: '\u03C8',
    omega: '\u03C9',
    thetasym: '\u03D1',
    upsih: '\u03D2',
    piv: '\u03D6',
    ensp: '\u2002',
    emsp: '\u2003',
    thinsp: '\u2009',
    zwnj: '\u200C',
    zwj: '\u200D',
    lrm: '\u200E',
    rlm: '\u200F',
    ndash: '\u2013',
    mdash: '\u2014',
    lsquo: '\u2018',
    rsquo: '\u2019',
    sbquo: '\u201A',
    ldquo: '\u201C',
    rdquo: '\u201D',
    bdquo: '\u201E',
    dagger: '\u2020',
    Dagger: '\u2021',
    bull: '\u2022',
    hellip: '\u2026',
    permil: '\u2030',
    prime: '\u2032',
    Prime: '\u2033',
    lsaquo: '\u2039',
    rsaquo: '\u203A',
    oline: '\u203E',
    frasl: '\u2044',
    euro: '\u20AC',
    image: '\u2111',
    weierp: '\u2118',
    real: '\u211C',
    trade: '\u2122',
    alefsym: '\u2135',
    larr: '\u2190',
    uarr: '\u2191',
    rarr: '\u2192',
    darr: '\u2193',
    harr: '\u2194',
    crarr: '\u21B5',
    lArr: '\u21D0',
    uArr: '\u21D1',
    rArr: '\u21D2',
    dArr: '\u21D3',
    hArr: '\u21D4',
    forall: '\u2200',
    part: '\u2202',
    exist: '\u2203',
    empty: '\u2205',
    nabla: '\u2207',
    isin: '\u2208',
    notin: '\u2209',
    ni: '\u220B',
    prod: '\u220F',
    sum: '\u2211',
    minus: '\u2212',
    lowast: '\u2217',
    radic: '\u221A',
    prop: '\u221D',
    infin: '\u221E',
    ang: '\u2220',
    and: '\u2227',
    or: '\u2228',
    cap: '\u2229',
    cup: '\u222A',
    int: '\u222B',
    there4: '\u2234',
    sim: '\u223C',
    cong: '\u2245',
    asymp: '\u2248',
    ne: '\u2260',
    equiv: '\u2261',
    le: '\u2264',
    ge: '\u2265',
    sub: '\u2282',
    sup: '\u2283',
    nsub: '\u2284',
    sube: '\u2286',
    supe: '\u2287',
    oplus: '\u2295',
    otimes: '\u2297',
    perp: '\u22A5',
    sdot: '\u22C5',
    lceil: '\u2308',
    rceil: '\u2309',
    lfloor: '\u230A',
    rfloor: '\u230B',
    lang: '\u2329',
    rang: '\u232A',
    loz: '\u25CA',
    spades: '\u2660',
    clubs: '\u2663',
    hearts: '\u2665',
    diams: '\u2666',
}));
/** @returns {string} */ function decodeHTMLStrict(/** @type {string} */ text) {
    return text.replaceAll(/&(?:[\da-zA-Z]+|#x[\da-fA-F]+|#\d+);/g, (key) => {
        if (key.charAt(1) === '#') {
            const secondChar = key.charAt(2);
            const codePoint = secondChar === 'x' ? parseInt(key.slice(3), 16) : parseInt(key.slice(2), 10);
            return codePoint > 0x10ffff ? key : String.fromCodePoint(codePoint);
        }
        return entities.get(key.slice(1, -1)) ?? key;
    });
}

/** @returns {number} */ function scanJSXAttributeValue(/** @type {Parser} */ parser, /** @type {number} */ context) {
    parser.startIndex = parser.tokenIndex = parser.index;
    parser.startColumn = parser.tokenColumn = parser.column;
    parser.startLine = parser.tokenLine = parser.line;
    parser.setToken(CharTypes[parser.currentChar] & 8192
        ? scanJSXString(parser)
        : scanSingleToken(parser, context, 0));
    return parser.getToken();
}
/** @returns {number} */ function scanJSXString(/** @type {Parser} */ parser) {
    const quote = parser.currentChar;
    let char = advanceChar(parser);
    const start = parser.index;
    while (char !== quote) {
        if (parser.index >= parser.end)
            parser.report(16);
        if (char === 13) {
            if (parser.source.charCodeAt(parser.index + 1) === 10)
                advanceChar(parser);
            parser.column = -1;
            parser.line++;
        }
        else if (char === 10 || char === 8232 || char === 8233) {
            parser.column = -1;
            parser.line++;
        }
        char = advanceChar(parser);
    }
    if (char !== quote)
        parser.report(16);
    parser.tokenValue = decodeHTMLStrict(parser.source.slice(start, parser.index));
    advanceChar(parser);
    if (parser.options.raw)
        parser.tokenRaw = parser.source.slice(parser.tokenIndex, parser.index);
    return 134283267;
}
function nextJSXToken(/** @type {Parser} */ parser) {
    parser.startIndex = parser.tokenIndex = parser.index;
    parser.startColumn = parser.tokenColumn = parser.column;
    parser.startLine = parser.tokenLine = parser.line;
    if (parser.index >= parser.end) {
        parser.setToken(1048576);
        return;
    }
    if (parser.currentChar === 60) {
        advanceChar(parser);
        parser.setToken(8456256);
        return;
    }
    if (parser.currentChar === 123) {
        advanceChar(parser);
        parser.setToken(2162700);
        return;
    }
    if (parser.currentChar === 125) {
        parser.report(180);
    }
    if (parser.currentChar === 62) {
        parser.report(181);
    }
    let state = 0;
    let hasCarriageReturn = false;
    while (parser.index < parser.end) {
        const char = parser.source.charCodeAt(parser.index);
        if (char === 13) {
            state |= 1 | 4;
            hasCarriageReturn = true;
            scanNewLine(parser);
        }
        else if (char === 10) {
            consumeLineFeed(parser, state);
            state = (state & -5) | 1;
        }
        else if (char === 8232 || char === 8233) {
            parser.flags |= 1;
            parser.currentChar = parser.source.charCodeAt(++parser.index);
            parser.column = 0;
            parser.line++;
            state = (state & -5) | 1;
        }
        else {
            advanceChar(parser);
        }
        if (CharTypes[parser.currentChar] & 16384)
            break;
    }
    if (parser.tokenIndex === parser.index)
        parser.report(0);
    const sourceSlice = parser.source.slice(parser.tokenIndex, parser.index);
    const raw = hasCarriageReturn ? sourceSlice.replaceAll('\r\n', '\n') : sourceSlice;
    if (parser.options.raw)
        parser.tokenRaw = raw;
    parser.tokenValue = decodeHTMLStrict(raw);
    parser.setToken(138);
}
/** @returns {number} */ function rescanJSXIdentifier(/** @type {Parser} */ parser) {
    if (parser.getToken() & 143360) {
        const { index } = parser;
        let char = parser.currentChar;
        while (CharTypes[char] & (32768 | 2)) {
            char = advanceChar(parser);
        }
        parser.tokenValue += parser.source.slice(index, parser.index);
        parser.setToken(208897, true);
    }
    return parser.getToken();
}

const nextFeatures = 1 | 2 | 4;

/** @returns {MeriyahRanges | undefined} */ function normalizeRanges(/** @type {boolean} */ ranges) {
    if (!ranges)
        return undefined;
    if (ranges === true)
        return { start: true, end: true, range: true };
    return {
        start: ranges.start ?? false,
        end: ranges.end ?? false,
        range: ranges.range ?? false,
    };
}
/** @returns {MeriyahOptions} */ function normalizeOptions(rawOptions) {
    let { features, next, ranges, module, sourceType, globalReturn, ...restOptions } = {
        validateRegex: true,
        features: 0,
        ...rawOptions,
    };
    if (next) {
        features |= nextFeatures;
    }
    ranges = normalizeRanges(ranges);
    if (module && !sourceType) {
        sourceType = 'module';
    }
    if (globalReturn && (!sourceType || sourceType === 'script')) {
        sourceType = 'commonjs';
    }
    const options = {
        ...restOptions,
        ranges,
        features,
        sourceType,
    };
    return options;
}

class PrivateScope {
    /** @type {Parser} */ parser;
    /** @type {undefined | PrivateScope} */ parent;
    refs = Object.create(null);
    /** @type {Map<string, number>} */ privateIdentifiers = new Map();
    constructor(/** @type {Parser} */ parser, /** @type {undefined | PrivateScope} */ parent) {
        /** @type {Parser} */ this.parser = parser;
        /** @type {undefined | PrivateScope} */ this.parent = parent;
    }
    addPrivateIdentifier(/** @type {string} */ name, /** @type {number} */ kind) {
        const { privateIdentifiers } = this;
        let focusKind = kind & (32 | 768);
        if (!(focusKind & 768))
            focusKind |= 768;
        const value = privateIdentifiers.get(name);
        if (this.hasPrivateIdentifier(name) &&
            ((value & 32) !== (focusKind & 32) || value & focusKind & 768)) {
            this.parser.report(148, name);
        }
        privateIdentifiers.set(name, this.hasPrivateIdentifier(name) ? value | focusKind : focusKind);
    }
    addPrivateIdentifierRef(/** @type {string} */ name) {
        this.refs[name] ??= [];
        this.refs[name].push(this.parser.tokenStart);
    }
    validatePrivateIdentifierRefs() {
        for (const name in this.refs) {
            if (this.hasPrivateIdentifier(name))
                continue;
            if (this.parent) {
                (this.parent.refs[name] ??= []).push(...this.refs[name]);
            }
            else {
                const { index, line, column } = this.refs[name][0];
                throw new ParseError({ index, line, column }, { index: index + name.length, line, column: column + name.length }, 4, name);
            }
        }
    }
    /** @returns {boolean} */ hasPrivateIdentifier(/** @type {string} */ name) {
        return this.privateIdentifiers.has(name);
    }
}

class Scope {
    /** @type {Parser} */ parser;
    /** @type {number} */ type;
    /** @type {undefined | Scope} */ parent;
    /** @type {{ type: number, params: any[], start: MeriyahLocation, end: MeriyahLocation } | undefined} */ scopeError;
    /** @type {Map<string, number>} */ variableBindings = new Map();
    constructor(/** @type {Parser} */ parser, /** @type {undefined | number} */ type = 2, /** @type {undefined | Scope} */ parent) {
        /** @type {Parser} */ this.parser = parser;
        /** @type {number} */ this.type = type;
        /** @type {undefined | Scope} */ this.parent = parent;
    }
    /** @returns {Scope} */ createChildScope(/** @type {undefined | number} */ type) {
        return new Scope(this.parser, type, this);
    }
    addVarOrBlock(/** @type {number} */ context, /** @type {string} */ name, /** @type {number} */ kind, tokenStart, tokenEnd, /** @type {number} */ origin) {
        if (kind & 4) {
            this.addVarName(context, name, kind, tokenStart, tokenEnd);
        }
        else {
            this.addBlockName(context, name, kind, tokenStart, tokenEnd, origin);
        }
        if (origin & 64) {
            this.parser.declareUnboundVariable(name);
        }
    }
    addVarName(/** @type {number} */ context, /** @type {string} */ name, /** @type {number} */ kind, tokenStart, tokenEnd) {
        const { parser } = this;
        let currentScope = this;
        while (currentScope && (currentScope.type & 128) === 0) {
            const { variableBindings } = currentScope;
            const value = variableBindings.get(name);
            if (value && value & 248) {
                if (parser.options.webcompat &&
                    (context & 1) === 0 &&
                    ((kind & 128 && value & 68) ||
                        (value & 128 && kind & 68))) ;
                else {
                    throw new ParseError(tokenStart, tokenEnd, 147, name);
                }
            }
            if (currentScope === this) {
                if (value && value & 1 && kind & 1) {
                    currentScope.recordScopeError(147, tokenStart, tokenEnd, name);
                }
            }
            if (value &&
                (value & 256 || (value & 512 && !parser.options.webcompat))) {
                throw new ParseError(tokenStart, tokenEnd, 147, name);
            }
            currentScope.variableBindings.set(name, kind);
            currentScope = currentScope.parent;
        }
    }
    /** @returns {boolean} */ hasVariable(/** @type {string} */ name) {
        return this.variableBindings.has(name);
    }
    addBlockName(/** @type {number} */ context, /** @type {string} */ name, /** @type {number} */ kind, tokenStart, tokenEnd, /** @type {number} */ origin = 0) {
        const { parser } = this;
        const value = this.variableBindings.get(name);
        if (value && (value & 2) === 0) {
            if (kind & 1) {
                this.recordScopeError(147, tokenStart, tokenEnd, name);
            }
            else if (parser.options.webcompat &&
                (context & 1) === 0 &&
                origin & 2 &&
                value === 64 &&
                kind === 64) ;
            else {
                throw new ParseError(tokenStart, tokenEnd, 147, name);
            }
        }
        if (this.type & 64 &&
            this.parent?.hasVariable(name) &&
            (this.parent.variableBindings.get(name) & 2) === 0) {
            throw new ParseError(tokenStart, tokenEnd, 147, name);
        }
        if (this.type & 512 && value && (value & 2) === 0) {
            if (kind & 1) {
                this.recordScopeError(147, tokenStart, tokenEnd, name);
            }
        }
        if (this.type & 32) {
            if (this.parent.variableBindings.get(name) & 768)
                throw new ParseError(tokenStart, tokenEnd, 161, name);
        }
        this.variableBindings.set(name, kind);
    }
    recordScopeError(/** @type {number} */ type, tokenStart, tokenEnd, ...params) {
        this.scopeError ??= {
            type,
            params,
            start: tokenStart,
            end: tokenEnd,
        };
    }
    reportScopeError() {
        const { scopeError } = this;
        if (!scopeError) {
            return;
        }
        throw new ParseError(scopeError.start, scopeError.end, scopeError.type, ...scopeError.params);
    }
}
/** @returns {Scope} */ function createArrowHeadParsingScope(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {string} */ value, tokenStart, tokenEnd) {
    const scope = parser.createScope().createChildScope(512);
    scope.addBlockName(context, value, 1, tokenStart, tokenEnd);
    return scope;
}

class Parser {
    /** @type {string} */ source;
    /** @type {any[] | null} */ lastOnToken = null;
    /** @type {MeriyahOptions} */ options;
    /** @type {number} */ token = 1048576;
    /** @type {number} */ flags = 0;
    features = 0;
    /** @type {number} */ index = 0;
    /** @type {number} */ line = 1;
    /** @type {number} */ column = 0;
    /** @type {number} */ startIndex = 0;
    /** @type {number} */ end = 0;
    /** @type {number} */ tokenIndex = 0;
    /** @type {number} */ startColumn = 0;
    /** @type {number} */ tokenColumn = 0;
    /** @type {number} */ tokenLine = 1;
    /** @type {number} */ startLine = 1;
    /** @type {any} */ tokenValue = '';
    /** @type {string} */ tokenRaw = '';
    /** @type {{ pattern: string, flags: string } | undefined} */ tokenRegExp = void 0;
    /** @type {number} */ currentChar = 0;
    /** @type {Set<string>} */ exportedNames = new Set();
    /** @type {Set<string>} */ exportedBindings = new Set();
    /** @type {number} */ assignable = 0;
    /** @type {number} */ destructible = 0;
    /** @type {MeriyahLocation[] | null} */ strictReservedRange = null;
    firstAwaitLocation = null;
    firstYieldLocation = null;
    /** @type {{ decorators: any[], start?: MeriyahLocation }} */ leadingDecorators = { decorators: [] };
    constructor(/** @type {string} */ source, rawOptions = {}) {
        /** @type {string} */ this.source = source;
        /** @type {number} */ this.end = source.length;
        /** @type {number} */ this.currentChar = source.charCodeAt(0);
        this.options = normalizeOptions(rawOptions);
        this.features = this.options.features;
        if (Array.isArray(this.options.onComment)) {
            this.options.onComment = pushComment(this.options.onComment, this.options);
        }
        if (Array.isArray(this.options.onToken)) {
            this.options.onToken = pushToken(this.options.onToken, this.options);
        }
    }
    /** @returns {number} */ getToken() {
        return this.token;
    }
    /** @returns {number} */ setToken(/** @type {number} */ value, /** @type {undefined | boolean} */ replaceLast = false) {
        this.token = value;
        const { onToken } = this.options;
        if (onToken) {
            if (value !== 1048576) {
                const loc = {
                    start: {
                        line: this.tokenLine,
                        column: this.tokenColumn,
                    },
                    end: {
                        line: this.line,
                        column: this.column,
                    },
                };
                if (!replaceLast && this.lastOnToken) {
                    onToken(...this.lastOnToken);
                }
                this.lastOnToken = [convertTokenType(value), this.tokenIndex, this.index, loc];
            }
            else {
                if (this.lastOnToken) {
                    onToken(...this.lastOnToken);
                    this.lastOnToken = null;
                }
            }
        }
        return value;
    }
    /** @returns {MeriyahLocation} */ get tokenStart() {
        return {
            index: this.tokenIndex,
            line: this.tokenLine,
            column: this.tokenColumn,
        };
    }
    get startPosition() {
        return {
            index: this.startIndex,
            line: this.startLine,
            column: this.startColumn,
        };
    }
    /** @returns {MeriyahLocation} */ get currentLocation() {
        return { index: this.index, line: this.line, column: this.column };
    }
    /** @template {MeriyahNode} T @param {T} node @returns {T} */
    finishNode(node, /** @type {MeriyahLocation} */ start, /** @type {MeriyahLocation | undefined} */ end) {
        const { ranges } = this.options;
        if (ranges) {
            const endIndex = end ? end.index : this.startIndex;
            if (ranges.start)
                node.start = start.index;
            if (ranges.end)
                node.end = endIndex;
            if (ranges.range)
                node.range = [start.index, endIndex];
        }
        if (this.options.loc) {
            node.loc = {
                start: {
                    line: start.line,
                    column: start.column,
                },
                end: end ? { line: end.line, column: end.column } : { line: this.startLine, column: this.startColumn },
            };
            if (this.options.source) {
                node.loc.source = this.options.source;
            }
        }
        return node;
    }
    addBindingToExports(/** @type {string} */ name) {
        this.exportedBindings.add(name);
    }
    declareUnboundVariable(/** @type {string} */ name) {
        const { exportedNames } = this;
        if (exportedNames.has(name)) {
            this.report(149, name);
        }
        exportedNames.add(name);
    }
    report(/** @type {number} */ type, ...params) {
        throw new ParseError(this.tokenStart, this.currentLocation, type, ...params);
    }
    /** @returns {undefined | Scope} */ createScopeIfLexical(/** @type {number | undefined} */ type, /** @type {undefined | Scope} */ parent) {
        if (this.options.lexical) {
            return this.createScope(type, parent);
        }
        return undefined;
    }
    /** @returns {Scope} */ createScope(/** @type {undefined | number} */ type, /** @type {undefined | Scope} */ parent) {
        return new Scope(this, type, parent);
    }
    /** @returns {undefined | PrivateScope} */ createPrivateScopeIfLexical(/** @type {undefined | PrivateScope} */ parent) {
        if (this.options.lexical) {
            return new PrivateScope(this, parent);
        }
        return undefined;
    }
    /** @returns {MeriyahNode} */ cloneIdentifier(/** @type {MeriyahNode} */ original) {
        return structuredClone(original);
    }
    /** @returns {MeriyahNode} */ cloneStringLiteral(/** @type {MeriyahNode} */ original) {
        return structuredClone(original);
    }
}
function pushComment(/** @type {any[]} */ comments, /** @type {MeriyahOptions} */ options) {
    return function (/** @type {string} */ type, /** @type {string} */ value, /** @type {number} */ start, /** @type {number} */ end, loc) {
        const comment = {
            type,
            value,
        };
        const { ranges } = options;
        if (ranges) {
            if (ranges.start)
                comment.start = start;
            if (ranges.end)
                comment.end = end;
            if (ranges.range)
                comment.range = [start, end];
        }
        if (options.loc) {
            comment.loc = loc;
        }
        comments.push(comment);
    };
}
function pushToken(/** @type {any[]} */ tokens, /** @type {MeriyahOptions} */ options) {
    return function (type, start, end, loc) {
        const token = {
            token: type,
        };
        const { ranges } = options;
        if (ranges) {
            if (ranges.start)
                token.start = start;
            if (ranges.end)
                token.end = end;
            if (ranges.range)
                token.range = [start, end];
        }
        if (options.loc) {
            token.loc = loc;
        }
        tokens.push(token);
    };
}

function parseSource(/** @type {string} */ source, rawOptions = {}, /** @type {number} */ context = 0) {
    const parser = new Parser(source, rawOptions);
    if (parser.options.sourceType === 'module')
        context |= 2 | 1;
    if (parser.options.sourceType === 'commonjs')
        context |= 4096 | 65536;
    if (parser.options.impliedStrict)
        context |= 1;
    skipHashBang(parser);
    const scope = parser.createScopeIfLexical();
    let body;
    let sourceType = 'script';
    if (context & 2) {
        sourceType = 'module';
        body = parseModuleItemList(parser, context | 8, scope);
        if (scope) {
            for (const name of parser.exportedBindings) {
                if (!scope.hasVariable(name))
                    parser.report(150, name);
            }
        }
    }
    else {
        body = parseStatementList(parser, context | 8, scope);
    }
    return parser.finishNode({
        type: 'Program',
        sourceType,
        body,
    }, { index: 0, line: 1, column: 0 }, parser.currentLocation);
}
/** @returns {any[]} */ function parseStatementList(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    nextToken(parser, context | 32 | 262144);
    const statements = [];
    while (parser.getToken() === 134283267) {
        const { index, tokenValue, tokenStart, tokenIndex } = parser;
        const token = parser.getToken();
        const expr = parseLiteral(parser, context);
        if (isValidStrictMode(parser, index, tokenIndex, tokenValue)) {
            context |= 1;
            if (parser.flags & 64) {
                throw new ParseError(parser.tokenStart, parser.currentLocation, 9);
            }
            if (parser.flags & 4096) {
                throw new ParseError(parser.tokenStart, parser.currentLocation, 15);
            }
        }
        statements.push(parseDirective(parser, context, expr, token, tokenStart));
    }
    while (parser.getToken() !== 1048576) {
        statements.push(parseStatementListItem(parser, context, scope, undefined, {}, 4));
    }
    return statements;
}
/** @returns {any[]} */ function parseModuleItemList(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    nextToken(parser, context | 32);
    const statements = [];
    while (parser.getToken() === 134283267) {
        const { tokenStart } = parser;
        const token = parser.getToken();
        statements.push(parseDirective(parser, context, parseLiteral(parser, context), token, tokenStart));
    }
    while (parser.getToken() !== 1048576) {
        statements.push(parseModuleItem(parser, context, scope));
    }
    return statements;
}
function parseModuleItem(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    if (parser.getToken() === 133) {
        Object.assign(parser.leadingDecorators, {
            start: parser.tokenStart,
            decorators: parseDecorators(parser, context, undefined),
        });
    }
    /** @type {MeriyahNode | undefined} */ let moduleItem;
    switch (parser.getToken()) {
        case 20564:
            moduleItem = parseExportDeclaration(parser, context, scope);
            break;
        case 86106:
            if (parser.leadingDecorators.decorators.length) {
                parser.report(172);
            }
            moduleItem = parseImportDeclaration(parser, context, scope);
            break;
        default:
            moduleItem = parseStatementListItem(parser, context, scope, undefined, {}, 4);
    }
    return moduleItem;
}
function parseStatementListItem(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {number} */ origin = 2) {
    const start = parser.tokenStart;
    if (parser.leadingDecorators.decorators.length && parser.getToken() !== 86094) {
        parser.report(172);
    }
    switch (parser.getToken()) {
        case 86104:
            return parseFunctionDeclaration(parser, context, scope, privateScope, 1, 0, 0, start, origin);
        case 133:
            if (!(parser.features & 1)) {
                parser.report(30, '@');
            }
        case 86094:
            return parseClassDeclaration(parser, context, scope, privateScope, 0);
        case 86090:
            return parseLexicalDeclaration(parser, context, scope, privateScope, 16);
        case 241737:
            return parseLetIdentOrVarDeclarationStatement(parser, context, scope, privateScope, labels, origin);
        case 209013:
            return parseUsingDeclarationOrExpressionStatement(parser, context, scope, privateScope, labels, origin);
        case 209006:
            if ((context & 2048 || (context & 2 && context & 8)) &&
                nextTokenIsUsingOnSameLine(parser)) {
                return parseAwaitUsingDeclarationOrExpressionStatement(parser, context, scope, privateScope, labels, origin);
            }
            return parseStatement(parser, context, scope, privateScope, labels, 1, origin);
        case 20564:
            parser.report(103, 'export');
        case 86106:
            nextToken(parser, context);
            switch (parser.getToken()) {
                case 67174411:
                    return parseImportCallDeclaration(parser, context, privateScope, start);
                case 67108877:
                    return parseImportMetaDeclaration(parser, context, start);
                default:
                    parser.report(103, 'import');
            }
        case 209005:
            return parseAsyncArrowOrAsyncFunctionDeclaration(parser, context, scope, privateScope, labels, 1, 1, origin);
        default:
            return parseStatement(parser, context, scope, privateScope, labels, 1, origin);
    }
}
function parseStatement(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {number} */ allowFuncDecl, /** @type {number} */ origin = 0) {
    switch (parser.getToken()) {
        case 86088:
            return parseVariableStatement(parser, context, scope, privateScope);
        case 20572:
            return parseReturnStatement(parser, context, privateScope);
        case 20569:
            return parseIfStatement(parser, context, scope, privateScope, labels);
        case 20567:
            return parseForStatement(parser, context, scope, privateScope, labels);
        case 20562:
            return parseDoWhileStatement(parser, context, scope, privateScope, labels);
        case 20578:
            return parseWhileStatement(parser, context, scope, privateScope, labels);
        case 86110:
            return parseSwitchStatement(parser, context, scope, privateScope, labels);
        case 1074790417:
            return parseEmptyStatement(parser, context);
        case 2162700:
            return parseBlock(parser, context, scope?.createChildScope(), privateScope, labels, parser.tokenStart);
        case 86112:
            return parseThrowStatement(parser, context, privateScope);
        case 20555:
            return parseBreakStatement(parser, context, labels);
        case 20559:
            return parseContinueStatement(parser, context, labels);
        case 20577:
            return parseTryStatement(parser, context, scope, privateScope, labels);
        case 20579:
            return parseWithStatement(parser, context, scope, privateScope, labels);
        case 20560:
            return parseDebuggerStatement(parser, context);
        case 209005:
            return parseAsyncArrowOrAsyncFunctionDeclaration(parser, context, scope, privateScope, labels, 0, allowFuncDecl, origin);
        case 20557:
            parser.report(164);
        case 20566:
            parser.report(165);
        case 86104:
            parser.report(context & 1
                ? 76
                : !parser.options.webcompat
                    ? 78
                    : 77);
        case 86094:
            parser.report(79);
        default:
            return parseExpressionOrLabelledStatement(parser, context, scope, privateScope, labels, allowFuncDecl, origin);
    }
}
function parseExpressionOrLabelledStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {number} */ allowFuncDecl, /** @type {number} */ origin) {
    const { tokenValue, tokenStart } = parser;
    const token = parser.getToken();
    /** @type {MeriyahNode | undefined} */ let expr;
    switch (token) {
        case 241737:
            expr = parseIdentifier(parser, context);
            if (context & 1)
                parser.report(85);
            if (parser.getToken() === 69271571)
                parser.report(84);
            break;
        default:
            expr = parsePrimaryExpression(parser, context, privateScope, 2, 0, 1, 0, 1, parser.tokenStart, 1, 1);
    }
    return finishExpressionOrLabelledStatement(parser, context, scope, privateScope, labels, allowFuncDecl, expr, token, tokenValue, tokenStart, origin);
}
function finishExpressionOrLabelledStatement(parser, context, scope, privateScope, labels, allowFuncDecl, initialExpression, token, tokenValue, tokenStart, origin) {
    if (token & 143360 && parser.getToken() === 21) {
        return parseLabelledStatement(parser, context, scope, privateScope, labels, tokenValue, initialExpression, token, allowFuncDecl, tokenStart, origin);
    }
    let expression = parseMemberOrUpdateExpression(parser, context, privateScope, initialExpression, 0, 0, tokenStart);
    expression = parseAssignmentExpression(parser, context, privateScope, 0, 0, tokenStart, expression);
    if (parser.getToken() === 18) {
        expression = parseSequenceExpression(parser, context, privateScope, 0, tokenStart, expression);
    }
    return parseExpressionStatement(parser, context, expression, tokenStart);
}
function parseBlock(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {MeriyahLocation} */ start = parser.tokenStart, type = 'BlockStatement') {
    const body = [];
    consume(parser, context | 32, 2162700);
    while (parser.getToken() !== 1074790415) {
        body.push(parseStatementListItem(parser, context, scope, privateScope, { parent: labels }));
    }
    consume(parser, context | 32, 1074790415);
    return parser.finishNode({
        type,
        body,
    }, start);
}
function parseReturnStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    if ((context & 4096) === 0)
        parser.report(92);
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    const argument = parser.flags & 1 || parser.getToken() & 1048576
        ? null
        : parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'ReturnStatement',
        argument,
    }, start);
}
function parseExpressionStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ expression, /** @type {MeriyahLocation} */ start) {
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'ExpressionStatement',
        expression,
    }, start);
}
function parseLabelledStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {string} */ value, /** @type {MeriyahNode} */ expr, /** @type {number} */ token, /** @type {number} */ allowFuncDecl, /** @type {MeriyahLocation} */ start, /** @type {number} */ origin) {
    validateBindingIdentifier(parser, context, 0, token, 1);
    validateAndDeclareLabel(parser, labels, value);
    nextToken(parser, context | 32);
    const body = allowFuncDecl &&
        (context & 1) === 0 &&
        parser.options.webcompat &&
        parser.getToken() === 86104
        ? parseFunctionDeclaration(parser, context, scope?.createChildScope(), privateScope, 0, 0, 0, parser.tokenStart, origin)
        : parseStatement(parser, context, scope, privateScope, labels, allowFuncDecl, origin);
    return parser.finishNode({
        type: 'LabeledStatement',
        label: expr,
        body,
    }, start);
}
function parseAsyncArrowOrAsyncFunctionDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, allowAsyncFuncDecl, /** @type {number} */ allowFuncDecl, /** @type {number} */ origin) {
    const { tokenValue, tokenStart: start } = parser;
    const token = parser.getToken();
    let expr = parseIdentifier(parser, context);
    if (parser.getToken() === 21) {
        return parseLabelledStatement(parser, context, scope, privateScope, labels, tokenValue, expr, token, allowFuncDecl, start, origin);
    }
    const asyncNewLine = parser.flags & 1;
    if (!asyncNewLine) {
        if (parser.getToken() === 86104) {
            if (!allowAsyncFuncDecl)
                parser.report(125);
            return parseFunctionDeclaration(parser, context, scope, privateScope, 1, 0, 1, start, origin);
        }
        if (isValidIdentifier(context, parser.getToken())) {
            expr = parseAsyncArrowAfterIdent(parser, context, privateScope, 1, start);
            if (parser.getToken() === 18)
                expr = parseSequenceExpression(parser, context, privateScope, 0, start, expr);
            return parseExpressionStatement(parser, context, expr, start);
        }
    }
    if (parser.getToken() === 67174411) {
        expr = parseAsyncArrowOrCallExpression(parser, context, privateScope, expr, 1, 1, asyncNewLine, start);
    }
    else {
        if (parser.getToken() === 10) {
            classifyIdentifier(parser, context, token);
            if ((token & 36864) === 36864) {
                parser.flags |= 256;
            }
            expr = parseArrowFromIdentifier(parser, context | 2048, privateScope, parser.tokenValue, expr, 0, 1, 0, start);
        }
        else {
            parser.assignable = 1;
        }
    }
    expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 0, start);
    expr = parseAssignmentExpression(parser, context, privateScope, 0, 0, start, expr);
    parser.assignable = 1;
    if (parser.getToken() === 18) {
        expr = parseSequenceExpression(parser, context, privateScope, 0, start, expr);
    }
    return parseExpressionStatement(parser, context, expr, start);
}
function parseDirective(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ expression, /** @type {number} */ token, /** @type {MeriyahLocation} */ start) {
    const endIndex = parser.startIndex;
    if (token !== 1074790417) {
        parser.assignable = 2;
        expression = parseMemberOrUpdateExpression(parser, context, undefined, expression, 0, 0, start);
        if (parser.getToken() !== 1074790417) {
            expression = parseAssignmentExpression(parser, context, undefined, 0, 0, start, expression);
            if (parser.getToken() === 18) {
                expression = parseSequenceExpression(parser, context, undefined, 0, start, expression);
            }
        }
        matchOrInsertSemicolon(parser, context | 32);
    }
    const node = {
        type: 'ExpressionStatement',
        expression,
    };
    if (expression.type === 'Literal' && typeof expression.value === 'string') {
        node.directive = parser.source.slice(start.index + 1, endIndex - 1);
    }
    return parser.finishNode(node, start);
}
function parseEmptyStatement(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    return parser.finishNode({
        type: 'EmptyStatement',
    }, start);
}
function parseThrowStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    if (parser.flags & 1)
        parser.report(90);
    const argument = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'ThrowStatement',
        argument,
    }, start);
}
function parseIfStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    consume(parser, context | 32, 67174411);
    parser.assignable = 1;
    const test = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 16);
    const consequent = parseConsequentOrAlternative(parser, context, scope, privateScope, labels);
    /** @type {MeriyahNode | null} */ let alternate = null;
    if (parser.getToken() === 20563) {
        nextToken(parser, context | 32);
        alternate = parseConsequentOrAlternative(parser, context, scope, privateScope, labels);
    }
    return parser.finishNode({
        type: 'IfStatement',
        test,
        consequent,
        alternate,
    }, start);
}
function parseConsequentOrAlternative(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const { tokenStart } = parser;
    return context & 1 ||
        !parser.options.webcompat ||
        parser.getToken() !== 86104
        ? parseStatement(parser, context, scope, privateScope, { parent: labels }, 0)
        : parseFunctionDeclaration(parser, context, scope?.createChildScope(), privateScope, 0, 0, 0, tokenStart);
}
function parseSwitchStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    consume(parser, context | 32, 67174411);
    const discriminant = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context, 16);
    consume(parser, context, 2162700);
    const cases = [];
    let seenDefault = 0;
    scope = scope?.createChildScope(8);
    while (parser.getToken() !== 1074790415) {
        const { tokenStart } = parser;
        /** @type {MeriyahNode | null} */ let test = null;
        const consequent = [];
        if (consumeOpt(parser, context | 32, 20556)) {
            test = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
        }
        else {
            consume(parser, context | 32, 20561);
            if (seenDefault)
                parser.report(89);
            seenDefault = 1;
        }
        consume(parser, context | 32, 21);
        while (parser.getToken() !== 20556 &&
            parser.getToken() !== 1074790415 &&
            parser.getToken() !== 20561) {
            const statement = parseStatementListItem(parser, context | 4, scope, privateScope, {
                parent: labels,
            });
            if (statement.type === 'VariableDeclaration' &&
                (statement.kind === 'using' || statement.kind === 'await using')) {
                parser.report(30, statement.kind);
            }
            consequent.push(statement);
        }
        cases.push(parser.finishNode({
            type: 'SwitchCase',
            test,
            consequent,
        }, tokenStart));
    }
    consume(parser, context | 32, 1074790415);
    return parser.finishNode({
        type: 'SwitchStatement',
        discriminant,
        cases,
    }, start);
}
function parseWhileStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    consume(parser, context | 32, 67174411);
    const test = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 16);
    const body = parseIterationStatementBody(parser, context, scope, privateScope, labels);
    return parser.finishNode({
        type: 'WhileStatement',
        test,
        body,
    }, start);
}
function parseIterationStatementBody(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    return parseStatement(parser, ((context | 131072) ^ 131072) | 128, scope, privateScope, { loop: 1, parent: labels }, 0);
}
function parseContinueStatement(/** @type {Parser} */ parser, /** @type {number} */ context, labels) {
    if ((context & 128) === 0)
        parser.report(68);
    const start = parser.tokenStart;
    nextToken(parser, context);
    /** @type {MeriyahNode | null} */ let label = null;
    if ((parser.flags & 1) === 0 && parser.getToken() & 143360) {
        const { tokenValue } = parser;
        if (!isValidLabel(parser, labels, tokenValue, 1))
            parser.report(140, tokenValue);
        label = parseIdentifier(parser, context | 32);
    }
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'ContinueStatement',
        label,
    }, start);
}
function parseBreakStatement(/** @type {Parser} */ parser, /** @type {number} */ context, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    /** @type {MeriyahNode | null} */ let label = null;
    if ((parser.flags & 1) === 0 && parser.getToken() & 143360) {
        const { tokenValue } = parser;
        if (!isValidLabel(parser, labels, tokenValue, 0))
            parser.report(140, tokenValue);
        label = parseIdentifier(parser, context | 32);
    }
    else if ((context & (4 | 128)) === 0) {
        parser.report(69);
    }
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'BreakStatement',
        label,
    }, start);
}
function parseWithStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    if (context & 1)
        parser.report(91);
    consume(parser, context | 32, 67174411);
    const object = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 16);
    const body = parseStatement(parser, context, scope, privateScope, labels, 0, 2);
    return parser.finishNode({
        type: 'WithStatement',
        object,
        body,
    }, start);
}
function parseDebuggerStatement(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'DebuggerStatement',
    }, start);
}
function parseTryStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    const firstScope = scope?.createChildScope(16);
    const block = parseBlock(parser, context, firstScope, privateScope, { parent: labels });
    const { tokenStart } = parser;
    const handler = consumeOpt(parser, context | 32, 20557)
        ? parseCatchBlock(parser, context, scope, privateScope, labels, tokenStart)
        : null;
    /** @type {MeriyahNode | null} */ let finalizer = null;
    if (parser.getToken() === 20566) {
        nextToken(parser, context | 32);
        const finalizerScope = scope?.createChildScope(4);
        const block = parseBlock(parser, context, finalizerScope, privateScope, { parent: labels });
        finalizer = block;
    }
    if (!handler && !finalizer) {
        parser.report(88);
    }
    return parser.finishNode({
        type: 'TryStatement',
        block,
        handler,
        finalizer,
    }, start);
}
function parseCatchBlock(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {MeriyahLocation} */ start) {
    /** @type {MeriyahNode | null} */ let param = null;
    if (consumeOpt(parser, context, 67174411)) {
        scope = scope?.createChildScope(4);
        param = parseBindingPattern(parser, context, scope, privateScope, (parser.getToken() & 2097152) === 2097152
            ? 256
            : 512);
        if (parser.getToken() === 18) {
            parser.report(86);
        }
        else if (parser.getToken() === 1077936155) {
            parser.report(87);
        }
        consume(parser, context | 32, 16);
    }
    const additionalScope = scope?.createChildScope(32);
    const body = parseBlock(parser, context, additionalScope, privateScope, { parent: labels });
    return parser.finishNode({
        type: 'CatchClause',
        param,
        body,
    }, start);
}
function parseStaticBlock(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahLocation} */ start) {
    scope = scope?.createChildScope();
    const ctorContext = 512 |
        4096 |
        1024 |
        4 |
        128 |
        32768;
    context =
        ((context | ctorContext) ^ ctorContext) |
            256 |
            2048 |
            524288 |
            65536;
    return parseBlock(parser, context, scope, privateScope, {}, start, 'StaticBlock');
}
function parseDoWhileStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    const body = parseIterationStatementBody(parser, context, scope, privateScope, labels);
    consume(parser, context, 20578);
    consume(parser, context | 32, 67174411);
    const test = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 16);
    consumeOpt(parser, context | 32, 1074790417);
    return parser.finishNode({
        type: 'DoWhileStatement',
        body,
        test,
    }, start);
}
function parseLetIdentOrVarDeclarationStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels, /** @type {number} */ origin) {
    const { tokenValue, tokenStart, currentLocation } = parser;
    const token = parser.getToken();
    let expr = parseIdentifier(parser, context);
    if (parser.getToken() & (143360 | 2097152) &&
        (parser.getToken() & 20480) !== 20480) {
        const declarations = parseVariableDeclarationList(parser, context, scope, privateScope, 8);
        matchOrInsertSemicolon(parser, context | 32);
        return parser.finishNode({
            type: 'VariableDeclaration',
            kind: 'let',
            declarations,
        }, tokenStart);
    }
    parser.assignable = 1;
    if (context & 1)
        parser.report(85);
    if (parser.getToken() === 21) {
        return parseLabelledStatement(parser, context, scope, privateScope, labels, tokenValue, expr, token, 1, tokenStart, origin);
    }
    if (parser.getToken() === 10) {
        let scope = void 0;
        if (parser.options.lexical)
            scope = createArrowHeadParsingScope(parser, context, tokenValue, tokenStart, currentLocation);
        parser.flags = (parser.flags | 128) ^ 128;
        expr = parseArrowFunctionExpression(parser, context, scope, privateScope, [expr], 0, tokenStart);
    }
    else {
        expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 0, tokenStart);
        expr = parseAssignmentExpression(parser, context, privateScope, 0, 0, tokenStart, expr);
    }
    if (parser.getToken() === 18) {
        expr = parseSequenceExpression(parser, context, privateScope, 0, tokenStart, expr);
    }
    return parseExpressionStatement(parser, context, expr, tokenStart);
}
function nextTokenIsUsingOnSameLine(parser) {
    const { index: parserIndex, source } = parser;
    let index = parserIndex;
    while (index < parser.end) {
        const char = source.charCodeAt(index);
        if (char === 0x0a || char === 0x0d || char === 0x2028 || char === 0x2029)
            return false;
        if (/\s/u.test(source[index])) {
            index++;
            continue;
        }
        if (char === 0x2f && source.charCodeAt(index + 1) === 0x2a) {
            index += 2;
            while (index < parser.end) {
                const commentChar = source.charCodeAt(index);
                if (commentChar === 0x0a || commentChar === 0x0d || commentChar === 0x2028 || commentChar === 0x2029) {
                    return false;
                }
                if (commentChar === 0x2a && source.charCodeAt(index + 1) === 0x2f) {
                    index += 2;
                    break;
                }
                index++;
            }
            continue;
        }
        break;
    }
    if (source.slice(index, index + 5) !== 'using')
        return false;
    const following = source.codePointAt(index + 5);
    return following === undefined || (following !== 0x5c && !isIdentifierPart(following));
}
function isResourceBindingStart(token) {
    return (token & 143360) === 143360 && (token & 20480) !== 20480;
}
function parseUsingDeclarationOrExpressionStatement(parser, context, scope, privateScope, labels, origin) {
    const { tokenStart, tokenValue, currentLocation } = parser;
    const token = parser.getToken();
    const expression = parseIdentifier(parser, context);
    if ((parser.flags & 1) === 0 && isResourceBindingStart(parser.getToken())) {
        if (origin & 4 &&
            context & 8 &&
            (context & 2) === 0 &&
            (context & 4096) === 0) {
            parser.report(30, KeywordDescTable[parser.getToken() & 255]);
        }
        return parseLexicalDeclaration(parser, context, scope, privateScope, 16, origin, 'using', tokenStart, 1);
    }
    parser.assignable = 1;
    if (parser.getToken() === 10) {
        let arrowScope = void 0;
        if (parser.options.lexical)
            arrowScope = createArrowHeadParsingScope(parser, context, tokenValue, tokenStart, currentLocation);
        parser.flags = (parser.flags | 128) ^ 128;
        const arrow = parseArrowFunctionExpression(parser, context, arrowScope, privateScope, [expression], 0, tokenStart);
        return parseExpressionStatement(parser, context, arrow, tokenStart);
    }
    return finishExpressionOrLabelledStatement(parser, context, scope, privateScope, labels, 1, expression, token, tokenValue, tokenStart, origin);
}
function parseAwaitUsingDeclarationOrExpressionStatement(parser, context, scope, privateScope, labels, origin) {
    const start = parser.tokenStart;
    if (context & 524288)
        parser.report(179);
    nextToken(parser, context | 32);
    let argument;
    if ((parser.flags & 1) === 0 && parser.getToken() === 209013) {
        const usingStart = parser.tokenStart;
        const usingIdentifier = parseIdentifier(parser, context);
        if ((parser.flags & 1) === 0 && isResourceBindingStart(parser.getToken())) {
            return parseLexicalDeclaration(parser, context, scope, privateScope, 16, origin, 'await using', start, 1);
        }
        argument = parseMemberOrUpdateExpression(parser, context, privateScope, usingIdentifier, 0, 0, usingStart);
    }
    else {
        argument = parseLeftHandSideExpression(parser, context, privateScope, 0, 0, 1);
    }
    if (parser.getToken() === 8391735)
        parser.report(33);
    parser.assignable = 2;
    const expression = parser.finishNode({
        type: 'AwaitExpression',
        argument,
    }, start);
    return finishExpressionOrLabelledStatement(parser, context, scope, privateScope, labels, 0, expression, 1048576, '', start, origin);
}
function parseLexicalDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ origin = 0, declarationKind, declarationStart = parser.tokenStart, keywordConsumed = 0) {
    const start = declarationStart;
    if (!keywordConsumed)
        nextToken(parser, context);
    const declarations = parseVariableDeclarationList(parser, context, scope, privateScope, kind, origin, declarationKind);
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'VariableDeclaration',
        kind: declarationKind ?? (kind & 8 ? 'let' : 'const'),
        declarations,
    }, start);
}
function parseVariableStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ origin = 0) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    const declarations = parseVariableDeclarationList(parser, context, scope, privateScope, 4, origin);
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode({
        type: 'VariableDeclaration',
        kind: 'var',
        declarations,
    }, start);
}
/** @returns {any[]} */ function parseVariableDeclarationList(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ origin = 0, declarationKind) {
    let bindingCount = 1;
    const firstDeclaration = parseVariableDeclaration(parser, context, scope, privateScope, kind, origin, declarationKind);
    const list = [firstDeclaration];
    const resourceNames = declarationKind && parser.options.lexical ? new Set([firstDeclaration.id.name]) : undefined;
    while (consumeOpt(parser, context, 18)) {
        bindingCount++;
        const declaration = parseVariableDeclaration(parser, context, scope, privateScope, kind, origin, declarationKind);
        if (resourceNames) {
            const { name } = declaration.id;
            if (resourceNames.has(name))
                parser.report(147, name);
            resourceNames.add(name);
        }
        list.push(declaration);
    }
    if (bindingCount > 1 && origin & 32 && parser.getToken() & 262144) {
        parser.report(61, KeywordDescTable[parser.getToken() & 255]);
    }
    return list;
}
function parseVariableDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ origin, declarationKind) {
    const { tokenStart } = parser;
    const token = parser.getToken();
    /** @type {MeriyahNode | null} */ let init = null;
    if (declarationKind && (token & 2097152) === 2097152) {
        parser.report(50);
    }
    const id = parseBindingPattern(parser, context, scope, privateScope, kind, origin);
    if (parser.getToken() === 1077936155) {
        nextToken(parser, context | 32);
        init = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart, origin);
        if (origin & 32) {
            if (parser.getToken() === 471156 ||
                (parser.getToken() === 8673330 &&
                    (token & 2097152 ||
                        (kind & 4) === 0 ||
                        context & 1 ||
                        !parser.options.webcompat))) {
                throw new ParseError(tokenStart, parser.currentLocation, 60, parser.getToken() === 471156 ? 'of' : 'in');
            }
        }
    }
    else if ((kind & 16 || (token & 2097152) > 0) &&
        (parser.getToken() & 262144) !== 262144) {
        parser.report(59, declarationKind ?? (kind & 16 ? 'const' : 'destructuring'));
    }
    return parser.finishNode({
        type: 'VariableDeclarator',
        id,
        init,
    }, tokenStart);
}
function parseForStatement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, labels) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    if (context & 524288 && parser.getToken() === 209006) {
        parser.report(179);
    }
    const forAwait = ((context & 2048) > 0 || ((context & 2) > 0 && (context & 8) > 0)) &&
        consumeOpt(parser, context, 209006);
    consume(parser, context | 32, 67174411);
    scope = scope?.createChildScope(1);
    /** @type {MeriyahNode | null} */ let test = null;
    /** @type {MeriyahNode | null} */ let update = null;
    let destructible = 0;
    /** @type {MeriyahNode | null} */ let init = null;
    let isVarDecl = parser.getToken() === 86088 ||
        parser.getToken() === 241737 ||
        parser.getToken() === 86090 ||
        parser.getToken() === 209013;
    let resourceDeclarationKind;
    let consumedForOfDelimiter = false;
    /** @type {MeriyahNode | undefined} */ let right;
    const { tokenStart } = parser;
    const token = parser.getToken();
    if (isVarDecl) {
        if (token === 241737) {
            init = parseIdentifier(parser, context);
            if (parser.getToken() & (143360 | 2097152) &&
                (parser.getToken() & 20480) !== 20480) {
                init = parser.finishNode({
                    type: 'VariableDeclaration',
                    kind: 'let',
                    declarations: parseVariableDeclarationList(parser, context | 131072, scope, privateScope, 8, 32),
                }, tokenStart);
                parser.assignable = 1;
            }
            else if (context & 1) {
                parser.report(67);
            }
            else {
                isVarDecl = false;
                parser.assignable = 1;
                init = parseMemberOrUpdateExpression(parser, context, privateScope, init, 0, 0, tokenStart);
                if (parser.getToken() === 471156)
                    parser.report(117);
            }
        }
        else if (token === 209013) {
            const usingIdentifier = parseIdentifier(parser, context);
            if ((parser.flags & 1) !== 0 || !isResourceBindingStart(parser.getToken())) {
                isVarDecl = false;
                parser.assignable = 1;
                init = parseMemberOrUpdateExpression(parser, context, privateScope, usingIdentifier, 0, 0, tokenStart);
            }
            else if (parser.getToken() === 471156) {
                const ofStart = parser.tokenStart;
                const ofEnd = parser.currentLocation;
                const ofToken = parser.getToken();
                const ofValue = parser.tokenValue;
                const ofIdentifier = parseIdentifier(parser, context);
                if (parser.getToken() !== 1077936155 &&
                    parser.getToken() !== 8673330 &&
                    parser.getToken() !== 1074790417 &&
                    parser.getToken() !== 18) {
                    isVarDecl = false;
                    consumedForOfDelimiter = true;
                    parser.assignable = 1;
                    init = usingIdentifier;
                }
                else {
                    resourceDeclarationKind = 'using';
                    validateBindingIdentifier(parser, context, 16, ofToken, 0);
                    scope?.addBlockName(context, ofValue, 16, ofStart, ofEnd, 32);
                    let declarationInitializer = null;
                    if (parser.getToken() === 1077936155) {
                        nextToken(parser, context | 32);
                        declarationInitializer = parseExpression(parser, context | 131072, privateScope, 1, 0, parser.tokenStart);
                        if ((parser.getToken() & 262144) === 262144) {
                            throw new ParseError(ofStart, parser.currentLocation, 60, parser.getToken() === 471156 ? 'of' : 'in');
                        }
                    }
                    else if (parser.getToken() !== 8673330) {
                        parser.report(59, resourceDeclarationKind);
                    }
                    const declarations = [
                        parser.finishNode({
                            type: 'VariableDeclarator',
                            id: ofIdentifier,
                            init: declarationInitializer,
                        }, ofStart),
                    ];
                    const resourceNames = parser.options.lexical ? new Set([ofValue]) : undefined;
                    while (consumeOpt(parser, context | 131072, 18)) {
                        const declaration = parseVariableDeclaration(parser, context | 131072, scope, privateScope, 16, 32, resourceDeclarationKind);
                        if (resourceNames) {
                            const { name } = declaration.id;
                            if (resourceNames.has(name))
                                parser.report(147, name);
                            resourceNames.add(name);
                        }
                        declarations.push(declaration);
                    }
                    if (declarations.length > 1 && parser.getToken() & 262144) {
                        parser.report(61, KeywordDescTable[parser.getToken() & 255]);
                    }
                    init = parser.finishNode({
                        type: 'VariableDeclaration',
                        kind: resourceDeclarationKind,
                        declarations,
                    }, tokenStart);
                    parser.assignable = 1;
                }
            }
            else {
                resourceDeclarationKind = 'using';
                init = parser.finishNode({
                    type: 'VariableDeclaration',
                    kind: resourceDeclarationKind,
                    declarations: parseVariableDeclarationList(parser, context | 131072, scope, privateScope, 16, 32, resourceDeclarationKind),
                }, tokenStart);
                parser.assignable = 1;
            }
        }
        else {
            nextToken(parser, context);
            init = parser.finishNode(token === 86088
                ? {
                    type: 'VariableDeclaration',
                    kind: 'var',
                    declarations: parseVariableDeclarationList(parser, context | 131072, scope, privateScope, 4, 32),
                }
                : {
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: parseVariableDeclarationList(parser, context | 131072, scope, privateScope, 16, 32),
                }, tokenStart);
            parser.assignable = 1;
        }
    }
    else if (token === 209006 &&
        (context & 2048 || (context & 2 && context & 8))) {
        if (context & 524288)
            parser.report(179);
        nextToken(parser, context | 32);
        let awaitArgument;
        if ((parser.flags & 1) === 0 && parser.getToken() === 209013) {
            const usingStart = parser.tokenStart;
            const usingIdentifier = parseIdentifier(parser, context);
            if ((parser.flags & 1) === 0 && isResourceBindingStart(parser.getToken())) {
                resourceDeclarationKind = 'await using';
                isVarDecl = true;
                init = parser.finishNode({
                    type: 'VariableDeclaration',
                    kind: resourceDeclarationKind,
                    declarations: parseVariableDeclarationList(parser, context | 131072, scope, privateScope, 16, 32, resourceDeclarationKind),
                }, tokenStart);
                parser.assignable = 1;
            }
            else {
                awaitArgument = parseMemberOrUpdateExpression(parser, context, privateScope, usingIdentifier, 0, 0, usingStart);
            }
        }
        else {
            awaitArgument = parseLeftHandSideExpression(parser, context, privateScope, 0, 0, 1);
        }
        if (!isVarDecl) {
            if (parser.getToken() === 8391735)
                parser.report(33);
            parser.assignable = 2;
            init = parser.finishNode({
                type: 'AwaitExpression',
                argument: awaitArgument,
            }, tokenStart);
        }
    }
    else if (forAwait && token === 209005) {
        const asyncIdentifier = parseIdentifier(parser, context);
        parser.assignable = 1;
        init = parseMemberOrUpdateExpression(parser, context | 131072, privateScope, asyncIdentifier, 0, 0, tokenStart);
    }
    else if (token === 1074790417) {
        if (forAwait)
            parser.report(82);
    }
    else if ((token & 2097152) === 2097152) {
        const patternStart = parser.tokenStart;
        init =
            token === 2162700
                ? parseObjectLiteralOrPattern(parser, context, void 0, privateScope, 1, 0, 0, 2, 32)
                : parseArrayExpressionOrPattern(parser, context, void 0, privateScope, 1, 0, 0, 2, 32);
        destructible = parser.destructible;
        if (destructible & 64) {
            parser.report(63);
        }
        parser.assignable =
            destructible & 16 ? 2 : 1;
        init = parseMemberOrUpdateExpression(parser, context | 131072, privateScope, init, 0, 0, patternStart);
    }
    else {
        init = parseLeftHandSideExpression(parser, context | 131072, privateScope, 1, 0, 1);
    }
    if (consumedForOfDelimiter || (parser.getToken() & 262144) === 262144) {
        if (consumedForOfDelimiter || parser.getToken() === 471156) {
            if (parser.assignable & 2)
                parser.report(80, forAwait ? 'await' : 'of');
            reinterpretToPattern(parser, init);
            if (!consumedForOfDelimiter)
                nextToken(parser, context | 32);
            right = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
            consume(parser, context | 32, 16);
            const body = parseIterationStatementBody(parser, context, scope, privateScope, labels);
            return parser.finishNode({
                type: 'ForOfStatement',
                left: init,
                right,
                body,
                await: forAwait,
            }, start);
        }
        if (resourceDeclarationKind)
            parser.report(30, 'in');
        if (parser.assignable & 2)
            parser.report(80, 'in');
        reinterpretToPattern(parser, init);
        nextToken(parser, context | 32);
        if (forAwait)
            parser.report(82);
        right = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
        consume(parser, context | 32, 16);
        const body = parseIterationStatementBody(parser, context, scope, privateScope, labels);
        return parser.finishNode({
            type: 'ForInStatement',
            body,
            left: init,
            right,
        }, start);
    }
    if (forAwait)
        parser.report(82);
    if (!isVarDecl) {
        if (destructible & 8 && parser.getToken() !== 1077936155) {
            parser.report(80, 'loop');
        }
        init = parseAssignmentExpression(parser, context | 131072, privateScope, 0, 0, tokenStart, init);
    }
    if (parser.getToken() === 18)
        init = parseSequenceExpression(parser, context, privateScope, 0, tokenStart, init);
    consume(parser, context | 32, 1074790417);
    if (parser.getToken() !== 1074790417)
        test = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 1074790417);
    if (parser.getToken() !== 16)
        update = parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart);
    consume(parser, context | 32, 16);
    const body = parseIterationStatementBody(parser, context, scope, privateScope, labels);
    return parser.finishNode({
        type: 'ForStatement',
        init,
        test,
        update,
        body,
    }, start);
}
function parseRestrictedIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    if (!isValidIdentifier(context, parser.getToken()))
        parser.report(120);
    if ((parser.getToken() & 537079808) === 537079808)
        parser.report(121);
    scope?.addBlockName(context, parser.tokenValue, 8, parser.tokenStart, parser.currentLocation);
    return parseIdentifier(parser, context);
}
function parseImportDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    let source;
    let sourceParsed = false;
    let phase = null;
    const { tokenStart } = parser;
    let specifiers = [];
    if (parser.getToken() === 134283267) {
        source = parseLiteral(parser, context);
    }
    else {
        if (parser.getToken() & 143360) {
            const token = parser.getToken();
            const { tokenValue, tokenStart: start, currentLocation } = parser;
            const isPhaseDefer = parser.features & 2 && (token & -2147483648) === 0 && tokenValue == 'defer';
            const isPhaseSource = parser.features & 4 && (token & -2147483648) === 0 && tokenValue == 'source';
            if (isPhaseDefer || isPhaseSource) {
                const phaseOrLocal = parseIdentifier(parser, context);
                if (tokenValue === 'defer') {
                    if (parser.getToken() === 8391476) {
                        phase = 'defer';
                        specifiers = [parseImportNamespaceSpecifier(parser, context, scope)];
                    }
                    else if (parser.getToken() === 209011 || parser.getToken() === 18) {
                        scope?.addBlockName(context, tokenValue, 8, start, currentLocation);
                        specifiers = [
                            parser.finishNode({
                                type: 'ImportDefaultSpecifier',
                                local: phaseOrLocal,
                            }, tokenStart),
                        ];
                    }
                    else {
                        parser.report(108);
                    }
                }
                else if (parser.getToken() === 209011) {
                    const fromToken = parser.getToken();
                    const fromStart = parser.tokenStart;
                    const fromEnd = parser.currentLocation;
                    const fromLocal = parseIdentifier(parser, context);
                    if (parser.getToken() === 209011) {
                        validateBindingIdentifier(parser, context, 16, fromToken, 0);
                        scope?.addBlockName(context, fromLocal.name, 8, fromStart, fromEnd);
                        phase = 'source';
                        specifiers = [
                            parser.finishNode({
                                type: 'ImportDefaultSpecifier',
                                local: fromLocal,
                            }, fromStart),
                        ];
                    }
                    else {
                        scope?.addBlockName(context, tokenValue, 8, start, currentLocation);
                        specifiers = [
                            parser.finishNode({
                                type: 'ImportDefaultSpecifier',
                                local: phaseOrLocal,
                            }, tokenStart),
                        ];
                        if (parser.getToken() !== 134283267)
                            parser.report(105, 'Import');
                        source = parseLiteral(parser, context);
                        sourceParsed = true;
                    }
                }
                else if (parser.getToken() & 143360) {
                    phase = 'source';
                    const localStart = parser.tokenStart;
                    const local = parseRestrictedIdentifier(parser, context, scope);
                    specifiers = [
                        parser.finishNode({
                            type: 'ImportDefaultSpecifier',
                            local,
                        }, localStart),
                    ];
                }
                else if (parser.getToken() === 18) {
                    scope?.addBlockName(context, tokenValue, 8, start, currentLocation);
                    specifiers = [
                        parser.finishNode({
                            type: 'ImportDefaultSpecifier',
                            local: phaseOrLocal,
                        }, tokenStart),
                    ];
                }
                else {
                    parser.report(109);
                }
            }
            else {
                const local = parseRestrictedIdentifier(parser, context, scope);
                specifiers = [
                    parser.finishNode({
                        type: 'ImportDefaultSpecifier',
                        local,
                    }, tokenStart),
                ];
            }
            if (phase === null && !sourceParsed && consumeOpt(parser, context, 18)) {
                switch (parser.getToken()) {
                    case 8391476:
                        specifiers.push(parseImportNamespaceSpecifier(parser, context, scope));
                        break;
                    case 2162700:
                        parseImportSpecifierOrNamedImports(parser, context, scope, specifiers);
                        break;
                    default:
                        parser.report(107);
                }
            }
        }
        else {
            switch (parser.getToken()) {
                case 8391476:
                    specifiers = [parseImportNamespaceSpecifier(parser, context, scope)];
                    break;
                case 2162700:
                    parseImportSpecifierOrNamedImports(parser, context, scope, specifiers);
                    break;
                case 67174411:
                    return parseImportCallDeclaration(parser, context, undefined, start);
                case 67108877:
                    return parseImportMetaDeclaration(parser, context, start);
                default:
                    parser.report(30, KeywordDescTable[parser.getToken() & 255]);
            }
        }
        if (!sourceParsed)
            source = parseModuleSpecifier(parser, context);
    }
    const attributes = parseImportAttributes(parser, context);
    const node = {
        type: 'ImportDeclaration',
        specifiers,
        source,
        attributes,
        ...(parser.features & 2 || parser.features & 4 ? { phase } : null),
    };
    matchOrInsertSemicolon(parser, context | 32);
    return parser.finishNode(node, start);
}
function parseImportNamespaceSpecifier(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    const { tokenStart } = parser;
    nextToken(parser, context);
    consume(parser, context, 77932);
    if ((parser.getToken() & 134217728) === 134217728) {
        throw new ParseError(tokenStart, parser.currentLocation, 30, KeywordDescTable[parser.getToken() & 255]);
    }
    return parser.finishNode({
        type: 'ImportNamespaceSpecifier',
        local: parseRestrictedIdentifier(parser, context, scope),
    }, tokenStart);
}
function parseModuleSpecifier(/** @type {Parser} */ parser, /** @type {number} */ context) {
    consume(parser, context, 209011);
    if (parser.getToken() !== 134283267)
        parser.report(105, 'Import');
    return parseLiteral(parser, context);
}
/** @returns {any[]} */ function parseImportSpecifierOrNamedImports(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {any[]} */ specifiers) {
    nextToken(parser, context);
    while (parser.getToken() & 143360 || parser.getToken() === 134283267) {
        let { tokenValue, tokenStart, currentLocation } = parser;
        const start = tokenStart;
        const token = parser.getToken();
        const imported = parseModuleExportName(parser, context);
        /** @type {MeriyahNode | undefined} */ let local;
        if (consumeOpt(parser, context, 77932)) {
            if ((parser.getToken() & 134217728) === 134217728 ||
                parser.getToken() === 18) {
                parser.report(106);
            }
            else {
                validateBindingIdentifier(parser, context, 16, parser.getToken(), 0);
            }
            tokenValue = parser.tokenValue;
            tokenStart = parser.tokenStart;
            currentLocation = parser.currentLocation;
            local = parseIdentifier(parser, context);
        }
        else if (imported.type === 'Identifier') {
            validateBindingIdentifier(parser, context, 16, token, 0);
            local = parser.cloneIdentifier(imported);
        }
        else {
            parser.report(25, KeywordDescTable[77932 & 255]);
        }
        scope?.addBlockName(context, tokenValue, 8, tokenStart, currentLocation);
        specifiers.push(parser.finishNode({
            type: 'ImportSpecifier',
            local,
            imported,
        }, start));
        if (parser.getToken() !== 1074790415)
            consume(parser, context, 18);
    }
    consume(parser, context, 1074790415);
    return specifiers;
}
function parseImportMetaDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahLocation} */ start) {
    let expr = parseImportMetaExpression(parser, context, parser.finishNode({
        type: 'Identifier',
        name: 'import',
    }, start), start);
    expr = parseMemberOrUpdateExpression(parser, context, undefined, expr, 0, 0, start);
    expr = parseAssignmentExpression(parser, context, undefined, 0, 0, start, expr);
    if (parser.getToken() === 18) {
        expr = parseSequenceExpression(parser, context, undefined, 0, start, expr);
    }
    return parseExpressionStatement(parser, context, expr, start);
}
function parseImportCallDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahLocation} */ start) {
    let expr = parseImportExpression(parser, context, privateScope, 0, start);
    parser.assignable = 2;
    expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 0, start);
    expr = parseAssignmentExpression(parser, context, privateScope, 0, 0, start, expr);
    if (parser.getToken() === 18) {
        expr = parseSequenceExpression(parser, context, privateScope, 0, start, expr);
    }
    return parseExpressionStatement(parser, context, expr, start);
}
function parseExportDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope) {
    const start = parser.leadingDecorators.decorators.length ? parser.leadingDecorators.start : parser.tokenStart;
    nextToken(parser, context | 32);
    const isDefaultExport = consumeOpt(parser, context | 32, 20561);
    if (parser.leadingDecorators.decorators.length && parser.getToken() !== 86094) {
        parser.report(172);
    }
    const specifiers = [];
    /** @type {MeriyahNode | null} */ let declaration = null;
    /** @type {MeriyahNode | null} */ let source = null;
    let attributes = [];
    if (isDefaultExport) {
        switch (parser.getToken()) {
            case 86104: {
                declaration = parseFunctionDeclaration(parser, context, scope, undefined, 1, 1, 0, parser.tokenStart, 4);
                break;
            }
            case 133:
                if (!(parser.features & 1)) {
                    parser.report(30, '@');
                }
            case 86094:
                declaration = parseClassDeclaration(parser, context, scope, undefined, 1);
                break;
            case 209005: {
                const { tokenStart } = parser;
                declaration = parseIdentifier(parser, context);
                const { flags } = parser;
                if ((flags & 1) === 0 && parser.getToken() === 86104) {
                    declaration = parseFunctionDeclaration(parser, context, scope, undefined, 1, 1, 1, tokenStart, 4);
                    break;
                }
                if (parser.getToken() === 10) {
                    declaration = parseArrowFromIdentifier(parser, context & -9, undefined, 'async', declaration, 0, 1, 0, tokenStart);
                }
                else if ((flags & 1) === 0 && parser.getToken() === 67174411) {
                    declaration = parseAsyncArrowOrCallExpression(parser, context, undefined, declaration, 1, 1, flags, tokenStart);
                    declaration = parseMemberOrUpdateExpression(parser, context, undefined, declaration, 0, 0, tokenStart);
                    declaration = parseAssignmentExpression(parser, context, undefined, 0, 0, tokenStart, declaration);
                }
                else if ((flags & 1) === 0 && parser.getToken() & 143360) {
                    if (scope)
                        scope = createArrowHeadParsingScope(parser, context, parser.tokenValue, parser.tokenStart, parser.currentLocation);
                    declaration = parseIdentifier(parser, context);
                    declaration = parseArrowFunctionExpression(parser, context, scope, undefined, [declaration], 1, tokenStart);
                }
                else {
                    declaration = parseMemberOrUpdateExpression(parser, context, undefined, declaration, 0, 0, tokenStart);
                    declaration = parseAssignmentExpression(parser, context, undefined, 0, 0, tokenStart, declaration);
                }
                matchOrInsertSemicolon(parser, context | 32);
                break;
            }
            default:
                declaration = parseExpression(parser, context, undefined, 1, 0, parser.tokenStart);
                matchOrInsertSemicolon(parser, context | 32);
        }
        if (scope)
            parser.declareUnboundVariable('default');
        return parser.finishNode({
            type: 'ExportDefaultDeclaration',
            declaration,
        }, start);
    }
    switch (parser.getToken()) {
        case 8391476: {
            nextToken(parser, context);
            /** @type {MeriyahNode | null} */ let exported = null;
            const isNamedDeclaration = consumeOpt(parser, context, 77932);
            if (isNamedDeclaration) {
                if (scope)
                    parser.declareUnboundVariable(parser.tokenValue);
                exported = parseModuleExportName(parser, context);
            }
            consume(parser, context, 209011);
            if (parser.getToken() !== 134283267)
                parser.report(105, 'Export');
            source = parseLiteral(parser, context);
            const attributes = parseImportAttributes(parser, context);
            const node = {
                type: 'ExportAllDeclaration',
                source,
                exported,
                attributes,
            };
            matchOrInsertSemicolon(parser, context | 32);
            return parser.finishNode(node, start);
        }
        case 2162700: {
            nextToken(parser, context);
            const tmpExportedNames = [];
            const tmpExportedBindings = [];
            let hasLiteralLocal = 0;
            while (parser.getToken() & 143360 || parser.getToken() === 134283267) {
                const { tokenStart, tokenValue } = parser;
                const local = parseModuleExportName(parser, context);
                if (local.type === 'Literal') {
                    hasLiteralLocal = 1;
                }
                /** @type {MeriyahNode | undefined} */ let exported;
                if (parser.getToken() === 77932) {
                    nextToken(parser, context);
                    if ((parser.getToken() & 143360) === 0 && parser.getToken() !== 134283267) {
                        parser.report(106);
                    }
                    if (scope) {
                        tmpExportedNames.push(parser.tokenValue);
                        tmpExportedBindings.push(tokenValue);
                    }
                    exported = parseModuleExportName(parser, context);
                }
                else {
                    if (scope) {
                        tmpExportedNames.push(parser.tokenValue);
                        tmpExportedBindings.push(parser.tokenValue);
                    }
                    exported = local.type === 'Literal' ? parser.cloneStringLiteral(local) : parser.cloneIdentifier(local);
                }
                specifiers.push(parser.finishNode({
                    type: 'ExportSpecifier',
                    local,
                    exported,
                }, tokenStart));
                if (parser.getToken() !== 1074790415)
                    consume(parser, context, 18);
            }
            consume(parser, context, 1074790415);
            if (consumeOpt(parser, context, 209011)) {
                if (parser.getToken() !== 134283267)
                    parser.report(105, 'Export');
                source = parseLiteral(parser, context);
                attributes = parseImportAttributes(parser, context);
                if (scope) {
                    tmpExportedNames.forEach((n) => parser.declareUnboundVariable(n));
                }
            }
            else {
                if (hasLiteralLocal) {
                    parser.report(174);
                }
                if (scope) {
                    tmpExportedNames.forEach((n) => parser.declareUnboundVariable(n));
                    tmpExportedBindings.forEach((b) => parser.addBindingToExports(b));
                }
            }
            matchOrInsertSemicolon(parser, context | 32);
            break;
        }
        case 133:
            if (!(parser.features & 1)) {
                parser.report(30, '@');
            }
        case 86094:
            declaration = parseClassDeclaration(parser, context, scope, undefined, 2);
            break;
        case 86104:
            declaration = parseFunctionDeclaration(parser, context, scope, undefined, 1, 2, 0, parser.tokenStart, 4);
            break;
        case 241737:
            declaration = parseLexicalDeclaration(parser, context, scope, undefined, 8, 64);
            break;
        case 86090:
            declaration = parseLexicalDeclaration(parser, context, scope, undefined, 16, 64);
            break;
        case 86088:
            declaration = parseVariableStatement(parser, context, scope, undefined, 64);
            break;
        case 209005: {
            const { tokenStart } = parser;
            nextToken(parser, context);
            if ((parser.flags & 1) === 0 && parser.getToken() === 86104) {
                declaration = parseFunctionDeclaration(parser, context, scope, undefined, 1, 2, 1, tokenStart, 4);
                break;
            }
        }
        default:
            parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
    const node = {
        type: 'ExportNamedDeclaration',
        declaration,
        specifiers,
        source,
        attributes: attributes,
    };
    return parser.finishNode(node, start);
}
function parseExpression(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ canAssign, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start, origin = 0) {
    let expr = parsePrimaryExpression(parser, context, privateScope, 2, 0, canAssign, inGroup, 1, start, origin, context & 131072 ? 0 : 1);
    expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, inGroup, 0, start);
    return parseAssignmentExpression(parser, context, privateScope, inGroup, 0, start, expr);
}
function parseSequenceExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start, /** @type {MeriyahNode} */ expr) {
    const expressions = [expr];
    while (consumeOpt(parser, context | 32, 18)) {
        expressions.push(parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart));
    }
    return parser.finishNode({
        type: 'SequenceExpression',
        expressions,
    }, start);
}
function parseExpressions(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ canAssign, /** @type {MeriyahLocation} */ start) {
    const expr = parseExpression(parser, context, privateScope, canAssign, inGroup, start);
    return parser.getToken() === 18
        ? parseSequenceExpression(parser, context, privateScope, inGroup, start, expr)
        : expr;
}
function parseAssignmentExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {MeriyahLocation} */ start, /** @type {MeriyahNode} */ left) {
    const token = parser.getToken();
    if ((token & 4194304) === 4194304) {
        if (parser.assignable & 2)
            parser.report(26);
        if ((token & 524288) === 524288 && parser.assignable & 4)
            parser.report(26);
        if ((!isPattern && token === 1077936155 && left.type === 'ArrayExpression') ||
            left.type === 'ObjectExpression') {
            reinterpretToPattern(parser, left);
        }
        nextToken(parser, context | 32);
        const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
        parser.assignable = 2;
        return parser.finishNode(isPattern
            ? {
                type: 'AssignmentPattern',
                left,
                right,
            }
            : {
                type: 'AssignmentExpression',
                left,
                operator: KeywordDescTable[token & 255],
                right,
            }, start);
    }
    if ((token & 8388608) === 8388608) {
        left = parseBinaryExpression(parser, context, privateScope, inGroup, start, 4, token, left);
    }
    if (consumeOpt(parser, context | 32, 22)) {
        left = parseConditionalExpression(parser, context, privateScope, left, start);
    }
    return left;
}
function parseAssignmentExpressionOrPattern(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {MeriyahLocation} */ start, /** @type {MeriyahNode} */ left) {
    const token = parser.getToken();
    nextToken(parser, context | 32);
    const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
    left = parser.finishNode(isPattern
        ? {
            type: 'AssignmentPattern',
            left,
            right,
        }
        : {
            type: 'AssignmentExpression',
            left,
            operator: KeywordDescTable[token & 255],
            right,
        }, start);
    parser.assignable = 2;
    return left;
}
function parseConditionalExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ test, /** @type {MeriyahLocation} */ start) {
    const consequent = parseExpression(parser, (context | 131072) ^ 131072, privateScope, 1, 0, parser.tokenStart);
    consume(parser, context | 32, 21);
    parser.assignable = 1;
    const alternate = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
    }, start);
}
function parseBinaryExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start, /** @type {number} */ minPrecedence, /** @type {number} */ operator, /** @type {MeriyahNode} */ left) {
    if ((parser.flags & 16384) === 16384) {
        parser.flags = (parser.flags | 16384) ^ 16384;
        return left;
    }
    const bit = -((context & 131072) > 0) & 8673330;
    let t;
    let precedence;
    parser.assignable = 2;
    while (parser.getToken() & 8388608) {
        t = parser.getToken();
        precedence = t & 3840;
        if ((t & 524288 && operator & 268435456) || (operator & 524288 && t & 268435456)) {
            parser.report(167);
        }
        if (precedence + ((t === 8391735) << 8) - ((bit === t) << 12) <= minPrecedence)
            break;
        nextToken(parser, context | 32);
        left = parser.finishNode({
            type: t & 524288 || t & 268435456 ? 'LogicalExpression' : 'BinaryExpression',
            left,
            right: parseBinaryExpression(parser, context, privateScope, inGroup, parser.tokenStart, precedence, t, parseLeftHandSideExpression(parser, context, privateScope, 0, inGroup, 1, (context & 131072) === 0 && (8673330 & 3840) > precedence ? 1 : 0)),
            operator: KeywordDescTable[t & 255],
        }, start);
    }
    if (parser.getToken() === 1077936155)
        parser.report(26);
    return left;
}
function parseUnaryExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ isLHS, /** @type {number} */ inGroup) {
    if (!isLHS)
        parser.report(0);
    const { tokenStart } = parser;
    const unaryOperator = parser.getToken();
    nextToken(parser, context | 32);
    const arg = parseLeftHandSideExpression(parser, context, privateScope, 0, inGroup, 1);
    if (parser.getToken() === 8391735)
        parser.report(33);
    if (context & 1 && unaryOperator === 16863276) {
        if (arg.type === 'Identifier') {
            parser.report(123);
        }
        else if (isPropertyWithPrivateFieldKey(arg)) {
            parser.report(129);
        }
    }
    parser.assignable = 2;
    return parser.finishNode({
        type: 'UnaryExpression',
        operator: KeywordDescTable[unaryOperator & 255],
        argument: arg,
        prefix: true,
    }, tokenStart);
}
function parseAsyncExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ isLHS, /** @type {number} */ canAssign, /** @type {number} */ inNew, /** @type {MeriyahLocation} */ start) {
    const token = parser.getToken();
    const expr = parseIdentifier(parser, context);
    const { flags } = parser;
    if ((flags & 1) === 0) {
        if (parser.getToken() === 86104) {
            return parseFunctionExpression(parser, context, privateScope, 1, inGroup, start);
        }
        if (isValidIdentifier(context, parser.getToken())) {
            if (!isLHS)
                parser.report(0);
            if ((parser.getToken() & 36864) === 36864) {
                parser.flags |= 256;
            }
            return parseAsyncArrowAfterIdent(parser, context, privateScope, canAssign, start);
        }
    }
    if (!inNew && parser.getToken() === 67174411) {
        return parseAsyncArrowOrCallExpression(parser, context, privateScope, expr, canAssign, 1, flags, start);
    }
    if (parser.getToken() === 10) {
        classifyIdentifier(parser, context, token);
        if (inNew)
            parser.report(51);
        if ((token & 36864) === 36864) {
            parser.flags |= 256;
        }
        return parseArrowFromIdentifier(parser, context, privateScope, parser.tokenValue, expr, inNew, canAssign, 0, start);
    }
    parser.assignable = 1;
    return expr;
}
function parseYieldExpressionOrIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ canAssign, /** @type {MeriyahLocation} */ start) {
    if (inGroup) {
        if ((parser.destructible & 256) === 0) {
            parser.firstYieldLocation ??= { start, end: parser.currentLocation };
        }
        parser.destructible |= 256;
    }
    if (context & 1024) {
        nextToken(parser, context | 32);
        if (context & 8192)
            throw new ParseError(start, parser.startPosition, 32);
        if (!canAssign)
            parser.report(26);
        if (parser.getToken() === 22)
            parser.report(126);
        /** @type {MeriyahNode | null} */ let argument = null;
        let delegate = false;
        if ((parser.flags & 1) === 0) {
            delegate = consumeOpt(parser, context | 32, 8391476);
            if (parser.getToken() & (12288 | 65536) || delegate) {
                argument = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
            }
        }
        else if (parser.getToken() === 8391476) {
            parser.report(30, KeywordDescTable[parser.getToken() & 255]);
        }
        if (parser.getToken() & (67108864 | 8388608)) {
            if (argument === null && (parser.flags & 1) === 0) {
                parser.report(30, KeywordDescTable[parser.getToken() & 255]);
            }
            parser.flags |= 16384;
        }
        parser.assignable = 2;
        return parser.finishNode({
            type: 'YieldExpression',
            argument,
            delegate,
        }, start);
    }
    if (context & 1)
        parser.report(97, 'yield');
    return parseIdentifierOrArrow(parser, context, privateScope, 0, canAssign);
}
function parseAwaitExpressionOrIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inNew, /** @type {number} */ inGroup, canAssign, /** @type {MeriyahLocation} */ start) {
    if (inGroup) {
        if ((parser.destructible & 128) === 0) {
            parser.firstAwaitLocation ??= { start, end: parser.currentLocation };
        }
        parser.destructible |= 128;
    }
    if (context & 524288)
        parser.report(179);
    const isEscaped = (parser.getToken() & -2147483648) !== 0;
    const allowRegExp = !isEscaped && context & (2048 | 2) ? 1 : 0;
    const possibleIdentifierOrArrowFunc = parseIdentifierOrArrow(parser, context, privateScope, allowRegExp, canAssign);
    const isIdentifier = isEscaped ||
        possibleIdentifierOrArrowFunc.type === 'ArrowFunctionExpression' ||
        ((parser.getToken() & 65536) === 0 &&
            (parser.getToken() & 36864) !== 36864);
    if (isIdentifier) {
        if (context & 2048)
            throw new ParseError(start, parser.startPosition, 178);
        if (context & 2)
            throw new ParseError(start, parser.startPosition, 112);
        if (context & 8192 && context & 2048)
            throw new ParseError(start, parser.startPosition, 112);
        return possibleIdentifierOrArrowFunc;
    }
    if (context & 8192 &&
        (context & (2048 | 2) || parser.getToken() & 143360)) {
        throw new ParseError(start, parser.startPosition, 31);
    }
    if (context & 2048 || (context & 2 && context & 8)) {
        if (inNew)
            throw new ParseError(start, parser.startPosition, 0);
        const argument = parseLeftHandSideExpression(parser, context, privateScope, 0, 0, 1);
        if (parser.getToken() === 8391735)
            parser.report(33);
        parser.assignable = 2;
        return parser.finishNode({
            type: 'AwaitExpression',
            argument,
        }, start);
    }
    if (context & 2)
        throw new ParseError(start, parser.startPosition, 98);
    return possibleIdentifierOrArrowFunc;
}
function parseFunctionBody(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number | undefined} */ funcNameToken, functionScope, /** @type {number} */ origin = 0) {
    const { tokenStart } = parser;
    parser.flags &= -4161;
    consume(parser, context | 32, 2162700);
    const body = [];
    if (parser.getToken() !== 1074790415) {
        while (parser.getToken() === 134283267) {
            const { index, tokenStart, tokenIndex, tokenValue } = parser;
            const token = parser.getToken();
            const expr = parseLiteral(parser, context);
            if (isValidStrictMode(parser, index, tokenIndex, tokenValue)) {
                context |= 1;
                if (parser.flags & 128) {
                    throw new ParseError(tokenStart, parser.currentLocation, 66);
                }
                if (parser.flags & 64) {
                    throw new ParseError(tokenStart, parser.currentLocation, 9);
                }
                if (parser.flags & 4096) {
                    throw new ParseError(tokenStart, parser.currentLocation, 15);
                }
                functionScope?.reportScopeError();
            }
            body.push(parseDirective(parser, context, expr, token, tokenStart));
        }
        if (context & 1) {
            if (funcNameToken) {
                if ((funcNameToken & 537079808) === 537079808) {
                    parser.report(121);
                }
                if ((funcNameToken & 36864) === 36864) {
                    parser.report(40);
                }
            }
            if (parser.flags & 512)
                parser.report(121);
            if (parser.flags & 256) {
                if (parser.strictReservedRange) {
                    throw new ParseError(parser.strictReservedRange[0], parser.strictReservedRange[1], 120);
                }
                parser.report(120);
            }
        }
    }
    parser.flags =
        (parser.flags | 512 | 256 | 64 | 4096) ^
            (512 | 256 | 64 | 4096);
    parser.destructible = (parser.destructible | 256) ^ 256;
    while (parser.getToken() !== 1074790415) {
        body.push(parseStatementListItem(parser, context, scope, privateScope, {}, 4));
    }
    consume(parser, origin & (16 | 8) ? context | 32 : context, 1074790415);
    parser.flags &= -4289;
    if (parser.getToken() === 1077936155)
        parser.report(26);
    return parser.finishNode({
        type: 'BlockStatement',
        body,
    }, tokenStart);
}
function parseSuperExpression(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenStart } = parser;
    nextToken(parser, context);
    switch (parser.getToken()) {
        case 67108991:
            parser.report(169);
        case 67174411: {
            if ((context & 512) === 0)
                parser.report(28);
            parser.assignable = 2;
            break;
        }
        case 69271571:
        case 67108877: {
            if ((context & 256) === 0)
                parser.report(29);
            parser.assignable = 1;
            break;
        }
        default:
            parser.report(30, 'super');
    }
    return parser.finishNode({ type: 'Super' }, tokenStart);
}
function parseLeftHandSideExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ canAssign, /** @type {number} */ inGroup, /** @type {number} */ isLHS, allowPrivateId = 0) {
    const start = parser.tokenStart;
    const expression = parsePrimaryExpression(parser, context, privateScope, 2, 0, canAssign, inGroup, isLHS, start, 0, allowPrivateId);
    return parseMemberOrUpdateExpression(parser, context, privateScope, expression, inGroup, 0, start);
}
function parseUpdateExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ expr, /** @type {MeriyahLocation} */ start) {
    if (parser.assignable & 2 ||
        expr.type === 'ArrayExpression' ||
        expr.type === 'ObjectExpression') {
        parser.report(55);
    }
    const token = parser.getToken();
    nextToken(parser, context);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'UpdateExpression',
        argument: expr,
        operator: KeywordDescTable[token & 255],
        prefix: false,
    }, start);
}
function parseMemberOrUpdateExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ expr, /** @type {number} */ inGroup, /** @type {number} */ inChain, /** @type {MeriyahLocation} */ start) {
    if ((parser.getToken() & 33619968) === 33619968 && (parser.flags & 1) === 0) {
        expr = parseUpdateExpression(parser, context, expr, start);
    }
    else if ((parser.getToken() & 67108864) === 67108864) {
        if ((parser.flags & 16384) === 16384) {
            parser.flags = (parser.flags | 16384) ^ 16384;
            return expr;
        }
        context = (context | 131072) ^ 131072;
        switch (parser.getToken()) {
            case 67108877: {
                nextToken(parser, (context | 262144 | 8) ^ 8);
                if (context & 16 && parser.getToken() === 131 && parser.tokenValue === 'super') {
                    parser.report(175);
                }
                parser.assignable =
                    (parser.flags & 2048) === 2048
                        ? 2
                        : 1;
                const property = parsePropertyOrPrivatePropertyName(parser, context | 64, privateScope, 1);
                expr = parser.finishNode({
                    type: 'MemberExpression',
                    object: expr,
                    computed: false,
                    property,
                    optional: false,
                }, start);
                break;
            }
            case 69271571: {
                if ((parser.flags & 8192) === 8192) {
                    parser.flags = (parser.flags | 8192) ^ 8192;
                    return expr;
                }
                let restoreHasOptionalChaining = false;
                if ((parser.flags & 2048) === 2048) {
                    restoreHasOptionalChaining = true;
                    parser.flags = (parser.flags | 2048) ^ 2048;
                }
                nextToken(parser, context | 32);
                const { tokenStart } = parser;
                const property = parseExpressions(parser, context, privateScope, inGroup, 1, tokenStart);
                consume(parser, context, 20);
                parser.assignable = restoreHasOptionalChaining ? 2 : 1;
                expr = parser.finishNode({
                    type: 'MemberExpression',
                    object: expr,
                    computed: true,
                    property,
                    optional: false,
                }, start);
                if (restoreHasOptionalChaining) {
                    parser.flags |= 2048;
                }
                break;
            }
            case 67174411: {
                if ((parser.flags & 1024) === 1024) {
                    parser.flags = (parser.flags | 1024) ^ 1024;
                    return expr;
                }
                let restoreHasOptionalChaining = false;
                if ((parser.flags & 2048) === 2048) {
                    restoreHasOptionalChaining = true;
                    parser.flags = (parser.flags | 2048) ^ 2048;
                }
                const args = parseArguments(parser, context, privateScope, inGroup);
                if (!restoreHasOptionalChaining && !(context & 1) && parser.options.webcompat) {
                    parser.assignable = 4;
                }
                else {
                    parser.assignable = 2;
                }
                expr = parser.finishNode({
                    type: 'CallExpression',
                    callee: expr,
                    arguments: args,
                    optional: false,
                }, start);
                if (restoreHasOptionalChaining) {
                    parser.flags |= 2048;
                }
                break;
            }
            case 67108991: {
                nextToken(parser, (context | 262144 | 8) ^ 8);
                parser.flags |= 2048;
                parser.assignable = 2;
                expr = parseOptionalChain(parser, context, privateScope, expr, start);
                break;
            }
            default:
                if ((parser.flags & 2048) === 2048) {
                    parser.report(168);
                }
                parser.assignable = 2;
                expr = parser.finishNode({
                    type: 'TaggedTemplateExpression',
                    tag: expr,
                    quasi: parser.getToken() === 67174408
                        ? parseTemplate(parser, context | 64, privateScope)
                        : parseTemplateLiteral(parser, context),
                }, start);
        }
        expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 1, start);
    }
    if (inChain === 0 && (parser.flags & 2048) === 2048) {
        parser.flags = (parser.flags | 2048) ^ 2048;
        expr = parser.finishNode({
            type: 'ChainExpression',
            expression: expr,
        }, start);
    }
    return expr;
}
function parseOptionalChain(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ expr, /** @type {MeriyahLocation} */ start) {
    let restoreHasOptionalChaining = false;
    /** @type {MeriyahNode | undefined} */ let node;
    if (parser.getToken() === 69271571 || parser.getToken() === 67174411) {
        if ((parser.flags & 2048) === 2048) {
            restoreHasOptionalChaining = true;
            parser.flags = (parser.flags | 2048) ^ 2048;
        }
    }
    if (parser.getToken() === 69271571) {
        nextToken(parser, context | 32);
        const { tokenStart } = parser;
        const property = parseExpressions(parser, context, privateScope, 0, 1, tokenStart);
        consume(parser, context, 20);
        parser.assignable = 2;
        node = parser.finishNode({
            type: 'MemberExpression',
            object: expr,
            computed: true,
            optional: true,
            property,
        }, start);
    }
    else if (parser.getToken() === 67174411) {
        const args = parseArguments(parser, context, privateScope, 0);
        parser.assignable = 2;
        node = parser.finishNode({
            type: 'CallExpression',
            callee: expr,
            arguments: args,
            optional: true,
        }, start);
    }
    else {
        const property = parsePropertyOrPrivatePropertyName(parser, context, privateScope, 1);
        parser.assignable = 2;
        node = parser.finishNode({
            type: 'MemberExpression',
            object: expr,
            computed: false,
            optional: true,
            property,
        }, start);
    }
    if (restoreHasOptionalChaining) {
        parser.flags |= 2048;
    }
    return node;
}
function parsePropertyOrPrivatePropertyName(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, allowPrivateId = 0) {
    if ((parser.getToken() & 143360) === 0 &&
        parser.getToken() !== -2147483527 &&
        parser.getToken() !== -2147483526 &&
        (parser.getToken() !== 131 || !allowPrivateId)) {
        parser.report(162);
    }
    return parser.getToken() === 131
        ? parsePrivateIdentifier(parser, context, privateScope, 0)
        : parseIdentifier(parser, context);
}
function parseUpdateExpressionPrefixed(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inNew, /** @type {number} */ isLHS, /** @type {MeriyahLocation} */ start) {
    if (inNew)
        parser.report(56);
    if (!isLHS)
        parser.report(0);
    const token = parser.getToken();
    nextToken(parser, context | 32);
    const arg = parseLeftHandSideExpression(parser, context, privateScope, 0, 0, 1);
    if (parser.assignable & 2) {
        parser.report(55);
    }
    parser.assignable = 2;
    return parser.finishNode({
        type: 'UpdateExpression',
        argument: arg,
        operator: KeywordDescTable[token & 255],
        prefix: true,
    }, start);
}
function parsePrimaryExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ inNew, /** @type {number} */ canAssign, /** @type {number} */ inGroup, /** @type {number} */ isLHS, /** @type {MeriyahLocation} */ start, origin = 0, allowPrivateId = 0) {
    if ((parser.getToken() & 143360) === 143360) {
        switch (parser.getToken()) {
            case 209006:
            case 209006 | -2147483648:
                return parseAwaitExpressionOrIdentifier(parser, context, privateScope, inNew, inGroup, canAssign, start);
            case 241771:
                return parseYieldExpressionOrIdentifier(parser, context, privateScope, inGroup, canAssign, start);
            case 209005:
                return parseAsyncExpression(parser, context, privateScope, inGroup, isLHS, canAssign, inNew, start);
        }
        const { tokenValue } = parser;
        const token = parser.getToken();
        const expr = parseIdentifier(parser, context | 64);
        if (parser.getToken() === 10) {
            if (!isLHS)
                parser.report(0);
            classifyIdentifier(parser, context, token);
            if ((token & 36864) === 36864) {
                parser.flags |= 256;
            }
            return parseArrowFromIdentifier(parser, context, privateScope, tokenValue, expr, inNew, canAssign, 0, start, origin);
        }
        if (context & 16 &&
            !(context & 32768) &&
            !(context & 8192) &&
            parser.tokenValue === 'arguments' &&
            !(origin & 1 && parser.getToken() === 21))
            throw new ParseError(start, parser.startPosition, 132);
        if ((token & 255) === (241737 & 255)) {
            if (context & 1)
                parser.report(115);
            if (kind & (8 | 16))
                parser.report(100);
        }
        parser.assignable =
            context & 1 && (token & 537079808) === 537079808
                ? 2
                : 1;
        return expr;
    }
    if ((parser.getToken() & 134217728) === 134217728) {
        return parseLiteral(parser, context);
    }
    switch (parser.getToken()) {
        case 33619993:
        case 33619994:
            return parseUpdateExpressionPrefixed(parser, context, privateScope, inNew, isLHS, start);
        case 16863276:
        case 16842798:
        case 16842799:
        case 25233968:
        case 25233969:
        case 16863275:
        case 16863277:
            return parseUnaryExpression(parser, context, privateScope, isLHS, inGroup);
        case 86104:
            return parseFunctionExpression(parser, context, privateScope, 0, inGroup, start);
        case 2162700:
            return parseObjectLiteral(parser, context, privateScope, canAssign ? 0 : 1, inGroup);
        case 69271571:
            return parseArrayLiteral(parser, context, privateScope, canAssign ? 0 : 1, inGroup);
        case 67174411:
            return parseParenthesizedExpression(parser, context, privateScope, canAssign, 1, start, origin);
        case 86021:
        case 86022:
        case 86023:
            return parseNullOrTrueOrFalseLiteral(parser, context);
        case 86111:
            return parseThisExpression(parser, context);
        case 65540:
            return parseRegExpLiteral(parser, context);
        case 133:
            if (!(parser.features & 1)) {
                parser.report(30, '@');
            }
        case 86094:
            return parseClassExpression(parser, context, privateScope, inGroup, start);
        case 86109:
            return parseSuperExpression(parser, context);
        case 67174409:
            return parseTemplateLiteral(parser, context);
        case 67174408:
            return parseTemplate(parser, context, privateScope);
        case 86107:
            return parseNewExpression(parser, context, privateScope, inGroup);
        case 134283389:
            return parseBigIntLiteral(parser, context);
        case 131: {
            if (!allowPrivateId)
                parser.report(30, 'PrivateField');
            const { tokenStart } = parser;
            const expression = parsePrivateIdentifier(parser, context, privateScope, 0);
            if (parser.getToken() !== 8673330) {
                throw new ParseError(tokenStart, parser.startPosition, 151);
            }
            return expression;
        }
        case 86106:
            return parseImportCallOrMetaExpression(parser, context, privateScope, inNew, inGroup, start);
        case 8456256:
            if (parser.options.jsx)
                return parseJSXRootElementOrFragment(parser, context, privateScope, 0, parser.tokenStart);
        default:
            if (isValidIdentifier(context, parser.getToken())) {
                return parseIdentifierOrArrow(parser, context, privateScope, 0, canAssign);
            }
            parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
}
function parseImportCallOrMetaExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inNew, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    let expr = parseIdentifier(parser, context);
    if (parser.getToken() === 67108877) {
        return parseImportMetaExpression(parser, context, expr, start, privateScope, inGroup, inNew);
    }
    if (inNew)
        parser.report(144);
    expr = parseImportExpression(parser, context, privateScope, inGroup, start);
    parser.assignable = 2;
    return parseMemberOrUpdateExpression(parser, context, privateScope, expr, inGroup, 0, start);
}
function parseImportMetaExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ meta, /** @type {MeriyahLocation} */ start, privateScope, inGroup = 0, inNew = 0) {
    const propertyStart = parser.tokenStart;
    const propertyEnd = parser.currentLocation;
    nextToken(parser, context);
    const token = parser.getToken();
    const isPhaseDefer = parser.features & 2 && (token & -2147483648) === 0 && parser.tokenValue === 'defer';
    const isPhaseSource = parser.features & 4 && (token & -2147483648) === 0 && parser.tokenValue === 'source';
    if (isPhaseDefer || isPhaseSource) {
        if (inNew)
            parser.report(144);
        nextToken(parser, context);
        const expression = parseImportExpression(parser, context, privateScope, inGroup, start, parser.tokenValue);
        parser.assignable = 2;
        return expression;
    }
    if ((context & 2) === 0) {
        throw new ParseError(propertyStart, propertyEnd, 171);
    }
    if (token !== 209031 && parser.tokenValue !== 'meta') {
        parser.report(176);
    }
    else if (token & -2147483648) {
        parser.report(177);
    }
    parser.assignable = 2;
    return parser.finishNode({
        type: 'MetaProperty',
        meta,
        property: parseIdentifier(parser, context),
    }, start);
}
function parseImportExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start, phase = null) {
    consume(parser, context | 32, 67174411);
    if (parser.getToken() === 14)
        parser.report(145);
    const source = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
    /** @type {MeriyahNode | null} */ let options = null;
    if (parser.getToken() === 18) {
        consume(parser, context, 18);
        if (parser.getToken() !== 16) {
            const expContext = (context | 131072) ^ 131072;
            options = parseExpression(parser, expContext, privateScope, 1, inGroup, parser.tokenStart);
        }
        consumeOpt(parser, context, 18);
    }
    const node = {
        type: 'ImportExpression',
        source,
        options,
        ...(parser.features & 2 || parser.features & 4 ? { phase } : null),
    };
    consume(parser, context, 16);
    return parser.finishNode(node, start);
}
/** @returns {any[]} */ function parseImportAttributes(/** @type {Parser | undefined} */ parser, /** @type {number} */ context) {
    if (!consumeOpt(parser, context, 20579))
        return [];
    consume(parser, context, 2162700);
    const attributes = [];
    const keysContent = new Set();
    while (parser.getToken() !== 1074790415) {
        const start = parser.tokenStart;
        const key = parseIdentifierOrStringLiteral(parser, context);
        consume(parser, context, 21);
        const value = parseStringLiteral(parser, context);
        const keyContent = key.type === 'Literal' ? key.value : key.name;
        if (keysContent.has(keyContent)) {
            parser.report(147, keyContent);
        }
        keysContent.add(keyContent);
        attributes.push(parser.finishNode({
            type: 'ImportAttribute',
            key,
            value,
        }, start));
        if (parser.getToken() !== 1074790415) {
            consume(parser, context, 18);
        }
    }
    consume(parser, context, 1074790415);
    return attributes;
}
function parseStringLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    if (parser.getToken() === 134283267) {
        return parseLiteral(parser, context);
    }
    else {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
}
function parseIdentifierOrStringLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    if (parser.getToken() === 134283267) {
        return parseLiteral(parser, context);
    }
    else if (parser.getToken() & 143360) {
        return parseIdentifier(parser, context);
    }
    else {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
}
function parseModuleExportName(/** @type {Parser | undefined} */ parser, /** @type {number} */ context) {
    if (parser.getToken() === 134283267) {
        const value = parser.tokenValue;
        if (!value.isWellFormed()) {
            parser.report(173);
        }
        return parseLiteral(parser, context);
    }
    else if (parser.getToken() & 143360) {
        return parseIdentifier(parser, context);
    }
    else {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
}
function parseBigIntLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenRaw, tokenValue, tokenStart } = parser;
    nextToken(parser, context);
    parser.assignable = 2;
    const node = {
        type: 'Literal',
        value: tokenValue,
        bigint: String(tokenValue),
    };
    if (parser.options.raw) {
        node.raw = tokenRaw;
    }
    return parser.finishNode(node, tokenStart);
}
function parseTemplateLiteral(/** @type {Parser | undefined} */ parser, /** @type {number} */ context) {
    parser.assignable = 2;
    const { tokenValue, tokenRaw, tokenStart } = parser;
    consume(parser, context, 67174409);
    const quasis = [parseTemplateElement(parser, tokenValue, tokenRaw, tokenStart, true)];
    return parser.finishNode({
        type: 'TemplateLiteral',
        expressions: [],
        quasis,
    }, tokenStart);
}
function parseTemplate(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    context = (context | 131072) ^ 131072;
    const { tokenValue, tokenRaw, tokenStart } = parser;
    consume(parser, (context & -65) | 32, 67174408);
    const quasis = [parseTemplateElement(parser, tokenValue, tokenRaw, tokenStart, false)];
    const expressions = [
        parseExpressions(parser, context & -65, privateScope, 0, 1, parser.tokenStart),
    ];
    if (parser.getToken() !== 1074790415)
        parser.report(83);
    while (parser.setToken(scanTemplateTail(parser, context), true) !== 67174409) {
        const { tokenValue, tokenRaw, tokenStart } = parser;
        consume(parser, (context & -65) | 32, 67174408);
        quasis.push(parseTemplateElement(parser, tokenValue, tokenRaw, tokenStart, false));
        expressions.push(parseExpressions(parser, context, privateScope, 0, 1, parser.tokenStart));
        if (parser.getToken() !== 1074790415)
            parser.report(83);
    }
    {
        const { tokenValue, tokenRaw, tokenStart } = parser;
        consume(parser, context, 67174409);
        quasis.push(parseTemplateElement(parser, tokenValue, tokenRaw, tokenStart, true));
    }
    parser.assignable = 2;
    return parser.finishNode({
        type: 'TemplateLiteral',
        expressions,
        quasis,
    }, tokenStart);
}
function parseTemplateElement(/** @type {Parser} */ parser, /** @type {string | undefined | null} */ cooked, /** @type {string | undefined} */ raw, /** @type {MeriyahLocation} */ start, /** @type {boolean} */ tail) {
    const node = parser.finishNode({
        type: 'TemplateElement',
        value: {
            cooked,
            raw,
        },
        tail,
    }, start);
    const tailSize = tail ? 1 : 2;
    const { ranges } = parser.options;
    if (ranges) {
        if (ranges.start)
            node.start += 1;
        if (ranges.end)
            node.end -= tailSize;
        if (ranges.range) {
            node.range[0] += 1;
            node.range[1] -= tailSize;
        }
    }
    if (parser.options.loc) {
        node.loc.start.column += 1;
        node.loc.end.column -= tailSize;
    }
    return node;
}
function parseSpreadElement(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const start = parser.tokenStart;
    context = (context | 131072) ^ 131072;
    consume(parser, context | 32, 14);
    const argument = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
    parser.assignable = 1;
    return parser.finishNode({
        type: 'SpreadElement',
        argument,
    }, start);
}
/** @returns {any[]} */ function parseArguments(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup) {
    nextToken(parser, context | 32);
    const args = [];
    if (parser.getToken() === 16) {
        nextToken(parser, context | 64);
        return args;
    }
    while (parser.getToken() !== 16) {
        if (parser.getToken() === 14) {
            args.push(parseSpreadElement(parser, context, privateScope));
        }
        else {
            args.push(parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart));
        }
        if (parser.getToken() !== 18)
            break;
        nextToken(parser, context | 32);
        if (parser.getToken() === 16)
            break;
    }
    consume(parser, context | 64, 16);
    return args;
}
function parseIdentifier(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, allowRegExp = 0) {
    const { tokenValue, tokenStart } = parser;
    nextToken(parser, context | (allowRegExp ? 32 : 0));
    return parser.finishNode({
        type: 'Identifier',
        name: tokenValue,
    }, tokenStart);
}
function parseLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenValue, tokenRaw, tokenStart } = parser;
    if (parser.getToken() === 134283389) {
        return parseBigIntLiteral(parser, context);
    }
    const node = {
        type: 'Literal',
        value: tokenValue,
    };
    if (parser.options.raw) {
        node.raw = tokenRaw;
    }
    nextToken(parser, context);
    parser.assignable = 2;
    return parser.finishNode(node, tokenStart);
}
function parseNullOrTrueOrFalseLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const start = parser.tokenStart;
    const raw = KeywordDescTable[parser.getToken() & 255];
    const value = parser.getToken() === 86023 ? null : raw === 'true';
    const node = {
        type: 'Literal',
        value,
    };
    if (parser.options.raw) {
        node.raw = raw;
    }
    nextToken(parser, context);
    parser.assignable = 2;
    return parser.finishNode(node, start);
}
function parseThisExpression(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenStart } = parser;
    nextToken(parser, context);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'ThisExpression',
    }, tokenStart);
}
function parseFunctionDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ allowGen, /** @type {number} */ flags, /** @type {number} */ isAsync, /** @type {MeriyahLocation} */ start, /** @type {number} */ origin = 0) {
    nextToken(parser, context | 32);
    const isGenerator = allowGen ? optionalBit(parser, context, 8391476) : 0;
    /** @type {MeriyahNode | null} */ let id = null;
    let funcNameToken;
    let functionScope = scope ? parser.createScope() : void 0;
    if (parser.getToken() === 67174411) {
        if ((flags & 1) === 0)
            parser.report(39, 'Function');
    }
    else {
        const kind = origin & 4 && ((context & 8) === 0 || (context & 2) === 0)
            ? 4
            : 64 | (isAsync ? 1024 : 0) | (isGenerator ? 1024 : 0);
        validateFunctionName(parser, context, parser.getToken());
        if (scope) {
            scope.addVarOrBlock(context, parser.tokenValue, kind, parser.tokenStart, parser.currentLocation, origin);
            functionScope = functionScope?.createChildScope(128);
            if (flags) {
                if (flags & 2) {
                    parser.declareUnboundVariable(parser.tokenValue);
                }
            }
        }
        funcNameToken = parser.getToken();
        if (parser.getToken() & 143360) {
            id = parseIdentifier(parser, context);
        }
        else {
            parser.report(30, KeywordDescTable[parser.getToken() & 255]);
        }
    }
    {
        const modifierFlags = 256 |
            512 |
            1024 |
            2048 |
            8192 |
            16384;
        context =
            ((context | modifierFlags) ^ modifierFlags) |
                65536 |
                (isAsync ? 2048 : 0) |
                (isGenerator ? 1024 : 0) |
                (isGenerator ? 0 : 262144);
    }
    functionScope = functionScope?.createChildScope(256);
    const params = parseFormalParametersOrFormalList(parser, (context | 8192) & -524289, functionScope, privateScope, 0, 1);
    const modifierFlags = 8 | 4 | 128 | 524288;
    const body = parseFunctionBody(parser, ((context | modifierFlags) ^ modifierFlags) | 32768 | 4096, functionScope?.createChildScope(64), privateScope, funcNameToken, functionScope, 8);
    return parser.finishNode({
        type: 'FunctionDeclaration',
        id,
        params,
        body,
        async: isAsync === 1,
        generator: isGenerator === 1,
    }, start);
}
function parseFunctionExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ isAsync, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    nextToken(parser, context | 32);
    const isGenerator = optionalBit(parser, context, 8391476);
    const generatorAndAsyncFlags = (isAsync ? 2048 : 0) | (isGenerator ? 1024 : 0);
    /** @type {MeriyahNode | null} */ let id = null;
    let funcNameToken;
    let scope = parser.createScopeIfLexical();
    const modifierFlags = 256 |
        512 |
        1024 |
        2048 |
        8192 |
        16384 |
        524288;
    if (parser.getToken() & 143360) {
        validateFunctionName(parser, ((context | modifierFlags) ^ modifierFlags) | generatorAndAsyncFlags, parser.getToken());
        scope = scope?.createChildScope(128);
        funcNameToken = parser.getToken();
        id = parseIdentifier(parser, context);
    }
    context =
        ((context | modifierFlags) ^ modifierFlags) |
            65536 |
            generatorAndAsyncFlags |
            (isGenerator ? 0 : 262144);
    scope = scope?.createChildScope(256);
    const params = parseFormalParametersOrFormalList(parser, (context | 8192) & -524289, scope, privateScope, inGroup, 1);
    const body = parseFunctionBody(parser, (context & -131229) |
        32768 |
        4096, scope?.createChildScope(64), privateScope, funcNameToken, scope);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'FunctionExpression',
        id,
        params,
        body,
        async: isAsync === 1,
        generator: isGenerator === 1,
    }, start);
}
function parseArrayLiteral(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ skipInitializer, /** @type {number} */ inGroup) {
    const expr = parseArrayExpressionOrPattern(parser, context, void 0, privateScope, skipInitializer, inGroup, 0, 2);
    if (parser.destructible & 64) {
        parser.report(63);
    }
    if (parser.destructible & 8) {
        parser.report(62);
    }
    if (expr.type === 'ArrayExpression')
        parser.assignable = 2;
    return expr;
}
function parseArrayExpressionOrPattern(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ skipInitializer, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {number} */ kind, /** @type {number} */ origin = 0) {
    const { tokenStart: start } = parser;
    nextToken(parser, context | 32);
    const elements = [];
    let destructible = 0;
    context = (context | 131072) ^ 131072;
    while (parser.getToken() !== 20) {
        if (consumeOpt(parser, context | 32, 18)) {
            elements.push(null);
        }
        else {
            /** @type {MeriyahNode | undefined} */ let left;
            const { tokenStart, tokenValue, currentLocation } = parser;
            const token = parser.getToken();
            if (token & 143360) {
                left = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, inGroup, 1, tokenStart);
                if (parser.getToken() === 1077936155) {
                    if (parser.assignable & 2)
                        parser.report(26);
                    nextToken(parser, context | 32);
                    scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
                    const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
                    left = parser.finishNode(isPattern
                        ? {
                            type: 'AssignmentPattern',
                            left,
                            right,
                        }
                        : {
                            type: 'AssignmentExpression',
                            operator: '=',
                            left,
                            right,
                        }, tokenStart);
                    destructible |=
                        (parser.destructible & 256 ? 256 : 0) |
                            (parser.destructible & 128 ? 128 : 0);
                }
                else if (parser.getToken() === 18 || parser.getToken() === 20) {
                    if (parser.assignable & 2) {
                        destructible |= 16;
                    }
                    else {
                        scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
                    }
                    destructible |=
                        (parser.destructible & 256 ? 256 : 0) |
                            (parser.destructible & 128 ? 128 : 0);
                }
                else {
                    destructible |=
                        kind & 1
                            ? 32
                            : (kind & 2) === 0
                                ? 16
                                : 0;
                    left = parseMemberOrUpdateExpression(parser, context, privateScope, left, inGroup, 0, tokenStart);
                    if (parser.getToken() !== 18 && parser.getToken() !== 20) {
                        if (parser.getToken() !== 1077936155)
                            destructible |= 16;
                        left = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, left);
                    }
                    else if (parser.getToken() !== 1077936155) {
                        destructible |=
                            parser.assignable & 1
                                ? 32
                                : 16;
                    }
                }
            }
            else if (token & 2097152) {
                left =
                    parser.getToken() === 2162700
                        ? parseObjectLiteralOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin)
                        : parseArrayExpressionOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin);
                destructible |= parser.destructible;
                parser.assignable =
                    parser.destructible & 16
                        ? 2
                        : 1;
                if (parser.getToken() === 18 || parser.getToken() === 20) {
                    if (parser.assignable & 2) {
                        destructible |= 16;
                    }
                }
                else if (parser.destructible & 8) {
                    parser.report(71);
                }
                else {
                    left = parseMemberOrUpdateExpression(parser, context, privateScope, left, inGroup, 0, tokenStart);
                    destructible = parser.assignable & 2 ? 16 : 0;
                    if (parser.getToken() !== 18 && parser.getToken() !== 20) {
                        left = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, left);
                    }
                    else if (parser.getToken() !== 1077936155) {
                        destructible |=
                            parser.assignable & 1
                                ? 32
                                : 16;
                    }
                }
            }
            else if (token === 14) {
                left = parseSpreadOrRestElement(parser, context, scope, privateScope, 20, kind, 0, inGroup, isPattern, origin);
                destructible |= parser.destructible;
                if (parser.getToken() !== 18 && parser.getToken() !== 20)
                    parser.report(30, KeywordDescTable[parser.getToken() & 255]);
            }
            else {
                left = parseLeftHandSideExpression(parser, context, privateScope, 1, 0, 1, context & 131072 ? 0 : 1);
                if (parser.getToken() !== 18 && parser.getToken() !== 20) {
                    if (parser.getToken() !== 1077936155)
                        destructible |= 16;
                    left = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, left);
                    if ((kind & (2 | 1)) === 0 && token === 67174411)
                        destructible |= 16;
                }
                else if (parser.assignable & 2) {
                    destructible |= 16;
                }
                else if (token === 67174411) {
                    destructible |=
                        parser.assignable & 1 && kind & (2 | 1)
                            ? 32
                            : 16;
                }
            }
            elements.push(left);
            if (consumeOpt(parser, context | 32, 18)) {
                if (parser.getToken() === 20)
                    break;
            }
            else
                break;
        }
    }
    consume(parser, context, 20);
    const node = parser.finishNode({
        type: isPattern ? 'ArrayPattern' : 'ArrayExpression',
        elements,
    }, start);
    if (!skipInitializer && parser.getToken() & 4194304) {
        return parseArrayOrObjectAssignmentPattern(parser, context, privateScope, destructible, inGroup, isPattern, start, node);
    }
    parser.destructible = destructible;
    return node;
}
function parseArrayOrObjectAssignmentPattern(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ destructible, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {MeriyahLocation} */ start, /** @type {MeriyahNode} */ node) {
    if (parser.getToken() !== 1077936155)
        parser.report(26);
    nextToken(parser, context | 32);
    if (destructible & 16)
        parser.report(26);
    if (!isPattern)
        reinterpretToPattern(parser, node);
    const { tokenStart } = parser;
    const right = parseExpression(parser, context, privateScope, 1, inGroup, tokenStart);
    parser.destructible =
        ((destructible | 64 | 8) ^
            (8 | 64)) |
            (parser.destructible & 128 ? 128 : 0) |
            (parser.destructible & 256 ? 256 : 0);
    return parser.finishNode(isPattern
        ? {
            type: 'AssignmentPattern',
            left: node,
            right,
        }
        : {
            type: 'AssignmentExpression',
            left: node,
            operator: '=',
            right,
        }, start);
}
function parseSpreadOrRestElement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ closingToken, /** @type {number} */ kind, /** @type {number} */ isAsync, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {number} */ origin = 0) {
    const { tokenStart: start } = parser;
    nextToken(parser, context | 32);
    /** @type {MeriyahNode | null} */ let argument = null;
    let destructible = 0;
    const { tokenValue, tokenStart, currentLocation } = parser;
    let token = parser.getToken();
    if (token & 143360) {
        parser.assignable = 1;
        argument = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, inGroup, 1, tokenStart);
        token = parser.getToken();
        argument = parseMemberOrUpdateExpression(parser, context, privateScope, argument, inGroup, 0, tokenStart);
        if (parser.getToken() !== 18 && parser.getToken() !== closingToken) {
            if (parser.assignable & 2 && parser.getToken() === 1077936155)
                parser.report(71);
            destructible |= 16;
            argument = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, argument);
        }
        if (parser.assignable & 2) {
            destructible |= 16;
        }
        else if (token === closingToken || token === 18) {
            scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
        }
        else {
            destructible |= 32;
        }
        destructible |= parser.destructible & 128 ? 128 : 0;
    }
    else if (token === closingToken) {
        parser.report(41);
    }
    else if (token & 2097152) {
        argument = (parser.getToken() === 2162700
            ? parseObjectLiteralOrPattern(parser, context, scope, privateScope, 1, inGroup, isPattern, kind, origin)
            : parseArrayExpressionOrPattern(parser, context, scope, privateScope, 1, inGroup, isPattern, kind, origin));
        token = parser.getToken();
        if (token !== 1077936155 && token !== closingToken && token !== 18) {
            if (parser.destructible & 8)
                parser.report(71);
            argument = parseMemberOrUpdateExpression(parser, context, privateScope, argument, inGroup, 0, tokenStart);
            destructible |= parser.assignable & 1 ? 0 : 16;
            if ((parser.getToken() & 4194304) === 4194304) {
                if (parser.getToken() !== 1077936155)
                    destructible |= 16;
                argument = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, argument);
            }
            else {
                if ((parser.getToken() & 8388608) === 8388608) {
                    argument = parseBinaryExpression(parser, context, privateScope, 1, tokenStart, 4, token, argument);
                }
                if (consumeOpt(parser, context | 32, 22)) {
                    argument = parseConditionalExpression(parser, context, privateScope, argument, tokenStart);
                }
                destructible |=
                    parser.assignable & 1
                        ? 32
                        : 16;
            }
        }
        else {
            destructible |=
                closingToken === 1074790415 && token !== 1077936155
                    ? 16
                    : parser.destructible;
        }
    }
    else {
        destructible |= 32;
        argument = parseLeftHandSideExpression(parser, context, privateScope, 1, inGroup, 1, context & 131072 ? 0 : 1);
        const token = parser.getToken();
        if (token === 1077936155) {
            if (parser.assignable & 2)
                parser.report(26);
            argument = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, argument);
            destructible |= 16;
        }
        else {
            if (token === 18) {
                destructible |= 16;
            }
            else if (token !== closingToken) {
                argument = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, argument);
            }
            destructible |=
                parser.assignable & 1
                    ? 32
                    : 16;
        }
        parser.destructible = destructible;
        if (parser.getToken() !== closingToken && parser.getToken() !== 18)
            parser.report(163);
        return parser.finishNode({
            type: isPattern ? 'RestElement' : 'SpreadElement',
            argument: argument,
        }, start);
    }
    if (parser.getToken() !== closingToken) {
        if (kind & 1)
            destructible |= isAsync ? 16 : 32;
        if (consumeOpt(parser, context | 32, 1077936155)) {
            if (destructible & 16)
                parser.report(26);
            reinterpretToPattern(parser, argument);
            const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
            argument = parser.finishNode(isPattern
                ? {
                    type: 'AssignmentPattern',
                    left: argument,
                    right,
                }
                : {
                    type: 'AssignmentExpression',
                    left: argument,
                    operator: '=',
                    right,
                }, tokenStart);
            destructible = 16;
        }
        else {
            destructible |= 16;
        }
    }
    parser.destructible = destructible;
    return parser.finishNode({
        type: isPattern ? 'RestElement' : 'SpreadElement',
        argument: argument,
    }, start);
}
function parseMethodDefinition(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    const modifierFlags = 1024 |
        2048 |
        8192 |
        ((kind & 64) === 0 ? 512 | 16384 : 0);
    context =
        ((context | modifierFlags) ^ modifierFlags) |
            (kind & 8 ? 1024 : 0) |
            (kind & 16 ? 2048 : 0) |
            (kind & 64 ? 16384 : 0) |
            256 |
            32768 |
            65536;
    let scope = parser.createScopeIfLexical(256);
    const params = parseMethodFormals(parser, (context | 8192) & -524289, scope, privateScope, kind, 1, inGroup);
    scope = scope?.createChildScope(64);
    const body = parseFunctionBody(parser, (context &
        -655501) |
        32768 |
        4096, scope, privateScope, void 0, scope?.parent);
    return parser.finishNode({
        type: 'FunctionExpression',
        params,
        body,
        async: (kind & 16) > 0,
        generator: (kind & 8) > 0,
        id: null,
    }, start);
}
function parseObjectLiteral(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ skipInitializer, /** @type {number} */ inGroup) {
    const expr = parseObjectLiteralOrPattern(parser, context, void 0, privateScope, skipInitializer, inGroup, 0, 2);
    if (parser.destructible & 64) {
        parser.report(63);
    }
    if (parser.destructible & 8) {
        parser.report(62);
    }
    if (expr.type === 'ObjectExpression')
        parser.assignable = 2;
    return expr;
}
function parseObjectLiteralOrPattern(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ skipInitializer, /** @type {number} */ inGroup, /** @type {number} */ isPattern, /** @type {number} */ kind, /** @type {number} */ origin = 0) {
    const { tokenStart: start } = parser;
    nextToken(parser, context);
    const properties = [];
    let destructible = 0;
    let prototypeCount = 0;
    context = (context | 131072) ^ 131072;
    while (parser.getToken() !== 1074790415) {
        const { tokenValue, tokenStart, currentLocation } = parser;
        const token = parser.getToken();
        if (token === 14) {
            properties.push(parseSpreadOrRestElement(parser, context, scope, privateScope, 1074790415, kind, 0, inGroup, isPattern, origin));
        }
        else {
            let state = 0;
            /** @type {MeriyahNode | null} */ let key = null;
            /** @type {MeriyahNode | undefined} */ let value;
            if (parser.getToken() & 143360 ||
                parser.getToken() === -2147483527 ||
                parser.getToken() === -2147483526) {
                if (parser.getToken() === -2147483526)
                    destructible |= 16;
                key = parseIdentifier(parser, context);
                if (parser.getToken() === 18 ||
                    parser.getToken() === 1074790415 ||
                    parser.getToken() === 1077936155) {
                    state |= 4;
                    if (context & 16 &&
                        !(context & 32768) &&
                        !(context & 8192) &&
                        tokenValue === 'arguments')
                        throw new ParseError(tokenStart, currentLocation, 132);
                    if (context & 1 && (token & 537079808) === 537079808) {
                        destructible |= 16;
                    }
                    else {
                        validateBindingIdentifier(parser, context, kind, token, 0);
                    }
                    scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
                    if (consumeOpt(parser, context | 32, 1077936155)) {
                        destructible |= 8;
                        const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
                        destructible |=
                            (parser.destructible & 256 ? 256 : 0) |
                                (parser.destructible & 128 ? 128 : 0);
                        value = parser.finishNode({
                            type: 'AssignmentPattern',
                            left: parser.cloneIdentifier(key),
                            right,
                        }, tokenStart);
                    }
                    else {
                        destructible |=
                            ((token & 255) === (209006 & 255) ? 128 : 0) |
                                (token === -2147483527 ? 16 : 0);
                        value = parser.cloneIdentifier(key);
                    }
                }
                else if (consumeOpt(parser, context | 32, 21)) {
                    const { tokenStart, currentLocation } = parser;
                    if (tokenValue === '__proto__')
                        prototypeCount++;
                    if (parser.getToken() & 143360) {
                        const tokenAfterColon = parser.getToken();
                        const valueAfterColon = parser.tokenValue;
                        value = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, inGroup, 1, tokenStart);
                        const token = parser.getToken();
                        value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (token === 1077936155 || token === 1074790415 || token === 18) {
                                destructible |= parser.destructible & 128 ? 128 : 0;
                                if (parser.assignable & 2) {
                                    destructible |= 16;
                                }
                                else if ((tokenAfterColon & 143360) === 143360) {
                                    scope?.addVarOrBlock(context, valueAfterColon, kind, tokenStart, currentLocation, origin);
                                }
                            }
                            else {
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                        else if ((parser.getToken() & 4194304) === 4194304) {
                            if (parser.assignable & 2) {
                                destructible |= 16;
                            }
                            else if (token !== 1077936155) {
                                destructible |= 32;
                            }
                            else {
                                scope?.addVarOrBlock(context, valueAfterColon, kind, tokenStart, currentLocation, origin);
                            }
                            value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                        }
                        else {
                            destructible |= 16;
                            if ((parser.getToken() & 8388608) === 8388608) {
                                value = parseBinaryExpression(parser, context, privateScope, 1, tokenStart, 4, token, value);
                            }
                            if (consumeOpt(parser, context | 32, 22)) {
                                value = parseConditionalExpression(parser, context, privateScope, value, tokenStart);
                            }
                        }
                    }
                    else if ((parser.getToken() & 2097152) === 2097152) {
                        value =
                            parser.getToken() === 69271571
                                ? parseArrayExpressionOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin)
                                : parseObjectLiteralOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin);
                        destructible = parser.destructible;
                        parser.assignable =
                            destructible & 16
                                ? 2
                                : 1;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2)
                                destructible |= 16;
                        }
                        else if (parser.destructible & 8) {
                            parser.report(71);
                        }
                        else {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible = parser.assignable & 2 ? 16 : 0;
                            if ((parser.getToken() & 4194304) === 4194304) {
                                value = parseAssignmentExpressionOrPattern(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                            else {
                                if ((parser.getToken() & 8388608) === 8388608) {
                                    value = parseBinaryExpression(parser, context, privateScope, 1, tokenStart, 4, token, value);
                                }
                                if (consumeOpt(parser, context | 32, 22)) {
                                    value = parseConditionalExpression(parser, context, privateScope, value, tokenStart);
                                }
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                    }
                    else {
                        value = parseLeftHandSideExpression(parser, context, privateScope, 1, inGroup, 1, context & 131072 ? 0 : 1);
                        destructible |=
                            parser.assignable & 1
                                ? 32
                                : 16;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2)
                                destructible |= 16;
                        }
                        else {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible = parser.assignable & 2 ? 16 : 0;
                            if (parser.getToken() !== 18 && token !== 1074790415) {
                                if (parser.getToken() !== 1077936155)
                                    destructible |= 16;
                                value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                        }
                    }
                }
                else if (parser.getToken() === 69271571) {
                    destructible |= 16;
                    if (token === 209005)
                        state |= 16;
                    state |=
                        (token === 209008
                            ? 256
                            : token === 209009
                                ? 512
                                : 1) | 2;
                    key = parseComputedPropertyName(parser, context, privateScope, inGroup);
                    destructible |= parser.assignable;
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else if (parser.getToken() & 143360) {
                    destructible |= 16;
                    if (token === -2147483527)
                        parser.report(95);
                    if (token === 209005) {
                        if (parser.flags & 1)
                            parser.report(134);
                        state |= 16 | 1;
                    }
                    else if (token === 209008) {
                        state |= 256;
                    }
                    else if (token === 209009) {
                        state |= 512;
                    }
                    else {
                        parser.report(0);
                    }
                    key = parseIdentifier(parser, context);
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else if (parser.getToken() === 67174411) {
                    destructible |= 16;
                    state |= 1;
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else if (parser.getToken() === 8391476) {
                    destructible |= 16;
                    if (token === 209008) {
                        parser.report(42);
                    }
                    else if (token === 209009) {
                        parser.report(43);
                    }
                    else if (token !== 209005) {
                        parser.report(30, KeywordDescTable[8391476 & 255]);
                    }
                    nextToken(parser, context);
                    state |=
                        8 | 1 | (token === 209005 ? 16 : 0);
                    if (parser.getToken() & 143360) {
                        key = parseIdentifier(parser, context);
                    }
                    else if ((parser.getToken() & 134217728) === 134217728) {
                        key = parseLiteral(parser, context);
                    }
                    else if (parser.getToken() === 69271571) {
                        state |= 2;
                        key = parseComputedPropertyName(parser, context, privateScope, inGroup);
                        destructible |= parser.assignable;
                    }
                    else {
                        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
                    }
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else if ((parser.getToken() & 134217728) === 134217728) {
                    if (token === 209005)
                        state |= 16;
                    state |=
                        token === 209008
                            ? 256
                            : token === 209009
                                ? 512
                                : 1;
                    destructible |= 16;
                    key = parseLiteral(parser, context);
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else {
                    parser.report(135);
                }
            }
            else if ((parser.getToken() & 134217728) === 134217728) {
                key = parseLiteral(parser, context);
                if (parser.getToken() === 21) {
                    consume(parser, context | 32, 21);
                    const { tokenStart } = parser;
                    if (tokenValue === '__proto__')
                        prototypeCount++;
                    if (parser.getToken() & 143360) {
                        value = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, inGroup, 1, tokenStart);
                        const { tokenValue: valueAfterColon, tokenStart: start, currentLocation } = parser;
                        const token = parser.getToken();
                        value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (token === 1077936155 || token === 1074790415 || token === 18) {
                                if (parser.assignable & 2) {
                                    destructible |= 16;
                                }
                                else {
                                    scope?.addVarOrBlock(context, valueAfterColon, kind, start, currentLocation, origin);
                                }
                            }
                            else {
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                        else if (parser.getToken() === 1077936155) {
                            if (parser.assignable & 2)
                                destructible |= 16;
                            value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                        }
                        else {
                            destructible |= 16;
                            value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                        }
                    }
                    else if ((parser.getToken() & 2097152) === 2097152) {
                        value =
                            parser.getToken() === 69271571
                                ? parseArrayExpressionOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin)
                                : parseObjectLiteralOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin);
                        destructible = parser.destructible;
                        parser.assignable =
                            destructible & 16
                                ? 2
                                : 1;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2) {
                                destructible |= 16;
                            }
                        }
                        else if ((parser.destructible & 8) !== 8) {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible = parser.assignable & 2 ? 16 : 0;
                            if ((parser.getToken() & 4194304) === 4194304) {
                                value = parseAssignmentExpressionOrPattern(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                            else {
                                if ((parser.getToken() & 8388608) === 8388608) {
                                    value = parseBinaryExpression(parser, context, privateScope, 1, tokenStart, 4, token, value);
                                }
                                if (consumeOpt(parser, context | 32, 22)) {
                                    value = parseConditionalExpression(parser, context, privateScope, value, tokenStart);
                                }
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                    }
                    else {
                        value = parseLeftHandSideExpression(parser, context, privateScope, 1, 0, 1, context & 131072 ? 0 : 1);
                        destructible |=
                            parser.assignable & 1
                                ? 32
                                : 16;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2) {
                                destructible |= 16;
                            }
                        }
                        else {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible = parser.assignable & 1 ? 0 : 16;
                            if (parser.getToken() !== 18 && parser.getToken() !== 1074790415) {
                                if (parser.getToken() !== 1077936155)
                                    destructible |= 16;
                                value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                        }
                    }
                }
                else if (parser.getToken() === 67174411) {
                    state |= 1;
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                    destructible = 16;
                }
                else {
                    parser.report(136);
                }
            }
            else if (parser.getToken() === 69271571) {
                key = parseComputedPropertyName(parser, context, privateScope, inGroup);
                destructible |= parser.destructible & 256 ? 256 : 0;
                state |= 2;
                if (parser.getToken() === 21) {
                    nextToken(parser, context | 32);
                    const { tokenStart, tokenValue, currentLocation } = parser;
                    const tokenAfterColon = parser.getToken();
                    if (parser.getToken() & 143360) {
                        value = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, inGroup, 1, tokenStart);
                        const token = parser.getToken();
                        value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                        if ((parser.getToken() & 4194304) === 4194304) {
                            destructible |=
                                parser.assignable & 1
                                    ? token === 1077936155
                                        ? 0
                                        : 32
                                    : 16;
                            value = parseAssignmentExpressionOrPattern(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                        }
                        else if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (token === 1077936155 || token === 1074790415 || token === 18) {
                                if (parser.assignable & 2) {
                                    destructible |= 16;
                                }
                                else if ((tokenAfterColon & 143360) === 143360) {
                                    scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
                                }
                            }
                            else {
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                        else {
                            destructible |= 16;
                            value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                        }
                    }
                    else if ((parser.getToken() & 2097152) === 2097152) {
                        value =
                            parser.getToken() === 69271571
                                ? parseArrayExpressionOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin)
                                : parseObjectLiteralOrPattern(parser, context, scope, privateScope, 0, inGroup, isPattern, kind, origin);
                        destructible = parser.destructible;
                        parser.assignable =
                            destructible & 16
                                ? 2
                                : 1;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2)
                                destructible |= 16;
                        }
                        else if (destructible & 8) {
                            parser.report(62);
                        }
                        else {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible =
                                parser.assignable & 2 ? destructible | 16 : 0;
                            if ((parser.getToken() & 4194304) === 4194304) {
                                if (parser.getToken() !== 1077936155)
                                    destructible |= 16;
                                value = parseAssignmentExpressionOrPattern(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                            else {
                                if ((parser.getToken() & 8388608) === 8388608) {
                                    value = parseBinaryExpression(parser, context, privateScope, 1, tokenStart, 4, token, value);
                                }
                                if (consumeOpt(parser, context | 32, 22)) {
                                    value = parseConditionalExpression(parser, context, privateScope, value, tokenStart);
                                }
                                destructible |=
                                    parser.assignable & 1
                                        ? 32
                                        : 16;
                            }
                        }
                    }
                    else {
                        value = parseLeftHandSideExpression(parser, context, privateScope, 1, 0, 1, context & 131072 ? 0 : 1);
                        destructible |=
                            parser.assignable & 1
                                ? 32
                                : 16;
                        if (parser.getToken() === 18 || parser.getToken() === 1074790415) {
                            if (parser.assignable & 2)
                                destructible |= 16;
                        }
                        else {
                            value = parseMemberOrUpdateExpression(parser, context, privateScope, value, inGroup, 0, tokenStart);
                            destructible = parser.assignable & 1 ? 0 : 16;
                            if (parser.getToken() !== 18 && parser.getToken() !== 1074790415) {
                                if (parser.getToken() !== 1077936155)
                                    destructible |= 16;
                                value = parseAssignmentExpression(parser, context, privateScope, inGroup, isPattern, tokenStart, value);
                            }
                        }
                    }
                }
                else if (parser.getToken() === 67174411) {
                    state |= 1;
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                    destructible = 16;
                }
                else {
                    parser.report(44);
                }
            }
            else if (token === 8391476) {
                consume(parser, context | 32, 8391476);
                state |= 8;
                if (parser.getToken() & 143360) {
                    const token = parser.getToken();
                    key = parseIdentifier(parser, context);
                    state |= 1;
                    if (parser.getToken() === 67174411) {
                        destructible |= 16;
                        value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                    }
                    else {
                        throw new ParseError(parser.tokenStart, parser.currentLocation, token === 209005
                            ? 46
                            : token === 209008 || parser.getToken() === 209009
                                ? 45
                                : 47, KeywordDescTable[token & 255]);
                    }
                }
                else if ((parser.getToken() & 134217728) === 134217728) {
                    destructible |= 16;
                    key = parseLiteral(parser, context);
                    state |= 1;
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else if (parser.getToken() === 69271571) {
                    destructible |= 16;
                    state |= 2 | 1;
                    key = parseComputedPropertyName(parser, context, privateScope, inGroup);
                    value = parseMethodDefinition(parser, context, privateScope, state, inGroup, parser.tokenStart);
                }
                else {
                    parser.report(128);
                }
            }
            else {
                parser.report(30, KeywordDescTable[token & 255]);
            }
            destructible |= parser.destructible & 128 ? 128 : 0;
            parser.destructible = destructible;
            properties.push(parser.finishNode({
                type: 'Property',
                key: key,
                value,
                kind: !(state & 768) ? 'init' : state & 512 ? 'set' : 'get',
                computed: (state & 2) > 0,
                method: (state & 1) > 0,
                shorthand: (state & 4) > 0,
            }, tokenStart));
        }
        destructible |= parser.destructible;
        if (parser.getToken() !== 18)
            break;
        nextToken(parser, context);
    }
    consume(parser, context, 1074790415);
    if (prototypeCount > 1)
        destructible |= 64;
    const node = parser.finishNode({
        type: isPattern ? 'ObjectPattern' : 'ObjectExpression',
        properties,
    }, start);
    if (!skipInitializer && parser.getToken() & 4194304) {
        return parseArrayOrObjectAssignmentPattern(parser, context, privateScope, destructible, inGroup, isPattern, start, node);
    }
    parser.destructible = destructible;
    return node;
}
/** @returns {any[]} */ function parseMethodFormals(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind, /** @type {number} */ type, /** @type {number} */ inGroup) {
    consume(parser, context, 67174411);
    const params = [];
    parser.flags = (parser.flags | 128) ^ 128;
    parser.strictReservedRange = null;
    parser.firstAwaitLocation = null;
    parser.firstYieldLocation = null;
    if (parser.getToken() === 16) {
        if (kind & 512) {
            parser.report(37, 'Setter', 'one', '');
        }
        nextToken(parser, context);
        return params;
    }
    if (kind & 256) {
        parser.report(37, 'Getter', 'no', 's');
    }
    if (kind & 512 && parser.getToken() === 14) {
        parser.report(38);
    }
    context = (context | 131072) ^ 131072;
    let setterArgs = 0;
    let isNonSimpleParameterList = 0;
    while (parser.getToken() !== 18) {
        /** @type {MeriyahNode | null} */ let left = null;
        const { tokenStart } = parser;
        if (parser.getToken() & 143360) {
            if ((context & 1) === 0) {
                if ((parser.getToken() & 36864) === 36864) {
                    parser.flags |= 256;
                    parser.strictReservedRange ??= [tokenStart, parser.currentLocation];
                }
                if ((parser.getToken() & 537079808) === 537079808) {
                    parser.flags |= 512;
                }
            }
            left = parseAndClassifyIdentifier(parser, context, scope, type);
        }
        else {
            if (parser.getToken() === 2162700) {
                left = parseObjectLiteralOrPattern(parser, context, scope, privateScope, 1, inGroup, 1, type);
            }
            else if (parser.getToken() === 69271571) {
                left = parseArrayExpressionOrPattern(parser, context, scope, privateScope, 1, inGroup, 1, type);
            }
            else if (parser.getToken() === 14) {
                left = parseSpreadOrRestElement(parser, context, scope, privateScope, 16, type, 0, inGroup, 1);
            }
            isNonSimpleParameterList = 1;
            if (parser.destructible & (32 | 16))
                parser.report(50);
        }
        if (parser.getToken() === 1077936155) {
            nextToken(parser, context | 32);
            isNonSimpleParameterList = 1;
            const right = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
            left = parser.finishNode({
                type: 'AssignmentPattern',
                left: left,
                right,
            }, tokenStart);
        }
        setterArgs++;
        params.push(left);
        if (!consumeOpt(parser, context, 18))
            break;
        if (parser.getToken() === 16) {
            break;
        }
    }
    if (kind & 512 && setterArgs !== 1) {
        parser.report(37, 'Setter', 'one', '');
    }
    scope?.reportScopeError();
    if (isNonSimpleParameterList)
        parser.flags |= 128;
    consume(parser, context, 16);
    return params;
}
function parseComputedPropertyName(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup) {
    nextToken(parser, context | 32);
    const key = parseExpression(parser, (context | 131072) ^ 131072, privateScope, 1, inGroup, parser.tokenStart);
    consume(parser, context, 20);
    return key;
}
function parseParenthesizedExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ canAssign, /** @type {number} */ kind, /** @type {MeriyahLocation} */ start, /** @type {number} */ origin) {
    parser.flags = (parser.flags | 128) ^ 128;
    const parenthesesStart = parser.tokenStart;
    nextToken(parser, context | 32 | 262144);
    const scope = parser.createScopeIfLexical()?.createChildScope(512);
    context = (context | 131072) ^ 131072;
    if (consumeOpt(parser, context, 16)) {
        return parseParenthesizedArrow(parser, context, scope, privateScope, [], canAssign, 0, start, origin);
    }
    let destructible = 0;
    const previousAwaitYield = parser.destructible & (256 | 128);
    parser.destructible &= -385;
    const previousFirstAwaitLocation = parser.firstAwaitLocation;
    parser.firstAwaitLocation = null;
    const previousFirstYieldLocation = parser.firstYieldLocation;
    parser.firstYieldLocation = null;
    /** @type {MeriyahNode | undefined} */ let expr;
    let expressions = [];
    let isSequence = 0;
    let isNonSimpleParameterList = 0;
    let hasStrictReserved = 0;
    const tokenAfterParenthesesStart = parser.tokenStart;
    parser.assignable = 1;
    while (parser.getToken() !== 16) {
        const { tokenStart, currentLocation } = parser;
        const token = parser.getToken();
        if (token & 143360) {
            scope?.addBlockName(context, parser.tokenValue, 1, tokenStart, currentLocation);
            if ((token & 537079808) === 537079808) {
                isNonSimpleParameterList = 1;
            }
            else if ((token & 36864) === 36864) {
                hasStrictReserved = 1;
            }
            expr = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, 1, 1, tokenStart, 0);
            if (parser.getToken() === 16 || parser.getToken() === 18) {
                if (parser.assignable & 2) {
                    destructible |= 16;
                    isNonSimpleParameterList = 1;
                }
            }
            else {
                if (parser.getToken() === 1077936155) {
                    isNonSimpleParameterList = 1;
                }
                else {
                    destructible |= 16;
                }
                expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 1, 0, tokenStart);
                if (parser.getToken() !== 16 && parser.getToken() !== 18) {
                    expr = parseAssignmentExpression(parser, context, privateScope, 1, 0, tokenStart, expr);
                }
            }
        }
        else if ((token & 2097152) === 2097152) {
            expr =
                token === 2162700
                    ? parseObjectLiteralOrPattern(parser, context | 262144, scope, privateScope, 0, 1, 0, kind)
                    : parseArrayExpressionOrPattern(parser, context | 262144, scope, privateScope, 0, 1, 0, kind);
            destructible |= parser.destructible;
            isNonSimpleParameterList = 1;
            parser.assignable = 2;
            if (parser.getToken() !== 16 && parser.getToken() !== 18) {
                if (destructible & 8)
                    parser.report(124);
                expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 0, tokenStart);
                destructible |= 16;
                if (parser.getToken() !== 16 && parser.getToken() !== 18) {
                    expr = parseAssignmentExpression(parser, context, privateScope, 0, 0, tokenStart, expr);
                }
            }
        }
        else if (token === 14) {
            expr = parseSpreadOrRestElement(parser, context, scope, privateScope, 16, kind, 0, 1, 0);
            if (parser.destructible & 16)
                parser.report(74);
            isNonSimpleParameterList = 1;
            if (isSequence && (parser.getToken() === 16 || parser.getToken() === 18)) {
                expressions.push(expr);
            }
            destructible |= 8;
            break;
        }
        else {
            destructible |= 16;
            expr = parseExpression(parser, context, privateScope, 1, 1, tokenStart);
            if (isSequence && (parser.getToken() === 16 || parser.getToken() === 18)) {
                expressions.push(expr);
            }
            if (parser.getToken() === 18) {
                if (!isSequence) {
                    isSequence = 1;
                    expressions = [expr];
                }
            }
            if (isSequence) {
                while (consumeOpt(parser, context | 32, 18)) {
                    expressions.push(parseExpression(parser, context, privateScope, 1, 1, parser.tokenStart));
                }
                parser.assignable = 2;
                expr = parser.finishNode({
                    type: 'SequenceExpression',
                    expressions: expressions,
                }, tokenAfterParenthesesStart);
            }
            consume(parser, context | 64, 16);
            parser.destructible = destructible | previousAwaitYield;
            if (previousFirstAwaitLocation) {
                parser.firstAwaitLocation = previousFirstAwaitLocation;
            }
            if (previousFirstYieldLocation) {
                parser.firstYieldLocation = previousFirstYieldLocation;
            }
            return parser.options.preserveParens
                ? parser.finishNode({
                    type: 'ParenthesizedExpression',
                    expression: expr,
                }, parenthesesStart)
                : expr;
        }
        if (isSequence && (parser.getToken() === 16 || parser.getToken() === 18)) {
            expressions.push(expr);
        }
        if (!consumeOpt(parser, context | 32, 18))
            break;
        if (!isSequence) {
            isSequence = 1;
            expressions = [expr];
        }
        if (parser.getToken() === 16) {
            destructible |= 8;
            break;
        }
    }
    if (isSequence) {
        parser.assignable = 2;
        expr = parser.finishNode({
            type: 'SequenceExpression',
            expressions: expressions,
        }, tokenAfterParenthesesStart);
    }
    consume(parser, context | 64, 16);
    if (destructible & 16 && destructible & 8)
        parser.report(153);
    destructible |=
        (parser.destructible & 256 ? 256 : 0) |
            (parser.destructible & 128 ? 128 : 0);
    if (parser.getToken() === 10) {
        if (destructible & (32 | 16))
            parser.report(49);
        if (context & (2048 | 2) && destructible & 128) {
            const loc = parser.firstAwaitLocation;
            if (loc)
                throw new ParseError(loc.start, loc.end, 31);
            parser.report(31);
        }
        if (context & (1 | 1024) && destructible & 256) {
            const loc = parser.firstYieldLocation;
            if (loc)
                throw new ParseError(loc.start, loc.end, 32);
            parser.report(32);
        }
        if (isNonSimpleParameterList)
            parser.flags |= 128;
        if (hasStrictReserved)
            parser.flags |= 256;
        parser.destructible |= previousAwaitYield;
        if (previousFirstAwaitLocation) {
            parser.firstAwaitLocation = previousFirstAwaitLocation;
        }
        if (previousFirstYieldLocation) {
            parser.firstYieldLocation = previousFirstYieldLocation;
        }
        return parseParenthesizedArrow(parser, context, scope, privateScope, isSequence ? expressions : [expr], canAssign, 0, start, origin);
    }
    if (destructible & 64) {
        parser.report(63);
    }
    if (destructible & 8) {
        parser.report(146);
    }
    parser.destructible =
        ((parser.destructible | 256) ^ 256) | destructible | previousAwaitYield;
    if (previousFirstAwaitLocation) {
        parser.firstAwaitLocation = previousFirstAwaitLocation;
    }
    if (previousFirstYieldLocation) {
        parser.firstYieldLocation = previousFirstYieldLocation;
    }
    return parser.options.preserveParens
        ? parser.finishNode({
            type: 'ParenthesizedExpression',
            expression: expr,
        }, parenthesesStart)
        : expr;
}
function parseIdentifierOrArrow(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, allowRegExp = 0, canAssign = 1) {
    const { tokenValue, tokenStart, currentLocation } = parser;
    let isNonSimpleParameterList = 0;
    let hasStrictReserved = 0;
    if ((parser.getToken() & 537079808) === 537079808) {
        isNonSimpleParameterList = 1;
    }
    else if ((parser.getToken() & 36864) === 36864) {
        hasStrictReserved = 1;
    }
    const expr = parseIdentifier(parser, context, allowRegExp);
    parser.assignable = 1;
    if (parser.getToken() === 10) {
        if (!canAssign)
            parser.report(57);
        const scope = parser.options.lexical
            ? createArrowHeadParsingScope(parser, context, tokenValue, tokenStart, currentLocation)
            : undefined;
        if (isNonSimpleParameterList)
            parser.flags |= 128;
        if (hasStrictReserved)
            parser.flags |= 256;
        return parseArrowFunctionExpression(parser, context, scope, privateScope, [expr], 0, tokenStart);
    }
    return expr;
}
function parseArrowFromIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {string} */ value, /** @type {MeriyahNode} */ expr, /** @type {number} */ inNew, /** @type {number} */ canAssign, /** @type {number} */ isAsync, /** @type {MeriyahLocation} */ start, origin = 0) {
    if (!canAssign)
        parser.report(57);
    if (inNew)
        parser.report(51);
    parser.flags &= -129;
    const scope = parser.options.lexical
        ? createArrowHeadParsingScope(parser, context, value, start, parser.currentLocation)
        : void 0;
    return parseArrowFunctionExpression(parser, context, scope, privateScope, [expr], isAsync, start, origin);
}
function parseParenthesizedArrow(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {any[]} */ params, /** @type {number} */ canAssign, /** @type {number} */ isAsync, /** @type {MeriyahLocation} */ start, origin = 0) {
    if (!canAssign)
        parser.report(57);
    for (let i = 0; i < params.length; ++i)
        reinterpretToPattern(parser, params[i]);
    return parseArrowFunctionExpression(parser, context, scope, privateScope, params, isAsync, start, origin);
}
function parseArrowFunctionExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {any[]} */ params, /** @type {number} */ isAsync, /** @type {MeriyahLocation} */ start, origin = 0) {
    if (parser.flags & 1)
        parser.report(48);
    consume(parser, context | 32, 10);
    const modifierFlags = 1024 | 2048 | 8192 | 524288 | 8;
    context = ((context | modifierFlags) ^ modifierFlags) | (isAsync ? 2048 : 0);
    const expression = parser.getToken() !== 2162700;
    /** @type {MeriyahNode | undefined} */ let body;
    scope?.reportScopeError();
    if (expression) {
        parser.flags =
            (parser.flags | 512 | 256 | 64 | 4096) ^
                (512 | 256 | 64 | 4096);
        body = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
    }
    else {
        scope = scope?.createChildScope(64);
        const modifierFlags = 4 | 128 | 131072 | 8;
        body = parseFunctionBody(parser, ((context | modifierFlags) ^ modifierFlags) | 4096, scope, privateScope, void 0, void 0, 16);
        switch (parser.getToken()) {
            case 69271571:
                if ((parser.flags & 1) === 0) {
                    parser.report(118);
                }
                parser.flags |= 8192;
                break;
            case 67108877:
            case 67108991:
            case 67174409:
            case 67174408:
            case 22:
                parser.report(119);
            case 67174411:
                if ((parser.flags & 1) === 0) {
                    parser.report(118);
                }
                parser.flags |= 1024;
                break;
        }
        if ((parser.getToken() & 8388608) === 8388608 && (parser.flags & 1) === 0) {
            if (parser.getToken() !== 8673330 || origin !== 32) {
                parser.report(30, KeywordDescTable[parser.getToken() & 255]);
            }
        }
        if ((parser.getToken() & 33619968) === 33619968)
            parser.report(127);
    }
    parser.assignable = 2;
    return parser.finishNode({
        type: 'ArrowFunctionExpression',
        params,
        body,
        async: isAsync === 1,
        expression,
        generator: false,
    }, start);
}
/** @returns {any[]} */ function parseFormalParametersOrFormalList(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {number} */ kind) {
    consume(parser, context, 67174411);
    parser.flags = (parser.flags | 128) ^ 128;
    parser.strictReservedRange = null;
    parser.firstAwaitLocation = null;
    parser.firstYieldLocation = null;
    const params = [];
    if (consumeOpt(parser, context, 16))
        return params;
    context = (context | 131072) ^ 131072;
    let isNonSimpleParameterList = 0;
    while (parser.getToken() !== 18) {
        /** @type {MeriyahNode | undefined} */ let left;
        const { tokenStart } = parser;
        const token = parser.getToken();
        if (token & 143360) {
            if ((context & 1) === 0) {
                if ((token & 36864) === 36864) {
                    parser.flags |= 256;
                    parser.strictReservedRange ??= [tokenStart, parser.currentLocation];
                }
                if ((token & 537079808) === 537079808) {
                    parser.flags |= 512;
                }
            }
            left = parseAndClassifyIdentifier(parser, context, scope, kind | 1);
        }
        else {
            if (token === 2162700) {
                left = parseObjectLiteralOrPattern(parser, context, scope, privateScope, 1, inGroup, 1, kind);
            }
            else if (token === 69271571) {
                left = parseArrayExpressionOrPattern(parser, context, scope, privateScope, 1, inGroup, 1, kind);
            }
            else if (token === 14) {
                left = parseSpreadOrRestElement(parser, context, scope, privateScope, 16, kind, 0, inGroup, 1);
            }
            else {
                parser.report(30, KeywordDescTable[token & 255]);
            }
            isNonSimpleParameterList = 1;
            if (parser.destructible & (32 | 16)) {
                parser.report(50);
            }
        }
        if (parser.getToken() === 1077936155) {
            nextToken(parser, context | 32);
            isNonSimpleParameterList = 1;
            const right = parseExpression(parser, context, privateScope, 1, inGroup, parser.tokenStart);
            left = parser.finishNode({
                type: 'AssignmentPattern',
                left,
                right,
            }, tokenStart);
        }
        params.push(left);
        if (!consumeOpt(parser, context, 18))
            break;
        if (parser.getToken() === 16) {
            break;
        }
    }
    if (isNonSimpleParameterList)
        parser.flags |= 128;
    if (isNonSimpleParameterList || context & 1) {
        scope?.reportScopeError();
    }
    consume(parser, context, 16);
    return params;
}
function parseMemberExpressionNoCall(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ expr, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    const token = parser.getToken();
    if (token & 67108864) {
        if (token === 67108877) {
            nextToken(parser, context | 262144);
            parser.assignable = 1;
            const property = parsePropertyOrPrivatePropertyName(parser, context, privateScope, 1);
            return parseMemberExpressionNoCall(parser, context, privateScope, parser.finishNode({
                type: 'MemberExpression',
                object: expr,
                computed: false,
                property,
                optional: false,
            }, start), 0, start);
        }
        else if (token === 69271571) {
            nextToken(parser, context | 32);
            const { tokenStart } = parser;
            const property = parseExpressions(parser, context, privateScope, inGroup, 1, tokenStart);
            consume(parser, context, 20);
            parser.assignable = 1;
            return parseMemberExpressionNoCall(parser, context, privateScope, parser.finishNode({
                type: 'MemberExpression',
                object: expr,
                computed: true,
                property,
                optional: false,
            }, start), 0, start);
        }
        else if (token === 67174408 || token === 67174409) {
            parser.assignable = 2;
            return parseMemberExpressionNoCall(parser, context, privateScope, parser.finishNode({
                type: 'TaggedTemplateExpression',
                tag: expr,
                quasi: parser.getToken() === 67174408
                    ? parseTemplate(parser, context | 64, privateScope)
                    : parseTemplateLiteral(parser, context | 64),
            }, start), 0, start);
        }
    }
    return expr;
}
function parseNewExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup) {
    const { tokenStart: start } = parser;
    const id = parseIdentifier(parser, context | 32);
    const { tokenStart } = parser;
    if (consumeOpt(parser, context, 67108877)) {
        if (context & 65536 && parser.getToken() === 209030) {
            parser.assignable = 2;
            return parseMetaProperty(parser, context, id, start);
        }
        parser.report(94);
    }
    parser.assignable = 2;
    if ((parser.getToken() & 16842752) === 16842752) {
        parser.report(65, KeywordDescTable[parser.getToken() & 255]);
    }
    const expr = parsePrimaryExpression(parser, context, privateScope, 2, 1, 0, inGroup, 1, tokenStart);
    context = (context | 131072) ^ 131072;
    const callee = parseMemberExpressionNoCall(parser, context, privateScope, expr, inGroup, tokenStart);
    if (parser.getToken() === 67108991)
        parser.report(170);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'NewExpression',
        callee,
        arguments: parser.getToken() === 67174411 ? parseArguments(parser, context, privateScope, inGroup) : [],
    }, start);
}
function parseMetaProperty(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ meta, /** @type {MeriyahLocation} */ start) {
    const property = parseIdentifier(parser, context);
    return parser.finishNode({
        type: 'MetaProperty',
        meta,
        property,
    }, start);
}
function parseAsyncArrowAfterIdent(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ canAssign, /** @type {MeriyahLocation} */ start) {
    if ((parser.getToken() & 255) === (209006 & 255))
        parser.report(31);
    if (context & (1 | 1024) && parser.getToken() === 241771) {
        parser.report(32);
    }
    classifyIdentifier(parser, context, parser.getToken());
    if ((parser.getToken() & 36864) === 36864) {
        parser.flags |= 256;
    }
    return parseArrowFromIdentifier(parser, (context & -524289) | 2048, privateScope, parser.tokenValue, parseIdentifier(parser, context), 0, canAssign, 1, start);
}
function parseAsyncArrowOrCallExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ callee, /** @type {number} */ canAssign, /** @type {number} */ kind, /** @type {number} */ flags, /** @type {MeriyahLocation} */ start) {
    nextToken(parser, context | 32);
    const scope = parser.createScopeIfLexical()?.createChildScope(512);
    const previousFirstAwaitLocation = parser.firstAwaitLocation;
    parser.firstAwaitLocation = null;
    const previousFirstYieldLocation = parser.firstYieldLocation;
    parser.firstYieldLocation = null;
    context = (context | 131072) ^ 131072;
    if (consumeOpt(parser, context, 16)) {
        if (parser.getToken() === 10) {
            if (flags & 1)
                parser.report(48);
            return parseParenthesizedArrow(parser, context, scope, privateScope, [], canAssign, 1, start);
        }
        if (!(context & 1) && parser.options.webcompat) {
            parser.assignable = 4;
        }
        else {
            parser.assignable = 2;
        }
        if (previousFirstAwaitLocation)
            parser.firstAwaitLocation = previousFirstAwaitLocation;
        if (previousFirstYieldLocation)
            parser.firstYieldLocation = previousFirstYieldLocation;
        return parser.finishNode({
            type: 'CallExpression',
            callee,
            arguments: [],
            optional: false,
        }, start);
    }
    let destructible = 0;
    let expr;
    let isNonSimpleParameterList = 0;
    parser.destructible =
        (parser.destructible | 256 | 128) ^
            (256 | 128);
    const params = [];
    while (parser.getToken() !== 16) {
        const { tokenStart, currentLocation } = parser;
        const token = parser.getToken();
        if (token & 143360) {
            scope?.addBlockName(context, parser.tokenValue, kind, tokenStart, currentLocation);
            if ((token & 537079808) === 537079808) {
                parser.flags |= 512;
            }
            else if ((token & 36864) === 36864) {
                parser.flags |= 256;
            }
            expr = parsePrimaryExpression(parser, context, privateScope, kind, 0, 1, 1, 1, tokenStart);
            if (parser.getToken() === 16 || parser.getToken() === 18) {
                if (parser.assignable & 2) {
                    destructible |= 16;
                    isNonSimpleParameterList = 1;
                }
            }
            else {
                if (parser.getToken() === 1077936155) {
                    isNonSimpleParameterList = 1;
                }
                else {
                    destructible |= 16;
                }
                expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 1, 0, tokenStart);
                if (parser.getToken() !== 16 && parser.getToken() !== 18) {
                    expr = parseAssignmentExpression(parser, context, privateScope, 1, 0, tokenStart, expr);
                }
            }
        }
        else if (token & 2097152) {
            expr = (token === 2162700
                ? parseObjectLiteralOrPattern(parser, context, scope, privateScope, 0, 1, 0, kind)
                : parseArrayExpressionOrPattern(parser, context, scope, privateScope, 0, 1, 0, kind));
            destructible |= parser.destructible;
            isNonSimpleParameterList = 1;
            if (parser.getToken() !== 16 && parser.getToken() !== 18) {
                if (destructible & 8)
                    parser.report(124);
                expr = parseMemberOrUpdateExpression(parser, context, privateScope, expr, 0, 0, tokenStart);
                destructible |= 16;
                if ((parser.getToken() & 8388608) === 8388608) {
                    expr = parseBinaryExpression(parser, context, privateScope, 1, start, 4, token, expr);
                }
                if (consumeOpt(parser, context | 32, 22)) {
                    expr = parseConditionalExpression(parser, context, privateScope, expr, start);
                }
            }
        }
        else if (token === 14) {
            expr = parseSpreadOrRestElement(parser, context, scope, privateScope, 16, kind, 1, 1, 0);
            destructible |=
                (parser.getToken() === 16 ? 0 : 16) | parser.destructible;
            isNonSimpleParameterList = 1;
        }
        else {
            expr = parseExpression(parser, context, privateScope, 1, 0, tokenStart);
            destructible = 0;
            params.push(expr);
            while (consumeOpt(parser, context | 32, 18)) {
                params.push(parseExpression(parser, context, privateScope, 1, 0, tokenStart));
            }
            destructible |= parser.assignable;
            consume(parser, context, 16);
            parser.destructible = destructible | 16;
            if (!(context & 1) && parser.options.webcompat) {
                parser.assignable = 4;
            }
            else {
                parser.assignable = 2;
            }
            if (previousFirstAwaitLocation)
                parser.firstAwaitLocation = previousFirstAwaitLocation;
            if (previousFirstYieldLocation)
                parser.firstYieldLocation = previousFirstYieldLocation;
            return parser.finishNode({
                type: 'CallExpression',
                callee,
                arguments: params,
                optional: false,
            }, start);
        }
        params.push(expr);
        if (!consumeOpt(parser, context | 32, 18))
            break;
    }
    consume(parser, context, 16);
    destructible |=
        (parser.destructible & 256 ? 256 : 0) |
            (parser.destructible & 128 ? 128 : 0);
    if (parser.getToken() === 10) {
        if (destructible & (32 | 16))
            parser.report(27);
        if (parser.flags & 1 || flags & 1)
            parser.report(48);
        if (destructible & 128) {
            const loc = parser.firstAwaitLocation;
            if (loc)
                throw new ParseError(loc.start, loc.end, 31);
            parser.report(31);
        }
        if (context & (1 | 1024) && destructible & 256) {
            const loc = parser.firstYieldLocation;
            if (loc)
                throw new ParseError(loc.start, loc.end, 32);
            parser.report(32);
        }
        if (isNonSimpleParameterList)
            parser.flags |= 128;
        return parseParenthesizedArrow(parser, context | 2048, scope, privateScope, params, canAssign, 1, start);
    }
    if (destructible & 64) {
        parser.report(63);
    }
    if (destructible & 8) {
        parser.report(62);
    }
    if (!(context & 1) && parser.options.webcompat) {
        parser.assignable = 4;
    }
    else {
        parser.assignable = 2;
    }
    if (previousFirstAwaitLocation)
        parser.firstAwaitLocation = previousFirstAwaitLocation;
    if (previousFirstYieldLocation)
        parser.firstYieldLocation = previousFirstYieldLocation;
    return parser.finishNode({
        type: 'CallExpression',
        callee,
        arguments: params,
        optional: false,
    }, start);
}
function parseRegExpLiteral(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenRaw, tokenRegExp, tokenValue, tokenStart } = parser;
    nextToken(parser, context);
    parser.assignable = 2;
    const node = {
        type: 'Literal',
        value: tokenValue,
        regex: tokenRegExp,
    };
    if (parser.options.raw) {
        node.raw = tokenRaw;
    }
    return parser.finishNode(node, tokenStart);
}
function parseClassDeclaration(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ flags) {
    let start;
    let decorators;
    if (parser.leadingDecorators.decorators.length) {
        start = parser.leadingDecorators.start;
        decorators = [...parser.leadingDecorators.decorators];
        parser.leadingDecorators.decorators.length = 0;
    }
    else {
        start = parser.tokenStart;
        decorators = parseDecorators(parser, context, privateScope);
    }
    context = (context | 16384 | 1) ^ 16384;
    consume(parser, context, 86094);
    /** @type {MeriyahNode | null} */ let id = null;
    /** @type {MeriyahNode | null} */ let superClass = null;
    const { tokenValue, tokenStart, currentLocation } = parser;
    if (parser.getToken() & 4096 && parser.getToken() !== 20565) {
        if (isStrictReservedWord(parser, context, parser.getToken())) {
            parser.report(120);
        }
        if ((parser.getToken() & 537079808) === 537079808) {
            parser.report(121);
        }
        if (scope) {
            scope.addBlockName(context, tokenValue, 32, tokenStart, currentLocation);
            if (flags) {
                if (flags & 2) {
                    parser.declareUnboundVariable(tokenValue);
                }
            }
        }
        id = parseIdentifier(parser, context);
    }
    else {
        if ((flags & 1) === 0)
            parser.report(39, 'Class');
    }
    let inheritedContext = context;
    if (consumeOpt(parser, context | 32, 20565)) {
        superClass = parseLeftHandSideExpression(parser, context, privateScope, 0, 0, 0);
        inheritedContext |= 512;
    }
    else {
        inheritedContext = (inheritedContext | 512) ^ 512;
    }
    const body = parseClassBody(parser, inheritedContext, context, scope, privateScope, 2, 0, 8);
    return parser.finishNode({
        type: 'ClassDeclaration',
        id,
        superClass,
        body,
        ...(parser.features & 1 ? { decorators } : null),
    }, start);
}
function parseClassExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    /** @type {MeriyahNode | null} */ let id = null;
    /** @type {MeriyahNode | null} */ let superClass = null;
    const decorators = parseDecorators(parser, context, privateScope);
    context = (context | 1 | 16384) ^ 16384;
    consume(parser, context, 86094);
    if (parser.getToken() & 4096 && parser.getToken() !== 20565) {
        if (isStrictReservedWord(parser, context, parser.getToken()))
            parser.report(120);
        if ((parser.getToken() & 537079808) === 537079808) {
            parser.report(121);
        }
        id = parseIdentifier(parser, context);
    }
    let inheritedContext = context;
    if (consumeOpt(parser, context | 32, 20565)) {
        superClass = parseLeftHandSideExpression(parser, context, privateScope, 0, inGroup, 0);
        inheritedContext |= 512;
    }
    else {
        inheritedContext = (inheritedContext | 512) ^ 512;
    }
    const body = parseClassBody(parser, inheritedContext, context, void 0, privateScope, 2, inGroup);
    parser.assignable = 2;
    return parser.finishNode({
        type: 'ClassExpression',
        id,
        superClass,
        body,
        ...(parser.features & 1 ? { decorators } : null),
    }, start);
}
/** @returns {any[]} */ function parseDecorators(/** @type {Parser | undefined} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const list = [];
    if (parser.features & 1) {
        while (parser.getToken() === 133) {
            list.push(parseDecorator(parser, context, privateScope));
        }
    }
    return list;
}
function parseDecorator(parser, context, privateScope) {
    const start = parser.tokenStart;
    nextToken(parser, context | 32);
    const expressionStart = parser.tokenStart;
    let expression;
    if (parser.getToken() === 67174411) {
        expression = parsePrimaryExpression(parser, context, privateScope, 2, 0, 1, 0, 1, start);
    }
    else {
        const token = parser.getToken();
        if (((token & 143360) !== 143360 && !isValidIdentifier(context, token)) ||
            (context & 1 && (token & 36864) === 36864)) {
            parser.report(30, KeywordDescTable[token & 255]);
        }
        if (token === 209006 && context & (2048 | 2)) {
            parser.report(112);
        }
        if (token === 241771 && context & 1024) {
            parser.report(97, 'yield');
        }
        let memberExpression = parseIdentifier(parser, context | 64);
        while (parser.getToken() === 67108877) {
            nextToken(parser, (context | 262144 | 8) ^ 8);
            const property = parsePropertyOrPrivatePropertyName(parser, context | 64, privateScope, 1);
            memberExpression = parser.finishNode({
                type: 'MemberExpression',
                object: memberExpression,
                computed: false,
                property,
                optional: false,
            }, expressionStart);
        }
        expression = memberExpression;
        if (parser.getToken() === 67174411) {
            const args = parseArguments(parser, context, privateScope, 0);
            expression = parser.finishNode({
                type: 'CallExpression',
                callee: memberExpression,
                arguments: args,
                optional: false,
            }, expressionStart);
        }
    }
    return parser.finishNode({
        type: 'Decorator',
        expression,
    }, start);
}
function parseClassBody(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ inheritedContext, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ parentScope, /** @type {number} */ kind, /** @type {number} */ inGroup, /** @type {number} */ origin = 0) {
    const { tokenStart } = parser;
    const privateScope = parser.createPrivateScopeIfLexical(parentScope);
    consume(parser, context | 32, 2162700);
    const modifierFlags = 131072 | 524288;
    context = (context | modifierFlags) ^ modifierFlags;
    const hasConstr = parser.flags & 32;
    parser.flags = (parser.flags | 32) ^ 32;
    const body = [];
    while (parser.getToken() !== 1074790415) {
        const decoratorStart = parser.tokenStart;
        const decorators = parseDecorators(parser, context, privateScope);
        if (decorators.length > 0 && parser.tokenValue === 'constructor') {
            parser.report(111);
        }
        if (parser.getToken() === 1074790415)
            parser.report(110);
        if (consumeOpt(parser, context, 1074790417)) {
            if (decorators.length > 0)
                parser.report(122);
            continue;
        }
        body.push(parseClassElementList(parser, context, scope, privateScope, inheritedContext, kind, decorators, 0, inGroup, decorators.length > 0 ? decoratorStart : parser.tokenStart));
    }
    consume(parser, origin & 8 ? context | 32 : context, 1074790415);
    privateScope?.validatePrivateIdentifierRefs();
    parser.flags = (parser.flags & -33) | hasConstr;
    return parser.finishNode({
        type: 'ClassBody',
        body,
    }, tokenStart);
}
function parseClassElementList(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inheritedContext, /** @type {number} */ type, /** @type {any[]} */ decorators, /** @type {number} */ isStatic, /** @type {number} */ inGroup, /** @type {MeriyahLocation} */ start) {
    let kind = isStatic ? 32 : 0;
    /** @type {MeriyahNode | null} */ let key = null;
    const token = parser.getToken();
    if (token & (143360 | 36864) || token === -2147483527) {
        key = parseIdentifier(parser, context);
        switch (token) {
            case 36970:
                if (!isStatic &&
                    parser.getToken() !== 67174411 &&
                    (parser.getToken() & 1048576) !== 1048576 &&
                    parser.getToken() !== 1077936155) {
                    return parseClassElementList(parser, context, scope, privateScope, inheritedContext, type, decorators, 1, inGroup, start);
                }
                break;
            case 209005:
                if (parser.getToken() !== 67174411 && (parser.flags & 1) === 0) {
                    if ((parser.getToken() & 1073741824) === 1073741824) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    kind |= 16 | (optionalBit(parser, context, 8391476) ? 8 : 0);
                }
                break;
            case 209008:
                if (parser.getToken() !== 67174411) {
                    if (parser.getToken() === 8391476 && parser.flags & 1) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    if ((parser.getToken() & 1073741824) === 1073741824) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    kind |= 256;
                }
                break;
            case 209009:
                if (parser.getToken() !== 67174411) {
                    if (parser.getToken() === 8391476 && parser.flags & 1) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    if ((parser.getToken() & 1073741824) === 1073741824) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    kind |= 512;
                }
                break;
            case 209010:
                if (parser.getToken() !== 67174411 && (parser.flags & 1) === 0) {
                    if ((parser.getToken() & 1073741824) === 1073741824) {
                        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
                    }
                    if (parser.features & 1)
                        kind |= 1024;
                }
                break;
        }
    }
    else if (token === 69271571) {
        kind |= 2;
        key = parseComputedPropertyName(parser, inheritedContext, privateScope, inGroup);
    }
    else if ((token & 134217728) === 134217728) {
        key = parseLiteral(parser, context);
    }
    else if (token === 8391476) {
        kind |= 8;
        nextToken(parser, context);
    }
    else if (parser.getToken() === 131) {
        kind |= 8192;
        key = parsePrivateIdentifier(parser, context | 16, privateScope, 768);
    }
    else if ((parser.getToken() & 1073741824) === 1073741824) {
        kind |= 128;
    }
    else if (isStatic && token === 2162700) {
        return parseStaticBlock(parser, context | 16, scope, privateScope, start);
    }
    else if (token === -2147483526) {
        key = parseIdentifier(parser, context);
    }
    else {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
    if (kind & (8 | 16 | 768 | 1024)) {
        if (parser.getToken() & 143360 ||
            parser.getToken() === -2147483527 ||
            parser.getToken() === -2147483526) {
            key = parseIdentifier(parser, context);
        }
        else if ((parser.getToken() & 134217728) === 134217728) {
            key = parseLiteral(parser, context);
        }
        else if (parser.getToken() === 69271571) {
            kind |= 2;
            key = parseComputedPropertyName(parser, inheritedContext, privateScope, 0);
        }
        else if (parser.getToken() === 131) {
            kind |= 8192;
            key = parsePrivateIdentifier(parser, context, privateScope, kind);
        }
        else
            parser.report(137);
    }
    if ((kind & 2) === 0) {
        if (parser.tokenValue === 'constructor') {
            if ((parser.getToken() & 1073741824) === 1073741824) {
                parser.report(131);
            }
            else if ((kind & 32) === 0 && parser.getToken() === 67174411) {
                if (kind & (768 | 16 | 128 | 8)) {
                    parser.report(53, 'accessor');
                }
                else if ((context & 512) === 0) {
                    if (parser.flags & 32)
                        parser.report(54);
                    else
                        parser.flags |= 32;
                }
            }
            kind |= 64;
        }
        else if ((kind & 8192) === 0 &&
            kind & 32 &&
            parser.tokenValue === 'prototype') {
            parser.report(52);
        }
    }
    if (kind & 1024 || (parser.getToken() !== 67174411 && (kind & 768) === 0)) {
        return parsePropertyDefinition(parser, context, privateScope, key, kind, decorators, start);
    }
    const value = parseMethodDefinition(parser, context | 16, privateScope, kind, inGroup, parser.tokenStart);
    return parser.finishNode({
        type: 'MethodDefinition',
        kind: (kind & 32) === 0 && kind & 64
            ? 'constructor'
            : kind & 256
                ? 'get'
                : kind & 512
                    ? 'set'
                    : 'method',
        static: (kind & 32) > 0,
        computed: (kind & 2) > 0,
        key,
        value,
        ...(parser.features & 1 ? { decorators } : null),
    }, start);
}
function parsePrivateIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ kind) {
    const { tokenStart } = parser;
    nextToken(parser, context);
    const { tokenValue } = parser;
    if (tokenValue === 'constructor')
        parser.report(130);
    if (parser.options.lexical) {
        if (!privateScope)
            parser.report(4, tokenValue);
        if (kind) {
            privateScope.addPrivateIdentifier(tokenValue, kind);
        }
        else {
            privateScope.addPrivateIdentifierRef(tokenValue);
        }
    }
    nextToken(parser, context);
    return parser.finishNode({
        type: 'PrivateIdentifier',
        name: tokenValue,
    }, tokenStart);
}
function parsePropertyDefinition(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahNode} */ key, /** @type {number} */ state, /** @type {any[] | undefined} */ decorators, /** @type {MeriyahLocation} */ start) {
    /** @type {MeriyahNode | null} */ let value = null;
    if (state & 8)
        parser.report(0);
    if (parser.getToken() === 1077936155) {
        nextToken(parser, context | 32);
        const { tokenStart } = parser;
        if (parser.getToken() === 537079928)
            parser.report(121);
        const modifierFlags = 1024 |
            2048 |
            8 |
            8192 |
            32768 |
            ((state & 64) === 0 ? 512 | 16384 : 0);
        context =
            ((context | modifierFlags) ^ modifierFlags) |
                (state & 8 ? 1024 : 0) |
                (state & 16 ? 2048 : 0) |
                (state & 64 ? 16384 : 0) |
                256 |
                65536;
        value = parsePrimaryExpression(parser, context | 16, privateScope, 2, 0, 1, 0, 1, tokenStart, 0, 1);
        if ((parser.getToken() & 1073741824) !== 1073741824 ||
            (parser.getToken() & 4194304) === 4194304) {
            value = parseMemberOrUpdateExpression(parser, context | 16, privateScope, value, 0, 0, tokenStart);
            value = parseAssignmentExpression(parser, context | 16, privateScope, 0, 0, tokenStart, value);
        }
    }
    matchOrInsertSemicolon(parser, context);
    return parser.finishNode({
        type: state & 1024 ? 'AccessorProperty' : 'PropertyDefinition',
        key,
        value,
        static: (state & 32) > 0,
        computed: (state & 2) > 0,
        ...(parser.features & 1 ? { decorators } : null),
    }, start);
}
function parseBindingPattern(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {PrivateScope | undefined} */ privateScope, kind, /** @type {number} */ origin = 0) {
    if (parser.getToken() & 143360 ||
        ((context & 1) === 0 && parser.getToken() === -2147483526))
        return parseAndClassifyIdentifier(parser, context, scope, kind, origin);
    if ((parser.getToken() & 2097152) !== 2097152)
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    const left = parser.getToken() === 69271571
        ? parseArrayExpressionOrPattern(parser, context, scope, privateScope, 1, 0, 1, kind, origin)
        : parseObjectLiteralOrPattern(parser, context, scope, privateScope, 1, 0, 1, kind, origin);
    if (parser.destructible & 16)
        parser.report(50);
    if (parser.destructible & 32)
        parser.report(50);
    return left;
}
function parseAndClassifyIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {Scope | undefined} */ scope, /** @type {number} */ kind, /** @type {number} */ origin = 0) {
    const token = parser.getToken();
    if (context & 1) {
        if ((token & 537079808) === 537079808) {
            parser.report(121);
        }
        else if ((token & 36864) === 36864 || token === -2147483526) {
            parser.report(120);
        }
    }
    if ((token & 20480) === 20480) {
        parser.report(102);
    }
    if (token === 241771) {
        if (context & 1024)
            parser.report(32);
        if (context & 2)
            parser.report(113);
    }
    if ((token & 255) === (241737 & 255)) {
        if (kind & (8 | 16))
            parser.report(100);
    }
    if (token === 209006) {
        if (context & 2048)
            parser.report(178);
        if (context & 2)
            parser.report(112);
    }
    const { tokenValue, tokenStart, currentLocation } = parser;
    nextToken(parser, context);
    scope?.addVarOrBlock(context, tokenValue, kind, tokenStart, currentLocation, origin);
    return parser.finishNode({
        type: 'Identifier',
        name: tokenValue,
    }, tokenStart);
}
function parseJSXRootElementOrFragment(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild, /** @type {MeriyahLocation} */ start) {
    if (!inJSXChild)
        consume(parser, context, 8456256);
    if (parser.getToken() === 8390721) {
        const openingFragment = parseJSXOpeningFragment(parser, start);
        const [children, closingFragment] = parseJSXChildrenAndClosingFragment(parser, context, privateScope, inJSXChild);
        return parser.finishNode({
            type: 'JSXFragment',
            openingFragment,
            children,
            closingFragment,
        }, start);
    }
    if (parser.getToken() === 8457014)
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    /** @type {MeriyahNode | null} */ let closingElement = null;
    let children = [];
    const openingElement = parseJSXOpeningElementOrSelfCloseElement(parser, context, privateScope, inJSXChild, start);
    if (!openingElement.selfClosing) {
        [children, closingElement] = parseJSXChildrenAndClosingElement(parser, context, privateScope, inJSXChild);
        const close = isEqualTagName(closingElement.name);
        if (isEqualTagName(openingElement.name) !== close)
            parser.report(157, close);
    }
    return parser.finishNode({
        type: 'JSXElement',
        children,
        openingElement,
        closingElement,
    }, start);
}
function parseJSXOpeningFragment(/** @type {Parser} */ parser, /** @type {MeriyahLocation} */ start) {
    nextJSXToken(parser);
    return parser.finishNode({
        type: 'JSXOpeningFragment',
    }, start);
}
function parseJSXClosingElement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ inJSXChild, /** @type {MeriyahLocation} */ start) {
    consume(parser, context, 8457014);
    const name = parseJSXElementName(parser, context);
    if (parser.getToken() !== 8390721) {
        parser.report(25, KeywordDescTable[8390721 & 255]);
    }
    if (inJSXChild) {
        nextJSXToken(parser);
    }
    else {
        nextToken(parser, context);
    }
    return parser.finishNode({
        type: 'JSXClosingElement',
        name,
    }, start);
}
function parseJSXClosingFragment(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {number} */ inJSXChild, /** @type {MeriyahLocation} */ start) {
    consume(parser, context, 8457014);
    if (parser.getToken() !== 8390721) {
        parser.report(25, KeywordDescTable[8390721 & 255]);
    }
    if (inJSXChild) {
        nextJSXToken(parser);
    }
    else {
        nextToken(parser, context);
    }
    return parser.finishNode({
        type: 'JSXClosingFragment',
    }, start);
}
/** @returns {any[]} */ function parseJSXChildrenAndClosingElement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild) {
    const children = [];
    while (true) {
        const child = parseJSXChildOrClosingElement(parser, context, privateScope, inJSXChild);
        if (child.type === 'JSXClosingElement') {
            return [children, child];
        }
        children.push(child);
    }
}
/** @returns {any[]} */ function parseJSXChildrenAndClosingFragment(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild) {
    const children = [];
    while (true) {
        const child = parseJSXChildOrClosingFragment(parser, context, privateScope, inJSXChild);
        if (child.type === 'JSXClosingFragment') {
            return [children, child];
        }
        children.push(child);
    }
}
function parseJSXChildOrClosingElement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild) {
    if (parser.getToken() === 138)
        return parseJSXText(parser);
    if (parser.getToken() === 2162700)
        return parseJSXExpressionContainer(parser, context, privateScope, 1, 0);
    if (parser.getToken() === 8456256) {
        const { tokenStart } = parser;
        nextToken(parser, context);
        if (parser.getToken() === 8457014)
            return parseJSXClosingElement(parser, context, inJSXChild, tokenStart);
        return parseJSXRootElementOrFragment(parser, context, privateScope, 1, tokenStart);
    }
    parser.report(0);
}
function parseJSXChildOrClosingFragment(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild) {
    if (parser.getToken() === 138)
        return parseJSXText(parser);
    if (parser.getToken() === 2162700)
        return parseJSXExpressionContainer(parser, context, privateScope, 1, 0);
    if (parser.getToken() === 8456256) {
        const { tokenStart } = parser;
        nextToken(parser, context);
        if (parser.getToken() === 8457014)
            return parseJSXClosingFragment(parser, context, inJSXChild, tokenStart);
        return parseJSXRootElementOrFragment(parser, context, privateScope, 1, tokenStart);
    }
    parser.report(0);
}
function parseJSXText(/** @type {Parser} */ parser) {
    const start = parser.tokenStart;
    nextJSXToken(parser);
    const node = {
        type: 'JSXText',
        value: parser.tokenValue,
    };
    if (parser.options.raw) {
        node.raw = parser.tokenRaw;
    }
    return parser.finishNode(node, start);
}
function parseJSXOpeningElementOrSelfCloseElement(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild, /** @type {MeriyahLocation} */ start) {
    if ((parser.getToken() & 143360) !== 143360 &&
        (parser.getToken() & 4096) !== 4096)
        parser.report(0);
    const tagName = parseJSXElementName(parser, context);
    const attributes = parseJSXAttributes(parser, context, privateScope);
    const selfClosing = parser.getToken() === 8457014;
    if (selfClosing)
        consume(parser, context | 1048576, 8457014);
    if (parser.getToken() !== 8390721) {
        parser.report(25, KeywordDescTable[8390721 & 255]);
    }
    if (inJSXChild || !selfClosing) {
        nextJSXToken(parser);
    }
    else {
        nextToken(parser, context);
    }
    return parser.finishNode({
        type: 'JSXOpeningElement',
        name: tagName,
        attributes,
        selfClosing,
    }, start);
}
function parseJSXElementName(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const { tokenStart } = parser;
    rescanJSXIdentifier(parser);
    let key = parseJSXIdentifier(parser, context);
    if (parser.getToken() === 21)
        return parseJSXNamespacedName(parser, context, key, tokenStart);
    while (consumeOpt(parser, context, 67108877)) {
        rescanJSXIdentifier(parser);
        key = parseJSXMemberExpression(parser, context, key, tokenStart);
    }
    return key;
}
function parseJSXMemberExpression(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ object, /** @type {MeriyahLocation} */ start) {
    const property = parseJSXIdentifier(parser, context);
    return parser.finishNode({
        type: 'JSXMemberExpression',
        object,
        property,
    }, start);
}
/** @returns {any[]} */ function parseJSXAttributes(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const attributes = [];
    while (parser.getToken() !== 8457014 &&
        parser.getToken() !== 8390721 &&
        parser.getToken() !== 1048576) {
        attributes.push(parseJsxAttribute(parser, context, privateScope));
    }
    return attributes;
}
function parseJSXSpreadAttribute(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const start = parser.tokenStart;
    nextToken(parser, context);
    consume(parser, context, 14);
    const expression = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
    consume(parser, context, 1074790415);
    return parser.finishNode({
        type: 'JSXSpreadAttribute',
        argument: expression,
    }, start);
}
function parseJsxAttribute(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope) {
    const { tokenStart } = parser;
    if (parser.getToken() === 2162700)
        return parseJSXSpreadAttribute(parser, context, privateScope);
    rescanJSXIdentifier(parser);
    /** @type {MeriyahNode | null} */ let value = null;
    let name = parseJSXIdentifier(parser, context);
    if (parser.getToken() === 21) {
        name = parseJSXNamespacedName(parser, context, name, tokenStart);
    }
    if (parser.getToken() === 1077936155) {
        const token = scanJSXAttributeValue(parser, context);
        switch (token) {
            case 134283267:
                value = parseLiteral(parser, context);
                break;
            case 8456256:
                value = parseJSXRootElementOrFragment(parser, context, privateScope, 0, parser.tokenStart);
                break;
            case 2162700:
                value = parseJSXExpressionContainer(parser, context, privateScope, 0, 1);
                break;
            default:
                parser.report(156);
        }
    }
    return parser.finishNode({
        type: 'JSXAttribute',
        value,
        name,
    }, tokenStart);
}
function parseJSXNamespacedName(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {MeriyahNode} */ namespace, /** @type {MeriyahLocation} */ start) {
    consume(parser, context, 21);
    const name = parseJSXIdentifier(parser, context);
    return parser.finishNode({
        type: 'JSXNamespacedName',
        namespace,
        name,
    }, start);
}
function parseJSXExpressionContainer(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {number} */ inJSXChild, /** @type {number} */ isAttr) {
    const { tokenStart: start } = parser;
    nextToken(parser, context | 32);
    const { tokenStart } = parser;
    if (parser.getToken() === 14)
        return parseJSXSpreadChild(parser, context, privateScope, start);
    let expression;
    if (parser.getToken() === 1074790415) {
        if (isAttr)
            parser.report(159);
        expression = parseJSXEmptyExpression(parser, {
            index: parser.startIndex,
            line: parser.startLine,
            column: parser.startColumn,
        });
    }
    else {
        expression = parseExpression(parser, context, privateScope, 1, 0, tokenStart);
    }
    if (parser.getToken() !== 1074790415) {
        parser.report(25, KeywordDescTable[1074790415 & 255]);
    }
    if (inJSXChild) {
        nextJSXToken(parser);
    }
    else {
        nextToken(parser, context);
    }
    return parser.finishNode({
        type: 'JSXExpressionContainer',
        expression,
    }, start);
}
function parseJSXSpreadChild(/** @type {Parser} */ parser, /** @type {number} */ context, /** @type {PrivateScope | undefined} */ privateScope, /** @type {MeriyahLocation} */ start) {
    consume(parser, context, 14);
    const expression = parseExpression(parser, context, privateScope, 1, 0, parser.tokenStart);
    consume(parser, context, 1074790415);
    return parser.finishNode({
        type: 'JSXSpreadChild',
        expression,
    }, start);
}
function parseJSXEmptyExpression(/** @type {Parser} */ parser, /** @type {MeriyahLocation} */ start) {
    return parser.finishNode({
        type: 'JSXEmptyExpression',
    }, start, parser.tokenStart);
}
function parseJSXIdentifier(/** @type {Parser} */ parser, /** @type {number} */ context) {
    const start = parser.tokenStart;
    if (!(parser.getToken() & 143360)) {
        parser.report(30, KeywordDescTable[parser.getToken() & 255]);
    }
    const { tokenValue } = parser;
    nextToken(parser, context | 1048576);
    return parser.finishNode({
        type: 'JSXIdentifier',
        name: tokenValue,
    }, start);
}

const { version } = packageJson;
function parseScript(/** @type {string} */ source, options) {
    return parseSource(source, { ...options, sourceType: 'script' });
}
function parseModule(/** @type {string} */ source, options) {
    return parseSource(source, { ...options, sourceType: 'module' });
}
function parse(/** @type {string | undefined} */ source, options) {
    return parseSource(source, options);
}

export { isParseError, parse, parseModule, parseScript, version };
