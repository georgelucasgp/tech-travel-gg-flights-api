import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItineraryDto } from '../presentation/dto/create-itinerary.dto';
import {
  IItineraryRepository,
  ItinerarySearchCriteria,
} from '../domain/repositories/itinerary.repository';
import { IFlightRepository } from '../../flights/domain/repositories/flight.repository';
import { Itinerary } from '../domain/entities/itinerary.entity';
import { ItineraryFactory } from './itinerary.factory';

@Injectable()
export class ItinerariesService {
  constructor(
    @Inject('IItineraryRepository')
    private readonly itineraryRepository: IItineraryRepository,
    @Inject('IFlightRepository')
    private readonly flightRepository: IFlightRepository,
  ) {}

  async create(createDto: CreateItineraryDto): Promise<Itinerary> {
    const flights = await Promise.all(
      createDto.flight_ids.map(async (flightId) => {
        const flight = await this.flightRepository.findById(flightId);
        if (!flight) {
          throw new BadRequestException(`Flight with ID ${flightId} not found`);
        }
        return flight;
      }),
    );

    try {
      const itinerary = ItineraryFactory.create({
        flights,
      });
      return await this.itineraryRepository.create(itinerary);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(): Promise<Itinerary[]> {
    return await this.itineraryRepository.findAll();
  }

  async findById(id: string): Promise<Itinerary> {
    const itinerary = await this.itineraryRepository.findById(id);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }
    return itinerary;
  }

  async findByCriteria(
    criteria: ItinerarySearchCriteria,
  ): Promise<Itinerary[]> {
    return await this.itineraryRepository.findByCriteria(criteria);
  }

  async delete(id: string): Promise<void> {
    const itinerary = await this.itineraryRepository.findById(id);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }
    await this.itineraryRepository.delete(id);
  }
}
