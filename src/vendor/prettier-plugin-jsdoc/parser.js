// @nts-check
import { parse, tokenizers } from "comment-parser";
import { addStarsToTheBeginningOfTheLines, convertToModernType, formatType, detectEndOfLine, findPluginByParser, isDefaultTag, } from "./utils.js";
import { DESCRIPTION, PARAM, RETURNS, EXAMPLE, IMPORT } from "./tags.js";
import { TAGS_DESCRIPTION_NEEDED, TAGS_GROUP_HEAD, TAGS_GROUP_CONDITION, TAGS_NAMELESS, TAGS_ORDER, TAGS_SYNONYMS, TAGS_TYPELESS, TAGS_VERTICALLY_ALIGN_ABLE, } from "./roles.js";
import { stringify } from "./stringify.js";
import { SPACE_TAG_DATA } from "./tags.js";
const { name: nameTokenizer, tag: tagTokenizer, type: typeTokenizer, description: descriptionTokenizer, } = tokenizers;
export const getParser = (originalParse, /** @type {string | undefined} */ parserName) => async function jsdocParser(/** @type {string} */ text, parsersOrOptions, maybeOptions) {
    let options = (maybeOptions ?? parsersOrOptions);
    const prettierParse = findPluginByParser(parserName, options)?.parse || originalParse;
    const ast = (await prettierParse(text, options));
    options = {
        ...options,
        printWidth: options.jsdocPrintWidth ?? options.printWidth,
        jsdocEmptyCommentStrategy: options.jsdocEmptyCommentStrategy ?? "remove",
    };
    const eol = options.endOfLine === "auto" ? detectEndOfLine(text) : options.endOfLine;
    options = { ...options, endOfLine: "lf" };
    if (!ast.comments) {
        ast.comments = [];
    }
    await Promise.all(ast.comments.map(async (comment) => {
        if (!isBlockComment(comment))
            return;
        const paramsOrder = getParamsOrders(text, comment);
        const originalValue = comment.value;
        comment.value = comment.value.replace(/^([*]+)/g, "*");
        const commentString = `/*${comment.value.replace(/\r\n?/g, "\n")}*/`;
        if (!/^\/\*\*[\s\S]+?\*\/$/.test(commentString))
            return;
        const parsed = parse(commentString, {
            spacing: "preserve",
            tokenizers: [
                tagTokenizer(),
                (spec) => {
                    if (isDefaultTag(spec.tag)) {
                        return spec;
                    }
                    return typeTokenizer("preserve")(spec);
                },
                nameTokenizer(),
                descriptionTokenizer("preserve"),
            ],
        })[0];
        comment.value = "";
        if (!parsed) {
            return;
        }
        normalizeTags(parsed);
        convertCommentDescToDescTag(parsed);
        const commentContentPrintWidth = getIndentationWidth(comment, text, options);
        let maxTagTitleLength = 0;
        let maxTagTypeLength = 0;
        let maxTagNameLength = 0;
        let tags = parsed.tags
            .map(({ type, optional, ...rest }) => {
            if (type) {
                type = type.replace(/[=]$/, /** @returns {string} */ () => {
                    optional = true;
                    return "";
                });
                type = convertToModernType(type);
            }
            return {
                ...rest,
                type,
                optional,
            };
        });
        tags = sortTags(tags, paramsOrder, options);
        if (options.jsdocSeparateReturnsFromParam) {
            tags = tags.flatMap((tag, index) => {
                if (tag.tag === RETURNS && tags[index - 1]?.tag === PARAM) {
                    return [SPACE_TAG_DATA, tag];
                }
                return [tag];
            });
        }
        if (options.jsdocAddDefaultToDescription) {
            tags = tags.map(addDefaultValueToDescription);
        }
        tags = await Promise.all(tags
            .map(assignOptionalAndDefaultToName)
            .map(async ({ type, ...rest }) => {
            if (type) {
                type = await formatType(type, {
                    ...options,
                    printWidth: commentContentPrintWidth,
                });
            }
            return {
                ...rest,
                type,
            };
        })).then((formattedTags) => formattedTags.map(({ type, name, description, tag, ...rest }) => {
            const isVerticallyAlignAbleTags = TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);
            if (isVerticallyAlignAbleTags) {
                maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
                maxTagTypeLength = Math.max(maxTagTypeLength, type.length);
                maxTagNameLength = Math.max(maxTagNameLength, name.length);
            }
            return {
                type,
                name,
                description,
                tag,
                ...rest,
            };
        }));
        if (options.jsdocSeparateTagGroups) {
            tags = tags.flatMap((tag, index) => {
                const prevTag = tags[index - 1];
                if (prevTag &&
                    prevTag.tag !== DESCRIPTION &&
                    prevTag.tag !== EXAMPLE &&
                    prevTag.tag !== SPACE_TAG_DATA.tag &&
                    tag.tag !== SPACE_TAG_DATA.tag &&
                    prevTag.tag !== tag.tag) {
                    return [SPACE_TAG_DATA, tag];
                }
                return [tag];
            });
        }
        const filteredTags = tags.filter(/** @returns {boolean} */ ({ description, tag }) => {
            if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
                return false;
            }
            return true;
        });
        for (const [tagIndex, tagData] of filteredTags.entries()) {
            const formattedTag = await stringify(tagData, tagIndex, filteredTags, { ...options, printWidth: commentContentPrintWidth }, maxTagTitleLength, maxTagTypeLength, maxTagNameLength);
            comment.value += formattedTag;
        }
        comment.value = comment.value.trimEnd();
        if (comment.value) {
            comment.value = addStarsToTheBeginningOfTheLines(originalValue, comment.value, options);
        }
        if (eol === "cr") {
            comment.value = comment.value.replace(/\n/g, "\r");
        }
        else if (eol === "crlf") {
            comment.value = comment.value.replace(/\n/g, "\r\n");
        }
    }));
    if (options.jsdocEmptyCommentStrategy === "remove") {
        ast.comments = ast.comments.filter(/** @returns {boolean} */ (comment) => !(isBlockComment(comment) && !comment.value));
    }
    return ast;
};
function sortTags(tags, paramsOrder, options) {
    let canGroupNextTags = false;
    let shouldSortAgain = false;
    const importDetailsBySource = {};
    const importSourceByDescription = {};
    const tagGroups = tags.reduce((tagGroups, cur) => {
        if (tagGroups.length === 0 ||
            (TAGS_GROUP_HEAD.includes(cur.tag) && canGroupNextTags)) {
            canGroupNextTags = false;
            tagGroups.push([]);
        }
        if (TAGS_GROUP_CONDITION.includes(cur.tag)) {
            canGroupNextTags = true;
        }
        if (options.jsdocFormatImports && cur.tag === IMPORT) {
            const importDetails = getImportDetails(cur);
            if (importDetails) {
                if (options.jsdocMergeImports) {
                    const existingImport = importDetailsBySource[importDetails.src];
                    if (existingImport) {
                        importDetailsBySource[importDetails.src].push(importDetails);
                        return tagGroups;
                    }
                    importDetailsBySource[importDetails.src] = [importDetails];
                }
                else {
                    writeImportDetailsToSpec(importDetails, options);
                    importSourceByDescription[importDetails.spec.description] =
                        importDetails.src;
                }
            }
        }
        tagGroups[tagGroups.length - 1].push(cur);
        return tagGroups;
    }, []);
    if (options.jsdocFormatImports && options.jsdocMergeImports) {
        Object.keys(importDetailsBySource).forEach((src) => {
            const importDetails = importDetailsBySource[src];
            const firstImpSpec = importDetails[0].spec;
            const { defaultImport, namedImports } = importDetails.reduce((prev, curr) => {
                prev.namedImports.push(...curr.namedImports);
                if (curr.defaultImport)
                    prev.defaultImport = curr.defaultImport;
                return prev;
            }, { namedImports: [], defaultImport: undefined });
            writeImportDetailsToSpec({ src, defaultImport, namedImports, spec: firstImpSpec }, options);
            importSourceByDescription[firstImpSpec.description] = src;
        });
    }
    tags = tagGroups.flatMap((tagGroup, index, array) => {
        tagGroup.sort(/** @returns {number} */ (a, b) => {
            if (paramsOrder &&
                paramsOrder.length > 1 &&
                a.tag === PARAM &&
                b.tag === PARAM) {
                const aIndex = paramsOrder.indexOf(a.name);
                const bIndex = paramsOrder.indexOf(b.name);
                if (aIndex > -1 && bIndex > -1) {
                    return aIndex - bIndex;
                }
                return 0;
            }
            if (options.jsdocFormatImports && a.tag === IMPORT && b.tag === IMPORT) {
                const aSrc = importSourceByDescription[a.description] ?? a.description;
                const bSrc = importSourceByDescription[b.description] ?? a.description;
                const aVal = aSrc.startsWith(".") ? 1 : 0;
                const bVal = bSrc.startsWith(".") ? 1 : 0;
                if (aVal === bVal)
                    return aSrc.localeCompare(bSrc);
                return aVal - bVal;
            }
            return (getTagOrderWeight(a.tag, options) - getTagOrderWeight(b.tag, options));
        });
        if (array.length - 1 !== index) {
            tagGroup.push(SPACE_TAG_DATA);
        }
        if (index > 0 &&
            tagGroup[0]?.tag &&
            !TAGS_GROUP_HEAD.includes(tagGroup[0].tag)) {
            shouldSortAgain = true;
        }
        return tagGroup;
    });
    return shouldSortAgain ? sortTags(tags, paramsOrder, options) : tags;
}
/** @returns {number} */ function getTagOrderWeight(/** @type {string} */ tag, options) {
    if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
        return -1;
    }
    let index;
    if (options.jsdocTagsOrder?.[tag] !== undefined) {
        index = options.jsdocTagsOrder[tag];
    }
    else {
        index = TAGS_ORDER[tag];
    }
    return index === undefined ? TAGS_ORDER.other : index;
}
/** @returns {boolean} */ function isBlockComment(comment) {
    return comment.type === "CommentBlock" || comment.type === "Block";
}
/** @returns {number} */ function getIndentationWidth(comment, /** @type {string} */ text, options) {
    const line = text.split(/\r\n?|\n/g)[comment.loc.start.line - 1];
    let spaces = 0;
    let tabs = 0;
    for (let i = comment.loc.start.column - 1; i >= 0; i--) {
        const c = line[i];
        if (c === " ") {
            spaces++;
        }
        else if (c === "\t") {
            tabs++;
        }
        else {
            break;
        }
    }
    return options.printWidth - (spaces + tabs * options.tabWidth) - " * ".length;
}
const TAGS_ORDER_ENTRIES = Object.entries(TAGS_ORDER);
function normalizeTags(parsed) {
    parsed.tags = parsed.tags.map(({ tag, type, name, description, default: _default, ...rest }) => {
        tag = tag || "";
        type = type || "";
        name = name || "";
        description = description || "";
        _default = _default?.trim();
        const tagSticksToType = tag.indexOf("{");
        if (tagSticksToType !== -1 && tag[tag.length - 1] === "}") {
            type = tag.slice(tagSticksToType + 1, -1) + " " + type;
            tag = tag.slice(0, tagSticksToType);
        }
        tag = tag.trim();
        const lower = tag.toLowerCase();
        const tagIndex = TAGS_ORDER_ENTRIES.findIndex(/** @returns {boolean} */ ([key]) => key.toLowerCase() === lower);
        if (tagIndex >= 0) {
            tag = TAGS_ORDER_ENTRIES[tagIndex][0];
        }
        else if (lower in TAGS_SYNONYMS) {
            tag = TAGS_SYNONYMS[lower];
        }
        type = type.trim();
        name = name.trim();
        if (name && TAGS_NAMELESS.includes(tag)) {
            description = `${name} ${description}`;
            name = "";
        }
        if (type && TAGS_TYPELESS.includes(tag)) {
            description = `{${type}} ${description}`;
            type = "";
        }
        return {
            tag,
            type,
            name,
            description,
            default: _default,
            ...rest,
        };
    });
}
function convertCommentDescToDescTag(parsed) {
    let description = parsed.description || "";
    parsed.description = "";
    parsed.tags = parsed.tags.filter(/** @returns {boolean} */ ({ description: _description, tag }) => {
        if (tag.toLowerCase() === DESCRIPTION) {
            if (_description.trim()) {
                description += "\n\n" + _description;
            }
            return false;
        }
        else {
            return true;
        }
    });
    if (description) {
        parsed.tags.unshift({
            tag: DESCRIPTION,
            description,
            name: undefined,
            type: undefined,
            source: [],
            optional: false,
            problems: [],
        });
    }
}
function getParamsOrders(/** @type {string} */ text, comment) {
    try {
        const lines = text.split("\n");
        let commentEnd = 0;
        for (let i = 0; i < comment.loc.end.line - 1; i++) {
            commentEnd += lines[i].length + 1;
        }
        commentEnd += comment.loc.end.column;
        const textAfterComment = text.slice(commentEnd);
        const functionMatch = textAfterComment.match(/^\s*function\s+\w*\s*\(([^)]*)\)/);
        if (functionMatch) {
            const paramsString = functionMatch[1];
            const params = paramsString
                .split(",")
                .map(/** @returns {string} */ (param) => {
                const trimmed = param.trim();
                const colonIndex = trimmed.indexOf(":");
                const paramName = colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
                return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
            })
                .filter((param) => param && param !== "...");
            return params;
        }
        const arrowMatch = textAfterComment.match(/^\s*(?:const|let|var)\s+\w+\s*=\s*\(([^)]*)\)\s*=>/);
        if (arrowMatch) {
            const paramsString = arrowMatch[1];
            const params = paramsString
                .split(",")
                .map(/** @returns {string} */ (param) => {
                const trimmed = param.trim();
                const colonIndex = trimmed.indexOf(":");
                const paramName = colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
                return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
            })
                .filter((param) => param && param !== "...");
            return params;
        }
        const methodMatch = textAfterComment.match(/^\s*(\w+)\s*\(([^)]*)\)/);
        if (methodMatch) {
            const paramsString = methodMatch[2];
            const params = paramsString
                .split(",")
                .map(/** @returns {string} */ (param) => {
                const trimmed = param.trim();
                const colonIndex = trimmed.indexOf(":");
                const paramName = colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
                return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
            })
                .filter((param) => param && param !== "...");
            return params;
        }
        return undefined;
    }
    catch (error) {
        return undefined;
    }
}
function addDefaultValueToDescription(tag) {
    if (tag.optional && tag.default) {
        let { description } = tag;
        description = description.replace(/(?:\s*Default\s+is\s+`.*?`\.?)+/g, "");
        if (description && !/[.\n]$/.test(description)) {
            description += ".";
        }
        description += ` Default is \`${tag.default}\``;
        return {
            ...tag,
            description: description.trim(),
        };
    }
    else {
        return tag;
    }
}
function assignOptionalAndDefaultToName({ name, optional, default: default_, tag, type, source, description, ...rest }) {
    if (isDefaultTag(tag)) {
        const usefulSourceLine = source.find(/** @returns {boolean} */ (x) => x.source.includes(`@${tag}`))?.source || "";
        const tagMatch = usefulSourceLine.match(/@default(Value)? (\[.*]|{.*}|\(.*\)|'.*'|".*"|`.*`| \w+)( ((?!\*\/).+))?/);
        const tagValue = tagMatch?.[2] || "";
        const tagDescription = tagMatch?.[4] || "";
        if (tagMatch) {
            type = tagValue;
            name = "";
            description = tagDescription;
        }
    }
    else if (optional) {
        if (name) {
            if (default_) {
                name = `[${name}=${default_}]`;
            }
            else {
                name = `[${name}]`;
            }
        }
        else {
            type = `${type} | undefined`;
        }
    }
    return {
        ...rest,
        tag,
        name,
        description,
        optional,
        type,
        source,
        default: default_,
    };
}
function writeImportDetailsToSpec(importDetails, options) {
    const { defaultImport, namedImports, src, spec } = importDetails;
    namedImports.sort(/** @returns {number} */ (a, b) => (a.alias ?? a.name).localeCompare(b.alias ?? b.name));
    const importClauses = [];
    if (defaultImport)
        importClauses.push(defaultImport);
    if (namedImports.length > 0) {
        const makeMultiLine = options.jsdocNamedImportLineSplitting && namedImports.length > 1;
        const typeString = namedImports
            .map(/** @returns {string} */ (t) => {
            const val = t.alias ? `${t.name} as ${t.alias}` : `${t.name}`;
            return makeMultiLine ? `  ${val}` : val;
        })
            .join(makeMultiLine ? ",\n" : ", ");
        const namedImportClause = makeMultiLine
            ? `{\n${typeString}\n}`
            : options.jsdocNamedImportPadding
                ? `{ ${typeString} }`
                : `{${typeString}}`;
        importClauses.push(namedImportClause);
    }
    const quote = options.singleQuote ? "'" : '"';
    spec.description = `${importClauses.join(", ")} from ${quote}${src}${quote}`;
}
function getImportDetails(spec) {
    const match = spec.description.match(/([^\s\\,\\{\\}]+)?(?:[^\\{\\}]*)\{?([^\\{\\}]*)?\}?(?:\s+from\s+)[\\'\\"](\S+)[\\'\\"]/s);
    if (!match)
        return null;
    const defaultImport = match[1] || "";
    const namedImportsClause = match[2] || "";
    const src = match[3] || "";
    const typeMatches = namedImportsClause.matchAll(/([^\s\\,\\{\\}]+)(?:\s+as\s+)?([^\s\\,\\{\\}]+)?/g);
    const namedImports = [];
    for (const typeMatch of typeMatches) {
        namedImports.push({ name: typeMatch[1], alias: typeMatch[2] });
    }
    return { spec, src, namedImports, defaultImport };
}
//# sourceMappingURL=parser.js.map