// a node of the tree that graphql's parser builds (graphql/language/ast.d.ts), which it writes out as an object with
// what its kind has: one record type for every kind, as code reads them by their kind
export type GraphqlAstNode = {
  alias?: any;
  argumentName?: any;
  arguments?: any;
  block?: any;
  defaultValue?: any;
  definitions?: any;
  description?: any;
  directives?: any;
  fieldName?: any;
  fields?: any;
  interfaces?: any;
  kind?: any;
  loc?: any;
  locations?: any;
  memberName?: any;
  name?: any;
  operation?: any;
  operationTypes?: any;
  repeatable?: any;
  selectionSet?: any;
  selections?: any;
  tokenCount?: any;
  typeCondition?: any;
  types?: any;
  value?: any;
  values?: any;
  variable?: any;
  variableDefinitions?: any;
};
