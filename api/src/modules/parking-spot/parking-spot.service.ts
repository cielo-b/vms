import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ParkingSpot } from "../../modals/parking-spot.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Parking } from "../../modals/parking.entity";
import { Utility } from "../../utils/Utility";
import { UpdateParkingSpotDto } from "./dto/update-parking-spot.dto";
import { EBookingStatus } from "../../enums/booking-status.enum";
import { User } from "../../modals/user.entity";
import { Vehicle } from "../../modals/vehicle.entity";
import { Booking } from "../../modals/booking.entity";

export class ParkingSpotService {
  public async createParkingSpot(id: string): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);

    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      if (!id) {
        throw ApiError.badRequest("Parking ID is required");
      }
      // get the parking
      const parking = await parkingRepo.findOne({
        where: { id },
        relations: ["spots"],
      });
      if (!parking) throw ApiError.notFound("Parking " + id + " not found.");

      // create the spot and append to the parking's spots
      const newSpot = parkingSpotRepo.create({
        parkingLot: parking,
        isOccupied: false,
        spotNumber: Utility.generateSpotNumber(parking.spots.length + 1),
      });
      const savedSpot = await parkingSpotRepo.save(newSpot);

      // Update parking's spots relation
      parking.spots = [...parking.spots, savedSpot];
      await parkingRepo.save(parking);

      return {
        success: true,
        message: "Parking spot created successfully",
        data: await parkingSpotRepo.findOne({ where: { parkingLot: { id } } }),
        code: 201,
      };
    } catch (error) {
      console.log("Error while creating the parking spot:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getAllSpotsGroupedByParking(): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);
    try {
      const parkings = await parkingRepo.find({
        relations: ["spots"],
        order: {
          name: "ASC",
          spots: {
            spotNumber: "ASC",
          },
        },
      });

      return {
        success: true,
        message: "Parking spots retrieved successfully",
        data: parkings.map((parking) => ({
          parkingId: parking.id,
          parkingName: parking.name,
          spots: parking.spots,
        })),
        code: 200,
      };
    } catch (error) {
      console.error("Error getting all spots grouped by parking:", error);
      throw ApiError.internal();
    }
  }

  public async getSpotsByParkingId(parkingId: string): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);
    try {
      if (!parkingId) {
        throw ApiError.badRequest("Parking ID is required");
      }

      const parking = await parkingRepo.findOne({
        where: { id: parkingId },
        relations: ["spots"],
      });

      if (!parking) {
        throw ApiError.notFound("Parking not found");
      }

      return {
        success: true,
        message: "Parking spots retrieved successfully",
        data: parking.spots,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting spots by parking ID:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getSpotById(spotId: string): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);
    try {
      if (!spotId) {
        throw ApiError.badRequest("Spot ID is required");
      }

      const spot = await parkingSpotRepo.findOne({
        where: { id: spotId },
        relations: ["parkingLot"],
      });

      if (!spot) {
        throw ApiError.notFound("Parking spot not found");
      }

      return {
        success: true,
        message: "Parking spot retrieved successfully",
        data: spot,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting spot by ID:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async updateSpot(
    spotId: string,
    dto: UpdateParkingSpotDto
  ): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);
    try {
      if (!spotId) {
        throw ApiError.badRequest("Spot ID is required");
      }

      const spot = await parkingSpotRepo.findOne({
        where: { id: spotId },
      });

      if (!spot) {
        throw ApiError.notFound("Parking spot not found");
      }

      parkingSpotRepo.merge(spot, dto);
      const updatedSpot = await parkingSpotRepo.save(spot);

      return {
        success: true,
        message: "Parking spot updated successfully",
        data: updatedSpot,
        code: 201,
      };
    } catch (error) {
      console.error("Error updating parking spot:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async deleteSpot(spotId: string): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);
    try {
      if (!spotId) {
        throw ApiError.badRequest("Spot ID is required");
      }

      const result = await parkingSpotRepo.delete(spotId);

      if (result.affected === 0) {
        throw ApiError.notFound("Parking spot not found");
      }

      return {
        success: true,
        message: "Parking spot deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting parking spot:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async startDirectParking(
    spotId: string,
    customerId: string,
    vehicleId: string
  ): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);


    const bookingRepo: Repository<Booking> =
      AppDataSource.getRepository(Booking);

    const vehicleRepo: Repository<Vehicle> =
      AppDataSource.getRepository(Vehicle);

    const userRepo: Repository<User> = AppDataSource.getRepository(User);
    try {
      // Validate entities exist
      const [spot, customer, vehicle] = await Promise.all([
        parkingSpotRepo.findOne({ where: { id: spotId } }),
        userRepo.findOne({ where: { id: customerId } }),
        vehicleRepo.findOne({ where: { id: vehicleId } }),
      ]);

      if (!spot) throw ApiError.notFound("Parking spot not found");
      if (!customer) throw ApiError.notFound("Customer not found");
      if (!vehicle) throw ApiError.notFound("Vehicle not found");

      // Check spot availability
      if (spot.isOccupied) {
        throw ApiError.badRequest("This parking spot is already occupied");
      }

      // Create immediate booking record
      const booking = bookingRepo.create({
        startTime: new Date(),
        status: EBookingStatus.ACTIVE,
        customer,
        vehicle,
        parkingSpot: spot,
      });

      await bookingRepo.save(booking);

      // Update spot status
      spot.isOccupied = true;
      await parkingSpotRepo.save(spot);

      return {
        success: true,
        message: "Direct parking started successfully",
        data: booking,
        code: 201,
      };
    } catch (error) {
      console.error("Error starting direct parking:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async completeDirectParking(
    spotId: string,
    hoursParked: number
  ): Promise<ApiResponse> {
    const parkingSpotRepo: Repository<ParkingSpot> =
      AppDataSource.getRepository(ParkingSpot);


    const bookingRepo: Repository<Booking> =
      AppDataSource.getRepository(Booking);


    try {
      const spot = await parkingSpotRepo.findOne({
        where: { id: spotId },
        relations: ["parkingLot"],
      });

      if (!spot) throw ApiError.notFound("Parking spot not found");

      // Find active booking for this spot
      const booking = await bookingRepo.findOne({
        where: {
          parkingSpot: { id: spotId },
          status: EBookingStatus.ACTIVE,
        },
        relations: ["customer", "vehicle", "parkingSpot"],
      });

      if (!booking) {
        throw ApiError.badRequest(
          "No active parking session found for this spot"
        );
      }

      // Calculate payment
      const totalAmount = hoursParked * spot.parkingLot.pricePerHour;

      // Update booking
      booking.endTime = new Date();
      booking.status = EBookingStatus.COMPLETED;
      await bookingRepo.save(booking);

      // Free up the spot
      spot.isOccupied = false;
      await parkingSpotRepo.save(spot);

      return {
        success: true,
        message: "Direct parking completed successfully",
        data: {
          booking,
          hoursParked,
          totalAmount,
          currency: "USD", // Adjust as needed
        },
        code: 200,
      };
    } catch (error) {
      console.error("Error completing direct parking:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getActiveParkingSession(spotId: string): Promise<ApiResponse> {


    const bookingRepo: Repository<Booking> =
      AppDataSource.getRepository(Booking);


    try {
      const booking = await bookingRepo.findOne({
        where: {
          parkingSpot: { id: spotId },
          status: EBookingStatus.ACTIVE,
        },
        relations: ["customer", "vehicle"],
      });

      if (!booking) {
        throw ApiError.notFound("No active parking session found");
      }

      return {
        success: true,
        message: "Active parking session retrieved",
        data: booking,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting active parking session:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
