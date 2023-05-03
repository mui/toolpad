import * as React from 'react';
import MarkdownElement from '@mui/monorepo/docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from '@mui/monorepo/docs/src/modules/components/AppLayoutDocs';
import Ad from '@mui/monorepo/docs/src/modules/components/Ad';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { Typography, Box, Divider } from '@mui/material';
import invariant from 'invariant';
import { interleave } from '../utils/react';

export interface SchemaReferenceProps {
  disableAd?: boolean;
  definitions: JSONSchema7;
}

interface JsonSchemaTypeDisplayProps {
  schema: JSONSchema7;
}

function JsonSchemaTypeDisplay({ schema }: JsonSchemaTypeDisplayProps) {
  let types: string[] = [];
  if (schema.type) {
    types = Array.isArray(schema.type) ? schema.type : [schema.type];
  } else if (!schema.anyOf) {
    types = ['any'];
  }
  return (
    <React.Fragment>
      {types.map((type) => {
        const typeId = type ?? 'any';
        return (
          <React.Fragment key={typeId}>
            <strong>type:</strong> <code>{typeId}</code>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

interface JsonSchemaDisplayProps {
  name?: string;
  schema: JSONSchema7Definition;
  idPrefix?: string;
}

function JsonSchemaDisplay({ name, schema, idPrefix = '' }: JsonSchemaDisplayProps) {
  invariant(typeof schema === 'object', `Expected an object but got ${typeof schema}`);

  if (schema.$ref) {
    if (schema.$ref.startsWith('#/definitions/')) {
      const definition = schema.$ref.slice('#/definitions/'.length);
      if (!definition.includes('/')) {
        const hash = `definition-${definition}`;
        return (
          <div>
            {name ? <code>{name}</code> : null}
            <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
              {definition}
            </a>
          </div>
        );
      }
    }
  }

  const properties: [string, JSONSchema7Definition][] = [];

  if (schema.properties) {
    properties.push(...Object.entries(schema.properties));
  }

  if (schema.additionalProperties) {
    properties.push(['*', schema.additionalProperties]);
  }

  const id = `${idPrefix}-${name || ''}`;

  return (
    <div>
      {name ? (
        <Box sx={{ flexShrink: 0 }}>
          <a href={`#${id}`} tabIndex={-1}>
            <code id={id}>{name}</code>
          </a>
        </Box>
      ) : null}
      {schema.description ? (
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box component="strong" sx={{ flexShrink: 0 }}>
            Description:
          </Box>
          <Box sx={{ ml: 1 }}>{schema.description}</Box>
        </Box>
      ) : null}

      <JsonSchemaTypeDisplay schema={schema} />

      {properties.length > 0 ? (
        <div>
          <strong>Properties:</strong>
          <Box sx={{ ml: 2 }}>
            {interleave(
              properties.map(([propName, propSchema]) => {
                return (
                  <JsonSchemaDisplay
                    key={propName}
                    name={propName}
                    schema={propSchema}
                    idPrefix={id}
                  />
                );
              }),
              <Divider sx={{ m: `8px 0 !important` }} />,
            )}
          </Box>
        </div>
      ) : null}

      {schema.items ? (
        <div>
          <strong>Items:</strong>
          <Box sx={{ ml: 2 }}>
            {Array.isArray(schema.items) ? (
              <ul>
                {schema.items.map((item, i) => (
                  <li key={i}>
                    <JsonSchemaDisplay schema={item} idPrefix={id} />
                  </li>
                ))}
              </ul>
            ) : (
              <JsonSchemaDisplay schema={schema.items} idPrefix={id} />
            )}
          </Box>
        </div>
      ) : null}

      {schema.anyOf ? (
        <React.Fragment>
          <strong>Must be any of:</strong>
          <ul>
            {schema.anyOf.map((subSchema, i) => {
              return (
                <li key={i}>
                  <JsonSchemaDisplay schema={subSchema} idPrefix={id} />
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ) : null}
    </div>
  );
}

interface HeadingProps {
  hash: string;
  level: 'h2' | 'h3';
  title: string;
}

function Heading({ hash, level: Level, title }: HeadingProps) {
  return (
    <Level id={hash}>
      {title}
      <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
        <svg>
          <use xlinkHref="#anchor-link-icon" />
        </svg>
      </a>
    </Level>
  );
}

export default function SchemaReference({ disableAd, definitions }: SchemaReferenceProps) {
  const toc = [
    {
      text: 'Files',
      hash: 'files',
      introduction: `These are the various files supported by toolpad.`,
      children: Object.entries(definitions.properties || {}).map(([name, content]) => ({
        text: name,
        hash: `file-${name}`,
        content,
        children: [],
      })),
    },
    {
      text: 'Definitions',
      hash: 'definitions',
      introduction: `These are shared definitions used throughout Toolpad files.`,
      children: Object.entries(definitions.definitions || {}).map(([name, content]) => ({
        text: name,
        hash: `definition-${name}`,
        content,
        children: [],
      })),
    },
  ];

  const description = 'An exhaustive reference for the Toolpad file formats.';

  return (
    <AppLayoutDocs
      description={description}
      disableAd={disableAd}
      disableToc={false}
      location="hello"
      title={`Schema Reference`}
      toc={toc}
    >
      <MarkdownElement>
        <h1>Schema Reference</h1>

        <Typography
          variant="h5"
          component="p"
          className={`description${disableAd ? '' : ' ad'}`}
          gutterBottom
        >
          {description}
          {disableAd ? null : <Ad />}
        </Typography>

        {toc.map((tocNode) => {
          return (
            <React.Fragment key={tocNode.hash}>
              <Heading hash={tocNode.hash} level="h2" title={tocNode.text} />

              <Typography>{tocNode.introduction}</Typography>

              {tocNode.children.map((tocItemNode) => {
                return (
                  <React.Fragment key={tocItemNode.hash}>
                    <Heading hash={tocItemNode.hash} level="h3" title={tocItemNode.text} />
                    <JsonSchemaDisplay schema={tocItemNode.content} idPrefix={tocItemNode.hash} />
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </MarkdownElement>
    </AppLayoutDocs>
  );
}
