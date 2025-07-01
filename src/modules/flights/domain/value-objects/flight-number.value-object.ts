import { BadRequestException } from '@nestjs/common';

export class FlightNumber {
  private static readonly FLIGHT_NUMBER_REGEX = /^[A-Z]{2}[0-9]{2,4}$/;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException('Flight number cannot be empty');
    }

    if (!FlightNumber.FLIGHT_NUMBER_REGEX.test(value)) {
      throw new BadRequestException(
        'Invalid flight number format. Use 2 letters followed by 2-4 digits (ex: LA3456).',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FlightNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
