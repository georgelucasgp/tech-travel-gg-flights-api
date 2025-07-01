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

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateFlightDto): Promise<FlightResponseDto> {
    const flight = await this.flightsService.create(createDto);
    return new FlightResponseDto(flight);
  }

  @Get()
  async findAll(@Query() query: FlightQueryDto): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findAll(query);
    return flights.map((flight) => new FlightResponseDto(flight));
  }

  @Get(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const flight = await this.flightsService.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    await this.flightsService.delete(id);
  }
}
