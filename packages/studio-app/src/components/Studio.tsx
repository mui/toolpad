import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/system';
import Release from './Release';
import Releases from './Releases';
import StudioEditor from './StudioEditor';
import client from '../api';

export default function Editor() {
  const { data: capabilites } = client.useQuery('getCapabilities', []);

  if (!capabilites?.edit) {
    return <Box>Unauthorized</Box>;
  }
  return (
    <BrowserRouter basename="_studio">
      <Routes>
        <Route path="/editor/*" element={<StudioEditor />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="releases/:version" element={<Release />} />
      </Routes>
    </BrowserRouter>
  );
}
