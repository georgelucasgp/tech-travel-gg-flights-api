export interface AvailabilityItineraryDto {
  itinerary_id: string | null;
  origin_iata: string;
  destination_iata: string;
  departure_datetime: string;
  arrival_datetime: string;
  total_duration_minutes: number;
  stops: number;
  flights: Array<{
    id: string;
    flight_number: string;
    origin_iata: string;
    destination_iata: string;
    departure_datetime: string;
    arrival_datetime: string;
  }>;
}

export class AvailabilityResponseDto {
  outbound_itineraries: AvailabilityItineraryDto[];
  inbound_itineraries: AvailabilityItineraryDto[];

  static fromResult(
    outbound: AvailabilityItineraryDto[],
    inbound: AvailabilityItineraryDto[] = [],
  ): AvailabilityResponseDto {
    return {
      outbound_itineraries: outbound,
      inbound_itineraries: inbound,
    };
  }
}
