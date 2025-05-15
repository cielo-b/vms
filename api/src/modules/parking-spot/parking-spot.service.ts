import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ParkingSpot } from "../../modals/parking-spot.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Parking } from "../../modals/parking.entity";
import { Utility } from "../../utils/Utility";
import { UpdateParkingSpotDto } from "./dto/update-parking-spot.dto";

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
}
