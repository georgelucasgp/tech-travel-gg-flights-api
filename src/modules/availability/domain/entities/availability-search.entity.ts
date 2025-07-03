import {
  SearchOrigin,
  SearchDestination,
  SearchDate,
  MaxStops,
  PreferredAirlines,
} from '../value-objects';

export interface AvailabilitySearchProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airlines?: string[];
  maxStops?: number;
}

export class AvailabilitySearch {
  private constructor(
    private readonly _origin: SearchOrigin,
    private readonly _destination: SearchDestination,
    private readonly _departureDate: SearchDate,
    private readonly _returnDate: SearchDate | undefined,
    private readonly _preferredAirlines: PreferredAirlines = new PreferredAirlines(
      [],
    ),
    private readonly _maxStops: MaxStops = new MaxStops(0),
  ) {
    this.validateSearch(
      this._origin,
      this._destination,
      this._departureDate,
      this._returnDate,
    );
  }

  static create(props: AvailabilitySearchProps): AvailabilitySearch {
    const origin = new SearchOrigin(props.origin);
    const destination = new SearchDestination(props.destination);
    const departureDate = new SearchDate(props.departureDate);
    const returnDate = props.returnDate
      ? new SearchDate(props.returnDate)
      : undefined;
    const preferredAirlines = new PreferredAirlines(props.airlines);
    const maxStops = new MaxStops(props.maxStops);

    return new AvailabilitySearch(
      origin,
      destination,
      departureDate,
      returnDate,
      preferredAirlines,
      maxStops,
    );
  }

  private validateSearch(
    origin: SearchOrigin,
    destination: SearchDestination,
    departureDate: SearchDate,
    returnDate?: SearchDate,
  ): void {
    if (origin.getValue() === destination.getValue()) {
      throw new Error('Origin and destination cannot be the same');
    }

    if (returnDate && returnDate.getValue() <= departureDate.getValue()) {
      throw new Error('Return date must be after departure date');
    }
  }

  get origin(): SearchOrigin {
    return this._origin;
  }

  get destination(): SearchDestination {
    return this._destination;
  }

  get departureDate(): SearchDate {
    return this._departureDate;
  }

  get returnDate(): SearchDate | undefined {
    return this._returnDate;
  }

  get preferredAirlines(): PreferredAirlines {
    return this._preferredAirlines;
  }

  get maxStops(): MaxStops {
    return this._maxStops;
  }

  isRoundTrip(): boolean {
    return this._returnDate !== undefined;
  }

  equals(other: AvailabilitySearch): boolean {
    return (
      this._origin.equals(other._origin) &&
      this._destination.equals(other._destination) &&
      this._departureDate.equals(other._departureDate) &&
      this._maxStops.equals(other._maxStops) &&
      this._preferredAirlines.equals(other._preferredAirlines) &&
      ((this._returnDate &&
        other._returnDate &&
        this._returnDate.equals(other._returnDate)) ||
        (!this._returnDate && !other._returnDate))
    );
  }

  toString(): string {
    const returnInfo = this._returnDate
      ? ` - Return: ${this._returnDate.toString()}`
      : ' (One way)';
    return `${this._origin.toString()} → ${this._destination.toString()} | Departure: ${this._departureDate.toString()}${returnInfo}`;
  }
}
