import * as path from 'path';
import * as fsCb from 'fs';
import prettier from 'prettier';
import * as ts from 'typescript';

const currentDirectory = __dirname;
const projectRoot = path.resolve(currentDirectory, '..', '..');

function formatType(rawType: string) {
  if (!rawType) {
    return '';
  }

  const prefix = 'type FakeType = ';
  const signatureWithTypeName = `${prefix}${rawType}`;

  const prettifiedSignatureWithTypeName = prettier.format(signatureWithTypeName, {
    printWidth: 999,
    singleQuote: true,
    semi: false,
    trailingComma: 'none',
    parser: 'typescript',
  });

  return prettifiedSignatureWithTypeName.slice(prefix.length).replace(/\n$/, '');
}

function stringifyType(type: ts.Type, checker: ts.TypeChecker) {
  const rawType = checker.typeToString(
    type,
    type.getSymbol()?.valueDeclaration,
    ts.TypeFormatFlags.NoTruncation,
  );

  return formatType(rawType);
}

function stringifySymbol(symbol: ts.Symbol, checker: ts.TypeChecker) {
  let rawType: string;

  const declaration = symbol.declarations?.[0];
  if (declaration && ts.isPropertySignature(declaration)) {
    rawType = declaration.type?.getText() ?? '';
  } else {
    const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
    rawType = checker.typeToString(type, symbol.valueDeclaration, ts.TypeFormatFlags.NoTruncation);
  }

  return formatType(rawType);
}

function getSymbolIsDeprecated(symbol: ts.Symbol, checker: ts.TypeChecker) {
  return symbol.getJsDocTags(checker).some((tag) => tag.name === 'deprecated');
}

function getDocType(symbol: ts.Symbol, checker: ts.TypeChecker): string | null {
  const typeJsDoc = symbol.getJsDocTags(checker).find((tag) => tag.name === 'muidoc');
  return typeJsDoc?.text?.[0]?.text.trim() ?? null;
}

function getSymbolDescription(symbol: ts.Symbol, checker: ts.TypeChecker) {
  return symbol
    .getDocumentationComment(checker)
    .map((comment) => comment.text)
    .join('\n\n');
}

function extractInterface(symbol: ts.Symbol, checker: ts.TypeChecker) {
  const type = checker.getDeclaredTypeOfSymbol(symbol);

  const rawType = checker.typeToString(
    type,
    symbol.valueDeclaration,
    ts.TypeFormatFlags.NoTruncation,
  );

  const properties = type.getProperties().map((propSymbol) => {
    return {
      name: propSymbol.name,
      typeString: stringifySymbol(propSymbol, checker),
    };
  });

  return [
    symbol.name,
    {
      kind: 'interface',
      name: symbol.name,
      description: getSymbolDescription(symbol, checker),
      deprecated: getSymbolIsDeprecated(symbol, checker),
      type: formatType(rawType),
      properties,
    },
  ];
}

function extractFunction(symbol: ts.Symbol, checker: ts.TypeChecker) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

  const rawType = checker.typeToString(
    checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!),
    symbol.valueDeclaration,
    ts.TypeFormatFlags.NoTruncation,
  );

  const argTypes = type.getCallSignatures()[0].getParameters();

  return [
    symbol.name,
    {
      kind: 'function',
      name: symbol.name,
      description: getSymbolDescription(symbol, checker),
      deprecated: getSymbolIsDeprecated(symbol, checker),
      type: formatType(rawType),
      argTypes: argTypes.map((argType) => {
        let argTypeType = checker.getTypeOfSymbolAtLocation(argType, argType.valueDeclaration);
        if (argTypeType.getNonNullableType().isTypeParameter()) {
          argTypeType = argTypeType.getConstraint();
        }
        return { name: argType.name, typeString: stringifyType(argTypeType, checker) };
      }),
    },
  ];
}

export async function buildCoreReference() {
  const corePackageRoot = path.resolve(projectRoot, 'packages/toolpad-core');
  const tsconfigPath = path.resolve(corePackageRoot, 'tsconfig.json');
  const entries = [
    { entrypoint: path.resolve(corePackageRoot, 'src/server.ts') },
    { entrypoint: path.resolve(corePackageRoot, 'src/browser.tsx') },
  ];

  const tsconfigFile = ts.readConfigFile(tsconfigPath, (filePath) =>
    fsCb.readFileSync(filePath).toString(),
  );

  if (tsconfigFile.error) {
    throw tsconfigFile.error;
  }

  const tsconfigFileContent = ts.parseJsonConfigFileContent(
    tsconfigFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  if (tsconfigFileContent.errors.length > 0) {
    throw tsconfigFileContent.errors[0];
  }

  const program = ts.createProgram({
    rootNames: entries.map((entry) => entry.entrypoint),
    options: tsconfigFileContent.options,
  });

  const checker = program.getTypeChecker();

  const allExports = entries.map(({ entrypoint }) => {
    const sourceFile = program.getSourceFile(entrypoint);

    const exports = Object.fromEntries(
      checker
        .getExportsOfModule(checker.getSymbolAtLocation(sourceFile))
        .map((symbol) => {
          const docType = getDocType(symbol, checker);
          switch (docType) {
            case 'function':
              return extractFunction(symbol, checker);
            case 'interface':
              return extractInterface(symbol, checker);
            case null:
              return null;
            default:
              throw new Error(`Unknown doc type '${docType}'.`);
          }
        })
        .filter(Boolean),
    );

    return [entrypoint, exports];
  });

  console.log(JSON.stringify(allExports, null, 2));
}
