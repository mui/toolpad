import * as React from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import { NodeId } from '../../../types';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomProvider';

interface CodeComponentEditorContentProps {
  nodeId: NodeId;
}

function CodeComponentEditorContent({ nodeId }: CodeComponentEditorContentProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const domNode = studioDom.getNode(dom, nodeId);
  studioDom.assertIsCodeComponent(domNode);

  const [input, setInput] = React.useState(domNode.code);

  return (
    <div>
      <Button
        onClick={() => {
          domApi.setNodeAttribute<studioDom.StudioCodeComponentNode, 'code'>(
            domNode,
            'code',
            input,
          );
        }}
      >
        Update
      </Button>
      <TextField
        sx={{ my: 1 }}
        autoFocus
        fullWidth
        multiline
        rows={10}
        label="code"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
    </div>
  );
}

interface CodeComponentEditorProps {
  className?: string;
}

export default function CodeComponentEditor({ className }: CodeComponentEditorProps) {
  const { nodeId } = useParams();
  return (
    <Box className={className}>
      <CodeComponentEditorContent key={nodeId} nodeId={nodeId as NodeId} />
    </Box>
  );
}
