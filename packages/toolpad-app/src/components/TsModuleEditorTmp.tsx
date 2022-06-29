import * as React from 'react';

export interface TsModuleEditorTmpProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function TsModuleEditorTmp({ value, onChange }: TsModuleEditorTmpProps) {
  return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={10} />;
}
