import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  NotFoundException,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { FlightsService } from '../application/flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import { FlightQueryDto } from './dto/flight-query.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Flights')
@Controller({ path: 'flights', version: '1' })
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({ status: 201, description: 'Flight created successfully' })
  async create(
    @Body() createFlightDto: CreateFlightDto,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.create(createFlightDto);
    return new FlightResponseDto(flight);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flights with optional filters' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully' })
  async findAll(@Query() query: FlightQueryDto): Promise<FlightResponseDto[]> {
    const showDeleted = query.deleted_at === 'true';
    const flights = await this.flightsService.findAll(query, showDeleted);
    return flights.map((flight) => new FlightResponseDto(flight));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flight by ID' })
  @ApiResponse({ status: 200, description: 'Flight retrieved successfully' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return new FlightResponseDto(flight);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flight' })
  @ApiResponse({ status: 200, description: 'Flight updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.update(id, updateFlightDto);
    return new FlightResponseDto(flight);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a flight' })
  @ApiResponse({ status: 204, description: 'Flight deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.flightsService.delete(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recovery a flight' })
  @ApiResponse({ status: 200, description: 'Flight recovered successfully' })
  async recovery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.recovery(id);
    return new FlightResponseDto(flight);
  }
}
