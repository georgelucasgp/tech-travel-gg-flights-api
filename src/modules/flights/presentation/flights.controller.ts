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
} from '@nestjs/common';
import { FlightsService } from '../application/flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import { FlightQueryDto } from './dto/flight-query.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({
    status: 201,
    description: 'The flight has been successfully created.',
    type: FlightResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateFlightDto): Promise<FlightResponseDto> {
    const flight = await this.flightsService.create(createDto);
    return new FlightResponseDto(flight);
  }

  @Get()
  @ApiOperation({ summary: 'List all flights with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'A list of flights.',
    type: [FlightResponseDto],
  })
  async findAll(@Query() query: FlightQueryDto): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findAll(query);
    return flights.map((flight) => new FlightResponseDto(flight));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a specific flight by ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested flight.',
    type: FlightResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return new FlightResponseDto(flight);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a flight (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'The flight has been successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const flight = await this.flightsService.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    await this.flightsService.delete(id);
  }
}
