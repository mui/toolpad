import * as React from 'react';
import MarkdownElement from '@mui/monorepo/docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from '@mui/monorepo/docs/src/modules/components/AppLayoutDocs';
import Ad from '@mui/monorepo/docs/src/modules/components/Ad';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {
  ButtonBase,
  Collapse,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
} from '@mui/material';
import invariant from 'invariant';
import clsx from 'clsx';
import { interleave } from '../utils/react';

const EMPTY_OBJECT = {};

const SchemaContext = React.createContext<{ [key: string]: JSONSchema7Definition }>(EMPTY_OBJECT);

const TooltipContext = React.createContext<{} | null>(null);

const SchemaTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
  },
});

const classNames = {
  indent: 'jsonschema-indent',
  open: 'jsonschema-open',
  arrow: 'jsonschema-arrow',
  description: 'jsonschema-description',
  name: 'jsonschema-name',
  keyword: 'jsonschema-keyword',
  comment: 'jsonschema-comment',
  divider: 'jsonschema-divider',
  objectLabel: 'jsonschema-object-label',
  constString: 'jsonschema-const-string',
};

const Wrapper = styled('div')(({ theme }) => ({
  fontFamily: 'Menlo,Consolas,"Droid Sans Mono",monospace;',
  backgroundColor: 'rgb(0, 30, 60)',
  color: 'rgb(255, 255, 255)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.8125rem',
  border: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(194, 224, 255, 0.08)',
  whiteSpace: 'pre-wrap',
  [`& .${classNames.indent}`]: {
    marginLeft: '2ch',
  },
  [`& .${classNames.objectLabel}`]: {
    fontFamily: theme.typography.fontFamily,
    display: 'inline-flex',
    alignItems: 'center',
    color: '#b2b2b2',
    [`& .${classNames.arrow}`]: {
      fontSize: 'small',
    },
    [`&.${classNames.open} .${classNames.arrow}`]: {
      transform: 'rotate(90deg)',
    },
  },
  [`& .${classNames.open}`]: {
    fontSize: 'small',
    [`& .${classNames.arrow}`]: {
      transform: 'rotate(90deg)',
    },
  },
  [`& .${classNames.open}`]: {
    fontSize: 'small',
    [`& .${classNames.arrow}`]: {
      transform: 'rotate(90deg)',
    },
  },
  [`& .${classNames.comment}`]: {
    color: '#b2b2b2',
  },
  [`& .${classNames.description}`]: {
    fontFamily: theme.typography.fontFamily,
    color: '#b2b2b2',
    whiteSpace: 'normal',
  },
  [`& .${classNames.name}`]: {
    scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
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
    color: '#B2BAC2',
    paddingLeft: '3ch',
  },
  [`& .${classNames.divider}`]: {
    backgroundColor: 'rgba(194, 224, 255, 0.08)',
    margin: theme.spacing(1, 0),
  },
  '& a': {
    color: '#66B2FF',
  },
  ul: {
    marginBottom: 0,
  },
}));

export interface SchemaReferenceProps {
  definitions: JSONSchema7;
  disableAd?: boolean;
  location?: string;
}

function getConstClass(type: string) {
  switch (type) {
    case 'string':
      return classNames.constString;
    default:
      return undefined;
  }
}

interface CollapsibleLabelProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function CollapsibleLabel({ children, open, onOpenChange }: CollapsibleLabelProps) {
  return (
    <ButtonBase
      component="span"
      className={clsx(classNames.objectLabel, { [classNames.open]: open })}
      onClick={() => onOpenChange?.((isOpen) => !isOpen)}
    >
      {children} <KeyboardArrowRightRoundedIcon className={classNames.arrow} />
    </ButtonBase>
  );
}

interface JsonSchemaTypeDisplayProps {
  schema: JSONSchema7;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function JsonSchemaTypeDisplay({ schema, open, onOpenChange }: JsonSchemaTypeDisplayProps) {
  let types: string[] = [];
  if (typeof schema.const !== 'undefined') {
    return (
      <span className={getConstClass(typeof schema.const)}>{JSON.stringify(schema.const)}</span>
    );
  }

  if (typeof schema.enum !== 'undefined') {
    return (
      <React.Fragment>
        {interleave(
          schema.enum.map((enumValue) => {
            const asString = JSON.stringify(enumValue);
            return (
              <span key={asString} className={getConstClass(typeof enumValue)}>
                {asString}
              </span>
            );
          }),
          ' | ',
        )}
      </React.Fragment>
    );
  }

  if (schema.type === 'object') {
    return (
      <CollapsibleLabel open={open} onOpenChange={onOpenChange}>
        object
      </CollapsibleLabel>
    );
  }

  if (schema.type === 'array') {
    return <span className={classNames.objectLabel}>array of </span>;
  }

  if (schema.anyOf) {
    return (
      <CollapsibleLabel open={open} onOpenChange={onOpenChange}>
        any of{' '}
      </CollapsibleLabel>
    );
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

  return (
    <React.Fragment>
      <JsonDescriptionDisplay schema={schema} />
      <JsonSchemaValueDisplay schema={schema} idPrefix={idPrefix} />
    </React.Fragment>
  );
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

interface JsonSchemaPropertiesDisplayProps {
  schema: JSONSchema7;
  idPrefix: string;
  open?: boolean;
}

function JsonSchemaPropertiesDisplay({ schema, idPrefix, open }: JsonSchemaPropertiesDisplayProps) {
  const properties: [string, JSONSchema7Definition][] = [];

  if (schema.properties) {
    properties.push(...Object.entries(schema.properties));
  }

  if (schema.additionalProperties) {
    properties.push([
      '*',
      typeof schema.additionalProperties === 'boolean' ? {} : schema.additionalProperties,
    ]);
  }

  return properties.length > 0 ? (
    <Collapse in={open} className={classNames.indent}>
      {interleave(
        properties.map(([propName, propSchema]) => {
          return (
            <JsonSchemaNameValueDisplay
              key={propName}
              name={propName}
              schema={propSchema}
              idPrefix={idPrefix}
            />
          );
        }),
        <hr className={classNames.divider} />,
      )}
    </Collapse>
  ) : null;
}

interface DefinitionTooltipProps {
  name: string;
}

function DefinitionTooltip({ name }: DefinitionTooltipProps) {
  const definitions = React.useContext(SchemaContext);
  const definition = definitions[name];

  if (!definition || typeof definition === 'boolean') {
    return null;
  }

  return (
    <TooltipContext.Provider value={EMPTY_OBJECT}>
      <Wrapper>
        <JsonSchemaNameValueDisplay name={name} schema={definition} idPrefix={`definition`} />
      </Wrapper>
    </TooltipContext.Provider>
  );
}

interface JsonSchemaValueDisplayProps {
  schema: JSONSchema7;
  idPrefix: string;
}

function JsonSchemaValueDisplay({ schema, idPrefix }: JsonSchemaValueDisplayProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(true);

  if (schema.$ref) {
    if (schema.$ref.startsWith('#/definitions/')) {
      const definition = schema.$ref.slice('#/definitions/'.length);
      if (!definition.includes('/')) {
        const hash = `definition-${definition}`;
        return (
          <SchemaTooltip title={<DefinitionTooltip name={definition} />}>
            <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
              {definition}
            </a>
          </SchemaTooltip>
        );
      }
    }
  }

  return (
    <React.Fragment>
      <JsonSchemaTypeDisplay schema={schema} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <JsonSchemaPropertiesDisplay open={detailsOpen} schema={schema} idPrefix={idPrefix} />

      {schema.items ? <JsonSchemaItemsDisplay schema={schema} idPrefix={idPrefix} /> : null}

      {schema.anyOf ? (
        <Collapse in={detailsOpen}>
          <ul>
            {schema.anyOf.map((subSchema, i) => {
              return (
                <li key={i}>
                  <JsonSchemaItemDisplay schema={subSchema} idPrefix={idPrefix} />
                </li>
              );
            })}
          </ul>
        </Collapse>
      ) : null}
    </React.Fragment>
  );
}

interface JsonDescriptionDisplayProps {
  schema: JSONSchema7;
}

function JsonDescriptionDisplay({ schema }: JsonDescriptionDisplayProps) {
  if (schema.description) {
    return (
      <div className={clsx(classNames.description, 'algolia-content')}>{schema.description}</div>
    );
  }

  return null;
}

interface JsonSchemaNameValueDisplayProps {
  name?: string;
  schema: JSONSchema7Definition;
  idPrefix?: string;
}

function JsonSchemaNameValueDisplay({
  name,
  schema,
  idPrefix = '',
}: JsonSchemaNameValueDisplayProps) {
  invariant(
    typeof schema === 'object',
    `Expected an object at "${name}" but got "${typeof schema}"`,
  );

  const properties: [string, JSONSchema7Definition][] = [];

  if (schema.properties) {
    properties.push(...Object.entries(schema.properties));
  }

  if (schema.additionalProperties) {
    properties.push([
      '*',
      typeof schema.additionalProperties === 'boolean' ? {} : schema.additionalProperties,
    ]);
  }

  const tooltipContext = React.useContext(TooltipContext);
  const isInsideTooltip = !!tooltipContext;

  const id = `${idPrefix}-${name || ''}`;
  const anchor = isInsideTooltip ? undefined : id;

  return (
    <React.Fragment>
      <JsonDescriptionDisplay schema={schema} />
      {name ? (
        <React.Fragment>
          <a
            id={anchor}
            href={`#${id}`}
            tabIndex={-1}
            className={clsx(classNames.name, 'algolia-lvl4')}
          >
            {name}
          </a>
          :{' '}
        </React.Fragment>
      ) : null}

      <JsonSchemaValueDisplay schema={schema} idPrefix={id} />
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

interface JsonSchemaDisplayProps {
  name: string;
  hash: string;
  schema: JSONSchema7;
  idPrefix?: string;
}

function JsonSchemaDisplay({ name, hash, schema, idPrefix = '' }: JsonSchemaDisplayProps) {
  return (
    <React.Fragment>
      <Heading hash={hash} level="h3" title={name} />
      <Typography>{schema.description}</Typography>
      <Wrapper>
        <JsonSchemaValueDisplay schema={schema} idPrefix={idPrefix} />
      </Wrapper>
    </React.Fragment>
  );
}

const description = 'An exhaustive reference for the Toolpad Studio file formats.';

export default function SchemaReference(props: SchemaReferenceProps) {
  const { definitions, disableAd, location } = props;
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
      introduction: `These are shared definitions used throughout Toolpad Studio files.`,
      children: Object.entries(definitions.definitions || {}).map(([name, content]) => ({
        text: name,
        hash: `definition-${name}`,
        content,
        children: [],
      })),
    },
  ];

  return (
    <AppLayoutDocs
      description={description}
      disableAd={disableAd}
      disableToc={false}
      location={location}
      title="Schema reference"
      toc={toc}
    >
      <SchemaContext.Provider value={definitions.definitions || EMPTY_OBJECT}>
        <MarkdownElement>
          <h1>Schema reference</h1>
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
                  invariant(typeof tocItemNode.content !== 'boolean', 'Invalid top level schema');
                  return (
                    <JsonSchemaDisplay
                      key={tocItemNode.hash}
                      hash={tocItemNode.hash}
                      name={tocItemNode.text}
                      schema={tocItemNode.content}
                      idPrefix={tocItemNode.hash}
                    />
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
      </SchemaContext.Provider>
    </AppLayoutDocs>
  );
}
