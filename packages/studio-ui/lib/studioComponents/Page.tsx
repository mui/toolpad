import * as React from 'react';
import type { StudioComponentDefinition } from '../types';

interface PageComponentProps {
  children?: React.ReactNode;
}

const Page: StudioComponentDefinition<PageComponentProps> = {
  props: {},
  module: '@mui/studio-components',
  importedName: 'Page',
};

export default Page;
