import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsDate,
  IsUUID,
  Length,
  Matches,
  IsInt,
  Min,
  Max,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const IATA_CODE_REGEX = /^[A-Z]{3}$/;

export class CreateFlightDto {
  @ApiProperty({
    description: 'Flight number (e.g., LA3456)',
    example: 'LA3456',
  })
  @IsString()
  @IsNotEmpty()
  flight_number: string;

  @ApiProperty({
    description: 'Airline ID (UUID)',
    example: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
  })
  @IsUUID()
  @IsNotEmpty()
  airline_id: string;

  @ApiProperty({
    description: 'IATA code of the origin airport (3 uppercase letters)',
    example: 'BSB',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Origin IATA code must be exactly 3 characters' })
  @Matches(IATA_CODE_REGEX, {
    message: 'Origin IATA code must contain only uppercase letters',
  })
  origin_iata: string;

  @ApiProperty({
    description: 'IATA code of the destination airport (3 uppercase letters)',
    example: 'CGH',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, {
    message: 'Destination IATA code must be exactly 3 characters',
  })
  @Matches(IATA_CODE_REGEX, {
    message: 'Destination IATA code must contain only uppercase letters',
  })
  destination_iata: string;

  @ApiProperty({
    description: 'Departure date and time in ISO 8601 UTC format',
    example: '2025-08-15T22:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  departure_datetime: Date;

  @ApiProperty({
    description: 'Arrival date and time in ISO 8601 UTC format',
    example: '2025-08-16T00:30:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  arrival_datetime: Date;

  @ApiProperty({
    description: 'Flight frequency (array of weekdays, 0=Sunday, 6=Saturday)',
    example: [1, 3, 5],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  frequency: number[];
}
