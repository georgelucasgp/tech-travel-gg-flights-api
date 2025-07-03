import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateItineraryDto {
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  flight_ids: string[];
}
