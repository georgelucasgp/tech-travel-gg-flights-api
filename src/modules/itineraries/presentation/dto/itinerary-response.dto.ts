import { Flight } from '../../../flights/domain/entities/flight.entity';
import { Itinerary } from '../../domain/entities/itinerary.entity';

export interface FlightResponseDto {
  id: string;
  flight_number: string;
  origin_iata: string;
  destination_iata: string;
  departure_datetime: string;
  arrival_datetime: string;
}

export class ItineraryResponseDto {
  id: string;
  origin_iata: string;
  destination_iata: string;
  departure_datetime: string;
  arrival_datetime: string;
  total_duration_minutes: number;
  stops: number;
  flights: FlightResponseDto[];

  static fromEntity(itinerary: Itinerary): ItineraryResponseDto {
    return {
      id: itinerary.id.toString(),
      origin_iata: itinerary.originIata,
      destination_iata: itinerary.destinationIata,
      departure_datetime: itinerary.departureDateTime.toISOString(),
      arrival_datetime: itinerary.arrivalDateTime.toISOString(),
      total_duration_minutes: itinerary.totalDurationMinutes,
      stops: itinerary.stops,
      flights: itinerary.flights.map((flight: Flight) => ({
        id: flight.id.toString(),
        flight_number: flight.flightNumber.getValue(),
        origin_iata: flight.originIata.getValue(),
        destination_iata: flight.destinationIata.getValue(),
        departure_datetime: flight.departureDatetime.toISOString(),
        arrival_datetime: flight.arrivalDatetime.toISOString(),
      })),
    };
  }
}
