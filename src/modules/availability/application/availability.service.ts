import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { AvailabilitySearchDto } from '../presentation/dto/availability-search.dto';
import {
  AvailabilityResponseDto,
  AvailabilityItineraryDto,
} from '../presentation/dto/availability-response.dto';
import { IAvailabilityRepository } from '../domain/repositories/availability.repository';
import { Flight } from '../../flights/domain/entities/flight.entity';
import { ItinerariesService } from '../../itineraries/application/itineraries.service';
import { Itinerary } from '../../itineraries/domain/entities/itinerary.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject('IAvailabilityRepository')
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly itinerariesService: ItinerariesService,
  ) {}

  async search(
    searchDto: AvailabilitySearchDto,
  ): Promise<AvailabilityResponseDto> {
    if (!searchDto.origin) {
      throw new BadRequestException('Origin is required');
    }
    if (!searchDto.destination) {
      throw new BadRequestException('Destination is required');
    }
    if (!searchDto.departure_date) {
      throw new BadRequestException('Departure date is required');
    }

    const departureDate = new Date(searchDto.departure_date);

    const outboundItineraries = await this.findItinerariesForRoute(
      searchDto.origin,
      searchDto.destination,
      departureDate,
      searchDto.airlines,
      searchDto.max_stops,
    );

    let inboundItineraries: AvailabilityItineraryDto[] = [];
    if (searchDto.return_date) {
      const returnDate = new Date(searchDto.return_date);
      inboundItineraries = await this.findItinerariesForRoute(
        searchDto.destination,
        searchDto.origin,
        returnDate,
        searchDto.airlines,
        searchDto.max_stops,
      );
    }

    return AvailabilityResponseDto.fromResult(
      outboundItineraries,
      inboundItineraries,
    );
  }

  private async findItinerariesForRoute(
    origin: string,
    destination: string,
    date: Date,
    preferredAirlines?: string[],
    maxStops?: number,
  ): Promise<AvailabilityItineraryDto[]> {
    const results: AvailabilityItineraryDto[] = [];

    const existingItineraries = await this.itinerariesService.findByCriteria({
      origin,
      destination,
      date,
      airline_codes: preferredAirlines,
      max_stops: maxStops,
    });

    for (const itinerary of existingItineraries) {
      results.push(this.createItineraryDtoFromEntity(itinerary));
    }

    if (results.length === 0) {
      const directFlights =
        await this.availabilityRepository.findAvailableFlights({
          origin,
          destination,
          date,
          airline_codes: preferredAirlines,
        });

      for (const flight of directFlights) {
        results.push(this.createItineraryFromFlight(flight));
      }

      if (!maxStops || maxStops > 0) {
        const connectionItineraries = await this.findConnectionFlights(
          origin,
          destination,
          date,
          preferredAirlines,
        );
        results.push(...connectionItineraries);
      }
    }

    return results.sort(
      (a, b) =>
        new Date(a.departure_datetime).getTime() -
        new Date(b.departure_datetime).getTime(),
    );
  }

  private createItineraryDtoFromEntity(
    itinerary: Itinerary,
  ): AvailabilityItineraryDto {
    return {
      itinerary_id: itinerary.id.getValue(),
      origin_iata: itinerary.originIata,
      destination_iata: itinerary.destinationIata,
      departure_datetime: itinerary.departureDateTime.toISOString(),
      arrival_datetime: itinerary.arrivalDateTime.toISOString(),
      total_duration_minutes: itinerary.totalDurationMinutes,
      stops: itinerary.stops,
      flights: itinerary.flights.map((flight) => ({
        id: flight.id.getValue(),
        flight_number: flight.flightNumber.getValue(),
        origin_iata: flight.originIata.getValue(),
        destination_iata: flight.destinationIata.getValue(),
        departure_datetime: flight.departureDatetime.toISOString(),
        arrival_datetime: flight.arrivalDatetime.toISOString(),
      })),
    };
  }

  private async findConnectionFlights(
    origin: string,
    destination: string,
    date: Date,
    preferredAirlines?: string[],
  ): Promise<AvailabilityItineraryDto[]> {
    const results: AvailabilityItineraryDto[] = [];

    const firstLegFlights =
      await this.availabilityRepository.findAvailableFlights({
        origin,
        destination: '',
        date,
        airline_codes: preferredAirlines,
      });

    for (const firstFlight of firstLegFlights) {
      const connectionAirport = firstFlight.destinationIata.getValue();

      if (connectionAirport === destination) continue;

      const secondLegFlights =
        await this.availabilityRepository.findAvailableFlights({
          origin: connectionAirport,
          destination,
          date,
          airline_codes: preferredAirlines,
        });

      for (const secondFlight of secondLegFlights) {
        if (
          this.availabilityRepository.hasValidConnectionTime(
            firstFlight,
            secondFlight,
          )
        ) {
          const itinerary = this.createItineraryFromFlights([
            firstFlight,
            secondFlight,
          ]);
          results.push(itinerary);
        }
      }
    }

    return results;
  }

  private createItineraryFromFlight(flight: Flight): AvailabilityItineraryDto {
    return {
      itinerary_id: null,
      origin_iata: flight.originIata.getValue(),
      destination_iata: flight.destinationIata.getValue(),
      departure_datetime: flight.departureDatetime.toISOString(),
      arrival_datetime: flight.arrivalDatetime.toISOString(),
      total_duration_minutes: this.calculateDurationMinutes(
        flight.departureDatetime,
        flight.arrivalDatetime,
      ),
      stops: 0,
      flights: [
        {
          id: flight.id.getValue(),
          flight_number: flight.flightNumber.getValue(),
          origin_iata: flight.originIata.getValue(),
          destination_iata: flight.destinationIata.getValue(),
          departure_datetime: flight.departureDatetime.toISOString(),
          arrival_datetime: flight.arrivalDatetime.toISOString(),
        },
      ],
    };
  }

  private createItineraryFromFlights(
    flights: Flight[],
  ): AvailabilityItineraryDto {
    const firstFlight = flights[0];
    const lastFlight = flights[flights.length - 1];

    return {
      itinerary_id: null,
      origin_iata: firstFlight.originIata.getValue(),
      destination_iata: lastFlight.destinationIata.getValue(),
      departure_datetime: firstFlight.departureDatetime.toISOString(),
      arrival_datetime: lastFlight.arrivalDatetime.toISOString(),
      total_duration_minutes: this.calculateDurationMinutes(
        firstFlight.departureDatetime,
        lastFlight.arrivalDatetime,
      ),
      stops: flights.length - 1,
      flights: flights.map((flight) => ({
        id: flight.id.getValue(),
        flight_number: flight.flightNumber.getValue(),
        origin_iata: flight.originIata.getValue(),
        destination_iata: flight.destinationIata.getValue(),
        departure_datetime: flight.departureDatetime.toISOString(),
        arrival_datetime: flight.arrivalDatetime.toISOString(),
      })),
    };
  }

  private calculateDurationMinutes(departure: Date, arrival: Date): number {
    const durationMs = arrival.getTime() - departure.getTime();
    return Math.round(durationMs / (1000 * 60));
  }
}
