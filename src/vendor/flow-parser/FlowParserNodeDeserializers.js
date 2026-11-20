// @nts-check
'use strict';
/** @typedef {import("./FlowParserDeserializer.js").default} FlowParserDeserializer */
/** @typedef {{ type: string, loc: any, [key: string]: any }} FlowNode */

module.exports = [/** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EmptyStatement',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExpressionStatement',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    directive: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BlockStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'IfStatement',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNode(),
    alternate: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'LabeledStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BreakStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ContinueStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'WithStatement',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SwitchStatement',
    loc: this.addEmptyLoc(),
    discriminant: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ReturnStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ThrowStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TryStatement',
    loc: this.addEmptyLoc(),
    block: this.deserializeNode(),
    handler: this.deserializeNode(),
    finalizer: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'WhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DoWhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ForStatement',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    test: this.deserializeNode(),
    update: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ForInStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ForOfStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode(),
    await: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DebuggerStatement',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'FunctionDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    generator: this.deserializeBoolean(),
    async: this.deserializeBoolean(),
    predicate: this.deserializeNode(),
    expression: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'VariableDeclaration',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString(),
    declarations: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'VariableDeclarator',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ClassDeclaration',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.superClass = this.deserializeNode();
  node.implements = this.deserializeNodeList();
  node.body = this.deserializeNode();
  node.superTypeArguments = this.deserializeNode();
  node.decorators = this.deserializeNodeList();
  if (this.deserializeBoolean()) node['abstract'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ComponentDeclaration',
    loc: this.addEmptyLoc()
  };
  node.body = this.deserializeNode();
  node.id = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  node.params = this.deserializeNodeList();
  node.rendersType = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.async = this.deserializeBoolean();
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'HookDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    returnType: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    async: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'EnumDeclaration',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.body = this.deserializeNode();
  if (this.deserializeBoolean()) node['const'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InterfaceDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeAlias',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportDeclaration',
    loc: this.addEmptyLoc(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    importKind: this.deserializeString(),
    attributes: this.deserializeNodeList(),
    phase: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportDefaultSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportSpecifier',
    loc: this.addEmptyLoc(),
    imported: this.deserializeNode(),
    local: this.deserializeNode(),
    importKind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportAttribute',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportEqualsDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    moduleReference: this.deserializeNode(),
    importKind: this.deserializeString(),
    isExport: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExternalModuleReference',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ExportNamedDeclaration',
    loc: this.addEmptyLoc()
  };
  node.declaration = this.deserializeNode();
  node.specifiers = this.deserializeNodeList();
  node.source = this.deserializeNode();
  node.exportKind = this.deserializeString();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['attributes'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ExportDefaultDeclaration',
    loc: this.addEmptyLoc()
  };
  node.declaration = this.deserializeNode();
  {
    const value = this.deserializeString();
    if (value != null) node['exportKind'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ExportAllDeclaration',
    loc: this.addEmptyLoc()
  };
  node.source = this.deserializeNode();
  node.exported = this.deserializeNode();
  node.exportKind = this.deserializeString();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['attributes'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExportSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode(),
    local: this.deserializeNode(),
    exportKind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExportAssignment',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ThisExpression',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Super',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ArrayExpression',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    trailingComma: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectExpression',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'FunctionExpression',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    generator: this.deserializeBoolean(),
    async: this.deserializeBoolean(),
    predicate: this.deserializeNode(),
    expression: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ArrowFunctionExpression',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    generator: this.deserializeBoolean(),
    async: this.deserializeBoolean(),
    id: this.deserializeNode(),
    predicate: this.deserializeNode(),
    expression: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SequenceExpression',
    loc: this.addEmptyLoc(),
    expressions: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'UnaryExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BinaryExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'LogicalExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ConditionalExpression',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    alternate: this.deserializeNode(),
    consequent: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'UpdateExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AssignmentExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'OptionalMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'CallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'OptionalCallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NewExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'YieldExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    delegate: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AwaitExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportExpression',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    options: this.deserializeNode(),
    phase: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MetaProperty',
    loc: this.addEmptyLoc(),
    meta: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'TaggedTemplateExpression',
    loc: this.addEmptyLoc()
  };
  node.tag = this.deserializeNode();
  node.quasi = this.deserializeNode();
  if (this.deserializeBoolean()) {
    node['typeArguments'] = this.deserializeNode();
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TemplateLiteral',
    loc: this.addEmptyLoc(),
    quasis: this.deserializeNodeList(),
    expressions: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TemplateElement',
    loc: this.addEmptyLoc(),
    tail: this.deserializeBoolean(),
    value: {
      cooked: this.deserializeString(),
      raw: this.deserializeString()
    }
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeCastExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AsExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SatisfiesExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AsConstExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NonNullExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordExpression',
    loc: this.addEmptyLoc(),
    recordConstructor: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    properties: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordExpressionProperties',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const loc = this.addEmptyLoc();
  const valueKind = this.next();
  let value = null;
  if (valueKind === 1) value = this.deserializeBoolean();else if (valueKind === 2) value = this.deserializeNumber();else if (valueKind === 3) value = this.deserializeString();
  const literalType = this.deserializeString();
  const raw = this.deserializeString();
  const bigint = this.deserializeString();
  const regexPattern = this.deserializeString();
  const regexFlags = this.deserializeString();
  const node = {
    type: 'Literal',
    loc,
    value,
    raw,
    literalType
  };
  if (bigint != null) {
    node.bigint = bigint;
    try {
      node.value = typeof BigInt === 'function' ? BigInt(bigint) : null;
    } catch (e) {
      node.value = null;
    }
  }
  if (regexPattern != null) {
    const flags = regexFlags != null ? regexFlags : '';
    node.regex = {
      pattern: regexPattern,
      flags
    };
    try {
      node.value = new RegExp(regexPattern, flags);
    } catch (e) {
      node.value = null;
    }
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Identifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'PrivateIdentifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ObjectPattern',
    loc: this.addEmptyLoc()
  };
  node.properties = this.deserializeNodeList();
  node.typeAnnotation = this.deserializeNode();
  if (this.deserializeBoolean()) node['optional'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ArrayPattern',
    loc: this.addEmptyLoc()
  };
  node.elements = this.deserializeNodeList();
  node.typeAnnotation = this.deserializeNode();
  if (this.deserializeBoolean()) node['optional'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RestElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AssignmentPattern',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Property',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    kind: this.deserializeString(),
    method: this.deserializeBoolean(),
    shorthand: this.deserializeBoolean(),
    computed: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SpreadElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ClassExpression',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.superClass = this.deserializeNode();
  node.implements = this.deserializeNodeList();
  node.body = this.deserializeNode();
  node.superTypeArguments = this.deserializeNode();
  node.decorators = this.deserializeNodeList();
  if (this.deserializeBoolean()) node['abstract'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ClassBody',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ClassImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MethodDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    kind: this.deserializeString(),
    static: this.deserializeBoolean(),
    computed: this.deserializeBoolean(),
    decorators: this.deserializeNodeList(),
    override: this.deserializeBoolean(),
    tsAccessibility: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'PropertyDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    tsAccessibility: this.deserializeString(),
    declare: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    override: this.deserializeBoolean(),
    decorators: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'StaticBlock',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Decorator',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ParameterProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    tsAccessibility: this.deserializeString(),
    declare: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    decorators: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareMethodDefinition',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  node.static = this.deserializeBoolean();
  node.optional = this.deserializeBoolean();
  node.computed = this.deserializeBoolean();
  node.kind = this.deserializeString();
  node.override = this.deserializeBoolean();
  {
    const value = this.deserializeString();
    if (value != null) node['tsAccessibility'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'AbstractMethodDefinition',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  node.computed = this.deserializeBoolean();
  if (this.deserializeBoolean()) node['override'] = true;
  {
    const value = this.deserializeString();
    if (value != null) node['tsAccessibility'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'AbstractPropertyDefinition',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  node.typeAnnotation = this.deserializeNode();
  node.computed = this.deserializeBoolean();
  node.variance = this.deserializeNode();
  if (this.deserializeBoolean()) node['override'] = true;
  {
    const value = this.deserializeString();
    if (value != null) node['tsAccessibility'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SwitchCase',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'CatchClause',
    loc: this.addEmptyLoc(),
    param: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ComponentParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    local: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareVariable',
    loc: this.addEmptyLoc()
  };
  node.declarations = this.deserializeNodeList();
  node.kind = this.deserializeString();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareFunction',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  node.predicate = this.deserializeNode();
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareClass',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.extends = this.deserializeNodeList();
  node.implements = this.deserializeNodeList();
  node.mixins = this.deserializeNodeList();
  node.body = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  if (this.deserializeBoolean()) node['abstract'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareComponent',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.rest = this.deserializeNode();
  node.rendersType = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareHook',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DeclareModule',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DeclareModuleExports',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareExportDeclaration',
    loc: this.addEmptyLoc()
  };
  node.default = this.deserializeBoolean();
  node.declaration = this.deserializeNode();
  node.specifiers = this.deserializeNodeList();
  node.source = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareExportAllDeclaration',
    loc: this.addEmptyLoc()
  };
  node.source = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareNamespace',
    loc: this.addEmptyLoc()
  };
  node.global = this.deserializeBoolean();
  node.id = this.deserializeNode();
  node.body = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  node.keyword = this.deserializeString();
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareInterface',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.body = this.deserializeNode();
  node.extends = this.deserializeNodeList();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareTypeAlias',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.right = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareEnum',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.body = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  if (this.deserializeBoolean()) node['const'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Variance',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'AnyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MixedTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EmptyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'VoidTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NullLiteralTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'SymbolTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NumberTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BigIntTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'StringTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BooleanTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NullableTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ArrayTypeAnnotation',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'IndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'OptionalIndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'UnionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'IntersectionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'KeyofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeOperator',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'StringLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NumberLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeNumber(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const loc = this.addEmptyLoc();
  this.deserializeNode();
  const raw = this.deserializeString();
  const bigint = this.deserializeString();
  let value = null;
  if (bigint != null && typeof BigInt === 'function') {
    try {
      value = BigInt(bigint);
    } catch (e) {
      value = null;
    }
  }
  return {
    type: 'BigIntLiteralTypeAnnotation',
    loc,
    value,
    raw,
    bigint
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'BooleanLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ExistsTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'UnknownTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NeverTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'UndefinedTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'GenericTypeAnnotation',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'QualifiedTypeIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'QualifiedTypeofIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'TypeofTypeAnnotation',
    loc: this.addEmptyLoc()
  };
  node.argument = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeArguments'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ImportType',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TupleTypeAnnotation',
    loc: this.addEmptyLoc(),
    elementTypes: this.deserializeNodeList(),
    inexact: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TupleTypeLabeledElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    elementType: this.deserializeNode(),
    variance: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TupleTypeSpreadElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeAnnotation',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    indexers: this.deserializeNodeList(),
    callProperties: this.deserializeNodeList(),
    internalSlots: this.deserializeNodeList(),
    inexact: this.deserializeBoolean(),
    exact: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'ObjectTypeProperty',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  node.method = this.deserializeBoolean();
  node.optional = this.deserializeBoolean();
  node.static = this.deserializeBoolean();
  node.proto = this.deserializeBoolean();
  node.variance = this.deserializeNode();
  node.kind = this.deserializeString();
  if (this.deserializeBoolean()) node['computed'] = true;
  if (this.deserializeBoolean()) node['abstract'] = true;
  if (this.deserializeBoolean()) node['override'] = true;
  {
    const value = this.deserializeString();
    if (value != null) node['tsAccessibility'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['init'] = value;
  }
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeSpreadProperty',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeIndexer',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeCallProperty',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeMappedTypeProperty',
    loc: this.addEmptyLoc(),
    keyTparam: this.deserializeNode(),
    propType: this.deserializeNode(),
    sourceType: this.deserializeNode(),
    nameType: this.deserializeNode(),
    variance: this.deserializeNode(),
    varianceOp: this.deserializeString(),
    optional: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypeInternalSlot',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    optional: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    method: this.deserializeBoolean(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'FunctionTypeParam',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypePredicate',
    loc: this.addEmptyLoc(),
    parameterName: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ConditionalTypeAnnotation',
    loc: this.addEmptyLoc(),
    checkType: this.deserializeNode(),
    extendsType: this.deserializeNode(),
    trueType: this.deserializeNode(),
    falseType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InferTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeParameter: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InterfaceExtends',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InterfaceTypeAnnotation',
    loc: this.addEmptyLoc(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeParameterDeclaration',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    const: this.deserializeBoolean(),
    bound: this.deserializeNode(),
    variance: this.deserializeNode(),
    default: this.deserializeNode(),
    usesExtendsBound: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TypeParameterInstantiation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ComponentTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    rendersType: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ComponentTypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DeclaredPredicate',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InferredPredicate',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXElement',
    loc: this.addEmptyLoc(),
    openingElement: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingElement: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXFragment',
    loc: this.addEmptyLoc(),
    openingFragment: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingFragment: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXOpeningElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    attributes: this.deserializeNodeList(),
    selfClosing: this.deserializeBoolean(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXOpeningFragment',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXClosingElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXClosingFragment',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXAttribute',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXSpreadAttribute',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXEmptyExpression',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXExpressionContainer',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXSpreadChild',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXText',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXNamespacedName',
    loc: this.addEmptyLoc(),
    namespace: this.deserializeNode(),
    name: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'JSXIdentifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumBooleanBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumBooleanMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumNumberBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumNumberMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumStringBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumStringMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumSymbolBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumDefaultedMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumBigIntBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumBigIntMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordDeclarationBody',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordDeclarationProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    defaultValue: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordDeclarationStaticProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RecordDeclarationImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchExpressionCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchStatementCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchWildcardPattern',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchLiteralPattern',
    loc: this.addEmptyLoc(),
    literal: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchUnaryPattern',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchInstancePattern',
    loc: this.addEmptyLoc(),
    targetConstructor: this.deserializeNode(),
    properties: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchInstanceObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchOrPattern',
    loc: this.addEmptyLoc(),
    patterns: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchAsPattern',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    target: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchIdentifierPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchMemberPattern',
    loc: this.addEmptyLoc(),
    base: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchBindingPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchArrayPattern',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchObjectPatternProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    pattern: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'MatchRestPattern',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'Program',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'InterpreterDirective',
    loc: this.addEmptyLoc(),
    value: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'FunctionTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    this: this.deserializeNode(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RendersType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RendersMaybeType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'RendersStarType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TemplateLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    quasis: this.deserializeNodeList(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'NamespaceExportDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'DeclareClassExtendsCall',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'OpaqueType',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    impltype: this.deserializeNode(),
    lowerBound: this.deserializeNode(),
    upperBound: this.deserializeNode(),
    supertype: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareOpaqueType',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.impltype = this.deserializeNode();
  node.lowerBound = this.deserializeNode();
  node.upperBound = this.deserializeNode();
  node.supertype = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'EnumBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeString(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'HookTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ConstructorTypeAnnotation',
    loc: this.addEmptyLoc(),
    abstract: this.deserializeBoolean(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ObjectTypePrivateField',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'TupleTypeElement',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  const node = {
    type: 'DeclareComponent',
    loc: this.addEmptyLoc()
  };
  node.body = this.deserializeNode();
  node.id = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  node.params = this.deserializeNodeList();
  node.rest = this.deserializeNode();
  node.rendersType = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.async = this.deserializeBoolean();
  return node;
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ThisTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} @returns {FlowNode} */ function () {
  return {
    type: 'ChainExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, function () {
  return {
    type: 'ExpressionStatement',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, function () {
  return {
    type: 'BlockStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList(),
    directives: this.deserializeNodeList()
  };
}, function () {
  return {
    type: 'Directive',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode()
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeString();
  const rawValue = this.deserializeString();
  const raw = this.deserializeString();
  return {
    type: 'DirectiveLiteral',
    loc,
    value,
    extra: {
      rawValue,
      raw
    }
  };
}, function () {
  return {
    type: 'ObjectProperty',
    loc: this.addEmptyLoc(),
    computed: this.deserializeBoolean(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    method: this.deserializeBoolean(),
    shorthand: this.deserializeBoolean()
  };
}, function () {
  const node = {
    type: 'ObjectMethod',
    loc: this.addEmptyLoc()
  };
  node.kind = this.deserializeString();
  node.method = this.deserializeBoolean();
  node.computed = this.deserializeBoolean();
  node.key = this.deserializeNode();
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  node.async = this.deserializeBoolean();
  node.generator = this.deserializeBoolean();
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  if (this.deserializeBoolean()) {
    node['variance'] = this.deserializeNode();
  }
  return node;
}, function () {
  const node = {
    type: 'ClassMethod',
    loc: this.addEmptyLoc()
  };
  node.kind = this.deserializeString();
  node.computed = this.deserializeBoolean();
  node.static = this.deserializeBoolean();
  node.key = this.deserializeNode();
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  node.async = this.deserializeBoolean();
  node.generator = this.deserializeBoolean();
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['predicate'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'ClassPrivateMethod',
    loc: this.addEmptyLoc()
  };
  node.kind = this.deserializeString();
  node.static = this.deserializeBoolean();
  node.key = this.deserializeNode();
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  node.async = this.deserializeBoolean();
  node.generator = this.deserializeBoolean();
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['predicate'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'ClassProperty',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  node.static = this.deserializeBoolean();
  node.variance = this.deserializeNode();
  if (this.deserializeBoolean()) node['declare'] = true;
  if (this.deserializeBoolean()) node['optional'] = true;
  node.computed = this.deserializeBoolean();
  return node;
}, function () {
  const node = {
    type: 'ClassPrivateProperty',
    loc: this.addEmptyLoc()
  };
  node.key = this.deserializeNode();
  node.value = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  node.static = this.deserializeBoolean();
  node.variance = this.deserializeNode();
  return node;
}, function () {
  return {
    type: 'PrivateName',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeString();
  const rawValue = value;
  const raw = this.deserializeString();
  return {
    type: 'StringLiteral',
    loc,
    value,
    extra: {
      rawValue,
      raw
    }
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeNumber();
  const raw = this.deserializeString();
  return {
    type: 'NumericLiteral',
    loc,
    value,
    extra: {
      rawValue: value,
      raw
    }
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeString();
  const rawValue = value;
  const raw = this.deserializeString();
  return {
    type: 'BigIntLiteral',
    loc,
    value,
    extra: {
      rawValue,
      raw
    }
  };
}, function () {
  return {
    type: 'BooleanLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean()
  };
}, function () {
  return {
    type: 'NullLiteral',
    loc: this.addEmptyLoc()
  };
}, function () {
  const loc = this.addEmptyLoc();
  const raw = this.deserializeString();
  const pattern = this.deserializeString();
  const flags = this.deserializeString();
  return {
    type: 'RegExpLiteral',
    loc,
    extra: {
      raw
    },
    pattern,
    flags
  };
}, function () {
  return {
    type: 'Import',
    loc: this.addEmptyLoc()
  };
}, function () {
  return {
    type: 'TupleTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeString();
  const rawValue = value;
  const raw = this.deserializeString();
  return {
    type: 'StringLiteralTypeAnnotation',
    loc,
    value,
    extra: {
      rawValue,
      raw
    }
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeNumber();
  const raw = this.deserializeString();
  return {
    type: 'NumberLiteralTypeAnnotation',
    loc,
    value,
    extra: {
      rawValue: value,
      raw
    }
  };
}, function () {
  const loc = this.addEmptyLoc();
  const bigint = this.deserializeString();
  const raw = this.deserializeString();
  let value = null;
  if (bigint != null && typeof BigInt === 'function') {
    try {
      value = BigInt(bigint);
    } catch (error) {
      value = null;
    }
  }
  return {
    type: 'BigIntLiteralTypeAnnotation',
    loc,
    value,
    extra: {
      rawValue: bigint,
      raw
    }
  };
}, function () {
  return {
    type: 'BooleanLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean()
  };
}, function () {
  const loc = this.addEmptyLoc();
  const value = this.deserializeString();
  const rawValue = value;
  const raw = this.deserializeString();
  return {
    type: 'JSXText',
    loc,
    value,
    extra: {
      rawValue,
      raw
    }
  };
}, function () {
  const node = {
    type: 'ClassDeclaration',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  node.superClass = this.deserializeNode();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['implements'] = value;
  }
  node.body = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['superTypeParameters'] = value;
  }
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['decorators'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'ClassExpression',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  node.superClass = this.deserializeNode();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['implements'] = value;
  }
  node.body = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['superTypeParameters'] = value;
  }
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['decorators'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'FunctionDeclaration',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  node.generator = this.deserializeBoolean();
  node.async = this.deserializeBoolean();
  {
    const value = this.deserializeNode();
    if (value != null) node['predicate'] = value;
  }
  if (this.deserializeBoolean()) node['__componentDeclaration'] = true;
  if (this.deserializeBoolean()) node['__hookDeclaration'] = true;
  return node;
}, function () {
  const node = {
    type: 'FunctionExpression',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  node.generator = this.deserializeBoolean();
  node.async = this.deserializeBoolean();
  {
    const value = this.deserializeNode();
    if (value != null) node['predicate'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'ArrowFunctionExpression',
    loc: this.addEmptyLoc()
  };
  node.params = this.deserializeNodeList();
  node.body = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeParameters'] = value;
  }
  {
    const value = this.deserializeNode();
    if (value != null) node['returnType'] = value;
  }
  node.async = this.deserializeBoolean();
  node.id = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['predicate'] = value;
  }
  return node;
}, function () {
  return {
    type: 'MemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean()
  };
}, function () {
  return {
    type: 'ArrayExpression',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList()
  };
}, function () {
  const node = {
    type: 'RestElement',
    loc: this.addEmptyLoc()
  };
  node.argument = this.deserializeNode();
  if (this.deserializeBoolean()) {
    node['typeAnnotation'] = this.deserializeNode();
  }
  return node;
}, function () {
  return {
    type: 'OpaqueType',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    impltype: this.deserializeNode(),
    supertype: this.deserializeNode()
  };
}, function () {
  const node = {
    type: 'DeclareOpaqueType',
    loc: this.addEmptyLoc()
  };
  node.id = this.deserializeNode();
  node.typeParameters = this.deserializeNode();
  node.impltype = this.deserializeNode();
  node.supertype = this.deserializeNode();
  if (this.deserializeBoolean()) node['implicitDeclare'] = true;
  return node;
}, function () {
  const node = {
    type: 'ExportAllDeclaration',
    loc: this.addEmptyLoc()
  };
  node.source = this.deserializeNode();
  node.exportKind = this.deserializeString();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['attributes'] = value;
  }
  return node;
}, function () {
  return {
    type: 'DeclareVariable',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, function () {
  const node = {
    type: 'Identifier',
    loc: this.addEmptyLoc()
  };
  node.name = this.deserializeString();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  if (this.deserializeBoolean()) node['optional'] = true;
  return node;
}, function () {
  const node = {
    type: 'ObjectPattern',
    loc: this.addEmptyLoc()
  };
  node.properties = this.deserializeNodeList();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  if (this.deserializeBoolean()) {
    node['optional'] = this.deserializeBoolean();
  }
  return node;
}, function () {
  const node = {
    type: 'ArrayPattern',
    loc: this.addEmptyLoc()
  };
  node.elements = this.deserializeNodeList();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeAnnotation'] = value;
  }
  if (this.deserializeBoolean()) {
    node['optional'] = this.deserializeBoolean();
  }
  return node;
}, function () {
  const node = {
    type: 'CallExpression',
    loc: this.addEmptyLoc()
  };
  node.callee = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeArguments'] = value;
  }
  node.arguments = this.deserializeNodeList();
  if (this.deserializeBoolean()) node['optional'] = true;
  return node;
}, function () {
  const node = {
    type: 'OptionalCallExpression',
    loc: this.addEmptyLoc()
  };
  node.callee = this.deserializeNode();
  {
    const value = this.deserializeNode();
    if (value != null) node['typeArguments'] = value;
  }
  node.arguments = this.deserializeNodeList();
  node.optional = this.deserializeBoolean();
  return node;
}, function () {
  const node = {
    type: 'ImportDeclaration',
    loc: this.addEmptyLoc()
  };
  node.specifiers = this.deserializeNodeList();
  node.source = this.deserializeNode();
  node.importKind = this.deserializeString();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['attributes'] = value;
  }
  {
    const value = this.deserializeString();
    if (value != null) node['phase'] = value;
  }
  return node;
}, function () {
  const node = {
    type: 'ExportNamedDeclaration',
    loc: this.addEmptyLoc()
  };
  {
    const value = this.deserializeNode();
    if (value != null) node['declaration'] = value;
  }
  node.specifiers = this.deserializeNodeList();
  node.source = this.deserializeNode();
  node.exportKind = this.deserializeString();
  {
    const value = this.deserializeNodeList();
    if (value.length > 0) node['attributes'] = value;
  }
  return node;
}, function () {
  return {
    type: 'JSXOpeningElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    attributes: this.deserializeNodeList(),
    selfClosing: this.deserializeBoolean()
  };
}, function () {
  return {
    type: 'TypeofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, function () {
  this.addEmptyLoc();
  return this.deserializeEnumRuntime();
}, function () {
  return {
    type: 'Program',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList(),
    directives: this.deserializeNodeList(),
    sourceType: this.deserializeString(),
    interpreter: this.deserializeNode()
  };
}, function () {
  return {
    type: 'File',
    loc: this.addEmptyLoc(),
    program: this.deserializeNode(),
    comments: this.deserializeComments()
  };
}, function () {
  return {
    type: 'GenericTypeAnnotation',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, function () {
  return {
    type: 'InterfaceExtends',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, function () {
  return {
    type: 'ClassImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}];