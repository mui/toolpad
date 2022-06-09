import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NoSsr } from '@mui/material';
import Release from './Release';
import Releases from './Releases';
import AppEditor from './AppEditor';
import Home from './Home';

function AppWorkspace() {
  return (
    <Routes>
      <Route>
        <Route path="editor/*" element={<AppEditor />} />
        <Route path="releases" element={<Releases />} />
        <Route path="releases/:version" element={<Release />} />
      </Route>
    </Routes>
  );
}

export interface EditorProps {
  basename: string;
}

export default function Toolpad({ basename }: EditorProps) {
  return (
    <NoSsr>
      <React.Suspense fallback="loading...">
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app/:appId/*" element={<AppWorkspace />} />
          </Routes>
        </BrowserRouter>
      </React.Suspense>
    </NoSsr>
  );
}
