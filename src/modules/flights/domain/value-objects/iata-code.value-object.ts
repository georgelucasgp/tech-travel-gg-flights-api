import { BadRequestException } from '@nestjs/common';

export class IataCode {
  private static readonly IATA_CODE_REGEX = /^[A-Z]{3}$/;

  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException('IATA code cannot be empty');
    }

    if (!IataCode.IATA_CODE_REGEX.test(value)) {
      throw new BadRequestException(
        'IATA code must be exactly 3 uppercase letters',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: IataCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
