import { randomUUID } from 'crypto';
import { validate as uuidValidate } from 'uuid';

export class ItineraryId {
  private constructor(private readonly _value: string) {
    this.validate(_value);
  }

  static create(value?: string): ItineraryId {
    if (arguments.length === 0) {
      return new ItineraryId(randomUUID());
    }
    return new ItineraryId(value!);
  }

  getValue(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (typeof value !== 'string') {
      throw new Error('ItineraryId must be a string');
    }

    if (!value) {
      throw new Error('ItineraryId cannot be empty');
    }

    if (!uuidValidate(value)) {
      throw new Error('ItineraryId must be a valid UUID');
    }
  }

  equals(other: ItineraryId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
