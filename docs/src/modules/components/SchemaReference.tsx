import * as React from 'react';
import MarkdownElement from '@mui/monorepo/docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from '@mui/monorepo/docs/src/modules/components/AppLayoutDocs';
import Ad from '@mui/monorepo/docs/src/modules/components/Ad';
import { JSONSchema7, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import { Typography, Chip, Box, Divider, styled, lighten } from '@mui/material';
import invariant from 'invariant';
import { interleave } from '@mui/toolpad-utils/react';

function coloredChipCss(color: string) {
  return {
    color,
    borderColor: color,
    background: lighten(color, 0.9),
  };
}

const TypeChip = styled(Chip)({
  '&.type-string': coloredChipCss('#fc929e'),
  '&.type-object': coloredChipCss('#a6e22e'),
  '&.type-number': coloredChipCss('#00F'),
  '&.type-boolean': coloredChipCss('#66d9ef'),
  '&.type-array': coloredChipCss('#00F'),
});

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
        return (
          <TypeChip
            className={`type-${typeId}`}
            variant="outlined"
            key={typeId}
            size="small"
            label={typeId}
            sx={{ mr: 1 }}
          />
        );
      })}
    </React.Fragment>
  );
}

interface JsonSchemaDisplayProps {
  name?: string;
  schema: JSONSchema7Definition;
}

function JsonSchemaDisplay({ name, schema }: JsonSchemaDisplayProps) {
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

  return (
    <React.Fragment>
      <div>
        {name ? <code>{name}</code> : null}
        {schema.description ? <div>{schema.description}</div> : null}
      </div>

      <JsonSchemaTypeDisplay schema={schema} />

      {properties.length > 0 ? (
        <div>
          <strong>Properties:</strong>
          <Box sx={{ ml: 2 }}>
            {interleave(
              properties.map(([propName, propSchema]) => {
                return <JsonSchemaDisplay key={propName} name={propName} schema={propSchema} />;
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
            <JsonSchemaDisplay schema={schema.items} />
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
                  <JsonSchemaDisplay schema={subSchema} />
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ) : null}
      {/*       <pre>{JSON.stringify(schema, null, 2)}</pre> */}
    </React.Fragment>
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
                    <JsonSchemaDisplay schema={tocItemNode.content} />
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
