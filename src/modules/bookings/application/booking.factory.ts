import { Booking, BookingProps } from '../domain/entities/booking.entity';
import { BookingId, BookingCode, BookingStatus } from '../domain/value-objects';
import { Itinerary } from '../../itineraries/domain/entities/itinerary.entity';

export interface BookingFactoryProps {
  id?: string;
  user_id: string;
  itinerary: Itinerary;
  code: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookingFactory {
  static create(props: BookingFactoryProps): Booking {
    const bookingProps: BookingProps = {
      id: props.id ? BookingId.create(props.id) : BookingId.create(),
      code: props.code ? BookingCode.create(props.code) : BookingCode.create(),
      userId: props.user_id,
      itinerary: props.itinerary,
      status: BookingStatus.create(props.status),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };

    return Booking.create(bookingProps);
  }
}
