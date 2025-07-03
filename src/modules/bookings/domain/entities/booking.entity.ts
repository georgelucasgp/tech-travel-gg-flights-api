import { BookingId, BookingCode, BookingStatus } from '../value-objects';
import { Itinerary } from '../../../itineraries/domain/entities/itinerary.entity';
import { BadRequestException } from '@nestjs/common';

export interface BookingProps {
  id: BookingId;
  code: BookingCode;
  userId: string;
  itinerary: Itinerary;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Booking {
  private constructor(
    private readonly _id: BookingId,
    private readonly _code: BookingCode,
    private readonly _userId: string,
    private readonly _itinerary: Itinerary,
    private _status: BookingStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: BookingProps): Booking {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new BadRequestException('User ID is required');
    }

    if (!props.itinerary) {
      throw new BadRequestException('Itinerary is required');
    }

    if (props.status.isPending() && props.itinerary.flights.length === 0) {
      throw new BadRequestException('Itinerary must have at least one flight');
    }

    return new Booking(
      props.id,
      props.code,
      props.userId,
      props.itinerary,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): BookingId {
    return this._id;
  }

  get code(): BookingCode {
    return this._code;
  }

  get userId(): string {
    return this._userId;
  }

  get itinerary(): Itinerary {
    return this._itinerary;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  confirm(): void {
    if (!this._status.isPending()) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }
    this._status = BookingStatus.confirmed();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (!this._status.canBeCancelled()) {
      throw new BadRequestException('This booking cannot be cancelled');
    }
    this._status = BookingStatus.cancelled();
    this._updatedAt = new Date();
  }

  equals(other: Booking): boolean {
    return this._id.equals(other._id);
  }

  toString(): string {
    return `Booking(${this._id.getValue()}, ${this._code.getValue()})`;
  }
}
