import * as React from 'react';
import ToolpadEditor from '../toolpad/Toolpad';

export default function ToolpadEditorVite({ basename }: { basename: string }) {
  return <ToolpadEditor basename={`${basename}/editor`} appUrl={basename} />;
}
