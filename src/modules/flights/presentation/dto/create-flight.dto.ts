import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsDate,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

const IATA_CODE_REGEX = /^[A-Z]{3}$/;

export class CreateFlightDto {
  @IsString() @IsNotEmpty() flightNumber: string;
  @IsUUID() @IsNotEmpty() airlineId: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Origin IATA code must be exactly 3 characters' })
  @Matches(IATA_CODE_REGEX, {
    message: 'Origin IATA code must contain only uppercase letters',
  })
  originIata: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, {
    message: 'Destination IATA code must be exactly 3 characters',
  })
  @Matches(IATA_CODE_REGEX, {
    message: 'Destination IATA code must contain only uppercase letters',
  })
  destinationIata: string;
  @Type(() => Date) @IsDate() @IsNotEmpty() departureDatetime: Date;
  @Type(() => Date) @IsDate() @IsNotEmpty() arrivalDatetime: Date;
  @IsArray() @IsNotEmpty() frequency: number[];
}
