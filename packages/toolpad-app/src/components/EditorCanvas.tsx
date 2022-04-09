import * as React from 'react';
import * as appDom from '../appDom';
import { VersionOrPreview } from '../types';
import ToolpadApp from './ToolpadApp';

export interface EditorCanvasProps {
  basename: string;
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
}

export default function EditorCanvas(props: EditorCanvasProps) {
  return <ToolpadApp {...props} />;
}
