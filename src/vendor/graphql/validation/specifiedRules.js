"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specifiedSDLRules = exports.specifiedRules = exports.recommendedRules = void 0;
const DeferStreamDirectiveLabelRule_ts_1 = require("./rules/DeferStreamDirectiveLabelRule.js");
const DeferStreamDirectiveOnRootFieldRule_ts_1 = require("./rules/DeferStreamDirectiveOnRootFieldRule.js");
const DeferStreamDirectiveOnValidOperationsRule_ts_1 = require("./rules/DeferStreamDirectiveOnValidOperationsRule.js");
const ExecutableDefinitionsRule_ts_1 = require("./rules/ExecutableDefinitionsRule.js");
const FieldsOnCorrectTypeRule_ts_1 = require("./rules/FieldsOnCorrectTypeRule.js");
const FragmentsOnCompositeTypesRule_ts_1 = require("./rules/FragmentsOnCompositeTypesRule.js");
const KnownArgumentNamesRule_ts_1 = require("./rules/KnownArgumentNamesRule.js");
const KnownDirectivesRule_ts_1 = require("./rules/KnownDirectivesRule.js");
const KnownFragmentNamesRule_ts_1 = require("./rules/KnownFragmentNamesRule.js");
const KnownOperationTypesRule_ts_1 = require("./rules/KnownOperationTypesRule.js");
const KnownTypeNamesRule_ts_1 = require("./rules/KnownTypeNamesRule.js");
const LoneAnonymousOperationRule_ts_1 = require("./rules/LoneAnonymousOperationRule.js");
const LoneSchemaDefinitionRule_ts_1 = require("./rules/LoneSchemaDefinitionRule.js");
const MaxIntrospectionDepthRule_ts_1 = require("./rules/MaxIntrospectionDepthRule.js");
const NoFragmentCyclesRule_ts_1 = require("./rules/NoFragmentCyclesRule.js");
const NoUndefinedVariablesRule_ts_1 = require("./rules/NoUndefinedVariablesRule.js");
const NoUnusedFragmentsRule_ts_1 = require("./rules/NoUnusedFragmentsRule.js");
const NoUnusedVariablesRule_ts_1 = require("./rules/NoUnusedVariablesRule.js");
const OverlappingFieldsCanBeMergedRule_ts_1 = require("./rules/OverlappingFieldsCanBeMergedRule.js");
const PossibleFragmentSpreadsRule_ts_1 = require("./rules/PossibleFragmentSpreadsRule.js");
const PossibleTypeExtensionsRule_ts_1 = require("./rules/PossibleTypeExtensionsRule.js");
const ProvidedRequiredArgumentsRule_ts_1 = require("./rules/ProvidedRequiredArgumentsRule.js");
const ScalarLeafsRule_ts_1 = require("./rules/ScalarLeafsRule.js");
const SingleFieldSubscriptionsRule_ts_1 = require("./rules/SingleFieldSubscriptionsRule.js");
const StreamDirectiveOnListFieldRule_ts_1 = require("./rules/StreamDirectiveOnListFieldRule.js");
const UniqueArgumentDefinitionNamesRule_ts_1 = require("./rules/UniqueArgumentDefinitionNamesRule.js");
const UniqueArgumentNamesRule_ts_1 = require("./rules/UniqueArgumentNamesRule.js");
const UniqueDirectiveNamesRule_ts_1 = require("./rules/UniqueDirectiveNamesRule.js");
const UniqueDirectivesPerLocationRule_ts_1 = require("./rules/UniqueDirectivesPerLocationRule.js");
const UniqueEnumValueNamesRule_ts_1 = require("./rules/UniqueEnumValueNamesRule.js");
const UniqueFieldDefinitionNamesRule_ts_1 = require("./rules/UniqueFieldDefinitionNamesRule.js");
const UniqueFragmentNamesRule_ts_1 = require("./rules/UniqueFragmentNamesRule.js");
const UniqueInputFieldNamesRule_ts_1 = require("./rules/UniqueInputFieldNamesRule.js");
const UniqueOperationNamesRule_ts_1 = require("./rules/UniqueOperationNamesRule.js");
const UniqueOperationTypesRule_ts_1 = require("./rules/UniqueOperationTypesRule.js");
const UniqueTypeNamesRule_ts_1 = require("./rules/UniqueTypeNamesRule.js");
const UniqueVariableNamesRule_ts_1 = require("./rules/UniqueVariableNamesRule.js");
const ValuesOfCorrectTypeRule_ts_1 = require("./rules/ValuesOfCorrectTypeRule.js");
const VariablesAreInputTypesRule_ts_1 = require("./rules/VariablesAreInputTypesRule.js");
const VariablesInAllowedPositionRule_ts_1 = require("./rules/VariablesInAllowedPositionRule.js");
exports.recommendedRules = Object.freeze([
    MaxIntrospectionDepthRule_ts_1.MaxIntrospectionDepthRule,
]);
exports.specifiedRules = Object.freeze([
    ExecutableDefinitionsRule_ts_1.ExecutableDefinitionsRule,
    KnownOperationTypesRule_ts_1.KnownOperationTypesRule,
    UniqueOperationNamesRule_ts_1.UniqueOperationNamesRule,
    LoneAnonymousOperationRule_ts_1.LoneAnonymousOperationRule,
    SingleFieldSubscriptionsRule_ts_1.SingleFieldSubscriptionsRule,
    KnownTypeNamesRule_ts_1.KnownTypeNamesRule,
    FragmentsOnCompositeTypesRule_ts_1.FragmentsOnCompositeTypesRule,
    VariablesAreInputTypesRule_ts_1.VariablesAreInputTypesRule,
    ScalarLeafsRule_ts_1.ScalarLeafsRule,
    FieldsOnCorrectTypeRule_ts_1.FieldsOnCorrectTypeRule,
    UniqueFragmentNamesRule_ts_1.UniqueFragmentNamesRule,
    KnownFragmentNamesRule_ts_1.KnownFragmentNamesRule,
    NoUnusedFragmentsRule_ts_1.NoUnusedFragmentsRule,
    PossibleFragmentSpreadsRule_ts_1.PossibleFragmentSpreadsRule,
    NoFragmentCyclesRule_ts_1.NoFragmentCyclesRule,
    UniqueVariableNamesRule_ts_1.UniqueVariableNamesRule,
    NoUndefinedVariablesRule_ts_1.NoUndefinedVariablesRule,
    NoUnusedVariablesRule_ts_1.NoUnusedVariablesRule,
    KnownDirectivesRule_ts_1.KnownDirectivesRule,
    UniqueDirectivesPerLocationRule_ts_1.UniqueDirectivesPerLocationRule,
    DeferStreamDirectiveOnRootFieldRule_ts_1.DeferStreamDirectiveOnRootFieldRule,
    DeferStreamDirectiveOnValidOperationsRule_ts_1.DeferStreamDirectiveOnValidOperationsRule,
    DeferStreamDirectiveLabelRule_ts_1.DeferStreamDirectiveLabelRule,
    StreamDirectiveOnListFieldRule_ts_1.StreamDirectiveOnListFieldRule,
    KnownArgumentNamesRule_ts_1.KnownArgumentNamesRule,
    UniqueArgumentNamesRule_ts_1.UniqueArgumentNamesRule,
    ValuesOfCorrectTypeRule_ts_1.ValuesOfCorrectTypeRule,
    ProvidedRequiredArgumentsRule_ts_1.ProvidedRequiredArgumentsRule,
    VariablesInAllowedPositionRule_ts_1.VariablesInAllowedPositionRule,
    OverlappingFieldsCanBeMergedRule_ts_1.OverlappingFieldsCanBeMergedRule,
    UniqueInputFieldNamesRule_ts_1.UniqueInputFieldNamesRule,
    ...exports.recommendedRules,
]);
exports.specifiedSDLRules = Object.freeze([
    LoneSchemaDefinitionRule_ts_1.LoneSchemaDefinitionRule,
    UniqueOperationTypesRule_ts_1.UniqueOperationTypesRule,
    UniqueTypeNamesRule_ts_1.UniqueTypeNamesRule,
    UniqueEnumValueNamesRule_ts_1.UniqueEnumValueNamesRule,
    UniqueFieldDefinitionNamesRule_ts_1.UniqueFieldDefinitionNamesRule,
    UniqueArgumentDefinitionNamesRule_ts_1.UniqueArgumentDefinitionNamesRule,
    UniqueDirectiveNamesRule_ts_1.UniqueDirectiveNamesRule,
    KnownTypeNamesRule_ts_1.KnownTypeNamesRule,
    KnownDirectivesRule_ts_1.KnownDirectivesRule,
    UniqueDirectivesPerLocationRule_ts_1.UniqueDirectivesPerLocationRule,
    PossibleTypeExtensionsRule_ts_1.PossibleTypeExtensionsRule,
    KnownArgumentNamesRule_ts_1.KnownArgumentNamesOnDirectivesRule,
    UniqueArgumentNamesRule_ts_1.UniqueArgumentNamesRule,
    UniqueInputFieldNamesRule_ts_1.UniqueInputFieldNamesRule,
    ProvidedRequiredArgumentsRule_ts_1.ProvidedRequiredArgumentsOnDirectivesRule,
]);
//# sourceMappingURL=specifiedRules.js.map