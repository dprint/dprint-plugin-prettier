// @nts-check
'use strict';
/** @typedef {import("./FlowParserDeserializer.js").default} FlowParserDeserializer */

module.exports = [/** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EmptyStatement',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExpressionStatement',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    directive: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BlockStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'IfStatement',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNode(),
    alternate: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'LabeledStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BreakStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ContinueStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'WithStatement',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SwitchStatement',
    loc: this.addEmptyLoc(),
    discriminant: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ReturnStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ThrowStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TryStatement',
    loc: this.addEmptyLoc(),
    block: this.deserializeNode(),
    handler: this.deserializeNode(),
    finalizer: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'WhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DoWhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ForStatement',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    test: this.deserializeNode(),
    update: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ForInStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ForOfStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode(),
    await: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DebuggerStatement',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'VariableDeclaration',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString(),
    declarations: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'VariableDeclarator',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ClassDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    superClass: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    body: this.deserializeNode(),
    superTypeArguments: this.deserializeNode(),
    decorators: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ComponentDeclaration',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    rendersType: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    async: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InterfaceDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeAlias',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportDeclaration',
    loc: this.addEmptyLoc(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    importKind: this.deserializeString(),
    attributes: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportDefaultSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportSpecifier',
    loc: this.addEmptyLoc(),
    imported: this.deserializeNode(),
    local: this.deserializeNode(),
    importKind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportAttribute',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportEqualsDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    moduleReference: this.deserializeNode(),
    importKind: this.deserializeString(),
    isExport: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExternalModuleReference',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportNamedDeclaration',
    loc: this.addEmptyLoc(),
    declaration: this.deserializeNode(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    exportKind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportDefaultDeclaration',
    loc: this.addEmptyLoc(),
    declaration: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportAllDeclaration',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    exported: this.deserializeNode(),
    exportKind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode(),
    local: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExportAssignment',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ThisExpression',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'Super',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ArrayExpression',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    trailingComma: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectExpression',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ArrowFunctionExpression',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    async: this.deserializeBoolean(),
    id: this.deserializeNode(),
    predicate: this.deserializeNode(),
    expression: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SequenceExpression',
    loc: this.addEmptyLoc(),
    expressions: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'UnaryExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BinaryExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'LogicalExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ConditionalExpression',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    alternate: this.deserializeNode(),
    consequent: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'UpdateExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AssignmentExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'OptionalMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'CallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'OptionalCallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NewExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'YieldExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    delegate: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AwaitExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportExpression',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    options: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MetaProperty',
    loc: this.addEmptyLoc(),
    meta: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TaggedTemplateExpression',
    loc: this.addEmptyLoc(),
    tag: this.deserializeNode(),
    quasi: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TemplateLiteral',
    loc: this.addEmptyLoc(),
    quasis: this.deserializeNodeList(),
    expressions: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TemplateElement',
    loc: this.addEmptyLoc(),
    tail: this.deserializeBoolean(),
    value: {
      cooked: this.deserializeString(),
      raw: this.deserializeString()
    }
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeCastExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AsExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SatisfiesExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AsConstExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NonNullExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    chain: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordExpression',
    loc: this.addEmptyLoc(),
    recordConstructor: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    properties: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordExpressionProperties',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'Identifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'PrivateIdentifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ArrayPattern',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RestElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AssignmentPattern',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SpreadElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ClassExpression',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    superClass: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    body: this.deserializeNode(),
    superTypeArguments: this.deserializeNode(),
    decorators: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ClassBody',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ClassImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'StaticBlock',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'Decorator',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareMethodDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    computed: this.deserializeBoolean(),
    kind: this.deserializeString(),
    override: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AbstractMethodDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    override: this.deserializeBoolean(),
    tsAccessibility: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AbstractPropertyDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    override: this.deserializeBoolean(),
    tsAccessibility: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SwitchCase',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'CatchClause',
    loc: this.addEmptyLoc(),
    param: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ComponentParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    local: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareVariable',
    loc: this.addEmptyLoc(),
    declarations: this.deserializeNodeList(),
    kind: this.deserializeString(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareFunction',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean(),
    predicate: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareClass',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    implements: this.deserializeNodeList(),
    mixins: this.deserializeNodeList(),
    body: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareComponent',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    rendersType: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareHook',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareModule',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareModuleExports',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareExportDeclaration',
    loc: this.addEmptyLoc(),
    default: this.deserializeBoolean(),
    declaration: this.deserializeNode(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareExportAllDeclaration',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareNamespace',
    loc: this.addEmptyLoc(),
    global: this.deserializeBoolean(),
    id: this.deserializeNode(),
    body: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean(),
    keyword: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareInterface',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    body: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareTypeAlias',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    right: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareEnum',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'Variance',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'AnyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MixedTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EmptyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'VoidTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NullLiteralTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'SymbolTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NumberTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BigIntTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'StringTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BooleanTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NullableTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ArrayTypeAnnotation',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'IndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'OptionalIndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'UnionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'IntersectionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'KeyofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeOperator',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'StringLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NumberLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeNumber(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'BooleanLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ExistsTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'UnknownTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NeverTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'UndefinedTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'GenericTypeAnnotation',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'QualifiedTypeIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'QualifiedTypeofIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ImportType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TupleTypeAnnotation',
    loc: this.addEmptyLoc(),
    elementTypes: this.deserializeNodeList(),
    inexact: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TupleTypeLabeledElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    elementType: this.deserializeNode(),
    variance: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TupleTypeSpreadElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    method: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    proto: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeSpreadProperty',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeIndexer',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean(),
    variance: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeCallProperty',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeMappedTypeProperty',
    loc: this.addEmptyLoc(),
    keyTparam: this.deserializeNode(),
    propType: this.deserializeNode(),
    sourceType: this.deserializeNode(),
    variance: this.deserializeNode(),
    optional: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypeInternalSlot',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    optional: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    method: this.deserializeBoolean(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'FunctionTypeParam',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypePredicate',
    loc: this.addEmptyLoc(),
    parameterName: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ConditionalTypeAnnotation',
    loc: this.addEmptyLoc(),
    checkType: this.deserializeNode(),
    extendsType: this.deserializeNode(),
    trueType: this.deserializeNode(),
    falseType: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InferTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeParameter: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InterfaceExtends',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InterfaceTypeAnnotation',
    loc: this.addEmptyLoc(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeParameterDeclaration',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TypeParameterInstantiation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ComponentTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    rendersType: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ComponentTypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclaredPredicate',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InferredPredicate',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXElement',
    loc: this.addEmptyLoc(),
    openingElement: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingElement: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXFragment',
    loc: this.addEmptyLoc(),
    openingFragment: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingFragment: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXOpeningElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    attributes: this.deserializeNodeList(),
    selfClosing: this.deserializeBoolean(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXOpeningFragment',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXClosingElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXClosingFragment',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXAttribute',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXSpreadAttribute',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXEmptyExpression',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXExpressionContainer',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXSpreadChild',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXText',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXNamespacedName',
    loc: this.addEmptyLoc(),
    namespace: this.deserializeNode(),
    name: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'JSXIdentifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumBooleanBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumBooleanMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumNumberBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumNumberMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumStringBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumStringMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumSymbolBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumDefaultedMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumBigIntBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumBigIntMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordDeclarationBody',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordDeclarationProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    defaultValue: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordDeclarationStaticProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    value: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RecordDeclarationImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchExpressionCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchStatementCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchWildcardPattern',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchLiteralPattern',
    loc: this.addEmptyLoc(),
    literal: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchUnaryPattern',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchInstancePattern',
    loc: this.addEmptyLoc(),
    targetConstructor: this.deserializeNode(),
    properties: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchInstanceObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchOrPattern',
    loc: this.addEmptyLoc(),
    patterns: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchAsPattern',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    target: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchIdentifierPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchMemberPattern',
    loc: this.addEmptyLoc(),
    base: this.deserializeNode(),
    property: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchBindingPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    kind: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchArrayPattern',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchObjectPatternProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    pattern: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'MatchRestPattern',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'Program',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'InterpreterDirective',
    loc: this.addEmptyLoc(),
    value: this.deserializeString()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'FunctionTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    this: this.deserializeNode(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RendersType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RendersMaybeType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'RendersStarType',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TemplateLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    quasis: this.deserializeNodeList(),
    types: this.deserializeNodeList()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'NamespaceExportDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareClassExtendsCall',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    argument: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
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
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareOpaqueType',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    impltype: this.deserializeNode(),
    lowerBound: this.deserializeNode(),
    upperBound: this.deserializeNode(),
    supertype: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'EnumBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeString(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'HookTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ConstructorTypeAnnotation',
    loc: this.addEmptyLoc(),
    abstract: this.deserializeBoolean(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ObjectTypePrivateField',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'TupleTypeElement',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'DeclareComponent',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    id: this.deserializeNode(),
    implicitDeclare: this.deserializeBoolean(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    rendersType: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    async: this.deserializeBoolean()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ThisTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}, /** @this {FlowParserDeserializer} */ function () {
  return {
    type: 'ChainExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}];