/*
  Warnings:

  - The primary key for the `airlines` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `airports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `flights` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `itineraries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `itinerary_flights` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_itinerary_id_fkey";

-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_airline_id_fkey";

-- DropForeignKey
ALTER TABLE "itinerary_flights" DROP CONSTRAINT "itinerary_flights_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "itinerary_flights" DROP CONSTRAINT "itinerary_flights_itinerary_id_fkey";

-- AlterTable
ALTER TABLE "airlines" DROP CONSTRAINT "airlines_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "airlines_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "airlines_id_seq";

-- AlterTable
ALTER TABLE "airports" DROP CONSTRAINT "airports_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "airports_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "airports_id_seq";

-- AlterTable
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "itinerary_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "bookings_id_seq";

-- AlterTable
ALTER TABLE "flights" DROP CONSTRAINT "flights_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "airline_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "flights_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "flights_id_seq";

-- AlterTable
ALTER TABLE "itineraries" DROP CONSTRAINT "itineraries_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "itineraries_id_seq";

-- AlterTable
ALTER TABLE "itinerary_flights" DROP CONSTRAINT "itinerary_flights_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "itinerary_id" SET DATA TYPE TEXT,
ALTER COLUMN "flight_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "itinerary_flights_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "itinerary_flights_id_seq";

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flights" ADD CONSTRAINT "itinerary_flights_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flights" ADD CONSTRAINT "itinerary_flights_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
