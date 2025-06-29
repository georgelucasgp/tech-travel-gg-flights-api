-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "airlines" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "iata_code" VARCHAR(3) NOT NULL,
    "icao_code" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "iata_code" VARCHAR(3) NOT NULL,
    "icao_code" VARCHAR(4) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "timezone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" SERIAL NOT NULL,
    "flight_number" VARCHAR(10) NOT NULL,
    "airline_id" INTEGER NOT NULL,
    "origin_iata" VARCHAR(3) NOT NULL,
    "destination_iata" VARCHAR(3) NOT NULL,
    "departure_datetime" TIMESTAMPTZ NOT NULL,
    "arrival_datetime" TIMESTAMPTZ NOT NULL,
    "frequency" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_flights" (
    "id" SERIAL NOT NULL,
    "itinerary_id" INTEGER NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "itinerary_flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "itinerary_id" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "airlines_iata_code_key" ON "airlines"("iata_code");

-- CreateIndex
CREATE UNIQUE INDEX "airlines_icao_code_key" ON "airlines"("icao_code");

-- CreateIndex
CREATE INDEX "airlines_iata_code_idx" ON "airlines"("iata_code");

-- CreateIndex
CREATE INDEX "airlines_icao_code_idx" ON "airlines"("icao_code");

-- CreateIndex
CREATE UNIQUE INDEX "airports_iata_code_key" ON "airports"("iata_code");

-- CreateIndex
CREATE UNIQUE INDEX "airports_icao_code_key" ON "airports"("icao_code");

-- CreateIndex
CREATE INDEX "airports_iata_code_idx" ON "airports"("iata_code");

-- CreateIndex
CREATE INDEX "airports_icao_code_idx" ON "airports"("icao_code");

-- CreateIndex
CREATE INDEX "airports_city_idx" ON "airports"("city");

-- CreateIndex
CREATE INDEX "airports_country_idx" ON "airports"("country");

-- CreateIndex
CREATE INDEX "flights_origin_iata_idx" ON "flights"("origin_iata");

-- CreateIndex
CREATE INDEX "flights_destination_iata_idx" ON "flights"("destination_iata");

-- CreateIndex
CREATE INDEX "flights_departure_datetime_idx" ON "flights"("departure_datetime");

-- CreateIndex
CREATE INDEX "flights_airline_id_idx" ON "flights"("airline_id");

-- CreateIndex
CREATE INDEX "flights_flight_number_idx" ON "flights"("flight_number");

-- CreateIndex
CREATE INDEX "flights_origin_iata_destination_iata_idx" ON "flights"("origin_iata", "destination_iata");

-- CreateIndex
CREATE INDEX "flights_origin_iata_departure_datetime_idx" ON "flights"("origin_iata", "departure_datetime");

-- CreateIndex
CREATE INDEX "itinerary_flights_itinerary_id_order_idx" ON "itinerary_flights"("itinerary_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_flights_itinerary_id_flight_id_key" ON "itinerary_flights"("itinerary_id", "flight_id");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_flights_itinerary_id_order_key" ON "itinerary_flights"("itinerary_id", "order");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_origin_iata_fkey" FOREIGN KEY ("origin_iata") REFERENCES "airports"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_destination_iata_fkey" FOREIGN KEY ("destination_iata") REFERENCES "airports"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flights" ADD CONSTRAINT "itinerary_flights_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flights" ADD CONSTRAINT "itinerary_flights_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
