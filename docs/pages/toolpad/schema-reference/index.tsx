import * as React from 'react';
import { GetStaticProps } from 'next';
import * as path from 'path';
import * as fs from 'fs/promises';
import { JSONSchema7 } from 'json-schema';

export interface ApiReferenceProps {
  definitions: JSONSchema7;
}

export const getStaticProps: GetStaticProps<ApiReferenceProps> = async () => {
  const schemaFile = path.join(process.cwd(), './schemas/v1/definitions.json');
  const content = await fs.readFile(schemaFile, { encoding: 'utf-8' });

  return {
    props: {
      definitions: JSON.parse(content),
    },
  };
};

export default function ApiReference({ definitions }: ApiReferenceProps) {
  return <pre>{JSON.stringify(definitions, null, 2)}</pre>;
}
