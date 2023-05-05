import * as React from 'react';
import MarkdownElement from '@mui/monorepo/docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from '@mui/monorepo/docs/src/modules/components/AppLayoutDocs';
import Ad from '@mui/monorepo/docs/src/modules/components/Ad';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { Typography, Divider, styled } from '@mui/material';
import invariant from 'invariant';
import { interleave } from '../utils/react';

const classNames = {
  description: 'jsonschema-description',
  name: 'jsonschema-name',
  keyword: 'jsonschema-keyword',
  comment: 'jsonschema-comment',
  objectLabel: 'jsonschema-object-label',
  constString: 'jsonschema-const-string',
};

const Wrapper = styled('div')(({ theme }) => ({
  fontFamily: 'Menlo,Consolas,"Droid Sans Mono",monospace;',
  fontSize: '0.8125rem',
  '& .indent': {
    marginLeft: '2ch',
  },
  [`& .${classNames.objectLabel}`]: {
    fontFamily: theme.typography.fontFamily,
    color: '#b2b2b2',
  },
  [`& .${classNames.comment}`]: {
    color: '#b2b2b2',
  },
  [`& .${classNames.description}`]: {
    fontFamily: theme.typography.fontFamily,
    color: '#b2b2b2',
    position: 'relative',
    // paddingLeft: '1em',
    overflow: 'hidden',
  },
  [`& .${classNames.description}:before`]: {
    // content: '"#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a#\\a"',
    whiteSpace: 'pre',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  [`& .${classNames.name}`]: {
    color: '#ffffff',
  },
  [`& .${classNames.constString}`]: {
    color: '#a6e22e',
  },
  [`& .${classNames.keyword}`]: {
    color: '#66d9ef',
  },
  '& ul': {
    listStyle: 'disc',
    paddingLeft: '3ch',
  },
}));

export interface SchemaReferenceProps {
  disableAd?: boolean;
  definitions: JSONSchema7;
}

function getConstClass(type: string) {
  switch (type) {
    case 'string':
      return classNames.constString;
    default:
      return undefined;
  }
}

interface JsonSchemaTypeDisplayProps {
  schema: JSONSchema7;
}

function JsonSchemaTypeDisplay({ schema }: JsonSchemaTypeDisplayProps) {
  let types: string[] = [];
  if (typeof schema.const !== 'undefined') {
    return (
      <span className={getConstClass(typeof schema.const)}>{JSON.stringify(schema.const)}</span>
    );
  }

  if (schema.type === 'object') {
    return <span className={classNames.objectLabel}>object </span>;
  }

  if (schema.type === 'array') {
    return <span className={classNames.objectLabel}>array of </span>;
  }

  if (schema.anyOf) {
    return <span className={classNames.objectLabel}>any of </span>;
  }

  if (schema.type) {
    types = Array.isArray(schema.type) ? schema.type : [schema.type];
  } else if (!schema.anyOf) {
    types = ['any'];
  }

  return (
    <React.Fragment>
      {interleave(
        types.map((type) => (
          <span key={type} className={classNames.keyword}>
            {type}
          </span>
        )),
        ' | ',
      )}
    </React.Fragment>
  );
}

interface JsonSchemaItemDisplayProps {
  schema?: JSONSchema7Definition;
  idPrefix: string;
}

function JsonSchemaItemDisplay({ schema, idPrefix }: JsonSchemaItemDisplayProps) {
  if (!schema || typeof schema === 'boolean') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return <JsonSchemaValueDisplay schema={schema} idPrefix={idPrefix} />;
}

interface JsonSchemaItemsDisplayProps {
  schema: JSONSchema7;
  idPrefix: string;
}

function JsonSchemaItemsDisplay({ schema, idPrefix }: JsonSchemaItemsDisplayProps) {
  if (Array.isArray(schema.items)) {
    return (
      <ul>
        {schema.items.map((item, i) => (
          <li key={i}>
            <JsonSchemaItemDisplay schema={item} idPrefix={idPrefix} />
          </li>
        ))}
      </ul>
    );
  }

  return <JsonSchemaItemDisplay schema={schema.items} idPrefix={idPrefix} />;
}

interface JsonSchemaValueDisplayProps {
  schema: JSONSchema7;
  idPrefix: string;
}

function JsonSchemaValueDisplay({ schema, idPrefix }: JsonSchemaValueDisplayProps) {
  const properties: [string, JSONSchema7Definition][] = [];

  if (schema.properties) {
    properties.push(...Object.entries(schema.properties));
  }

  if (schema.additionalProperties) {
    properties.push(['*', schema.additionalProperties]);
  }

  if (schema.$ref) {
    if (schema.$ref.startsWith('#/definitions/')) {
      const definition = schema.$ref.slice('#/definitions/'.length);
      if (!definition.includes('/')) {
        const hash = `definition-${definition}`;
        return (
          <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
            {definition}
          </a>
        );
      }
    }
  }

  return (
    <React.Fragment>
      <JsonSchemaTypeDisplay schema={schema} />

      {properties.length > 0 ? (
        <div className="indent">
          {interleave(
            properties.map(([propName, propSchema]) => {
              return (
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                <JsonSchemaDisplay
                  key={propName}
                  name={propName}
                  schema={propSchema}
                  idPrefix={idPrefix}
                />
              );
            }),
            <Divider sx={{ m: `8px 0 !important` }} />,
          )}
        </div>
      ) : null}

      {schema.items ? <JsonSchemaItemsDisplay schema={schema} idPrefix={idPrefix} /> : null}

      {schema.anyOf ? (
        <ul>
          {schema.anyOf.map((subSchema, i) => {
            return (
              <li key={i}>
                <JsonSchemaItemDisplay schema={subSchema} idPrefix={idPrefix} />
              </li>
            );
          })}
        </ul>
      ) : null}
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

  const properties: [string, JSONSchema7Definition][] = [];

  if (schema.properties) {
    properties.push(...Object.entries(schema.properties));
  }

  if (schema.additionalProperties) {
    properties.push(['*', schema.additionalProperties]);
  }

  const id = `${idPrefix}-${name || ''}`;

  return (
    <Wrapper>
      {schema.description ? (
        <div className={classNames.description}>{schema.description}</div>
      ) : null}
      {name ? (
        <React.Fragment>
          <a href={`#${id}`} tabIndex={-1} className={classNames.name}>
            <span id={id}>{name}</span>
          </a>
          :{' '}
        </React.Fragment>
      ) : null}

      <JsonSchemaValueDisplay schema={schema} idPrefix={id} />
    </Wrapper>
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
      <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
        <symbol id="anchor-link-icon" viewBox="0 0 16 16">
          <path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z" />
        </symbol>
      </svg>
    </AppLayoutDocs>
  );
}
