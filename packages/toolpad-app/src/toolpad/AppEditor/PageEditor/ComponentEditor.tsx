import { Stack, styled, Typography } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinition, ArgTypeDefinitions, ComponentConfig } from '@mui/toolpad-core';
import { ExactEntriesOf } from '../../../utils/types';
import * as appDom from '../../../appDom';
import NodeAttributeEditor from './NodeAttributeEditor';
import { useDom } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import PageOptionsPanel from './PageOptionsPanel';
import ErrorAlert from './ErrorAlert';
import NodeNameEditor from '../NodeNameEditor';
import { useToolpadComponent } from '../toolpadComponents';
import { getElementNodeComponentId } from '../../../toolpadComponents';
import { boxAlignArgTypeDef, boxJustifyArgTypeDef } from '../../../toolpadComponents/layoutBox';

const classes = {
  control: 'Toolpad_Control',
};

const ComponentPropsEditorRoot = styled('div')(({ theme }) => ({
  [`& .${classes.control}`]: {
    margin: theme.spacing(1, 0),
  },
}));

function shouldRenderControl(propTypeDef: ArgTypeDefinition) {
  if (propTypeDef.typeDef.type === 'element') {
    return propTypeDef.control?.type !== 'slot' && propTypeDef.control?.type !== 'slots';
  }
  return true;
}

interface ComponentPropsEditorProps<P> {
  node: appDom.ElementNode<P>;
  componentConfig: ComponentConfig<P>;
}

function ComponentPropsEditor<P>({ componentConfig, node }: ComponentPropsEditorProps<P>) {
  const hasLayoutControls = componentConfig.hasBoxAlign || componentConfig.hasBoxJustify;

  return (
    <ComponentPropsEditorRoot>
      {hasLayoutControls ? (
        <React.Fragment>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Layout:
          </Typography>
          {componentConfig.hasBoxAlign ? (
            <div className={classes.control}>
              <NodeAttributeEditor
                node={node}
                namespace="layout"
                name="boxAlign"
                argType={boxAlignArgTypeDef}
              />
            </div>
          ) : null}
          {componentConfig.hasBoxJustify ? (
            <div className={classes.control}>
              <NodeAttributeEditor
                node={node}
                namespace="layout"
                name="boxJustify"
                argType={boxJustifyArgTypeDef}
              />
            </div>
          ) : null}
        </React.Fragment>
      ) : null}
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Properties:
      </Typography>
      {(Object.entries(componentConfig.argTypes) as ExactEntriesOf<ArgTypeDefinitions<P>>).map(
        ([propName, propTypeDef]) =>
          propTypeDef && shouldRenderControl(propTypeDef) ? (
            <div key={propName} className={classes.control}>
              <NodeAttributeEditor
                node={node}
                namespace="props"
                name={propName}
                argType={propTypeDef}
              />
            </div>
          ) : null,
      )}
    </ComponentPropsEditorRoot>
  );
}

interface SelectedNodeEditorProps {
  node: appDom.ElementNode;
}

function SelectedNodeEditor({ node }: SelectedNodeEditorProps) {
  const dom = useDom();
  const { viewState } = usePageEditorState();
  const nodeError = viewState.nodes[node.id]?.error;
  const componentConfig = viewState.nodes[node.id]?.componentConfig || { argTypes: {} };

  const component = useToolpadComponent(dom, getElementNodeComponentId(node));

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="subtitle1">
        Component: {component?.displayName || '<unknown>'}
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        ID: {node.id}
      </Typography>
      <NodeNameEditor node={node} />
      {nodeError ? <ErrorAlert error={nodeError} /> : null}
      {node ? (
        <React.Fragment>
          <ComponentPropsEditor componentConfig={componentConfig} node={node} />
        </React.Fragment>
      ) : null}
    </Stack>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const dom = useDom();
  const editor = usePageEditorState();

  const { selection } = editor;

  const selectedNode = selection ? appDom.getNode(dom, selection) : null;

  return (
    <div className={className}>
      {selectedNode && appDom.isElement(selectedNode) ? (
        // Add key to make sure it mounts every time selected node changes
        <SelectedNodeEditor key={selectedNode.id} node={selectedNode} />
      ) : (
        <PageOptionsPanel />
      )}
    </div>
  );
}
