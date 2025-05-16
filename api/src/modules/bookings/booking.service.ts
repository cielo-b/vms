import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { Booking } from "../../modals/booking.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { EBookingStatus } from "../../enums/booking-status.enum";
import { User } from "../../modals/user.entity";
import { Vehicle } from "../../modals/vehicle.entity";
import { ParkingSpot } from "../../modals/parking-spot.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";

export class BookingService {
  private bookingRepo: Repository<Booking> = AppDataSource.getRepository(Booking);
  private userRepo: Repository<User> = AppDataSource.getRepository(User);
  private vehicleRepo: Repository<Vehicle> = AppDataSource.getRepository(Vehicle);
  private spotRepo: Repository<ParkingSpot> = AppDataSource.getRepository(ParkingSpot);

  public async createBooking(dto: CreateBookingDto): Promise<ApiResponse> {
    try {
      // Validate related entities exist
      const [customer, vehicle, spot] = await Promise.all([
        this.userRepo.findOne({ where: { id: dto.customerId } }),
        this.vehicleRepo.findOne({ where: { id: dto.vehicleId } }),
        this.spotRepo.findOne({ where: { id: dto.spotId } }),
      ]);

      if (!customer) throw ApiError.badRequest("Customer not found");
      if (!vehicle) throw ApiError.badRequest("Vehicle not found");
      if (!spot) throw ApiError.badRequest("Parking spot not found");

      // Check if spot is available
      if (spot.isOccupied) {
        throw ApiError.badRequest("This parking spot is not available");
      }

      const booking: Booking = this.bookingRepo.create({
        startTime: new Date(dto.startTime),
        requestedHours: dto.requestedHours,
        status: EBookingStatus.PENDING,
        customer,
        vehicle,
        parkingSpot: spot,
      });

      await this.bookingRepo.save(booking);

      // Update spot status
      spot.isOccupied = true;
      await this.spotRepo.save(spot);

      return {
        success: true,
        message: "Booking created successfully",
        data: booking,
        code: 201,
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getAllBookings(): Promise<ApiResponse> {
    try {
      const bookings = await this.bookingRepo.find({
        relations: ['customer', 'vehicle', 'parkingSpot'],
      });
      return {
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting all bookings:", error);
      throw ApiError.internal();
    }
  }

  public async getBookingById(id: string): Promise<ApiResponse> {
    try {
      const booking = await this.bookingRepo.findOne({
        where: { id },
        relations: ['customer', 'vehicle', 'parkingSpot', 'payment', 'receipt'],
      });

      if (!booking) {
        throw ApiError.notFound(`Booking with ID ${id} not found`);
      }

      return {
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
        code: 200,
      };
    } catch (error) {
      console.error(`Error getting booking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async updateBooking(id: string, dto: UpdateBookingDto): Promise<ApiResponse> {
    try {
      const booking = await this.bookingRepo.findOne({ 
        where: { id },
        relations: ['parkingSpot'],
      });

      if (!booking) {
        throw ApiError.notFound(`Booking with ID ${id} not found`);
      }

      // Validate status transitions
      if (dto.status && !this.isValidStatusTransition(booking.status, dto.status)) {
        throw ApiError.badRequest(`Invalid status transition from ${booking.status} to ${dto.status}`);
      }

      // Update booking
      this.bookingRepo.merge(booking, dto);
      await this.bookingRepo.save(booking);

      // If booking is cancelled or completed, free up the spot
      if (dto.status === EBookingStatus.CANCELLED || dto.status === EBookingStatus.COMPLETED) {
        booking.parkingSpot.isOccupied = false;
        await this.spotRepo.save(booking.parkingSpot);
      }

      return {
        success: true,
        message: "Booking updated successfully",
        data: booking,
        code: 200,
      };
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async deleteBooking(id: string): Promise<ApiResponse> {
    try {
      const booking = await this.bookingRepo.findOne({ 
        where: { id },
        relations: ['parkingSpot'],
      });

      if (!booking) {
        throw ApiError.notFound(`Booking with ID ${id} not found`);
      }

      // Free up the parking spot
      booking.parkingSpot.isOccupied = false;
      await this.spotRepo.save(booking.parkingSpot);

      await this.bookingRepo.delete(id);

      return {
        success: true,
        message: "Booking deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  private isValidStatusTransition(currentStatus: EBookingStatus, newStatus: EBookingStatus): boolean {
    const validTransitions: Record<EBookingStatus, EBookingStatus[]> = {
      [EBookingStatus.PENDING]: [EBookingStatus.APPROVED, EBookingStatus.CANCELLED],
      [EBookingStatus.APPROVED]: [EBookingStatus.ACTIVE, EBookingStatus.CANCELLED],
      [EBookingStatus.ACTIVE]: [EBookingStatus.COMPLETED],
      [EBookingStatus.COMPLETED]: [],
      [EBookingStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus].includes(newStatus);
  }
}