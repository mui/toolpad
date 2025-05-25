# Claude Instructions for Toolpad Project

## Workspace Commands

**IMPORTANT**: This is a monorepo managed with pnpm workspaces. Always use workspace commands instead of changing directories:

### Correct Usage

```bash
# Run commands in specific workspace
pnpm -F @toolpad/core <command>
pnpm -F create-toolpad-app <command>

# Examples:
pnpm -F @toolpad/core test
pnpm -F @toolpad/core build
pnpm -F @toolpad/core lint
```

### Avoid

```bash
# DON'T do this
cd packages/toolpad-core && npm test
cd packages/toolpad-core && pnpm test
```

## Available Workspaces

- `@toolpad/core` - Core React components and hooks
- `@toolpad/utils` - Shared utilities
- `create-toolpad-app` - Project scaffolding tool

## Testing

- Always run tests using `pnpm -F <workspace> test`
- For linting: `pnpm -F <workspace> lint`
- For type checking: `pnpm -F <workspace> typecheck`
