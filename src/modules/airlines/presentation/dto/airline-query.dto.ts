import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBooleanString } from 'class-validator';

export class AirlineQueryDto {
  @ApiPropertyOptional({
    description:
      'If true, returns all records (including deleted ones). Default: false.',
  })
  @IsOptional()
  @IsBooleanString()
  deleted_at?: string;
}
