/*
  Warnings:

  - You are about to drop the `StudioDomNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudioDomNodeAttribute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id,appId]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[version,appId]` on the table `Release` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appId` to the `Deployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appId` to the `Release` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudioDomNode" DROP CONSTRAINT "StudioDomNode_parentId_fkey";

-- DropForeignKey
ALTER TABLE "StudioDomNodeAttribute" DROP CONSTRAINT "StudioDomNodeAttribute_nodeId_fkey";

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "appId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "appId" TEXT NOT NULL;

-- DropTable
DROP TABLE "StudioDomNode";

-- DropTable
DROP TABLE "StudioDomNodeAttribute";

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

-- CreateIndex
CREATE UNIQUE INDEX "DomNode_name_key" ON "DomNode"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DomNode_id_appId_key" ON "DomNode"("id", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "DomNodeAttribute_nodeId_namespace_name_key" ON "DomNodeAttribute"("nodeId", "namespace", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_id_appId_key" ON "Deployment"("id", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "Release_version_appId_key" ON "Release"("version", "appId");

-- AddForeignKey
ALTER TABLE "DomNode" ADD CONSTRAINT "DomNode_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomNode" ADD CONSTRAINT "DomNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DomNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomNodeAttribute" ADD CONSTRAINT "DomNodeAttribute_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "DomNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
