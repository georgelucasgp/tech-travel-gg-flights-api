export class SearchDestination {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.toUpperCase();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Search destination is required and must be a string');
    }

    if (value.length !== 3) {
      throw new Error('Search destination must be a 3-character IATA code');
    }

    if (!/^[A-Z]{3}$/i.test(value)) {
      throw new Error('Search destination must contain only letters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SearchDestination): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
