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
} from '@nestjs/common';
import { AirlinesService } from '../application/airlines.service';
import { AirlineResponseDto } from './dto/airline-response.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
        name: 'GG Airlines',
        iataCode: 'GG',
        createdAt: '2025-01-07T10:00:00Z',
        updatedAt: '2025-01-07T10:00:00Z',
      },
    },
  })
  async create(
    @Body() createAirlineDto: CreateAirlineDto,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.create(createAirlineDto);
    return new AirlineResponseDto(airline);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airlines' })
  @ApiResponse({ status: 200, description: 'Airlines retrieved successfully' })
  async findAll(): Promise<AirlineResponseDto[]> {
    const airlines = await this.airlinesService.findAll();
    return airlines.map((airline) => new AirlineResponseDto(airline));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airline by ID' })
  @ApiResponse({ status: 200, description: 'Airline retrieved successfully' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.findOne(id);
    return new AirlineResponseDto(airline);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an airline' })
  @ApiResponse({ status: 200, description: 'Airline updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAirlineDto: UpdateAirlineDto,
  ): Promise<AirlineResponseDto> {
    const airline = await this.airlinesService.update(id, updateAirlineDto);
    return new AirlineResponseDto(airline);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an airline' })
  @ApiResponse({ status: 204, description: 'Airline deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airlinesService.remove(id);
  }
}
