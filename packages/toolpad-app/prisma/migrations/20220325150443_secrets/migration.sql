/*
  Warnings:

  - You are about to drop the `PreviewSecret` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleaseSecret` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "DomNodeAttributeType" ADD VALUE 'secret';

-- DropForeignKey
ALTER TABLE "PreviewSecret" DROP CONSTRAINT "PreviewSecret_appId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseSecret" DROP CONSTRAINT "ReleaseSecret_appId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseSecret" DROP CONSTRAINT "ReleaseSecret_appId_version_fkey";

-- DropTable
DROP TABLE "PreviewSecret";

-- DropTable
DROP TABLE "ReleaseSecret";
