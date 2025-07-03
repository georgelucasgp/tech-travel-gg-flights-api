import { Booking } from '../entities/booking.entity';

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByCode(code: string): Promise<Booking | null>;
  findByUserId(userId: string): Promise<Booking[]>;
  existsByCode(code: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
