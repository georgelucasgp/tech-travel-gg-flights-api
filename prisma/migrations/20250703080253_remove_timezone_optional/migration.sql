/*
  Warnings:

  - Made the column `timezone` on table `airports` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "airports" ALTER COLUMN "timezone" SET NOT NULL;
