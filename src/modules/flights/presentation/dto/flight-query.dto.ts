import { IsOptional, IsString, Length, Matches } from 'class-validator';

const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const AIRLINE_IATA_CODE_REGEX = /^[A-Z]{2}$/;

export class FlightQueryDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(AIRLINE_IATA_CODE_REGEX)
  airlineCode?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  origin?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(IATA_CODE_REGEX)
  destination?: string;
}
