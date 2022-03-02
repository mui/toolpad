var _a, _b, _c;
import 'dotenv/config';
import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';
const args = arg({
    // Types
    '--help': Boolean,
    '--dev': Boolean,
    '--port': Number,
    '--demo': Boolean,
    // Aliases
    '-p': '--port',
});
function resolveStudioDir({ _: positional = [] }) {
    const dirArg = positional.length > 0 ? positional[0] : '.';
    return dirArg ? path.resolve(process.cwd(), dirArg) : process.cwd();
}
const STUDIO_DIR = resolveStudioDir(args);
const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';
console.log(`Starting Studio in "${STUDIO_DIR}"`);
const studioDir = path.dirname(createRequire(import.meta.url).resolve('@mui/studio-app/package.json'));
const port = (_a = args['--port']) !== null && _a !== void 0 ? _a : 3000;
const cp = execa('yarn', [NEXT_CMD, '--', '--port', String(port)], {
    cwd: studioDir,
    preferLocal: true,
    stdio: 'pipe',
    extendEnv: false,
    env: {
        STUDIO_DATABASE_URL: process.env.STUDIO_DATABASE_URL,
        FORCE_COLOR: process.env.FORCE_COLOR,
        STUDIO_DIR,
        DEMO_MODE: String(!!args['--demo']),
    },
});
process.stdin.pipe(cp.stdin);
(_b = cp.stdout) === null || _b === void 0 ? void 0 : _b.pipe(process.stdout);
(_c = cp.stderr) === null || _c === void 0 ? void 0 : _c.pipe(process.stdout);
