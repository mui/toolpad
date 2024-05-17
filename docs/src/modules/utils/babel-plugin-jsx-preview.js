// @ts-check
const fs = require('fs');

const pluginName = 'babel-plugin-jsx-preview';

/**
 * @typedef {import('@babel/core')} babel
 */

/**
 *
 * @param {babel.NodePath<babel.types.JSXElement>} path
 * @param {babel.PluginPass} state
 */
function getPreviewNodes(path, state) {
  const wrapperTypes = state.opts.wrapperTypes ?? [];
  /**
   * @type {(babel.types.JSXElement['children'])}
   */
  let previewNodes = [];

  previewNodes = [path.node];
  const name = path.get('openingElement').get('name');
  if (
    name.isJSXIdentifier() &&
    wrapperTypes.includes(name.node.name) &&
    path.node.children.length > 0
  ) {
    // Trim blank JSXText to normalize
    // return (
    //   <div />
    // )
    // and
    // return (
    //   <Stack>
    //     <div />
    // ^^^^ Blank JSXText including newline
    //   </Stack>
    // )
    previewNodes = path.node.children.filter((child, index, children) => {
      const isSurroundingBlankJSXText =
        (index === 0 || index === children.length - 1) &&
        child.type === 'JSXText' &&
        !/[^\s]+/.test(child.value);
      return !isSurroundingBlankJSXText;
    });
  }
  return previewNodes;
}

/**
 *
 * @param {string[]} lines
 * @returns {string[]}
 */
function trimEmptyLines(lines) {
  const start = lines.findIndex((line) => line.trim() !== '');
  const end = lines.findLastIndex((line) => line.trim() !== '');
  return lines.slice(start, end + 1);
}

/**
 *
 * @param {string[]} lines
 * @returns {string[]}
 */
function dedentLines(lines) {
  const trimmedLines = trimEmptyLines(lines);
  const indentation = trimmedLines[0]?.match(/^\s*/)?.[0].length ?? 0;
  return trimmedLines.map((line) => line.slice(indentation));
}

/** @type {(input: string) => boolean} */
const isPreviewStart = (line) =>
  ['// preview-start', '{/* preview-start */}'].includes(line.trim());
/** @type {(input: string) => boolean} */
const isPreviewEnd = (line) => ['// preview-end', '{/* preview-end */}'].includes(line.trim());

/**
 *
 * @param {string} code
 * @returns {string | null}
 */
function extractExplicitPreview(code) {
  const lines = code.split(/\n/);

  const ranges = [];

  let start = -1;
  for (const [index, line] of lines.entries()) {
    if (isPreviewStart(line) && start < 0) {
      start = index;
    } else if (isPreviewEnd(line) && start >= 0) {
      ranges.push([start, index]);
      start = -1;
    }
  }

  const previewSections = ranges.map(([startLine, endLine]) => {
    const previewLines = lines.slice(startLine + 1, endLine);
    const dedentedPreviewLines = dedentLines(previewLines);
    return dedentedPreviewLines.join('\n');
  });

  if (previewSections.length > 0) {
    return previewSections.join('\n\n// ...\n\n');
  }

  return null;
}

/**
 * @returns {babel.PluginObj}
 */
export default function babelPluginJsxPreview() {
  /**
   * @type {babel.types.JSXElement['children']}
   */
  let previewNodes = [];

  return {
    name: pluginName,
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const declarationPath = path.get('declaration');
        if (!declarationPath.isFunctionDeclaration()) {
          return;
        }
        const bodyPath = declarationPath.get('body');

        const returnPaths = bodyPath.get('body').filter((member) => member.isReturnStatement());
        const lastReturnPath = returnPaths[returnPaths.length - 1];
        const returnedJSXPath = lastReturnPath.get('argument');

        if (returnedJSXPath.isJSXElement()) {
          previewNodes = getPreviewNodes(returnedJSXPath, state);
        }
      },
    },
    post(state) {
      const previewPlugin = state.opts.plugins?.find((plugin) => plugin.key === pluginName);
      if (!previewPlugin) {
        throw new Error(`Can't find the ${pluginName} plugin.`);
      }

      const { maxLines, outputFilename } = previewPlugin.options;

      let hasPreview = false;

      const explicitPreview = extractExplicitPreview(state.code);

      if (explicitPreview) {
        fs.writeFileSync(outputFilename, explicitPreview);
        hasPreview = true;
      } else if (previewNodes.length > 0) {
        const startNode = previewNodes[0];
        const endNode = previewNodes.slice(-1)[0];
        const preview = state.code.slice(startNode.start, endNode.end);
        const previewLines = preview.split(/\n/);
        // The first line is already trimmed either due to trimmed blank JSXText or because it's a single node which babel already trims.
        // The last line is therefore the meassure for indentation
        const indentation = previewLines.slice(-1)[0].match(/^\s*/)[0].length;
        const dedentedPreviewLines = preview.split(/\n/).map((line, index) => {
          if (index === 0) {
            return line;
          }
          return line.slice(indentation);
        });

        if (previewLines.length <= maxLines) {
          fs.writeFileSync(outputFilename, dedentedPreviewLines.join('\n'));
          hasPreview = true;
        }
      }

      if (!hasPreview) {
        try {
          fs.unlinkSync(outputFilename);
        } catch (error) {
          // Would throw if the file doesn't exist.
          // But we do want to ensure that the file doesn't exist so the error is fine.
        }
      }
    },
  };
}
