import {
  IsOptional,
  IsString,
  Length,
  Matches,
  IsBooleanString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const AIRLINE_IATA_CODE_REGEX = /^[A-Z]{2}$/;

export class FlightQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra voos pelo código IATA da companhia aérea (ex: LA)',
    example: 'LA',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(AIRLINE_IATA_CODE_REGEX)
  airlineCode?: string;

  @ApiPropertyOptional({
    description:
      'Filtra voos pelo código IATA do aeroporto de origem (ex: BSB)',
    example: 'BSB',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  origin?: string;

  @ApiPropertyOptional({
    description:
      'Filtra voos pelo código IATA do aeroporto de destino (ex: CGH)',
    example: 'CGH',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  destination?: string;

  @ApiPropertyOptional({
    description:
      'If true, returns all records (including deleted ones). Default: false.',
  })
  @IsOptional()
  @IsBooleanString()
  deleted_at?: string;
}
