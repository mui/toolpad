import ts from 'typescript';

export const compilerOptions: ts.CompilerOptions = {
  noEmit: true,
  target: ts.ScriptTarget.ESNext,
  lib: ['lib.esnext.d.ts'],
  types: ['node'],
  // NOTE: strictNullChecks is essential for the type extraction to work properly. When we decide
  // to support user-defined tsconfig.json, we must make sure this option is enabled.
  strictNullChecks: true,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
};
