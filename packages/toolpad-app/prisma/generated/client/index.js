
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  decompressFromBase64,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  findSync
} = require('./runtime/library')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.11.0
 * Query Engine version: 8fde8fef4033376662cad983758335009d522acb
 */
Prisma.prismaVersion = {
  client: "4.11.0",
  engine: "8fde8fef4033376662cad983758335009d522acb"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}


  const path = require('path')

const fs = require('fs')

// some frameworks or bundlers replace or totally remove __dirname
const hasDirname = typeof __dirname !== 'undefined' && __dirname !== '/'

// will work in most cases, ie. if the client has not been bundled
const regularDirname = hasDirname && fs.existsSync(path.join(__dirname, 'schema.prisma')) && __dirname

// if the client has been bundled, we need to look for the folders
const foundDirname = !regularDirname && findSync(process.cwd(), [
    "packages/toolpad-app/prisma/generated/client",
    "toolpad-app/prisma/generated/client",
], ['d'], ['d'], 1)[0]

const dirname = regularDirname || foundDirname || __dirname

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.Prisma.AppScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  editedAt: 'editedAt',
  dom: 'dom',
  public: 'public'
});

exports.Prisma.DeploymentScalarFieldEnum = makeEnum({
  id: 'id',
  createdAt: 'createdAt',
  appId: 'appId',
  version: 'version'
});

exports.Prisma.DomNodeAttributeScalarFieldEnum = makeEnum({
  nodeId: 'nodeId',
  namespace: 'namespace',
  name: 'name',
  type: 'type',
  value: 'value'
});

exports.Prisma.DomNodeScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  type: 'type',
  parentId: 'parentId',
  parentIndex: 'parentIndex',
  parentProp: 'parentProp',
  appId: 'appId'
});

exports.Prisma.JsonNullValueFilter = makeEnum({
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
});

exports.Prisma.NullableJsonNullValueInput = makeEnum({
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
});

exports.Prisma.QueryMode = makeEnum({
  default: 'default',
  insensitive: 'insensitive'
});

exports.Prisma.ReleaseScalarFieldEnum = makeEnum({
  description: 'description',
  createdAt: 'createdAt',
  snapshot: 'snapshot',
  appId: 'appId',
  version: 'version'
});

exports.Prisma.SortOrder = makeEnum({
  asc: 'asc',
  desc: 'desc'
});

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});
exports.DomNodeAttributeType = makeEnum({
  const: 'const',
  binding: 'binding',
  boundExpression: 'boundExpression',
  jsExpression: 'jsExpression',
  secret: 'secret',
  jsExpressionAction: 'jsExpressionAction',
  navigationAction: 'navigationAction'
});

exports.DomNodeType = makeEnum({
  app: 'app',
  connection: 'connection',
  api: 'api',
  theme: 'theme',
  page: 'page',
  element: 'element',
  codeComponent: 'codeComponent',
  derivedState: 'derivedState',
  queryState: 'queryState',
  query: 'query',
  mutation: 'mutation'
});

exports.Prisma.ModelName = makeEnum({
  App: 'App',
  DomNode: 'DomNode',
  DomNodeAttribute: 'DomNodeAttribute',
  Release: 'Release',
  Deployment: 'Deployment'
});

const dmmfString = "{\"datamodel\":{\"enums\":[{\"name\":\"DomNodeType\",\"values\":[{\"name\":\"app\",\"dbName\":null},{\"name\":\"connection\",\"dbName\":null},{\"name\":\"api\",\"dbName\":null},{\"name\":\"theme\",\"dbName\":null},{\"name\":\"page\",\"dbName\":null},{\"name\":\"element\",\"dbName\":null},{\"name\":\"codeComponent\",\"dbName\":null},{\"name\":\"derivedState\",\"dbName\":null},{\"name\":\"queryState\",\"dbName\":null},{\"name\":\"query\",\"dbName\":null},{\"name\":\"mutation\",\"dbName\":null}],\"dbName\":null},{\"name\":\"DomNodeAttributeType\",\"values\":[{\"name\":\"const\",\"dbName\":null},{\"name\":\"binding\",\"dbName\":null},{\"name\":\"boundExpression\",\"dbName\":null},{\"name\":\"jsExpression\",\"dbName\":null},{\"name\":\"secret\",\"dbName\":null},{\"name\":\"jsExpressionAction\",\"dbName\":null},{\"name\":\"navigationAction\",\"dbName\":null}],\"dbName\":null}],\"models\":[{\"name\":\"App\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"editedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"public\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Deployment\",\"relationName\":\"AppDeployments\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nodes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNode\",\"relationName\":\"AppNodes\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"releases\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Release\",\"relationName\":\"AppReleases\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"DomNode\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNodeType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentIndex\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentProp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"app\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"App\",\"relationName\":\"AppNodes\",\"relationFromFields\":[\"appId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNode\",\"relationName\":\"Children\",\"relationFromFields\":[\"parentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"children\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNode\",\"relationName\":\"Children\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attributes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNodeAttribute\",\"relationName\":\"Attributes\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"appId\",\"name\"]],\"uniqueIndexes\":[{\"name\":\"node_name_app_constraint\",\"fields\":[\"appId\",\"name\"]}],\"isGenerated\":false},{\"name\":\"DomNodeAttribute\",\"dbName\":null,\"fields\":[{\"name\":\"nodeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"namespace\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNodeAttributeType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"node\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DomNode\",\"relationName\":\"Attributes\",\"relationFromFields\":[\"nodeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"nodeId\",\"namespace\",\"name\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"nodeId\",\"namespace\",\"name\"]}],\"isGenerated\":false},{\"name\":\"Release\",\"dbName\":null,\"fields\":[{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Bytes\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"app\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"App\",\"relationName\":\"AppReleases\",\"relationFromFields\":[\"appId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Deployment\",\"relationName\":\"DeploymentRelease\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":\"release_app_constraint\",\"fields\":[\"version\",\"appId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Deployment\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"app\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"App\",\"relationName\":\"AppDeployments\",\"relationFromFields\":[\"appId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"release\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Release\",\"relationName\":\"DeploymentRelease\",\"relationFromFields\":[\"appId\",\"version\"],\"relationToFields\":[\"appId\",\"version\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}],\"types\":[]},\"mappings\":{\"modelOperations\":[{\"model\":\"App\",\"plural\":\"apps\",\"findUnique\":\"findUniqueApp\",\"findUniqueOrThrow\":\"findUniqueAppOrThrow\",\"findFirst\":\"findFirstApp\",\"findFirstOrThrow\":\"findFirstAppOrThrow\",\"findMany\":\"findManyApp\",\"create\":\"createOneApp\",\"createMany\":\"createManyApp\",\"delete\":\"deleteOneApp\",\"update\":\"updateOneApp\",\"deleteMany\":\"deleteManyApp\",\"updateMany\":\"updateManyApp\",\"upsert\":\"upsertOneApp\",\"aggregate\":\"aggregateApp\",\"groupBy\":\"groupByApp\"},{\"model\":\"DomNode\",\"plural\":\"domNodes\",\"findUnique\":\"findUniqueDomNode\",\"findUniqueOrThrow\":\"findUniqueDomNodeOrThrow\",\"findFirst\":\"findFirstDomNode\",\"findFirstOrThrow\":\"findFirstDomNodeOrThrow\",\"findMany\":\"findManyDomNode\",\"create\":\"createOneDomNode\",\"createMany\":\"createManyDomNode\",\"delete\":\"deleteOneDomNode\",\"update\":\"updateOneDomNode\",\"deleteMany\":\"deleteManyDomNode\",\"updateMany\":\"updateManyDomNode\",\"upsert\":\"upsertOneDomNode\",\"aggregate\":\"aggregateDomNode\",\"groupBy\":\"groupByDomNode\"},{\"model\":\"DomNodeAttribute\",\"plural\":\"domNodeAttributes\",\"findUnique\":\"findUniqueDomNodeAttribute\",\"findUniqueOrThrow\":\"findUniqueDomNodeAttributeOrThrow\",\"findFirst\":\"findFirstDomNodeAttribute\",\"findFirstOrThrow\":\"findFirstDomNodeAttributeOrThrow\",\"findMany\":\"findManyDomNodeAttribute\",\"create\":\"createOneDomNodeAttribute\",\"createMany\":\"createManyDomNodeAttribute\",\"delete\":\"deleteOneDomNodeAttribute\",\"update\":\"updateOneDomNodeAttribute\",\"deleteMany\":\"deleteManyDomNodeAttribute\",\"updateMany\":\"updateManyDomNodeAttribute\",\"upsert\":\"upsertOneDomNodeAttribute\",\"aggregate\":\"aggregateDomNodeAttribute\",\"groupBy\":\"groupByDomNodeAttribute\"},{\"model\":\"Release\",\"plural\":\"releases\",\"findUnique\":\"findUniqueRelease\",\"findUniqueOrThrow\":\"findUniqueReleaseOrThrow\",\"findFirst\":\"findFirstRelease\",\"findFirstOrThrow\":\"findFirstReleaseOrThrow\",\"findMany\":\"findManyRelease\",\"create\":\"createOneRelease\",\"createMany\":\"createManyRelease\",\"delete\":\"deleteOneRelease\",\"update\":\"updateOneRelease\",\"deleteMany\":\"deleteManyRelease\",\"updateMany\":\"updateManyRelease\",\"upsert\":\"upsertOneRelease\",\"aggregate\":\"aggregateRelease\",\"groupBy\":\"groupByRelease\"},{\"model\":\"Deployment\",\"plural\":\"deployments\",\"findUnique\":\"findUniqueDeployment\",\"findUniqueOrThrow\":\"findUniqueDeploymentOrThrow\",\"findFirst\":\"findFirstDeployment\",\"findFirstOrThrow\":\"findFirstDeploymentOrThrow\",\"findMany\":\"findManyDeployment\",\"create\":\"createOneDeployment\",\"createMany\":\"createManyDeployment\",\"delete\":\"deleteOneDeployment\",\"update\":\"updateOneDeployment\",\"deleteMany\":\"deleteManyDeployment\",\"updateMany\":\"updateManyDeployment\",\"upsert\":\"upsertOneDeployment\",\"aggregate\":\"aggregateDeployment\",\"groupBy\":\"groupByDeployment\"}],\"otherOperations\":{\"read\":[],\"write\":[\"executeRaw\",\"queryRaw\"]}}}"
const dmmf = JSON.parse(dmmfString)
exports.Prisma.dmmf = JSON.parse(dmmfString)

/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/danilo/Documents/GitHub/mui-toolpad/packages/toolpad-app/prisma/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../..",
  "clientVersion": "4.11.0",
  "engineVersion": "8fde8fef4033376662cad983758335009d522acb",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "dataProxy": false
}
config.dirname = dirname
config.document = dmmf




const { warnEnvConflicts } = require('./runtime/library')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(dirname, config.relativeEnvPaths.schemaEnvPath)
})


const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "packages/toolpad-app/prisma/generated/client/libquery_engine-darwin-arm64.dylib.node")
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "packages/toolpad-app/prisma/generated/client/schema.prisma")
