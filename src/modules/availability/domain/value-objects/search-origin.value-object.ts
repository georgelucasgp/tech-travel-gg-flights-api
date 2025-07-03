export class SearchOrigin {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.toUpperCase();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Search origin is required and must be a string');
    }

    if (value.length !== 3) {
      throw new Error('Search origin must be a 3-character IATA code');
    }

    if (!/^[A-Z]{3}$/i.test(value)) {
      throw new Error('Search origin must contain only letters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SearchOrigin): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
