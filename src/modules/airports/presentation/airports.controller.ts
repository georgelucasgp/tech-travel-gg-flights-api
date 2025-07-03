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
import { AirportsService } from '../application/airports.service';
import { AirportResponseDto } from './dto/airport-response.dto';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AirportQueryDto } from './dto/airport-query.dto';

@ApiTags('Airports')
@Controller({ path: 'airports', version: '1' })
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new airport' })
  @ApiResponse({
    status: 201,
    description: 'Airport created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek',
        iata_code: 'BSB',
        city: 'Brasília',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async create(
    @Body() createAirportDto: CreateAirportDto,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.create({
      name: createAirportDto.name,
      iata_code: createAirportDto.iata_code,
      city: createAirportDto.city,
      country: createAirportDto.country,
      timezone: createAirportDto.timezone,
    });
    return AirportResponseDto.fromEntity(airport);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airports' })
  @ApiQuery({
    name: 'deleted_at',
    required: false,
    description: 'Include deleted airports (true/false)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: 'Airports retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek',
          iata_code: 'BSB',
          city: 'Brasília',
          country: 'Brasil',
          timezone: 'America/Sao_Paulo',
          created_at: '2025-07-01T10:00:00.000Z',
          updated_at: '2025-07-01T10:00:00.000Z',
          deleted_at: null,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Aeroporto Internacional do Rio de Janeiro - Galeão',
          iata_code: 'GIG',
          city: 'Rio de Janeiro',
          country: 'Brasil',
          timezone: 'America/Sao_Paulo',
          created_at: '2025-07-01T11:00:00.000Z',
          updated_at: '2025-07-01T11:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  async findAll(
    @Query() query: AirportQueryDto,
  ): Promise<AirportResponseDto[]> {
    const showDeleted = query.deleted_at === 'true';
    const airports = await this.airportsService.findAll(showDeleted);
    return airports.map((airport) => AirportResponseDto.fromEntity(airport));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airport by ID' })
  @ApiParam({
    name: 'id',
    description: 'Airport UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airport retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek',
        iata_code: 'BSB',
        city: 'Brasília',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.findById(id);
    return AirportResponseDto.fromEntity(airport);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airport updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek Internacional',
        iata_code: 'BSB',
        city: 'Brasília',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.update(id, updateAirportDto);
    return AirportResponseDto.fromEntity(airport);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Airport deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airportsService.remove(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recover a deleted airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Airport recovered successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek',
        iata_code: 'BSB',
        city: 'Brasília',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async recovery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.recovery(id);
    return AirportResponseDto.fromEntity(airport);
  }
}
