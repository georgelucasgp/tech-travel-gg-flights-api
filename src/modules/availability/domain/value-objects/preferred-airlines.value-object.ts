export class PreferredAirlines {
  private readonly value: string[];

  constructor(airlines?: string[]) {
    this.value = this.validate(airlines);
  }

  private validate(airlines?: string[]): string[] {
    if (!airlines || airlines.length === 0) {
      return [];
    }

    if (!Array.isArray(airlines)) {
      throw new Error('Preferred airlines must be an array');
    }

    const validatedAirlines = airlines.map((airline) => {
      if (typeof airline !== 'string') {
        throw new Error('Each airline code must be a string');
      }

      const normalized = airline.toUpperCase().trim();

      if (!/^[A-Z]{2}$/.test(normalized)) {
        throw new Error(
          `Invalid airline code: ${airline}. Must be a 2-character IATA code`,
        );
      }

      return normalized;
    });
    return [...new Set(validatedAirlines)];
  }

  getValue(): string[] {
    return [...this.value];
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  includes(airlineCode: string): boolean {
    return this.value.includes(airlineCode.toUpperCase());
  }

  equals(other: PreferredAirlines): boolean {
    if (this.value.length !== other.value.length) {
      return false;
    }
    return this.value.every((airline) => other.value.includes(airline));
  }

  toString(): string {
    return this.value.join(', ');
  }
}
