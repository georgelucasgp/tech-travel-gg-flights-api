import { BadRequestException } from '@nestjs/common';

export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class BookingStatus {
  private readonly _value: BookingStatusEnum;

  constructor(value: BookingStatusEnum) {
    this._value = value;
    this.validate();
  }

  static create(value: BookingStatusEnum | string): BookingStatus {
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase();
      if (
        Object.values(BookingStatusEnum).includes(
          upperValue as BookingStatusEnum,
        )
      ) {
        return new BookingStatus(upperValue as BookingStatusEnum);
      }
      throw new BadRequestException(`Invalid booking status: ${value}`);
    }
    return new BookingStatus(value);
  }

  static pending(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.PENDING);
  }

  static confirmed(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.CONFIRMED);
  }

  static cancelled(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.CANCELLED);
  }

  getValue(): BookingStatusEnum {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: BookingStatus): boolean {
    return this._value === other._value;
  }

  isPending(): boolean {
    return this._value === BookingStatusEnum.PENDING;
  }

  isConfirmed(): boolean {
    return this._value === BookingStatusEnum.CONFIRMED;
  }

  isCancelled(): boolean {
    return this._value === BookingStatusEnum.CANCELLED;
  }

  canBeCancelled(): boolean {
    return (
      this._value === BookingStatusEnum.CONFIRMED ||
      this._value === BookingStatusEnum.PENDING
    );
  }

  private validate(): void {
    if (!Object.values(BookingStatusEnum).includes(this._value)) {
      throw new BadRequestException(`Invalid booking status: ${this._value}`);
    }
  }
}
