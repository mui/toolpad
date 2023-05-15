import { Stack, styled, Typography, Divider } from '@mui/material';
import * as React from 'react';
import * as _ from 'lodash-es';
import {
  ArgTypeDefinition,
  ArgTypeDefinitions,
  ComponentConfig,
  LiveBinding,
} from '@mui/toolpad-core';
import { ExactEntriesOf } from '../../../utils/types';
import * as appDom from '../../../appDom';
import NodeAttributeEditor from './NodeAttributeEditor';
import { useDom, useAppState } from '../../AppState';
import { usePageEditorState } from './PageEditorProvider';
import PageOptionsPanel from './PageOptionsPanel';
import ErrorAlert from './ErrorAlert';
import NodeNameEditor from '../NodeNameEditor';
import { useToolpadComponent } from '../toolpadComponents';
import { getElementNodeComponentId } from '../../../toolpadComponents';
import {
  layoutBoxArgTypes,
  LAYOUT_DIRECTION_BOTH,
  LAYOUT_DIRECTION_HORIZONTAL,
  LAYOUT_DIRECTION_VERTICAL,
} from '../../../toolpadComponents/layoutBox';
import ElementContext from '../ElementContext';
import MarkdownTooltip from '../../../components/MarkdownTooltip';

const classes = {
  control: 'Toolpad_Control',
  sectionHeading: 'Toolpad_ControlsSectionHeading',
};

const ComponentEditorRoot = styled('div')(({ theme }) => ({
  [`& .${classes.control}`]: {
    margin: theme.spacing(0, 0),
  },
  [`& .${classes.sectionHeading}`]: {
    margin: theme.spacing(0, 0, -0.5, 0),
  },
}));

function shouldRenderControl<P extends object>(
  propTypeDef: ArgTypeDefinition<P>,
  propName: keyof P,
  props: P,
  componentConfig: ComponentConfig<P>,
) {
  if (propTypeDef.type === 'element' || propTypeDef.type === 'template') {
    return (
      propTypeDef.control?.type !== 'slot' &&
      propTypeDef.control?.type !== 'slots' &&
      propTypeDef.control?.type !== 'layoutSlot'
    );
  }

  if (typeof propTypeDef.visible === 'boolean') {
    return propTypeDef.visible;
  }

  if (typeof propTypeDef.visible === 'function') {
    return propTypeDef.visible(props);
  }

  if (componentConfig.resizableHeightProp && propName === componentConfig.resizableHeightProp) {
    return false;
  }

  return true;
}

interface ComponentPropsEditorProps<P extends object> {
  node: appDom.ElementNode<P>;
  bindings: Partial<Record<string, LiveBinding>>;
  componentConfig: ComponentConfig<P>;
}

function ComponentPropsEditor<P extends object>({
  componentConfig,
  bindings,
  node,
}: ComponentPropsEditorProps<P>) {
  const { layoutDirection } = componentConfig;

  const hasLayoutHorizontalControls =
    layoutDirection === LAYOUT_DIRECTION_HORIZONTAL || layoutDirection === LAYOUT_DIRECTION_BOTH;
  const hasLayoutVerticalControls =
    layoutDirection === LAYOUT_DIRECTION_VERTICAL || layoutDirection === LAYOUT_DIRECTION_BOTH;
  const hasLayoutControls = hasLayoutHorizontalControls || hasLayoutVerticalControls;

  const props = React.useMemo(() => {
    const propsPattern = new RegExp(`(?<=${node.id}.props.)(.*)`);
    return Object.fromEntries(
      Object.entries(bindings).map(([key, binding]) => [
        key.match(propsPattern)?.[0],
        binding?.value,
      ]),
    );
  }, [bindings, node.id]);

  const argTypesByCategory = _.groupBy(
    Object.entries(componentConfig.argTypes || {}) as ExactEntriesOf<ArgTypeDefinitions<P>>,
    ([, propTypeDef]) => propTypeDef?.category || 'properties',
  );

  return (
    <React.Fragment>
      {hasLayoutControls ? (
        <React.Fragment>
          <Typography variant="overline" className={classes.sectionHeading}>
            Layout:
          </Typography>

          <div className={classes.control}>
            <NodeAttributeEditor
              node={node}
              namespace="layout"
              name={hasLayoutHorizontalControls ? 'horizontalAlign' : 'verticalAlign'}
              argType={
                hasLayoutHorizontalControls
                  ? layoutBoxArgTypes.horizontalAlign
                  : layoutBoxArgTypes.verticalAlign
              }
            />
          </div>

          <Divider sx={{ mt: 1 }} />
        </React.Fragment>
      ) : null}
      {Object.entries(argTypesByCategory).map(([category, argTypeEntries]) => (
        <React.Fragment key={category}>
          <Typography variant="overline" className={classes.sectionHeading}>
            {category}:
          </Typography>
          {argTypeEntries.map(([propName, propTypeDef]) =>
            propTypeDef && shouldRenderControl(propTypeDef, propName, props, componentConfig) ? (
              <div key={propName} className={classes.control}>
                <NodeAttributeEditor
                  node={node}
                  namespace="props"
                  props={props}
                  name={propName}
                  argType={propTypeDef}
                />
              </div>
            ) : null,
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

interface SelectedNodeEditorProps {
  node: appDom.ElementNode;
}

function SelectedNodeEditor({ node }: SelectedNodeEditorProps) {
  const { dom } = useDom();
  const { bindings, viewState } = usePageEditorState();

  const nodeError = viewState.nodes[node.id]?.error;
  const componentConfig = viewState.nodes[node.id]?.componentConfig || { argTypes: {} };

  const component = useToolpadComponent(dom, getElementNodeComponentId(node));

  const displayName = component?.displayName || '<unknown>';

  return (
    <ElementContext.Provider value={node}>
      <Stack direction="column" gap={1}>
        <MarkdownTooltip placement="left" title={componentConfig.helperText ?? displayName}>
          <Typography variant="subtitle1">Component: {displayName}</Typography>
        </MarkdownTooltip>
        <NodeNameEditor node={node} />
        {nodeError ? <ErrorAlert error={nodeError} /> : null}
        <Divider sx={{ mt: 1 }} />
        {node ? (
          <ComponentPropsEditor bindings={bindings} componentConfig={componentConfig} node={node} />
        ) : null}
      </Stack>
    </ElementContext.Provider>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const { dom } = useDom();
  const { currentView } = useAppState();
  const selectedNodeId = currentView.kind === 'page' ? currentView.selectedNodeId : null;

  const selectedNode = selectedNodeId ? appDom.getMaybeNode(dom, selectedNodeId) : null;

  return (
    <ComponentEditorRoot className={className} data-testid="component-editor">
      {selectedNode && appDom.isElement(selectedNode) ? (
        // Add key to make sure it mounts every time selected node changes
        <SelectedNodeEditor key={selectedNode.id} node={selectedNode} />
      ) : (
        <PageOptionsPanel />
      )}
    </ComponentEditorRoot>
  );
}
