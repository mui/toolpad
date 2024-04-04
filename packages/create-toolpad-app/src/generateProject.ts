import path from 'path';
import { PackageJson } from './packageType';

interface GenerateProjectOptions {
  name: string;
}

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  const rootLayoutContent = `  
  import AppProvider from "@toolpad/core/client/AppProvider";
  import DashboardIcon from "@mui/icons-material/Dashboard";
  import type { Navigation } from "@toolpad/core";
  import theme from '../theme';

  const NAVIGATION: Navigation = [
    {
      title: "Main items",
      routes: [
        {
          label: "Page",
          path: "/page",
          icon: <DashboardIcon />,
        },
      ],
    },
  ];
  
  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {      
    return (
      <html lang="en">
        <body>
        <AppProvider theme={theme} navigation={NAVIGATION}>
          {children}
        </AppProvider>
        </body>
      </html>
    );
  }
    `;

  const dashboardLayoutContent = `
  import { DashboardLayout } from "@toolpad/core/client/layout";

  export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <DashboardLayout>{children}</DashboardLayout>
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
  "use client";
  import { Inter } from "next/font/google";
  import { createTheme } from "@mui/material/styles";

  const inter = Inter({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
  });

  const baseTheme = createTheme({
    palette: {
      grey: {
        50: "rgba(19, 35, 70, 0.05)",
        100: "rgba(19, 35, 70, 0.1)",
        200: "rgba(19, 35, 70, 0.2)",
        300: "rgba(19, 35, 70, 0.3)",
        400: "rgba(19, 35, 70, 0.4)",
        500: "rgba(19, 35, 70, 0.5)",
        600: "rgba(19, 35, 70, 0.6)",
        700: "rgba(19, 35, 70, 0.7)",
        800: "rgba(19, 35, 70, 0.8)",
        900: "rgba(19, 35, 70, 0.9)",
      },
      divider: "rgba(19, 35, 70, 0.12)",
      background: {
        default: "#fbfcfe",
      },
      action: {
        active: "rgba(19, 35, 70, 0.28)",
        hover: "rgba(19, 35, 70, 0.04)",
        hoverOpacity: 0.04,
        selected: "rgba(66, 165, 245, 0.15)",
        selectedOpacity: 0.15,
        disabled: "rgba(19, 35, 70, 0.2)",
        disabledBackground: "rgba(19, 35, 70, 0.12)",
        disabledOpacity: 0.38,
        focus: "rgba(19, 35, 70, 0.12)",
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
      },
    },
    typography: {
      fontFamily: inter.style.fontFamily,
    },
  });

  const theme = createTheme(baseTheme, {
    typography: {
      h6: {
        fontWeight: "700",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: baseTheme.palette.divider,
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
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: baseTheme.palette.primary.dark,
            padding: 8,
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            color: baseTheme.palette.grey["400"],
            fontSize: 12,
            fontWeight: "700",
            height: 40,
            paddingLeft: 32,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(0, 0, 0, 0)",
            borderRadius: "8px",
            "&.Mui-selected": {
              border: "1px solid rgba(66, 165, 245, 0.3)",
              "& .MuiListItemIcon-root": {
                color: baseTheme.palette.primary.dark,
              },
              "& .MuiTypography-root": {
                color: baseTheme.palette.primary.dark,
              },
              "& .MuiSvgIcon-root": {
                color: baseTheme.palette.primary.dark,
              },
              "& .MuiTouchRipple-child": {
                backgroundColor: baseTheme.palette.primary.dark,
              },
            },
            "& .MuiSvgIcon-root": {
              color: baseTheme.palette.action.active,
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            "& .MuiTypography-root": {
              fontWeight: "500",
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: "34px",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderBottomWidth: 4,
            borderColor: baseTheme.palette.grey["50"],
            margin: "8px 16px 0",
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
