import path from 'path';
import { PackageJson } from './packageType';

interface GenerateProjectOptions {
  name: string;
}

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  const rootLayoutContent = `  
  import { AppProvider } from '@toolpad/core';
  import theme from '../theme';
  
  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {      
    return (
      <html lang="en">
        <body>
          <AppProvider theme={theme}>{children}</AppProvider>
        </body>
      </html>
    );
  }
    `;

  const dashboardLayoutContent = `
    import {
    AppBar,
    Badge,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    Toolbar,
  } from "@mui/material";

  import HomeIcon from "@mui/icons-material/Home";
  import SettingsIcon from "@mui/icons-material/Settings";
  import NotificationsIcon from "@mui/icons-material/Notifications";

  export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <Box sx={{ display: "flex" }}>
        <AppBar position="absolute">
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" anchor="left">
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          ></Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton LinkComponent={"a"} href="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
            </ListItemButton>
          </List>
        </Drawer>
        <Box
          component={"main"}
          sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
        >
          <Toolbar />
          <Container maxWidth="lg">{children}</Container>
        </Box>
      </Box>
    );
  }
  `;

  const rootPageContent = `
  import Link from "next/link";
  import { Button, Container, Typography, Box } from "@mui/material";

  export default function Home() {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to{" "}
            <Link href="https://mui.com/toolpad/core/introduction">
              Toolpad Core!
            </Link>
          </Typography>

          <Typography variant="body1">
            Get started by editing <code>(dashboard)/page/page.tsx</code>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Link href="/page">
              <Button variant="contained" color="primary">
                Go to Page
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }
  `;

  const dashboardPageContent = `
  import { Typography, Container } from "@mui/material";
  export default function Home() {
    return (
      <main>
        <Container sx={{ mx: 4 }}>
          <Typography variant="h6" color="grey.800">
            Dashboard content!
          </Typography>
        </Container>
      </main>
    );
  }
  `;

  const themeContent = `
  "use client"
  import { Roboto } from "next/font/google";
  import { createTheme } from "@mui/material/styles";
  
  const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
  });
  
  const theme = createTheme({
    typography: {
      fontFamily: roboto.style.fontFamily,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: 0,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: "28px",
          },
        },
      },
    },
  });
  
  export default theme;
  `;

  const eslintConfigContent = `{    
    "extends": "next/core-web-vitals"        
  }
  `;

  const nextTypesContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
  `;

  const nextConfigContent = `
  /** @type {import('next').NextConfig} */
  const nextConfig = {};
  export default nextConfig;
  `;

  const tsConfigContent = `{
    "compilerOptions": {
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  `;

  const packageJson: PackageJson = {
    name: path.basename(options.name),
    version: '0.1.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      react: '^18',
      'react-dom': '^18',
      next: '^14',
      '@toolpad/core': 'latest',
      '@mui/material': '^5',
      '@mui/icons-material': '^5',
      '@emotion/react': '^11',
      '@emotion/styled': '^11',
      '@emotion/cache': '^11',
    },
    devDependencies: {
      typescript: '^5',
      '@types/node': '^20',
      '@types/react': '^18',
      '@types/react-dom': '^18',
      eslint: '^8',
      'eslint-config-next': '^14',
    },
  };

  const gitignoreTemplate = `
  # Logs
  logs
  *.log
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  lerna-debug.log*
  .pnpm-debug.log*
  
  # Diagnostic reports (https://nodejs.org/api/report.html)
  report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
  
  # Runtime data
  pids
  *.pid
  *.seed
  *.pid.lock
  
  # Directory for instrumented libs generated by jscoverage/JSCover
  lib-cov
  
  # Coverage directory used by tools like istanbul
  coverage
  *.lcov
  
  # nyc test coverage
  .nyc_output
  
  # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
  .grunt
  
  # Bower dependency directory (https://bower.io/)
  bower_components
  
  # node-waf configuration
  .lock-wscript
  
  # Compiled binary addons (https://nodejs.org/api/addons.html)
  build/Release
  
  # Dependency directories
  node_modules/
  jspm_packages/
  
  # Snowpack dependency directory (https://snowpack.dev/)
  web_modules/
  
  # TypeScript cache
  *.tsbuildinfo
  
  # Optional npm cache directory
  .npm
  
  # Optional eslint cache
  .eslintcache
  
  # Optional stylelint cache
  .stylelintcache
  
  # Microbundle cache
  .rpt2_cache/
  .rts2_cache_cjs/
  .rts2_cache_es/
  .rts2_cache_umd/
  
  # Optional REPL history
  .node_repl_history
  
  # Output of 'npm pack'
  *.tgz
  
  # Yarn Integrity file
  .yarn-integrity
  
  # dotenv environment variable files
  .env
  .env.development.local
  .env.test.local
  .env.production.local
  .env.local
  
  # parcel-bundler cache (https://parceljs.org/)
  .cache
  .parcel-cache
  
  # Next.js build output
  .next
  out
  
  # Nuxt.js build / generate output
  .nuxt
  dist
  
  # Gatsby files
  .cache/
  # Comment in the public line in if your project uses Gatsby and not Next.js
  # https://nextjs.org/blog/next-9-1#public-directory-support
  # public
  
  # vuepress build output
  .vuepress/dist
  
  # vuepress v2.x temp and cache directory
  .temp
  .cache
  
  # Docusaurus cache and generated files
  .docusaurus
  
  # Serverless directories
  .serverless/
  
  # FuseBox cache
  .fusebox/
  
  # DynamoDB Local files
  .dynamodb/
  
  # TernJS port file
  .tern-port
  
  # Stores VSCode versions used for testing VSCode extensions
  .vscode-test
  
  # yarn v2
  .yarn/cache
  .yarn/unplugged
  .yarn/build-state.yml
  .yarn/install-state.gz
  `;

  // Define all files to be created up front
  return new Map([
    ['app/api/auth/[...nextAuth]/route.ts', { content: '' }],
    ['app/auth/[...path]/page.tsx', { content: '' }],
    ['app/(dashboard)/page/page.tsx', { content: dashboardPageContent }],
    ['app/(dashboard)/layout.tsx', { content: dashboardLayoutContent }],
    ['app/layout.tsx', { content: rootLayoutContent }],
    ['app/page.tsx', { content: rootPageContent }],
    ['theme.ts', { content: themeContent }],
    ['next-env.d.ts', { content: nextTypesContent }],
    ['next.config.mjs', { content: nextConfigContent }],
    ['.eslintrc.json', { content: eslintConfigContent }],
    ['tsconfig.json', { content: tsConfigContent }],
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['.gitignore', { content: gitignoreTemplate }],
    // ...
  ]);
}
