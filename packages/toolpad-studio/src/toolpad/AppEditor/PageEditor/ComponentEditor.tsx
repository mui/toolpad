import { Stack, styled, Typography, Divider } from '@mui/material';
import * as React from 'react';
// TODO: Remove lodash-es import here
// eslint-disable-next-line no-restricted-imports
import { groupBy } from 'lodash-es';
import {
  ArgTypeDefinition,
  ArgTypeDefinitions,
  ComponentConfig,
  LiveBinding,
} from '@toolpad/studio-runtime';
import { ExactEntriesOf } from '@toolpad/utils/types';
import * as appDom from '@toolpad/studio-runtime/appDom';
import NodeAttributeEditor from './NodeAttributeEditor';
import { usePageEditorState } from './PageEditorProvider';
import { useToolpadComponent } from '../toolpadComponents';
import { getElementNodeComponentId } from '../../../runtime/toolpadComponents';
import {
  layoutBoxArgTypes,
  LAYOUT_DIRECTION_BOTH,
  LAYOUT_DIRECTION_HORIZONTAL,
  LAYOUT_DIRECTION_VERTICAL,
} from '../../../runtime/toolpadComponents/layoutBox';
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

  const argTypesByCategory: Record<string, ExactEntriesOf<ArgTypeDefinitions<P>>> = groupBy(
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
            <Typography variant="body2">Alignment:</Typography>
            <Stack direction="row">
              {hasLayoutHorizontalControls ? (
                <NodeAttributeEditor
                  node={node}
                  namespace="layout"
                  name="horizontalAlign"
                  argType={layoutBoxArgTypes.horizontalAlign}
                  sx={{ maxWidth: 110 }}
                />
              ) : null}
              {hasLayoutVerticalControls ? (
                <NodeAttributeEditor
                  node={node}
                  namespace="layout"
                  name="verticalAlign"
                  argType={layoutBoxArgTypes.verticalAlign}
                />
              ) : null}
            </Stack>
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
            propTypeDef && shouldRenderControl(propTypeDef, propName, props) ? (
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
  const { bindings, viewState } = usePageEditorState();

  const componentConfig = viewState.nodes[node.id]?.componentConfig || { argTypes: {} };

  const component = useToolpadComponent(getElementNodeComponentId(node));

  const displayName = component?.displayName || '<unknown>';

  return (
    <ElementContext.Provider value={node}>
      <Stack direction="column" gap={0}>
        <MarkdownTooltip placement="left" title={componentConfig.helperText ?? displayName}>
          <Typography variant="body1">{node.name}</Typography>
        </MarkdownTooltip>
        <Divider sx={{ mt: 1 }} />
        {node ? (
          <ComponentPropsEditor bindings={bindings} componentConfig={componentConfig} node={node} />
        ) : null}
      </Stack>
    </ElementContext.Provider>
  );
}

export interface ComponentEditorProps {
  node: appDom.ElementNode;
  className?: string;
}

export default function ComponentEditor({ node, className }: ComponentEditorProps) {
  return (
    <ComponentEditorRoot className={className} data-testid="component-editor">
      <SelectedNodeEditor key={node.id} node={node} />
    </ComponentEditorRoot>
  );
}
