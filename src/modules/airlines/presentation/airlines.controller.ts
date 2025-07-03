import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AirlinesService } from '../application/airlines.service';
import { AirlineResponseDto } from './dto/airline-response.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AirlineQueryDto } from './dto/airline-query.dto';

@ApiTags('Airlines')
@Controller({ path: 'airlines', version: '1' })
export class AirlinesController {
  constructor(private readonly airlinesService: AirlinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new airline' })
  @ApiResponse({
    status: 201,
    description: 'Airline created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'LATAM Airlines',
        iata_code: 'LA',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async create(
    @Body() createAirlineDto: CreateAirlineDto,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.create({
      name: createAirlineDto.name,
      iata_code: createAirlineDto.iata_code,
    });
    return AirlineResponseDto.fromEntity(airline);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airlines' })
  @ApiQuery({
    name: 'deleted_at',
    required: false,
    description: 'Include deleted airlines (true/false)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: 'Airlines retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'LATAM Airlines',
          iata_code: 'LA',
          created_at: '2025-07-01T10:00:00.000Z',
          updated_at: '2025-07-01T10:00:00.000Z',
          deleted_at: null,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Azul Airlines',
          iata_code: 'AD',
          created_at: '2025-07-01T11:00:00.000Z',
          updated_at: '2025-07-01T11:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  async findAll(
    @Query() query: AirlineQueryDto,
  ): Promise<AirlineResponseDto[]> {
    const showDeleted = query.deleted_at === 'true';
    const airlines = await this.airlinesService.findAll(showDeleted);
    return airlines.map((airline) => AirlineResponseDto.fromEntity(airline));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airline by ID' })
  @ApiParam({
    name: 'id',
    description: 'Airline UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airline retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'LATAM Airlines',
        iata_code: 'LA',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.findById(id);
    return AirlineResponseDto.fromEntity(airline);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an airline' })
  @ApiParam({
    name: 'id',
    description: 'Airline UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airline updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'LATAM Airlines Updated',
        iata_code: 'LA',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAirlineDto: UpdateAirlineDto,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.update(id, updateAirlineDto);
    return AirlineResponseDto.fromEntity(airline);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an airline' })
  @ApiParam({
    name: 'id',
    description: 'Airline UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Airline deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airlinesService.remove(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recover a deleted airline' })
  @ApiParam({
    name: 'id',
    description: 'Airline UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airline recovered successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'LATAM Airlines',
        iata_code: 'LA',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async recovery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.recovery(id);
    return AirlineResponseDto.fromEntity(airline);
  }
}
