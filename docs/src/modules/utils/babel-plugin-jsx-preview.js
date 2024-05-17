// @ts-check
const fs = require('fs');

const pluginName = 'babel-plugin-jsx-preview';

const wrapperTypes = ['div', 'Box', 'Stack'];

/**
 * @typedef {import('@babel/core')} babel
 */

/**
 *
 * @param {babel.NodePath<babel.types.JSXElement>} path
 */
function getPreviewNodes(path) {
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
      ExportDefaultDeclaration(path) {
        const declarationPath = path.get('declaration');
        if (!declarationPath.isFunctionDeclaration()) {
          return;
        }
        const bodyPath = declarationPath.get('body');

        const returnPaths = bodyPath.get('body').filter((member) => member.isReturnStatement());
        const lastReturnPath = returnPaths[returnPaths.length - 1];
        const returnedJSXPath = lastReturnPath.get('argument');

        if (returnedJSXPath.isJSXElement()) {
          previewNodes = getPreviewNodes(returnedJSXPath);
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

      const lines = state.code.split(/\n/);
      const previewStart = lines.findIndex((line) =>
        ['// preview-start', '{/* preview-start */}'].includes(line.trim()),
      );
      const previewEnd = lines.findIndex((line) =>
        ['// preview-end', '{/* preview-end */}'].includes(line.trim()),
      );

      if (previewStart >= 0 && previewEnd >= 0 && previewStart < previewEnd) {
        const previewLines = lines.slice(previewStart + 1, previewEnd);
        const dedentedPreviewLines = dedentLines(previewLines);
        fs.writeFileSync(outputFilename, dedentedPreviewLines.join('\n'));
        hasPreview = true;
      } else if (previewNodes.length > 0) {
        const startNode = previewNodes[0];
        const endNode = previewNodes.slice(-1)[0];
        const startLine = startNode.loc?.start.line;
        const endLine = endNode.loc?.end.line;
        if (typeof startLine === 'number' && typeof endLine === 'number') {
          const previewLines = lines.slice(startLine - 1, endLine);

          if (previewLines.length <= maxLines) {
            const dedentedPreviewLines = dedentLines(previewLines);
            fs.writeFileSync(outputFilename, dedentedPreviewLines.join('\n'));
            hasPreview = true;
          }
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
