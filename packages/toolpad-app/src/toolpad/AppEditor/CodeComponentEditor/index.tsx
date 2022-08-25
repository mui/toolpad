import * as React from 'react';
import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import {
  NodeId,
  TOOLPAD_COMPONENT,
  ArgTypeDefinitions,
  ArgTypeDefinition,
} from '@mui/toolpad-core';
import { useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import { tryFormat } from '../../../utils/prettier';
import useShortcut from '../../../utils/useShortcut';
import { usePrompt } from '../../../utils/router';
import NodeNameEditor from '../NodeNameEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useCodeComponent from './useCodeComponent';
import { filterValues, mapValues } from '../../../utils/collections';
import lazyComponent from '../../../utils/lazyComponent';
import CenteredSpinner from '../../../components/CenteredSpinner';
import SplitPane from '../../../components/SplitPane';
import { getDefaultControl } from '../../propertyControls';
import { WithControlledProp } from '../../../utils/types';
import useDebounced from '../../../utils/useDebounced';
import EditorCanvasHost from '../PageEditor/EditorCanvasHost';

const TypescriptEditor = lazyComponent(() => import('../../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <CenteredSpinner />,
});

interface PropertyEditorProps extends WithControlledProp<any> {
  name: string;
  argType: ArgTypeDefinition;
}

function PropertyEditor({ argType, name, value, onChange }: PropertyEditorProps) {
  const Control = getDefaultControl(argType);
  if (!Control) {
    return null;
  }
  return <Control label={name} propType={argType.typeDef} value={value} onChange={onChange} />;
}

interface PropertiesEditorProps extends WithControlledProp<Record<string, any>> {
  argTypes: ArgTypeDefinitions;
}

function PropertiesEditor({ argTypes, value, onChange }: PropertiesEditorProps) {
  return (
    <Stack sx={{ p: 2, gap: 2, overflow: 'auto', height: '100%' }}>
      <Typography>Properties:</Typography>
      {Object.entries(argTypes).map(([name, argType]) => {
        invariant(argType, 'argType not defined');
        return (
          <ErrorBoundary fallback={<div>{name}</div>} resetKeys={[argType]}>
            <PropertyEditor
              name={name}
              argType={argType}
              value={value[name]}
              onChange={(newPropValue) => onChange({ ...value, [name]: newPropValue })}
            />
          </ErrorBoundary>
        );
      })}
    </Stack>
  );
}

const DEFAULT_ARGTYPES: ArgTypeDefinitions = {};

function createViewerDom(dom: appDom.AppDom, initialCode: string) {
  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);
  for (const page of pages) {
    dom = appDom.removeNode(dom, page.id);
  }

  const newCodeComponentNode = appDom.createNode(dom, 'codeComponent', {
    name: 'viewerComponent',
    attributes: {
      code: appDom.createConst(initialCode),
    },
  });

  dom = appDom.addNode(dom, newCodeComponentNode, root, 'codeComponents');

  const page = appDom.createNode(dom, 'page', {
    name: 'viewerPage',
    attributes: { title: appDom.createConst('code component viewer') },
  });
  dom = appDom.addNode(dom, page, root, 'pages');

  const instance = appDom.createNode(dom, 'element', {
    name: 'viewerInstance',
    attributes: { component: appDom.createConst(`codeComponent.${newCodeComponentNode.id}`) },
  });

  dom = appDom.addNode(dom, instance, page, 'children');

  return dom;
}

const EXTRA_LIBS_HTTP_MODULES = [
  {
    content: `declare module "https://*";`,
  },
];

interface CodeComponentEditorContentProps {
  codeComponentNode: appDom.CodeComponentNode;
}

function CodeComponentEditorContent({ codeComponentNode }: CodeComponentEditorContentProps) {
  const domApi = useDomApi();
  const dom = useDom();

  const { data: typings } = useQuery<Record<string, string>>(['/typings.json'], async () => {
    return fetch('/typings.json').then((res) => res.json());
  });

  const extraLibs = React.useMemo(() => {
    if (typings) {
      return [
        ...Object.entries(typings).map(([path, content]) => ({
          content,
          filePath: `file:///${path}`,
        })),
        ...EXTRA_LIBS_HTTP_MODULES,
      ];
    }

    return EXTRA_LIBS_HTTP_MODULES;
  }, [typings]);

  const [input, setInput] = React.useState<string>(codeComponentNode.attributes.code.value);
  React.useEffect(
    () => setInput(codeComponentNode.attributes.code.value),
    [codeComponentNode.attributes.code.value],
  );

  const frameRef = React.useRef<HTMLIFrameElement>(null);

  usePageTitle(`${codeComponentNode.name} | Toolpad editor`);

  const handleSave = React.useCallback(() => {
    const pretty = tryFormat(input);
    setInput(pretty);
    domApi.setNodeNamespacedProp(
      codeComponentNode,
      'attributes',
      'code',
      appDom.createConst(pretty),
    );
  }, [codeComponentNode, domApi, input]);

  const allChangesAreCommitted = codeComponentNode.attributes.code.value === input;

  usePrompt(
    'Your code has unsaved changes. Are you sure you want to navigate away? All changes will be discarded.',
    !allChangesAreCommitted,
  );

  useShortcut({ code: 'KeyS', metaKey: true }, handleSave);

  const [iframeLoaded, onLoad] = React.useReducer(() => true, false);

  React.useEffect(() => {
    const document = frameRef.current?.contentDocument;
    // When we hydrate the iframe then the load event is already dispatched
    // once the iframe markup is parsed (maybe later but the important part is
    // that it happens before React can attach event listeners).
    // We need to check the readyState of the document once the iframe is mounted
    // and "replay" the missed load event.
    // See https://github.com/facebook/react/pull/13862 for ongoing effort in React
    // (though not with iframes in mind).
    if (document?.readyState === 'complete' && !iframeLoaded) {
      onLoad();
    }
  }, [iframeLoaded]);

  const [props, setProps] = React.useState({});

  const debouncedInput = useDebounced(input, 250);

  const { Component: CodeComponent } = useCodeComponent(debouncedInput);
  const argTypes: ArgTypeDefinitions<any> = CodeComponent
    ? CodeComponent[TOOLPAD_COMPONENT].argTypes
    : DEFAULT_ARGTYPES;

  const [previewDom, setPreviewDom] = React.useState(() => createViewerDom(dom, input));

  const previewProps = React.useMemo(
    () => ({
      ...mapValues(argTypes, (argType) => argType?.defaultValue),
      ...filterValues(props, (propValue) => typeof propValue !== 'undefined'),
    }),
    [argTypes, props],
  );

  const debouncedProps = useDebounced(previewProps, 250);

  React.useEffect(() => {
    setPreviewDom((existingDom) => {
      const componentNodeId = appDom.getNodeIdByName(existingDom, 'viewerComponent');
      invariant(componentNodeId, 'viewerComponent missing');
      const componentNode = appDom.getNode(existingDom, componentNodeId, 'codeComponent');

      const instanceNodeId = appDom.getNodeIdByName(existingDom, 'viewerInstance');
      invariant(instanceNodeId, 'viewerInstance missing');
      const instanceNode = appDom.getNode(existingDom, instanceNodeId, 'element');

      existingDom = appDom.setNodeNamespacedProp(
        existingDom,
        componentNode,
        'attributes',
        'code',
        appDom.createConst(debouncedInput),
      );

      const theProps = mapValues(debouncedProps, (value) => appDom.createConst(value));

      existingDom = appDom.setNodeNamespace(existingDom, instanceNode, 'props', theProps);

      return existingDom;
    });
  }, [debouncedInput, debouncedProps]);

  const pageNodeId = appDom.getNodeIdByName(previewDom, 'viewerPage');
  invariant(pageNodeId, 'viewerPage missing');
  const pageNode = appDom.getNode(previewDom, pageNodeId, 'page');

  return (
    <React.Fragment>
      <Stack sx={{ height: '100%' }}>
        <Toolbar sx={{ mt: 2, mb: 2 }}>
          <NodeNameEditor node={codeComponentNode} sx={{ maxWidth: 300 }} />
        </Toolbar>
        <Box flex={1}>
          <SplitPane split="vertical" allowResize size="50%">
            <TypescriptEditor
              value={input}
              onChange={(newValue) => setInput(newValue || '')}
              extraLibs={extraLibs}
            />

            <SplitPane split="horizontal" allowResize size="20%" primary="second">
              <EditorCanvasHost
                sx={{ height: '100%' }}
                appId="123" // TODO: what should go here?
                pageNodeId={pageNode.id}
                dom={previewDom}
              />
              <PropertiesEditor argTypes={argTypes} value={props} onChange={setProps} />
            </SplitPane>
          </SplitPane>
        </Box>
        <Toolbar
          sx={{
            justifyContent: 'end',
          }}
        >
          <Button disabled={allChangesAreCommitted} onClick={handleSave} variant="contained">
            Update
          </Button>
        </Toolbar>
      </Stack>
    </React.Fragment>
  );
}

interface CodeComponentEditorProps {
  appId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CodeComponentEditor({ appId }: CodeComponentEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const codeComponentNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'codeComponent');
  return codeComponentNode ? (
    <CodeComponentEditorContent key={nodeId} codeComponentNode={codeComponentNode} />
  ) : (
    <Typography sx={{ p: 4 }}>Non-existing Code Component &quot;{nodeId}&quot;</Typography>
  );
}
