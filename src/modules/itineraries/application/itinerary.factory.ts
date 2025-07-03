import { Itinerary } from '../domain/entities/itinerary.entity';
import { Flight } from '../../flights/domain/entities/flight.entity';

export class ItineraryFactory {
  static createFromFlights(flights: Flight[]): Itinerary {
    return Itinerary.create(flights);
  }
}
