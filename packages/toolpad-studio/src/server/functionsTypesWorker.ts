import * as path from 'path';
import invariant from 'invariant';
import ts from 'typescript';
import { glob } from 'glob';
import chalk from 'chalk';
import type { JSONSchema7, JSONSchema7TypeName, JSONSchema7Type } from 'json-schema';
import { asArray } from '@toolpad/utils/collections';
import { PrimitiveValueType } from '@toolpad/studio-runtime';
import { compilerOptions } from './functionsShared';

export interface ReturnTypeIntrospectionResult {
  schema: JSONSchema7 | null;
}

export interface HandlerIntrospectionResult {
  name: string;
  isCreateFunction: boolean;
  parameters: [string, PrimitiveValueType][];
  returnType: ReturnTypeIntrospectionResult;
}

export interface DataProviderIntrospectionResult {
  name: string;
}

export interface IntrospectionMessage {
  message: string;
}

export interface FileIntrospectionResult {
  name: string;
  errors: IntrospectionMessage[];
  warnings: IntrospectionMessage[];
  handlers: HandlerIntrospectionResult[];
  dataProviders: DataProviderIntrospectionResult[];
}

export interface IntrospectionResult {
  error?: Error;
  files: FileIntrospectionResult[];
}

export type WorkerApi = {
  introspect(): Promise<IntrospectionResult>;
};

export interface TypesWorkerData {
  resourcesFolder: string;
}

const NULL_PROP_VALUE: PrimitiveValueType = {
  type: 'object',
  schema: { type: 'null' },
  default: null,
};

function propValueFromJsonSchema(schema: JSONSchema7 | null): PrimitiveValueType {
  if (!schema) {
    return NULL_PROP_VALUE;
  }

  if (Array.isArray(schema.type)) {
    return propValueFromJsonSchema({
      ...schema,
      type: schema.type[0],
    });
  }

  switch (schema.type) {
    case 'integer':
      return { type: 'number' };
    case 'string': {
      if (schema.enum) {
        return { type: 'string', enum: schema.enum.map((value) => String(value)) };
      }
      return { type: 'string' };
    }
    case 'null':
    case null:
    case undefined:
      return NULL_PROP_VALUE;
    default:
      return { type: schema.type, schema };
  }
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
  return (type.getFlags() & flag) !== 0;
}

function asUnionTypes(type: ts.Type): ts.Type[] {
  return type.isUnion() ? type.types : [type];
}

function toJsonSchema(
  tsType: ts.Type,
  checker: ts.TypeChecker,
  seenTypes: Set<ts.Type>,
): JSONSchema7 | null {
  if (seenTypes.has(tsType)) {
    return { const: '[Circular]' };
  }

  seenTypes.add(tsType);

  try {
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

      const withoutUndefined = tsType.types.filter(
        (type) => !hasTypeFlag(type, ts.TypeFlags.Undefined),
      );

      if (withoutUndefined.length <= 0) {
        return null;
      }

      if (withoutUndefined.length === 1) {
        return toJsonSchema(withoutUndefined[0], checker, seenTypes);
      }

      for (const type of withoutUndefined) {
        const itemType = toJsonSchema(type, checker, seenTypes);

        if (itemType) {
          anyOf.push(itemType);
        }
      }

      const typeNames = new Set<JSONSchema7TypeName>();
      const enumValues = new Set<JSONSchema7Type>();
      let hasTrue = false;
      let hasFalse = false;
      let hasOther = false;
      let isEnum = true;
      for (const itemType of anyOf) {
        if (typeof itemType.const !== 'undefined') {
          enumValues.add(itemType.const);
        } else {
          isEnum = false;
        }

        if (itemType.const === true) {
          hasTrue = true;
        } else if (itemType.const === false) {
          hasFalse = true;
        } else {
          hasOther = true;
        }

        for (const typeName of asArray(itemType.type)) {
          if (typeName) {
            typeNames.add(typeName);
          }
        }
      }

      if (hasTrue && hasFalse && !hasOther) {
        return { type: 'boolean' };
      }

      if (isEnum) {
        let type: JSONSchema7TypeName | undefined;
        if (typeNames.size === 1) {
          type = Array.from(typeNames)[0];
        }
        return { type, enum: Array.from(enumValues) };
      }

      if (anyOf.length === 1) {
        return anyOf[0];
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
          items = toJsonSchema(indexType, checker, seenTypes) ?? undefined;
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
          const propertySchema = toJsonSchema(propertyType, checker, seenTypes);
          return propertySchema ? [[propertyName, propertySchema]] : [];
        }),
      );

      return { type: 'object', properties, required };
    }

    return {};
  } finally {
    seenTypes.delete(tsType);
  }
}

function getParameters(
  callSignatures: readonly ts.Signature[],
  checker: ts.TypeChecker,
): [string, PrimitiveValueType][] {
  invariant(callSignatures.length > 0, 'Expected at least 1 call signature');

  const paramEntries: [string, PrimitiveValueType][] = callSignatures[0]
    .getParameters()
    .map((parameter) => {
      const paramType = checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration!);
      const schema = toJsonSchema(paramType, checker, new Set());

      return [
        parameter.getName(),
        {
          ...propValueFromJsonSchema(schema),
          required: !checker.isOptionalParameter(
            parameter.valueDeclaration as ts.ParameterDeclaration,
          ),
        },
      ];
    });

  return paramEntries;
}

function getAwaitedType(type: ts.Type, checker: ts.TypeChecker): ts.Type {
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
            return getAwaitedType(valueType, checker);
          }
        }
      }
    }
  }

  return type;
}

function isToolpadCreateFunction(exportType: ts.Type): boolean {
  const properties = exportType.getProperties();

  for (const property of properties) {
    if (ts.isPropertySignature(property.valueDeclaration!)) {
      if (property.valueDeclaration.name.getText() === '[TOOLPAD_FUNCTION]') {
        return true;
      }
    }
  }

  return false;
}

function isToolpadCreateDataProvider(exportType: ts.Type): boolean {
  const properties = exportType.getProperties();

  for (const property of properties) {
    if (ts.isPropertySignature(property.valueDeclaration!)) {
      if (property.valueDeclaration.name.getText() === '[TOOLPAD_DATA_PROVIDER_MARKER]') {
        return true;
      }
    }
  }

  return false;
}

function getCreateFunctionParameters(
  callSignatures: readonly ts.Signature[],
  checker: ts.TypeChecker,
): [string, PrimitiveValueType][] {
  invariant(callSignatures.length > 0, 'Expected at least 1 call signature');
  const [callSignature] = callSignatures;
  const [firstParameter] = callSignature.getParameters();
  invariant(firstParameter, 'Expected at least 1 parameter');
  const firstParameterType = checker.getTypeOfSymbolAtLocation(
    firstParameter,
    firstParameter.valueDeclaration!,
  );
  const parametersProperty = firstParameterType.getProperty('parameters');
  invariant(parametersProperty, 'Expected parameters property');
  const parametersPropertyType = checker.getTypeOfSymbolAtLocation(
    parametersProperty,
    parametersProperty.valueDeclaration!,
  );
  return parametersPropertyType.getProperties().map((property) => {
    const propertyType = checker.getTypeOfSymbol(property);
    const schema = toJsonSchema(propertyType, checker, new Set());
    return [
      property.getName(),
      {
        ...propValueFromJsonSchema(schema),
        required: false,
      },
    ];
  });
}

function getReturnType(callSignatures: readonly ts.Signature[], checker: ts.TypeChecker) {
  invariant(callSignatures.length > 0, 'Expected at least 1 call signature');

  const returnType = callSignatures[0].getReturnType();

  const awaitedReturnType = getAwaitedType(returnType, checker);

  const schema = toJsonSchema(awaitedReturnType, checker, new Set());

  return {
    schema,
  };
}

export interface ExtractTypesParams {
  resourcesFolder: string;
}

let createFunctionWarningShown = false;

export default async function extractTypes({
  resourcesFolder,
}: ExtractTypesParams): Promise<IntrospectionResult> {
  const entryPoints = await glob(path.join(resourcesFolder, './*.ts'), {
    windowsPathsNoEscape: true,
  });

  const program = ts.createProgram(entryPoints, compilerOptions);

  const checker = program.getTypeChecker();

  const usingCreateFunction = [];

  const files: FileIntrospectionResult[] = entryPoints
    .map((entrypoint) => {
      const sourceFile = program.getSourceFile(entrypoint);
      const relativeEntrypoint = path.relative(resourcesFolder, entrypoint);

      if (!sourceFile) {
        return null;
      }

      const diagnostics = program.getSemanticDiagnostics(sourceFile);

      for (const diagnostic of diagnostics) {
        // eslint-disable-next-line no-console
        console.log(`${chalk.blue('info')}  - ${formatDiagnostic(diagnostic)}`);
      }

      const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

      if (!moduleSymbol) {
        return null;
      }

      const exports = checker.getExportsOfModule(moduleSymbol);

      const handlers: HandlerIntrospectionResult[] = exports
        .map((symbol) => {
          const exportType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
          const callSignatures = exportType.getCallSignatures();

          if (callSignatures.length <= 0) {
            return null;
          }

          const isCreateFunction = isToolpadCreateFunction(exportType);
          if (isCreateFunction) {
            usingCreateFunction.push(symbol.name);
          }
          return {
            name: symbol.name,
            isCreateFunction,
            parameters: isCreateFunction
              ? getCreateFunctionParameters(callSignatures, checker)
              : getParameters(callSignatures, checker),
            returnType: getReturnType(callSignatures, checker),
          } satisfies HandlerIntrospectionResult;
        })
        .filter(Boolean);

      const dataProviders: DataProviderIntrospectionResult[] = exports
        .map((symbol) => {
          const exportType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);

          if (isToolpadCreateDataProvider(exportType)) {
            return {
              name: symbol.name,
            };
          }

          return null;
        })
        .filter(Boolean);

      return {
        name: relativeEntrypoint,
        errors: diagnostics
          .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
          .map((diagnostic) => ({ message: formatDiagnostic(diagnostic) })),
        warnings: diagnostics
          .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Warning)
          .map((diagnostic) => ({ message: formatDiagnostic(diagnostic) })),
        handlers,
        dataProviders,
      } satisfies FileIntrospectionResult;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (usingCreateFunction.length > 0 && !createFunctionWarningShown) {
    console.warn(
      `${chalk.yellow('warn')} - ${chalk.bold(usingCreateFunction.length)} function${
        usingCreateFunction.length === 1 ? ' is' : 's are'
      } using the deprecated ${chalk.red(
        'createFunction',
      )} API. This will be removed from Toolpad in a future release. Please see ${chalk.underline(
        chalk.blue('https://mui.com/toolpad/studio/reference/api/create-function/'),
      )} for migration information and updates.`,
    );
    createFunctionWarningShown = true;
  }

  return { files };
}
