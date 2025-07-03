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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
        name: 'Aeroporto Internacional de Brasília',
        iata_code: 'BSB',
        city: 'Brasília',
        country: 'Brazil',
        timezone: 'America/Sao_Paulo',
        created_at: '2025-01-07T10:00:00Z',
        updated_at: '2025-01-07T10:00:00Z',
      },
    },
  })
  async create(
    @Body() createAirportDto: CreateAirportDto,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.create(createAirportDto);
    return new AirportResponseDto(airport);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airports' })
  @ApiResponse({ status: 200, description: 'Airports retrieved successfully' })
  async findAll(
    @Query() query: AirportQueryDto,
  ): Promise<AirportResponseDto[]> {
    const showDeleted = query.deleted_at === 'true';
    const airports = await this.airportsService.findAll(showDeleted);
    return airports.map((airport) => new AirportResponseDto(airport));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airport by ID' })
  @ApiResponse({ status: 200, description: 'Airport retrieved successfully' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.findById(id);
    return new AirportResponseDto(airport);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an airport' })
  @ApiResponse({ status: 200, description: 'Airport updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.update(id, updateAirportDto);
    return new AirportResponseDto(airport);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an airport' })
  @ApiResponse({ status: 204, description: 'Airport deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airportsService.remove(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recovery an airport' })
  @ApiResponse({ status: 200, description: 'Airport recovered successfully' })
  async recovery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirportResponseDto> {
    const airport = await this.airportsService.recovery(id);
    return new AirportResponseDto(airport);
  }
}
