/*
  Warnings:

  - The primary key for the `Deployment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Release` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Release` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appId,name]` on the table `DomNode` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `version` on the `Deployment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `Release` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_appId_fkey";

-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_version_fkey";

-- DropForeignKey
ALTER TABLE "DomNode" DROP CONSTRAINT "DomNode_appId_fkey";

-- DropForeignKey
ALTER TABLE "Release" DROP CONSTRAINT "Release_appId_fkey";

-- DropIndex
DROP INDEX "Deployment_id_appId_key";

-- DropIndex
DROP INDEX "DomNode_id_appId_key";

-- DropIndex
DROP INDEX "DomNode_name_key";

-- DropIndex
DROP INDEX "Release_version_appId_key";

-- DropIndex
DROP INDEX "Release_version_key";

-- AlterTable
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL,
ADD CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Deployment_id_seq";

-- AlterTable
ALTER TABLE "Release" DROP CONSTRAINT "Release_pkey",
DROP COLUMN "id",
DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL,
ADD CONSTRAINT "Release_pkey" PRIMARY KEY ("version", "appId");

-- CreateTable
CREATE TABLE "PreviewSecret" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "PreviewSecret_pkey" PRIMARY KEY ("appId","id")
);

-- CreateTable
CREATE TABLE "ReleaseSecret" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "ReleaseSecret_pkey" PRIMARY KEY ("appId","version","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomNode_appId_name_key" ON "DomNode"("appId", "name");

-- AddForeignKey
ALTER TABLE "DomNode" ADD CONSTRAINT "DomNode_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_appId_version_fkey" FOREIGN KEY ("appId", "version") REFERENCES "Release"("appId", "version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewSecret" ADD CONSTRAINT "PreviewSecret_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseSecret" ADD CONSTRAINT "ReleaseSecret_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseSecret" ADD CONSTRAINT "ReleaseSecret_appId_version_fkey" FOREIGN KEY ("appId", "version") REFERENCES "Release"("appId", "version") ON DELETE CASCADE ON UPDATE CASCADE;
