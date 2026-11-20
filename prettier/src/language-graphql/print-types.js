// @nts-check
// the types of what prettier's graphql printer reads, for nts

/**
 * A node of graphql's tree as the printer reads it, which graphql's parser writes out as objects of a shape that
 * depends on the kind of node
 * @typedef {{
 *   kind: string,
 *   value?: any,
 *   block?: boolean,
 *   repeatable?: boolean,
 *   operation?: string,
 *   name?: any,
 *   alias?: any,
 *   type?: any,
 *   typeCondition?: any,
 *   selectionSet?: any,
 *   defaultValue?: any,
 *   description?: any,
 *   loc?: any,
 *   arguments?: any[],
 *   directives?: any[],
 *   values?: any[],
 *   fields?: any[],
 *   types?: any[],
 *   interfaces?: any[],
 *   operationTypes?: any[],
 *   variableDefinitions?: any[],
 *   definitions?: any[],
 *   selections?: any[],
 *   locations?: any[],
 *   comments?: any[],
 * }} GraphqlNode
 */

/**
 * The options that the graphql printer reads
 * @typedef {{
 *   bracketSpacing: boolean,
 *   originalText: string,
 * }} GraphqlOptions
 */

/** @typedef {(selector?: any, args?: any) => any} GraphqlPrint */

export {};
