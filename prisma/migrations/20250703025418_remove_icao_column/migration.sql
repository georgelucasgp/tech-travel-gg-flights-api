/*
  Warnings:

  - You are about to drop the column `icao_code` on the `airlines` table. All the data in the column will be lost.
  - You are about to drop the column `icao_code` on the `airports` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "airlines_icao_code_idx";

-- DropIndex
DROP INDEX "airlines_icao_code_key";

-- DropIndex
DROP INDEX "airports_icao_code_idx";

-- DropIndex
DROP INDEX "airports_icao_code_key";

-- AlterTable
ALTER TABLE "airlines" DROP COLUMN "icao_code";

-- AlterTable
ALTER TABLE "airports" DROP COLUMN "icao_code";
