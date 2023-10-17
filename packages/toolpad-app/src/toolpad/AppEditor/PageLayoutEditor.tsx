import { MenuItem, TextField } from '@mui/material';
import * as React from 'react';
import { AppDom, PageLayoutMode, PageNode, setNodeNamespacedProp } from '../../appDom';
import { useDomApi } from '../AppState';

interface PageLayoutEditorProps {
  node: PageNode;
}

const PAGE_LAYOUT_OPTIONS: { value: PageLayoutMode; label: string }[] = [
  { value: 'container', label: 'Container' },
  { value: 'fluid', label: 'Fluid' },
];

export default function PageLayoutEditor({ node }: PageLayoutEditorProps) {
  const domApi = useDomApi();
  const [pageLayoutInput, setpageLayoutInput] = React.useState(node.attributes.layout);

  const handlePageLayoutChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setpageLayoutInput(event.target.value as PageLayoutMode);
      domApi.update((appDom: AppDom) =>
        setNodeNamespacedProp(
          appDom,
          node,
          'attributes',
          'layout',
          event.target.value as PageLayoutMode,
        ),
      );
    },
    [domApi, node],
  );

  return (
    <TextField
      select
      defaultValue="container"
      value={pageLayoutInput}
      onChange={handlePageLayoutChange}
      label="Page Layout"
      fullWidth
    >
      {PAGE_LAYOUT_OPTIONS.map((option) => {
        return (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        );
      })}
    </TextField>
  );
}
