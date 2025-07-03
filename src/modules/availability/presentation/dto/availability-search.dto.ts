import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const AIRLINE_IATA_CODE_REGEX = /^[A-Z0-9]{2}$/;

export class AvailabilitySearchDto {
  @ApiProperty({
    description: 'IATA code of the origin airport',
    example: 'BSB',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  origin: string;

  @ApiProperty({
    description: 'IATA code of the destination airport',
    example: 'GIG',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  destination: string;

  @ApiProperty({
    description: 'Departure date in YYYY-MM-DD format',
    example: '2025-07-01',
  })
  @IsDateString()
  @IsNotEmpty()
  departure_date: string;

  @ApiPropertyOptional({
    description: 'Return date in YYYY-MM-DD format',
    example: '2025-07-10',
  })
  @IsOptional()
  @IsDateString()
  return_date?: string;

  @ApiPropertyOptional({
    description: 'List of preferred airline IATA codes',
    example: ['LA', 'G3', '2Z'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 2, { each: true })
  @Matches(AIRLINE_IATA_CODE_REGEX, {
    each: true,
    message: 'IATA code must be exactly 2 uppercase letters or digits',
  })
  airlines?: string[];

  @ApiPropertyOptional({
    description: 'Maximum number of stops (0 for direct flights)',
    example: 1,
    minimum: 0,
    maximum: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  max_stops?: number;
}
