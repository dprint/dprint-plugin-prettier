//#region ../compiler/src/ml_parser/tokens.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
let TokenType = /* @__PURE__ */ function(TokenType) {
	TokenType[TokenType["TAG_OPEN_START"] = 0] = "TAG_OPEN_START";
	TokenType[TokenType["TAG_OPEN_END"] = 1] = "TAG_OPEN_END";
	TokenType[TokenType["TAG_OPEN_END_VOID"] = 2] = "TAG_OPEN_END_VOID";
	TokenType[TokenType["TAG_CLOSE"] = 3] = "TAG_CLOSE";
	TokenType[TokenType["INCOMPLETE_TAG_OPEN"] = 4] = "INCOMPLETE_TAG_OPEN";
	TokenType[TokenType["TEXT"] = 5] = "TEXT";
	TokenType[TokenType["ESCAPABLE_RAW_TEXT"] = 6] = "ESCAPABLE_RAW_TEXT";
	TokenType[TokenType["RAW_TEXT"] = 7] = "RAW_TEXT";
	TokenType[TokenType["INTERPOLATION"] = 8] = "INTERPOLATION";
	TokenType[TokenType["ENCODED_ENTITY"] = 9] = "ENCODED_ENTITY";
	TokenType[TokenType["COMMENT_START"] = 10] = "COMMENT_START";
	TokenType[TokenType["COMMENT_END"] = 11] = "COMMENT_END";
	TokenType[TokenType["IN_ELEMENT_COMMENT"] = 12] = "IN_ELEMENT_COMMENT";
	TokenType[TokenType["CDATA_START"] = 13] = "CDATA_START";
	TokenType[TokenType["CDATA_END"] = 14] = "CDATA_END";
	TokenType[TokenType["ATTR_NAME"] = 15] = "ATTR_NAME";
	TokenType[TokenType["ATTR_QUOTE"] = 16] = "ATTR_QUOTE";
	TokenType[TokenType["ATTR_VALUE_TEXT"] = 17] = "ATTR_VALUE_TEXT";
	TokenType[TokenType["ATTR_VALUE_INTERPOLATION"] = 18] = "ATTR_VALUE_INTERPOLATION";
	TokenType[TokenType["DOC_TYPE_START"] = 19] = "DOC_TYPE_START";
	TokenType[TokenType["DOC_TYPE_END"] = 20] = "DOC_TYPE_END";
	TokenType[TokenType["EXPANSION_FORM_START"] = 21] = "EXPANSION_FORM_START";
	TokenType[TokenType["EXPANSION_CASE_VALUE"] = 22] = "EXPANSION_CASE_VALUE";
	TokenType[TokenType["EXPANSION_CASE_EXP_START"] = 23] = "EXPANSION_CASE_EXP_START";
	TokenType[TokenType["EXPANSION_CASE_EXP_END"] = 24] = "EXPANSION_CASE_EXP_END";
	TokenType[TokenType["EXPANSION_FORM_END"] = 25] = "EXPANSION_FORM_END";
	TokenType[TokenType["BLOCK_OPEN_START"] = 26] = "BLOCK_OPEN_START";
	TokenType[TokenType["BLOCK_OPEN_END"] = 27] = "BLOCK_OPEN_END";
	TokenType[TokenType["BLOCK_CLOSE"] = 28] = "BLOCK_CLOSE";
	TokenType[TokenType["BLOCK_PARAMETER"] = 29] = "BLOCK_PARAMETER";
	TokenType[TokenType["INCOMPLETE_BLOCK_OPEN"] = 30] = "INCOMPLETE_BLOCK_OPEN";
	TokenType[TokenType["LET_START"] = 31] = "LET_START";
	TokenType[TokenType["LET_VALUE"] = 32] = "LET_VALUE";
	TokenType[TokenType["LET_END"] = 33] = "LET_END";
	TokenType[TokenType["INCOMPLETE_LET"] = 34] = "INCOMPLETE_LET";
	TokenType[TokenType["COMPONENT_OPEN_START"] = 35] = "COMPONENT_OPEN_START";
	TokenType[TokenType["COMPONENT_OPEN_END"] = 36] = "COMPONENT_OPEN_END";
	TokenType[TokenType["COMPONENT_OPEN_END_VOID"] = 37] = "COMPONENT_OPEN_END_VOID";
	TokenType[TokenType["COMPONENT_CLOSE"] = 38] = "COMPONENT_CLOSE";
	TokenType[TokenType["INCOMPLETE_COMPONENT_OPEN"] = 39] = "INCOMPLETE_COMPONENT_OPEN";
	TokenType[TokenType["DIRECTIVE_NAME"] = 40] = "DIRECTIVE_NAME";
	TokenType[TokenType["DIRECTIVE_OPEN"] = 41] = "DIRECTIVE_OPEN";
	TokenType[TokenType["DIRECTIVE_CLOSE"] = 42] = "DIRECTIVE_CLOSE";
	TokenType[TokenType["PROCESSING_INSTRUCTION"] = 43] = "PROCESSING_INSTRUCTION";
	TokenType[TokenType["EOF"] = 44] = "EOF";
	return TokenType;
}({});
//#endregion
export { TokenType };
