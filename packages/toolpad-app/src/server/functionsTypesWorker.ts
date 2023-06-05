import invariant from 'invariant';
import * as path from 'path';
import chokidar from 'chokidar';
import { Worker, isMainThread, workerData } from 'worker_threads';
import * as ts from 'typescript';
import { glob } from 'glob';
import { Stats } from 'fs';
import chalk from 'chalk';
import { JSONSchema7, JSONSchema7TypeName, JSONSchema7Type } from 'json-schema';
import { asArray } from '@mui/toolpad-utils/collections';
import { has } from 'lodash';

export interface TypesWorkerData {
  resourcesFolder: string;
}

interface CreateWorkerParams extends TypesWorkerData {
  resourcesFolder: string;
}

export function createWorker({ resourcesFolder }: CreateWorkerParams) {
  invariant(isMainThread, 'createWorker() must be called from the main thread');
  const worker = new Worker(path.join(__dirname, 'functionsTypesWorker.js'), {
    workerData: {
      resourcesFolder,
    } satisfies TypesWorkerData,
  });
  return worker;
}

function getFirstCallsignature(type: ts.Type): ts.Signature | undefined {
  return type.getCallSignatures()[0];
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
  }
  return message;
}

function hasTypeFlag(type: ts.Type, flag: ts.TypeFlags) {
  // eslint-disable-next-line no-bitwise
  return (type.flags & flag) !== 0;
}

function asUnionTypes(type: ts.Type): ts.Type[] {
  return type.isUnion() ? type.types : [type];
}

function toJsonSchema(
  tsType: ts.Type,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): JSONSchema7 | null {
  if (
    hasTypeFlag(tsType, ts.TypeFlags.Undefined) ||
    hasTypeFlag(tsType, ts.TypeFlags.Void) ||
    hasTypeFlag(tsType, ts.TypeFlags.VoidLike)
  ) {
    return null;
  }

  if (hasTypeFlag(tsType, ts.TypeFlags.Null)) {
    return { type: 'null' };
  }

  if (tsType === checker.getTrueType()) {
    return { type: 'boolean', const: true };
  }

  if (tsType === checker.getFalseType()) {
    return { type: 'boolean', const: false };
  }

  if (tsType.isNumberLiteral()) {
    return { type: 'number', const: tsType.value };
  }

  if (tsType.isStringLiteral()) {
    return { type: 'string', const: tsType.value };
  }

  if (tsType.isUnion()) {
    const anyOf = [];
    const typeNames = new Set<JSONSchema7TypeName>();
    let enumValues: Set<JSONSchema7Type> | null = new Set();

    const withoutUndefined = tsType.types.filter(
      (type) => !hasTypeFlag(type, ts.TypeFlags.Undefined),
    );

    if (withoutUndefined.length <= 0) {
      return null;
    }

    if (withoutUndefined.length === 1) {
      return toJsonSchema(withoutUndefined[0], checker, sourceFile);
    }

    for (const type of withoutUndefined) {
      const itemType = toJsonSchema(type, checker, sourceFile);

      if (itemType) {
        if (enumValues && itemType.const) {
          enumValues.add(itemType.const);
        } else {
          enumValues = null;
        }

        for (const typeName of asArray(itemType.type)) {
          if (typeName) {
            typeNames.add(typeName);
          }
        }

        anyOf.push(itemType);
      }
    }

    if (enumValues) {
      let type: JSONSchema7TypeName | undefined;
      if (typeNames.size === 1) {
        type = Array.from(typeNames)[0];
      }
      return {
        type,
        enum: Array.from(enumValues),
      };
    }

    return { anyOf };
  }

  if (
    hasTypeFlag(tsType, ts.TypeFlags.BooleanLike) ||
    hasTypeFlag(tsType, ts.TypeFlags.Boolean) ||
    hasTypeFlag(tsType, ts.TypeFlags.BooleanLiteral)
  ) {
    return { type: 'boolean' };
  }

  if (
    hasTypeFlag(tsType, ts.TypeFlags.NumberLike) ||
    hasTypeFlag(tsType, ts.TypeFlags.Number) ||
    hasTypeFlag(tsType, ts.TypeFlags.NumberLiteral) ||
    hasTypeFlag(tsType, ts.TypeFlags.BigIntLike) ||
    hasTypeFlag(tsType, ts.TypeFlags.BigInt) ||
    hasTypeFlag(tsType, ts.TypeFlags.BigIntLiteral)
  ) {
    return { type: 'number' };
  }

  if (
    hasTypeFlag(tsType, ts.TypeFlags.StringLike) ||
    hasTypeFlag(tsType, ts.TypeFlags.String) ||
    hasTypeFlag(tsType, ts.TypeFlags.StringLiteral)
  ) {
    return { type: 'string' };
  }

  if (hasTypeFlag(tsType, ts.TypeFlags.Object)) {
    if (checker.isArrayLikeType(tsType)) {
      let items: JSONSchema7 | undefined;
      const indexType = tsType.getNumberIndexType();
      if (indexType) {
        items = toJsonSchema(indexType, checker, sourceFile) ?? undefined;
      }

      return {
        type: 'array',
        items,
      };
    }

    const required: string[] = [];

    const properties = Object.fromEntries(
      tsType.getProperties().flatMap((propertySymbol) => {
        const propertyName = propertySymbol.getName();
        const propertyType = checker.getTypeOfSymbol(propertySymbol);
        const isOptional = asUnionTypes(propertyType).some((type) =>
          hasTypeFlag(type, ts.TypeFlags.Undefined),
        );
        if (!isOptional) {
          required.push(propertyName);
        }
        const propertySchema = toJsonSchema(propertyType, checker, sourceFile);
        return propertySchema ? [[propertyName, propertySchema]] : [];
      }),
    );

    return { type: 'object', properties, required };
  }

  return {};
}

function getParameters(exportType: ts.Type, checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const callSignature = getFirstCallsignature(exportType);

  if (!callSignature) {
    return [];
  }

  const args = callSignature.getParameters().map((parameter) => {
    const paramType = checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration!);

    return {
      name: parameter.getName(),
      schema: toJsonSchema(paramType, checker, sourceFile),
      optional: checker.isOptionalParameter(parameter.valueDeclaration as ts.ParameterDeclaration),
    };
  });

  return args;
}

function getAwaitedType(
  type: ts.Type,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): ts.Type {
  const awaitedType = type.getNonNullableType();
  const then = awaitedType.getProperty('then');
  if (hasTypeFlag(awaitedType, ts.TypeFlags.Object) && then) {
    const thenType = checker.getTypeOfSymbolAtLocation(then, then.valueDeclaration!);
    for (const thenCallSignature of thenType.getCallSignatures()) {
      const [onfulfilled] = thenCallSignature.getParameters();
      if (onfulfilled) {
        const onfulfilledType = checker
          .getTypeOfSymbolAtLocation(onfulfilled, onfulfilled.valueDeclaration!)
          .getNonNullableType();
        for (const onFulfilledCallSignature of onfulfilledType.getCallSignatures()) {
          const [value] = onFulfilledCallSignature.getParameters();
          if (value) {
            const valueType = checker.getTypeOfSymbolAtLocation(value, value.valueDeclaration!);
            return getAwaitedType(valueType, checker, sourceFile);
          }
        }
      }
    }
  }

  return type;
}

function getReturnType(exportType: ts.Type, checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const callSignatures = exportType.getCallSignatures();

  if (callSignatures.length <= 0) {
    return {};
  }

  const returnType = callSignatures[0].getReturnType();

  const awaitedReturnType = getAwaitedType(returnType, checker, sourceFile);

  return {
    schema: toJsonSchema(awaitedReturnType, checker, sourceFile),
  };
}

async function generateTypes(resourcesFolder: string) {
  const files = await glob(path.join(resourcesFolder, './*.ts'));

  const program = ts.createProgram(files, {
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    lib: ['lib.esnext.d.ts'],
    types: ['node'],
    strict: true,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  });

  const checker = program.getTypeChecker();

  const allExports = files.map((entrypoint) => {
    const sourceFile = program.getSourceFile(entrypoint);

    if (!sourceFile) {
      return [entrypoint, null];
    }

    const diagnostics = program.getSemanticDiagnostics(sourceFile);

    for (const diagnostic of diagnostics) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.blue('info')}  - ${formatDiagnostic(diagnostic)}`);
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

    if (!moduleSymbol) {
      return [entrypoint, null];
    }

    const exports = Object.fromEntries(
      checker.getExportsOfModule(moduleSymbol).map((symbol) => {
        const exportType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);

        return [
          symbol.name,
          {
            parameters: getParameters(exportType, checker, sourceFile),
            returnType: getReturnType(exportType, checker, sourceFile),
          },
        ];
      }),
    );

    return [entrypoint, exports];
  });

  console.log('yooo', JSON.stringify(allExports, null, 2));
}

async function doWork({ resourcesFolder }: TypesWorkerData) {
  // TODO: debounce?
  const handleChange = (filePath: string, stats?: Stats | undefined) => {
    generateTypes(resourcesFolder);
  };
  chokidar.watch(resourcesFolder).on('add', handleChange);
  chokidar.watch(resourcesFolder).on('unlink', handleChange);
  chokidar.watch(resourcesFolder).on('change', handleChange);
}

if (!isMainThread) {
  doWork(workerData);
}
