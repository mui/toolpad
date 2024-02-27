import * as path from 'path';
import * as fs from 'fs/promises';
import * as React from 'react';
import { GetStaticProps } from 'next';
import SchemaReference, {
  SchemaReferenceProps,
} from '../../../../../src/modules/components/SchemaReference';

export const getStaticProps: GetStaticProps<SchemaReferenceProps> = async () => {
  const schemaFile = path.join(process.cwd(), './schemas/v1/definitions.json');
  const content = await fs.readFile(schemaFile, { encoding: 'utf-8' });

  return {
    props: {
      definitions: JSON.parse(content),
    },
  };
};

export default function Page(props: SchemaReferenceProps) {
  return (
    <SchemaReference
      disableAd
      location="/docs/pages/toolpad/studio/reference/file-schema/index.tsx"
      {...props}
    />
  );
}
