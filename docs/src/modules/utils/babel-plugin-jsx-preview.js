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
  let previewNode = [];

  previewNode = [path.node];
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
    previewNode = path.node.children.filter((child, index, children) => {
      const isSurroundingBlankJSXText =
        (index === 0 || index === children.length - 1) &&
        child.type === 'JSXText' &&
        !/[^\s]+/.test(child.value);
      return !isSurroundingBlankJSXText;
    });
  }
  return previewNode;
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
      JSXElement(path) {
        const comments = path.node.leadingComments || [];
        const hasComment = comments.some((comment) => comment.value.trim() === 'preview');
        if (hasComment) {
          previewNodes = getPreviewNodes(path);
        }
      },
      ExportDefaultDeclaration(path) {
        if (previewNodes) {
          return;
        }

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
      const { maxLines, outputFilename } = state.opts.plugins.find((plugin) => {
        return plugin.key === pluginName;
      }).options;

      let hasPreview = false;
      if (previewNodes.length > 0) {
        const startNode = previewNodes[0];
        const endNode = previewNodes.slice(-1)[0];
        const preview = state.code.slice(startNode.start, endNode.end);
        const previewLines = preview.split(/\n/);
        // The first line is already trimmed either due to trimmed blank JSXText or because it's a single node which babel already trims.
        // The last line is therefore the meassure for indentation
        const indentation = previewLines.slice(-1)[0].match(/^\s*/)[0].length;
        const deindentedPreviewLines = preview.split(/\n/).map((line, index) => {
          if (index === 0) {
            return line;
          }
          return line.slice(indentation);
        });

        if (deindentedPreviewLines.length <= maxLines) {
          fs.writeFileSync(outputFilename, deindentedPreviewLines.join('\n'));
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
