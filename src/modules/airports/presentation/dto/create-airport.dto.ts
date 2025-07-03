import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAirportDto {
  @ApiProperty({
    description: 'Name of the airport',
    example:
      'Aeroporto Internacional de Brasília - Presidente Juscelino Kubitschek',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  name: string;

  @ApiProperty({
    description: 'IATA code of the airport (3 uppercase letters)',
    example: 'BSB',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'IATA code must be exactly 3 uppercase letters',
  })
  iata_code: string;

  @ApiProperty({
    description: 'City where the airport is located',
    example: 'Brasília',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city: string;

  @ApiProperty({
    description: 'Country where the airport is located',
    example: 'Brazil',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country: string;

  @ApiProperty({
    description: 'Timezone of the airport',
    example: 'America/Sao_Paulo',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  timezone: string;
}
