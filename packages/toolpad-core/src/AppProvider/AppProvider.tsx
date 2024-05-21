import * as React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { baseTheme } from '../themes';

export interface Branding {
  title?: string;
  logo?: React.ReactNode;
}

export interface NavigationPageItem {
  kind?: 'page';
  title: string;
  slug?: string;
  icon?: React.ReactNode;
  children?: Navigation;
}

export interface NavigationSubheaderItem {
  kind: 'header';
  title: string;
}

export interface NavigationDividerItem {
  kind: 'divider';
}

export type NavigationItem = NavigationPageItem | NavigationSubheaderItem | NavigationDividerItem;

export type Navigation = NavigationItem[];

export const BrandingContext = React.createContext<Branding | null>(null);

export const NavigationContext = React.createContext<Navigation>([]);

interface AppProviderProps {
  /**
   * The content of the app provider.
   */
  children: React.ReactNode;
  /**
   * [Theme](https://mui.com/material-ui/customization/theming/) used by the app.
   * @default baseTheme
   */
  theme?: Theme;
  /**
   * Branding options for the app.
   * @default null
   */
  branding?: Branding | null;
  /**
   * Navigation definition for the app.
   * @default []
   */
  navigation?: Navigation;
}

/**
 *
 * Demos:
 *
 * - [App Provider](https://mui.com/toolpad/core/react-app-provider/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [AppProvider API](https://mui.com/toolpad/core/api/app-provider)
 */
function AppProvider(props: AppProviderProps) {
  const { children, theme = baseTheme, branding = null, navigation = [] } = props;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrandingContext.Provider value={branding}>
        <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
      </BrandingContext.Provider>
    </ThemeProvider>
  );
}

AppProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Branding options for the app.
   * @default null
   */
  branding: PropTypes.shape({
    logo: PropTypes.node,
    title: PropTypes.string,
  }),
  /**
   * The content of the app provider.
   */
  children: PropTypes.node,
  /**
   * Navigation definition for the app.
   * @default []
   */
  navigation: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        children: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.shape({
              kind: PropTypes.oneOf(['header']).isRequired,
              title: PropTypes.string.isRequired,
            }),
            PropTypes.shape({
              kind: PropTypes.oneOf(['divider']).isRequired,
            }),
          ]).isRequired,
        ),
        icon: PropTypes.node,
        kind: PropTypes.oneOf(['page']),
        slug: PropTypes.string,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['header']).isRequired,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['divider']).isRequired,
      }),
    ]).isRequired,
  ),
  /**
   * [Theme](https://mui.com/material-ui/customization/theming/) used by the app.
   * @default baseTheme
   */
  theme: PropTypes.shape({
    applyStyles: PropTypes.func.isRequired,
    breakpoints: PropTypes.shape({
      between: PropTypes.func.isRequired,
      down: PropTypes.func.isRequired,
      keys: PropTypes.arrayOf(PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired)
        .isRequired,
      not: PropTypes.func.isRequired,
      only: PropTypes.func.isRequired,
      unit: PropTypes.string,
      up: PropTypes.func.isRequired,
      values: PropTypes.shape({
        lg: PropTypes.number.isRequired,
        md: PropTypes.number.isRequired,
        sm: PropTypes.number.isRequired,
        xl: PropTypes.number.isRequired,
        xs: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    components: PropTypes.object,
    direction: PropTypes.oneOf(['ltr', 'rtl']).isRequired,
    mixins: PropTypes.shape({
      toolbar: PropTypes.object.isRequired,
    }).isRequired,
    palette: PropTypes.shape({
      action: PropTypes.shape({
        activatedOpacity: PropTypes.number.isRequired,
        active: PropTypes.string.isRequired,
        disabled: PropTypes.string.isRequired,
        disabledBackground: PropTypes.string.isRequired,
        disabledOpacity: PropTypes.number.isRequired,
        focus: PropTypes.string.isRequired,
        focusOpacity: PropTypes.number.isRequired,
        hover: PropTypes.string.isRequired,
        hoverOpacity: PropTypes.number.isRequired,
        selected: PropTypes.string.isRequired,
        selectedOpacity: PropTypes.number.isRequired,
      }).isRequired,
      augmentColor: PropTypes.func.isRequired,
      background: PropTypes.shape({
        default: PropTypes.string.isRequired,
        paper: PropTypes.string.isRequired,
      }).isRequired,
      common: PropTypes.shape({
        black: PropTypes.string.isRequired,
        white: PropTypes.string.isRequired,
      }).isRequired,
      contrastThreshold: PropTypes.number.isRequired,
      divider: PropTypes.string.isRequired,
      error: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
      getContrastText: PropTypes.func.isRequired,
      grey: PropTypes.shape({
        '100': PropTypes.string.isRequired,
        '200': PropTypes.string.isRequired,
        '300': PropTypes.string.isRequired,
        '400': PropTypes.string.isRequired,
        '50': PropTypes.string.isRequired,
        '500': PropTypes.string.isRequired,
        '600': PropTypes.string.isRequired,
        '700': PropTypes.string.isRequired,
        '800': PropTypes.string.isRequired,
        '900': PropTypes.string.isRequired,
        A100: PropTypes.string.isRequired,
        A200: PropTypes.string.isRequired,
        A400: PropTypes.string.isRequired,
        A700: PropTypes.string.isRequired,
      }).isRequired,
      info: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
      mode: PropTypes.oneOf(['dark', 'light']).isRequired,
      primary: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
      secondary: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
      success: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
      text: PropTypes.shape({
        disabled: PropTypes.string.isRequired,
        primary: PropTypes.string.isRequired,
        secondary: PropTypes.string.isRequired,
      }).isRequired,
      tonalOffset: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          dark: PropTypes.number.isRequired,
          light: PropTypes.number.isRequired,
        }),
      ]).isRequired,
      warning: PropTypes.shape({
        contrastText: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    shadows: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.oneOf(['none']), PropTypes.string]).isRequired,
    ).isRequired,
    shape: PropTypes.shape({
      borderRadius: PropTypes.number.isRequired,
    }).isRequired,
    spacing: PropTypes.func.isRequired,
    transitions: PropTypes.shape({
      create: PropTypes.func.isRequired,
      duration: PropTypes.shape({
        complex: PropTypes.number.isRequired,
        enteringScreen: PropTypes.number.isRequired,
        leavingScreen: PropTypes.number.isRequired,
        short: PropTypes.number.isRequired,
        shorter: PropTypes.number.isRequired,
        shortest: PropTypes.number.isRequired,
        standard: PropTypes.number.isRequired,
      }).isRequired,
      easing: PropTypes.shape({
        easeIn: PropTypes.string.isRequired,
        easeInOut: PropTypes.string.isRequired,
        easeOut: PropTypes.string.isRequired,
        sharp: PropTypes.string.isRequired,
      }).isRequired,
      getAutoHeightDuration: PropTypes.func.isRequired,
    }).isRequired,
    typography: PropTypes.shape({
      body1: PropTypes.object.isRequired,
      body2: PropTypes.object.isRequired,
      button: PropTypes.object.isRequired,
      caption: PropTypes.object.isRequired,
      fontFamily: PropTypes.oneOfType([
        PropTypes.oneOf([
          '-moz-initial',
          'cursive',
          'fantasy',
          'inherit',
          'initial',
          'monospace',
          'revert-layer',
          'revert',
          'sans-serif',
          'serif',
          'unset',
        ]),
        PropTypes.shape({
          '__@iterator@27': PropTypes.func.isRequired,
          anchor: PropTypes.func.isRequired,
          at: PropTypes.func.isRequired,
          big: PropTypes.func.isRequired,
          blink: PropTypes.func.isRequired,
          bold: PropTypes.func.isRequired,
          charAt: PropTypes.func.isRequired,
          charCodeAt: PropTypes.func.isRequired,
          codePointAt: PropTypes.func.isRequired,
          concat: PropTypes.func.isRequired,
          endsWith: PropTypes.func.isRequired,
          fixed: PropTypes.func.isRequired,
          fontcolor: PropTypes.func.isRequired,
          fontsize: PropTypes.func.isRequired,
          includes: PropTypes.func.isRequired,
          indexOf: PropTypes.func.isRequired,
          italics: PropTypes.func.isRequired,
          lastIndexOf: PropTypes.func.isRequired,
          length: PropTypes.number.isRequired,
          link: PropTypes.func.isRequired,
          localeCompare: PropTypes.func.isRequired,
          match: PropTypes.func.isRequired,
          matchAll: PropTypes.func.isRequired,
          normalize: PropTypes.func.isRequired,
          padEnd: PropTypes.func.isRequired,
          padStart: PropTypes.func.isRequired,
          repeat: PropTypes.func.isRequired,
          replace: PropTypes.func.isRequired,
          replaceAll: PropTypes.func.isRequired,
          search: PropTypes.func.isRequired,
          slice: PropTypes.func.isRequired,
          small: PropTypes.func.isRequired,
          split: PropTypes.func.isRequired,
          startsWith: PropTypes.func.isRequired,
          strike: PropTypes.func.isRequired,
          sub: PropTypes.func.isRequired,
          substr: PropTypes.func.isRequired,
          substring: PropTypes.func.isRequired,
          sup: PropTypes.func.isRequired,
          toLocaleLowerCase: PropTypes.func.isRequired,
          toLocaleUpperCase: PropTypes.func.isRequired,
          toLowerCase: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          toUpperCase: PropTypes.func.isRequired,
          trim: PropTypes.func.isRequired,
          trimEnd: PropTypes.func.isRequired,
          trimLeft: PropTypes.func.isRequired,
          trimRight: PropTypes.func.isRequired,
          trimStart: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
      ]),
      fontSize: PropTypes.number.isRequired,
      fontWeightBold: PropTypes.oneOfType([
        PropTypes.oneOf([
          '-moz-initial',
          'bold',
          'bolder',
          'inherit',
          'initial',
          'lighter',
          'normal',
          'revert-layer',
          'revert',
          'unset',
        ]),
        PropTypes.shape({
          '__@iterator@27': PropTypes.func.isRequired,
          anchor: PropTypes.func.isRequired,
          at: PropTypes.func.isRequired,
          big: PropTypes.func.isRequired,
          blink: PropTypes.func.isRequired,
          bold: PropTypes.func.isRequired,
          charAt: PropTypes.func.isRequired,
          charCodeAt: PropTypes.func.isRequired,
          codePointAt: PropTypes.func.isRequired,
          concat: PropTypes.func.isRequired,
          endsWith: PropTypes.func.isRequired,
          fixed: PropTypes.func.isRequired,
          fontcolor: PropTypes.func.isRequired,
          fontsize: PropTypes.func.isRequired,
          includes: PropTypes.func.isRequired,
          indexOf: PropTypes.func.isRequired,
          italics: PropTypes.func.isRequired,
          lastIndexOf: PropTypes.func.isRequired,
          length: PropTypes.number.isRequired,
          link: PropTypes.func.isRequired,
          localeCompare: PropTypes.func.isRequired,
          match: PropTypes.func.isRequired,
          matchAll: PropTypes.func.isRequired,
          normalize: PropTypes.func.isRequired,
          padEnd: PropTypes.func.isRequired,
          padStart: PropTypes.func.isRequired,
          repeat: PropTypes.func.isRequired,
          replace: PropTypes.func.isRequired,
          replaceAll: PropTypes.func.isRequired,
          search: PropTypes.func.isRequired,
          slice: PropTypes.func.isRequired,
          small: PropTypes.func.isRequired,
          split: PropTypes.func.isRequired,
          startsWith: PropTypes.func.isRequired,
          strike: PropTypes.func.isRequired,
          sub: PropTypes.func.isRequired,
          substr: PropTypes.func.isRequired,
          substring: PropTypes.func.isRequired,
          sup: PropTypes.func.isRequired,
          toLocaleLowerCase: PropTypes.func.isRequired,
          toLocaleUpperCase: PropTypes.func.isRequired,
          toLowerCase: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          toUpperCase: PropTypes.func.isRequired,
          trim: PropTypes.func.isRequired,
          trimEnd: PropTypes.func.isRequired,
          trimLeft: PropTypes.func.isRequired,
          trimRight: PropTypes.func.isRequired,
          trimStart: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
        PropTypes.shape({
          toExponential: PropTypes.func.isRequired,
          toFixed: PropTypes.func.isRequired,
          toLocaleString: PropTypes.func.isRequired,
          toPrecision: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
      ]),
      fontWeightLight: PropTypes.oneOfType([
        PropTypes.oneOf([
          '-moz-initial',
          'bold',
          'bolder',
          'inherit',
          'initial',
          'lighter',
          'normal',
          'revert-layer',
          'revert',
          'unset',
        ]),
        PropTypes.shape({
          '__@iterator@27': PropTypes.func.isRequired,
          anchor: PropTypes.func.isRequired,
          at: PropTypes.func.isRequired,
          big: PropTypes.func.isRequired,
          blink: PropTypes.func.isRequired,
          bold: PropTypes.func.isRequired,
          charAt: PropTypes.func.isRequired,
          charCodeAt: PropTypes.func.isRequired,
          codePointAt: PropTypes.func.isRequired,
          concat: PropTypes.func.isRequired,
          endsWith: PropTypes.func.isRequired,
          fixed: PropTypes.func.isRequired,
          fontcolor: PropTypes.func.isRequired,
          fontsize: PropTypes.func.isRequired,
          includes: PropTypes.func.isRequired,
          indexOf: PropTypes.func.isRequired,
          italics: PropTypes.func.isRequired,
          lastIndexOf: PropTypes.func.isRequired,
          length: PropTypes.number.isRequired,
          link: PropTypes.func.isRequired,
          localeCompare: PropTypes.func.isRequired,
          match: PropTypes.func.isRequired,
          matchAll: PropTypes.func.isRequired,
          normalize: PropTypes.func.isRequired,
          padEnd: PropTypes.func.isRequired,
          padStart: PropTypes.func.isRequired,
          repeat: PropTypes.func.isRequired,
          replace: PropTypes.func.isRequired,
          replaceAll: PropTypes.func.isRequired,
          search: PropTypes.func.isRequired,
          slice: PropTypes.func.isRequired,
          small: PropTypes.func.isRequired,
          split: PropTypes.func.isRequired,
          startsWith: PropTypes.func.isRequired,
          strike: PropTypes.func.isRequired,
          sub: PropTypes.func.isRequired,
          substr: PropTypes.func.isRequired,
          substring: PropTypes.func.isRequired,
          sup: PropTypes.func.isRequired,
          toLocaleLowerCase: PropTypes.func.isRequired,
          toLocaleUpperCase: PropTypes.func.isRequired,
          toLowerCase: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          toUpperCase: PropTypes.func.isRequired,
          trim: PropTypes.func.isRequired,
          trimEnd: PropTypes.func.isRequired,
          trimLeft: PropTypes.func.isRequired,
          trimRight: PropTypes.func.isRequired,
          trimStart: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
        PropTypes.shape({
          toExponential: PropTypes.func.isRequired,
          toFixed: PropTypes.func.isRequired,
          toLocaleString: PropTypes.func.isRequired,
          toPrecision: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
      ]),
      fontWeightMedium: PropTypes.oneOfType([
        PropTypes.oneOf([
          '-moz-initial',
          'bold',
          'bolder',
          'inherit',
          'initial',
          'lighter',
          'normal',
          'revert-layer',
          'revert',
          'unset',
        ]),
        PropTypes.shape({
          '__@iterator@27': PropTypes.func.isRequired,
          anchor: PropTypes.func.isRequired,
          at: PropTypes.func.isRequired,
          big: PropTypes.func.isRequired,
          blink: PropTypes.func.isRequired,
          bold: PropTypes.func.isRequired,
          charAt: PropTypes.func.isRequired,
          charCodeAt: PropTypes.func.isRequired,
          codePointAt: PropTypes.func.isRequired,
          concat: PropTypes.func.isRequired,
          endsWith: PropTypes.func.isRequired,
          fixed: PropTypes.func.isRequired,
          fontcolor: PropTypes.func.isRequired,
          fontsize: PropTypes.func.isRequired,
          includes: PropTypes.func.isRequired,
          indexOf: PropTypes.func.isRequired,
          italics: PropTypes.func.isRequired,
          lastIndexOf: PropTypes.func.isRequired,
          length: PropTypes.number.isRequired,
          link: PropTypes.func.isRequired,
          localeCompare: PropTypes.func.isRequired,
          match: PropTypes.func.isRequired,
          matchAll: PropTypes.func.isRequired,
          normalize: PropTypes.func.isRequired,
          padEnd: PropTypes.func.isRequired,
          padStart: PropTypes.func.isRequired,
          repeat: PropTypes.func.isRequired,
          replace: PropTypes.func.isRequired,
          replaceAll: PropTypes.func.isRequired,
          search: PropTypes.func.isRequired,
          slice: PropTypes.func.isRequired,
          small: PropTypes.func.isRequired,
          split: PropTypes.func.isRequired,
          startsWith: PropTypes.func.isRequired,
          strike: PropTypes.func.isRequired,
          sub: PropTypes.func.isRequired,
          substr: PropTypes.func.isRequired,
          substring: PropTypes.func.isRequired,
          sup: PropTypes.func.isRequired,
          toLocaleLowerCase: PropTypes.func.isRequired,
          toLocaleUpperCase: PropTypes.func.isRequired,
          toLowerCase: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          toUpperCase: PropTypes.func.isRequired,
          trim: PropTypes.func.isRequired,
          trimEnd: PropTypes.func.isRequired,
          trimLeft: PropTypes.func.isRequired,
          trimRight: PropTypes.func.isRequired,
          trimStart: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
        PropTypes.shape({
          toExponential: PropTypes.func.isRequired,
          toFixed: PropTypes.func.isRequired,
          toLocaleString: PropTypes.func.isRequired,
          toPrecision: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
      ]),
      fontWeightRegular: PropTypes.oneOfType([
        PropTypes.oneOf([
          '-moz-initial',
          'bold',
          'bolder',
          'inherit',
          'initial',
          'lighter',
          'normal',
          'revert-layer',
          'revert',
          'unset',
        ]),
        PropTypes.shape({
          '__@iterator@27': PropTypes.func.isRequired,
          anchor: PropTypes.func.isRequired,
          at: PropTypes.func.isRequired,
          big: PropTypes.func.isRequired,
          blink: PropTypes.func.isRequired,
          bold: PropTypes.func.isRequired,
          charAt: PropTypes.func.isRequired,
          charCodeAt: PropTypes.func.isRequired,
          codePointAt: PropTypes.func.isRequired,
          concat: PropTypes.func.isRequired,
          endsWith: PropTypes.func.isRequired,
          fixed: PropTypes.func.isRequired,
          fontcolor: PropTypes.func.isRequired,
          fontsize: PropTypes.func.isRequired,
          includes: PropTypes.func.isRequired,
          indexOf: PropTypes.func.isRequired,
          italics: PropTypes.func.isRequired,
          lastIndexOf: PropTypes.func.isRequired,
          length: PropTypes.number.isRequired,
          link: PropTypes.func.isRequired,
          localeCompare: PropTypes.func.isRequired,
          match: PropTypes.func.isRequired,
          matchAll: PropTypes.func.isRequired,
          normalize: PropTypes.func.isRequired,
          padEnd: PropTypes.func.isRequired,
          padStart: PropTypes.func.isRequired,
          repeat: PropTypes.func.isRequired,
          replace: PropTypes.func.isRequired,
          replaceAll: PropTypes.func.isRequired,
          search: PropTypes.func.isRequired,
          slice: PropTypes.func.isRequired,
          small: PropTypes.func.isRequired,
          split: PropTypes.func.isRequired,
          startsWith: PropTypes.func.isRequired,
          strike: PropTypes.func.isRequired,
          sub: PropTypes.func.isRequired,
          substr: PropTypes.func.isRequired,
          substring: PropTypes.func.isRequired,
          sup: PropTypes.func.isRequired,
          toLocaleLowerCase: PropTypes.func.isRequired,
          toLocaleUpperCase: PropTypes.func.isRequired,
          toLowerCase: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          toUpperCase: PropTypes.func.isRequired,
          trim: PropTypes.func.isRequired,
          trimEnd: PropTypes.func.isRequired,
          trimLeft: PropTypes.func.isRequired,
          trimRight: PropTypes.func.isRequired,
          trimStart: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
        PropTypes.shape({
          toExponential: PropTypes.func.isRequired,
          toFixed: PropTypes.func.isRequired,
          toLocaleString: PropTypes.func.isRequired,
          toPrecision: PropTypes.func.isRequired,
          toString: PropTypes.func.isRequired,
          valueOf: PropTypes.func.isRequired,
        }),
      ]),
      h1: PropTypes.object.isRequired,
      h2: PropTypes.object.isRequired,
      h3: PropTypes.object.isRequired,
      h4: PropTypes.object.isRequired,
      h5: PropTypes.object.isRequired,
      h6: PropTypes.object.isRequired,
      htmlFontSize: PropTypes.number.isRequired,
      overline: PropTypes.object.isRequired,
      pxToRem: PropTypes.func.isRequired,
      subtitle1: PropTypes.object.isRequired,
      subtitle2: PropTypes.object.isRequired,
    }).isRequired,
    unstable_strictMode: PropTypes.bool,
    unstable_sx: PropTypes.func.isRequired,
    unstable_sxConfig: PropTypes.object.isRequired,
    zIndex: PropTypes.shape({
      appBar: PropTypes.number.isRequired,
      drawer: PropTypes.number.isRequired,
      fab: PropTypes.number.isRequired,
      mobileStepper: PropTypes.number.isRequired,
      modal: PropTypes.number.isRequired,
      snackbar: PropTypes.number.isRequired,
      speedDial: PropTypes.number.isRequired,
      tooltip: PropTypes.number.isRequired,
    }).isRequired,
  }),
} as any;

export { AppProvider };
