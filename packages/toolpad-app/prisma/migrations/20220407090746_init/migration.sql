-- CreateEnum
CREATE TYPE "DomNodeType" AS ENUM ('app', 'connection', 'api', 'theme', 'page', 'element', 'codeComponent', 'derivedState', 'queryState');

-- CreateEnum
CREATE TYPE "DomNodeAttributeType" AS ENUM ('const', 'binding', 'boundExpression', 'jsExpression', 'secret');

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DomNodeType" NOT NULL,
    "parentId" TEXT,
    "parentIndex" TEXT,
    "parentProp" TEXT,
    "appId" TEXT NOT NULL,

    CONSTRAINT "DomNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomNodeAttribute" (
    "nodeId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DomNodeAttributeType" NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Release" (
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" BYTEA NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("version","appId")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomNode_appId_name_key" ON "DomNode"("appId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DomNodeAttribute_nodeId_namespace_name_key" ON "DomNodeAttribute"("nodeId", "namespace", "name");

-- AddForeignKey
ALTER TABLE "DomNode" ADD CONSTRAINT "DomNode_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomNode" ADD CONSTRAINT "DomNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DomNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomNodeAttribute" ADD CONSTRAINT "DomNodeAttribute_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "DomNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_appId_version_fkey" FOREIGN KEY ("appId", "version") REFERENCES "Release"("appId", "version") ON DELETE RESTRICT ON UPDATE CASCADE;
