import { Booking, BookingProps } from '../domain/entities/booking.entity';
import { BookingId, BookingCode, BookingStatus } from '../domain/value-objects';
import { Itinerary } from '../../itineraries/domain/entities/itinerary.entity';

export interface BookingFactoryProps {
  id?: string;
  userId: string;
  itinerary: Itinerary;
  code: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class BookingFactory {
  static create(props: BookingFactoryProps): Booking {
    const bookingProps: BookingProps = {
      id: props.id ? BookingId.create(props.id) : BookingId.create(),
      code: props.code ? BookingCode.create(props.code) : BookingCode.create(),
      userId: props.userId,
      itinerary: props.itinerary,
      status: BookingStatus.create(props.status),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };

    return Booking.create(bookingProps);
  }
}
