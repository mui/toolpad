import * as React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import { useTheme } from '@mui/system';
import { exactProp } from '@mui/utils';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Demo from 'docs/src/modules/components/Demo';
import useMediaQuery from '@mui/material/useMediaQuery';
import MarkdownElement from 'docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from 'docs/src/modules/components/AppLayoutDocs';
import { useTranslate, useUserLanguage } from 'docs/src/modules/utils/i18n';
import Ad from 'docs/src/modules/components/Ad';
import AdGuest from 'docs/src/modules/components/AdGuest';

function noComponent(moduleID) {
  return function NoComponent() {
    throw new Error(`No demo component provided for '${moduleID}'`);
  };
}

const classes = {
  imageContainer: 'MuiToolpadDocs-ImageContainer',
  enlargeIcon: 'MuiToolpadDocs-EnlargeIcon',
  fullSizeImage: 'MuiToolpadDocs-FullSizeImage',
  fullSizeImageDialog: 'MuiToolpadDocs-FullSizeImageDialog',
  fullSizeImageDialogTitle: 'MuiToolpadDocs-FullSizeImageDialogTitle',
  fullSizeImageDialogCloseButton: 'MuiToolpadDocs-FullSizeImageDialogCloseButton',
};

const Root = styled('div')(
  ({ theme }) => {
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
    return {
      '& .markdown-body': {
        lineHeight: 1.7,
      },
      '& .arcade': {
        position: 'relative',
        paddingBottom: 'calc(54.79166666666667% + 41px)',
        height: 0,
      },
      [`& .${classes.imageContainer}`]: {
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
      },

      '& img, & video': {
        border: `1px solid ${theme.palette.divider}`,
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',

        // Override styles defined in MarkdownElement
        borderRadius: '4px!important',
        display: 'block!important',
      },

      [`& .${classes.imageContainer}:hover .${classes.enlargeIcon}`]: {
        // breakpoints
        opacity: isMdUp ? 0.7 : 0,
      },

      [`& .${classes.enlargeIcon}`]: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 40,
        height: 40,
        backgroundImage: 'url(/static/icons/enlarge.svg)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0,
        transition: 'opacity 0.3s',
      },

      '& .image-caption': {
        fontSize: theme.typography.pxToRem(13),
        marginTop: 0,
        marginBottom: theme.spacing(2),
        textAlign: 'center',
        color: (theme.vars || theme).palette.grey[700],
        '& a': {
          color: 'inherit',
          textDecoration: 'underline',
        },
      },
    };
  },
  ({ theme }) =>
    theme.applyDarkStyles({
      // '& img, & video, & .arcade': {
      //   boxShadow: `0 0 10px ${theme.palette.grey[700]}`,
      // },
      '& .image-caption': {
        color: (theme.vars || theme).palette.grey[500],
      },
    }),
);

const ImageViewer = styled(Dialog)(({ theme }) => ({
  [`& .${classes.fullSizeImageDialog}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingBottom: 0,
  },
  [`& .${classes.fullSizeImage}`]: {
    maxWidth: '100%',
    maxHeight: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
  },
}));

export default function MarkdownDocs(props) {
  const theme = useTheme();

  const {
    disableAd = false,
    disableToc = false,
    demos = {},
    docs,
    demoComponents,
    srcComponents,
  } = props;

  const userLanguage = useUserLanguage();
  const t = useTranslate();

  const localizedDoc = docs[userLanguage] || docs.en;
  const { description, location, rendered, title, toc } = localizedDoc;

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [imageViewerSrc, setImageViewerSrc] = React.useState(null);

  const handleImageViewerOpen = React.useCallback(
    (event) => {
      let src = event.target.currentSrc;
      if (isMdUp) {
        if (event.target.tagName === 'SPAN') {
          src = event.target.previousElementSibling.currentSrc;
        }
        setImageViewerOpen(true);
        setImageViewerSrc(src);
      }
    },
    [isMdUp],
  );

  if (typeof window !== 'undefined') {
    window.handleImageViewerOpen = handleImageViewerOpen;
  }

  const handleImageViewerClose = React.useCallback(() => {
    setImageViewerOpen(false);
  }, []);

  return (
    <AppLayoutDocs
      description={description}
      disableAd={disableAd}
      disableToc={disableToc}
      location={location}
      title={title}
      toc={toc}
    >
      <Root>
        {disableAd ? null : (
          <AdGuest>
            <Ad />
          </AdGuest>
        )}
        {rendered.map((renderedMarkdownOrDemo, index) => {
          if (typeof renderedMarkdownOrDemo === 'string') {
            return (
              <React.Fragment key={index}>
                <MarkdownElement renderedMarkdown={renderedMarkdownOrDemo} />
              </React.Fragment>
            );
          }

          if (renderedMarkdownOrDemo.component) {
            const name = renderedMarkdownOrDemo.component;
            const Component = srcComponents?.[name];

            if (Component === undefined) {
              throw new Error(`No component found at the path ${path.join('docs/src', name)}`);
            }

            return (
              <React.Fragment key={index}>
                <Component {...renderedMarkdownOrDemo} markdown={localizedDoc} />
              </React.Fragment>
            );
          }

          const name = renderedMarkdownOrDemo.demo;
          const demo = demos?.[name];
          if (demo === undefined) {
            const errorMessage = [
              `Missing demo: ${name}. You can use one of the following:`,
              Object.keys(demos),
            ].join('\n');

            if (userLanguage === 'en') {
              throw new Error(errorMessage);
            }

            if (process.env.NODE_ENV !== 'production') {
              console.error(errorMessage);
            }

            const warnIcon = (
              <span role="img" aria-label={t('emojiWarning')}>
                ⚠️
              </span>
            );
            return (
              <div key={index}>
                {/* eslint-disable-next-line material-ui/no-hardcoded-labels */}
                {warnIcon} Missing demo `{name}` {warnIcon}
              </div>
            );
          }

          const splitLocationBySlash = location.split('/');
          splitLocationBySlash.pop();
          const fileNameWithLocation = `${splitLocationBySlash.join('/')}/${name}`;

          return (
            <Demo
              key={index}
              mode={theme.palette.mode}
              demo={{
                raw: demo.raw,
                js: demoComponents[demo.module] ?? noComponent(demo.module),
                scope: demos.scope,
                jsxPreview: demo.jsxPreview,
                rawTS: demo.rawTS,
                tsx: demoComponents[demo.moduleTS] ?? null,
                gaLabel: fileNameWithLocation.replace(/^\/docs\/data\//, ''),
              }}
              disableAd={disableAd}
              demoOptions={renderedMarkdownOrDemo}
              githubLocation={`${process.env.SOURCE_CODE_REPO}/blob/v${process.env.LIB_VERSION}${fileNameWithLocation}`}
            />
          );
        })}
        <ImageViewer
          open={imageViewerOpen}
          onClose={handleImageViewerClose}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent className={classes.fullSizeImageDialog}>
            <img src={imageViewerSrc} className={classes.fullSizeImage} alt="Sup" />
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              className={classes.fullSizeImageDialogCloseButton}
              onClick={handleImageViewerClose}
            >
              Close
            </Button>
          </DialogActions>
        </ImageViewer>
      </Root>
    </AppLayoutDocs>
  );
}

MarkdownDocs.propTypes = {
  demoComponents: PropTypes.object,
  demos: PropTypes.object,
  disableAd: PropTypes.bool,
  disableCssVarsProvider: PropTypes.bool,
  disableToc: PropTypes.bool,
  docs: PropTypes.object.isRequired,
  srcComponents: PropTypes.object,
};

if (process.env.NODE_ENV !== 'production') {
  MarkdownDocs.propTypes = exactProp(MarkdownDocs.propTypes);
}
