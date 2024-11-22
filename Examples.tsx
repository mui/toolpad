import * as React from 'react';
// ... existing imports ...

interface Layout {
  title: string;
  description: string;
  href: string;
  source: string;
  new?: boolean;
  hasDarkMode?: boolean;
  stackBlitz: string | null;
  codeSandbox?: string;
}

interface MaterialTemplate {
  files: Record<string, unknown>;
  codeVariant: 'TS' | 'JS';
}

interface MaterialTemplates {
  map: Map<string, MaterialTemplate>;
  sharedTheme?: {
    files: Record<string, unknown>;
  };
}

export default function Examples(): JSX.Element {
  const translation = useTranslate();
  const materialTemplates: MaterialTemplates = sourceMaterialTemplates();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
      {layouts(translation).map((layout: Layout) => {
        const templateId = layout.source.split('/').pop() as string;
        const templateName = pascalCase(templateId);
        const item = materialTemplates.map.get(templateId);

        // ... rest of the JSX remains the same ...

        // Type the content replacement functions
        const replaceContent = (content: string | unknown): string | unknown => {
          if (typeof content === 'string') {
            return content
              .replace(/\.\.\/shared-theme\//g, './theme/')
              .replace('./App', `./${templateName}`);
          }
          return content;
        };

        // ... rest of the JSX remains the same ...
      })}
    </Box>
  );
}
