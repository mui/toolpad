import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Release from './Release';
import Releases from './Releases';
import StudioEditor from './StudioEditor';

export default function Editor() {
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
