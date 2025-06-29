import { randomUUID } from 'crypto';

const FLIGHT_NUMBER_REGEX = /^[A-Z]{2}\d{3,4}$/;
const IATA_CODE_REGEX = /^[A-Z]{3}$/;

type FlightProps = {
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
};

export class Flight {
  private readonly _id?: string;
  public readonly props: Readonly<FlightProps>;

  private constructor(props: FlightProps, id?: string) {
    this._id = id ?? randomUUID();
    this.props = Object.freeze(props);
  }

  get id() {
    return this._id;
  }
  get flightNumber() {
    return this.props.flightNumber;
  }

  public static create(props: FlightProps, id?: string): Flight {
    if (
      !props.flightNumber ||
      !props.airlineId ||
      !props.originIata ||
      !props.destinationIata ||
      !props.departureDatetime ||
      !props.arrivalDatetime ||
      !props.frequency
    ) {
      throw new Error('All required fields must be filled');
    }

    if (!FLIGHT_NUMBER_REGEX.test(props.flightNumber)) {
      throw new Error('Flight number is invalid');
    }

    if (
      !IATA_CODE_REGEX.test(props.originIata) ||
      !IATA_CODE_REGEX.test(props.destinationIata)
    ) {
      throw new Error('IATA codes are invalid');
    }

    if (props.originIata === props.destinationIata) {
      throw new Error('Origin and destination cannot be the same');
    }

    if (props.arrivalDatetime <= props.departureDatetime) {
      throw new Error('Arrival datetime must be after departure datetime');
    }

    return new Flight(props, id);
  }
}
