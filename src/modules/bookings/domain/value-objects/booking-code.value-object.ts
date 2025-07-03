import { BadRequestException } from '@nestjs/common';

export class BookingCode {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value ?? this.generateCode();
    this.validate();
  }

  static create(value?: string): BookingCode {
    return new BookingCode(value);
  }

  getValue(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: BookingCode): boolean {
    return this._value === other._value;
  }

  private validate(): void {
    if (!this._value) {
      throw new BadRequestException('BookingCode cannot be empty');
    }

    if (this._value.length !== 6) {
      throw new BadRequestException('BookingCode must be exactly 6 characters');
    }

    if (!/^[A-Z0-9]{6}$/.test(this._value)) {
      throw new BadRequestException(
        'BookingCode must contain only uppercase letters and numbers',
      );
    }
  }

  private generateCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  }
}
