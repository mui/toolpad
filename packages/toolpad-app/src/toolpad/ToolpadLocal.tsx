import * as React from 'react';
import NoSsr from '../components/NoSsr';
import { EditorContent } from './AppEditor';

export interface ToolpadLocalProps {
  basename: string;
}

export default function ToolpadLocal({ basename }: ToolpadLocalProps) {
  return (
    <NoSsr>
      <EditorContent appId="<local>" />
    </NoSsr>
  );
}
