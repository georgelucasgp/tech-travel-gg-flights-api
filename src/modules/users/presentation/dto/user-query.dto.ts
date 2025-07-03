import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBooleanString } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({
    description:
      'If true, returns all records (including deleted ones). Default: false.',
  })
  @IsOptional()
  @IsBooleanString()
  deleted_at?: string;
}
