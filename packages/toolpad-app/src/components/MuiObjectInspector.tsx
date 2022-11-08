import * as React from 'react';
import clsx from 'clsx';
import { styled, SvgIcon } from '@mui/material';
import { NodeApi, NodeRendererProps, Tree } from 'react-arborist';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

function getType(value: unknown) {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'string' && /^(#|rgb|rgba|hsl|hsla)/.test(value)) {
    return 'color';
  }

  return typeof value;
}

type PropValueType = ReturnType<typeof getType>;

function getLabel(value: unknown, type: PropValueType): string {
  switch (type) {
    case 'array':
      return `Array(${(value as unknown[]).length})`;
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'function':
      return `f ${(value as Function).name}()`;
    case 'object':
      return 'Object';
    case 'string':
      return `"${value}"`;
    case 'symbol':
      return `Symbol(${String(value)})`;
    case 'bigint':
    case 'boolean':
    case 'number':
    default:
      return String(value);
  }
}

function getTokenType(type: string): string {
  switch (type) {
    case 'color':
      return 'string';
    case 'object':
    case 'array':
      return 'comment';
    default:
      return type;
  }
}

interface ObjectTreePropertyNode {
  id: string;
  name?: string;
  value: unknown;
  type: PropValueType;
  children?: ObjectTreePropertyNode[];
}

function createTreeData(data: object, id = '$ROOT'): ObjectTreePropertyNode[] {
  const result: ObjectTreePropertyNode[] = [];
  for (const [name, value] of Object.entries(data)) {
    const itemId = `${id}.${name}`;
    const type = getType(value);
    result.push({
      id: itemId,
      name,
      value,
      type,
      children: value && typeof value === 'object' ? createTreeData(value, itemId) : undefined,
    });
  }
  return result;
}

const classes = {
  node: 'Toolpad__ObjectExplorerNode',
  token: 'Toolpad__ObjectExplorerToken',
};

const StyledTree = styled(Tree<ObjectTreePropertyNode>)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#d4d4d4' : '#000000',
  background: theme.palette.mode === 'dark' ? '#0c2945' : '#ffffff',
  fontSize: 12,
  fontFamily:
    '"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;',

  [`.${classes.node}`]: {
    whiteSpace: 'noWrap',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  [`& .${classes.token}.string`]: {
    color: theme.palette.mode === 'dark' ? '#ce9178' : '#a31515',
  },
  [`& .${classes.token}.boolean`]: {
    color: theme.palette.mode === 'dark' ? '#569cd6' : '#0000ff',
  },
  [`& .${classes.token}.number`]: {
    color: theme.palette.mode === 'dark' ? '#b5cea8' : '#098658',
  },
  [`& .${classes.token}.comment`]: {
    color: theme.palette.mode === 'dark' ? '#608b4e' : '#008000',
  },
  [`& .${classes.token}.null`]: {
    color: theme.palette.mode === 'dark' ? '#569cd6' : '#0000ff',
  },
  [`& .${classes.token}.undefined`]: {
    color: theme.palette.mode === 'dark' ? '#569cd6' : '#0000ff',
  },
  [`& .${classes.token}.function`]: {
    color: theme.palette.mode === 'dark' ? '#569cd6' : '#0000ff',
  },
}));

interface PropertyValueProps {
  open?: boolean;
  type: PropValueType;
  value: unknown;
}

function PropertyValue({ open, type, value }: PropertyValueProps) {
  if (!open && type === 'object') {
    return <span className={clsx(classes.token, 'comment')}>{'{…}'}</span>;
  }
  if (!open && type === 'array') {
    return <span className={clsx(classes.token, 'comment')}>{'[…]'}</span>;
  }
  return <span className={clsx(classes.token, getTokenType(type))}>{getLabel(value, type)}</span>;
}

interface TreeItemIconProps {
  node: NodeApi<ObjectTreePropertyNode>;
}

function TreeItemIcon({ node }: TreeItemIconProps) {
  if (node.isLeaf) {
    return <SvgIcon />;
  }
  return node.isOpen ? <ArrowDropDownIcon /> : <ArrowRightIcon />;
}

function ObjectPropertyEntry({
  node,
  style,
  dragHandle,
}: NodeRendererProps<ObjectTreePropertyNode>) {
  return (
    // TODO: react-arborist sets role treeitem to its parent but suggests onClcik on this node
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classes.node}
      style={{ ...style, userSelect: 'unset' }}
      ref={dragHandle}
      onClick={() => node.toggle()}
    >
      <TreeItemIcon node={node} />
      <span>
        {node.data.name ? <span>{node.data.name}: </span> : null}
        <PropertyValue open={node.isOpen} value={node.data.value} type={node.data.type} />
      </span>
    </div>
  );
}

function useDimensions<E extends HTMLElement>(): [
  React.RefCallback<E>,
  { width?: number; height?: number },
] {
  const elmRef = React.useRef<E | null>(null);
  const [dimensions, setDimensions] = React.useState({});

  const observerRef = React.useRef<ResizeObserver | undefined>();
  const getObserver = () => {
    let observer = observerRef.current;
    if (!observer) {
      observer = new ResizeObserver(() => {
        setDimensions(elmRef.current?.getBoundingClientRect().toJSON());
      });
      observerRef.current = observer;
    }
    return observer;
  };

  const ref = React.useCallback((elm: E | null) => {
    elmRef.current = elm;
    setDimensions(elm?.getBoundingClientRect().toJSON());
    const observer = getObserver();
    observer.disconnect();
    if (elm) {
      observer.observe(elm);
    }
  }, []);

  return [ref, dimensions];
}

export interface MuiObjectInspectorProps {
  data?: unknown;
  expandPaths?: string[];
}

export default function MuiObjectInspector(props: MuiObjectInspectorProps) {
  const { data = {}, expandPaths } = props;

  const initialOpenState = React.useMemo(
    () => (expandPaths ? Object.fromEntries(expandPaths.map((path) => [path, true])) : undefined),
    [expandPaths],
  );

  const initalData: ObjectTreePropertyNode[] = React.useMemo(
    () =>
      data && typeof data === 'object'
        ? createTreeData(data)
        : [{ name: '', id: '$ROOT', value: data, type: getType(data) }],
    [data],
  );

  const [rootRef, dimensions] = useDimensions<HTMLDivElement>();

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <StyledTree
        indent={8}
        disableDrag
        disableDrop
        initialData={initalData}
        initialOpenState={initialOpenState}
        width={dimensions.width}
        height={dimensions.height}
      >
        {ObjectPropertyEntry}
      </StyledTree>
    </div>
  );
}
