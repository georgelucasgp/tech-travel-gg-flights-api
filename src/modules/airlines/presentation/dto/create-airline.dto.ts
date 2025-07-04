import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAirlineDto {
  @ApiProperty({
    description: 'Name of the airline',
    example: 'LATAM Airlines',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'IATA code of the airline (2 uppercase letters or digits)',
    example: 'G3',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(/^[A-Z0-9]{2}$/, {
    message: 'IATA code must be exactly 2 uppercase letters or digits',
  })
  iata_code: string;
}
