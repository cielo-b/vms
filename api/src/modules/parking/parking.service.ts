import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateParkingDto } from "./dto/create-parking.dto";
import { Parking } from "../../modals/parking.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { UpdateParkingDto } from "./dto/update-parking.dto";
import { ParkingSpot } from "../../modals/parking-spot.entity";

export class ParkingService {
  public async createParking(dto: CreateParkingDto): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      // get the parking
      const eParking = await parkingRepo.findOne({
        where: { name: dto.name },
      });

      if (eParking)
        throw ApiError.badRequest("Parking " + dto.name + " already exists.");

      // create the parking
      const parking: Parking = parkingRepo.create({
        name: dto.name,
        address: dto.address,
        pricePerHour: dto.price,
      });

      await parkingRepo.save(parking);

      return {
        success: true,
        message: "Parking created successfully.",
        data: await parkingRepo.findOne({
          where: { name: parking.name },
          relations: ["spots"],
        }),
        code: 201,
      };
    } catch (error) {
      console.log("Error in parking creation", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getAllParkings(): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      const parkings = await parkingRepo.find({ relations: ["spots"] });
      return {
        success: true,
        message: "Parkings retrieved successfully.",
        data: parkings,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting all parkings:", error);
      throw ApiError.internal();
    }
  }

  public async getParkingById(id: string): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      const parking = await parkingRepo.findOne({
        where: { id },
        relations: ["spots"],
      });

      if (!parking) {
        throw ApiError.notFound(`Parking with ID ${id} not found.`);
      }

      return {
        success: true,
        message: "Parking retrieved successfully.",
        data: parking,
        code: 200,
      };
    } catch (error) {
      console.error(`Error getting parking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async updateParking(
    id: string,
    dto: UpdateParkingDto
  ): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      const parking = await parkingRepo.findOne({ where: { id } });

      if (!parking) {
        throw ApiError.notFound(`Parking with ID ${id} not found.`);
      }

      // Check for name conflict
      if (dto.name && dto.name !== parking.name) {
        const existingParking = await parkingRepo.findOne({
          where: { name: dto.name },
        });
        if (existingParking) {
          throw ApiError.badRequest(`Parking ${dto.name} already exists.`);
        }
      }

      parkingRepo.merge(parking, dto);
      await parkingRepo.save(parking);

      return {
        success: true,
        message: "Parking updated successfully.",
        data: await parkingRepo.findOne({
          where: { name: parking.name },
          relations: ["spots"],
        }),
        code: 201,
      };
    } catch (error) {
      console.error(`Error updating parking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async deleteParking(id: string): Promise<ApiResponse> {
    const parkingRepo: Repository<Parking> =
      AppDataSource.getRepository(Parking);

    try {
      // Find the parking with its spots
      const parking = await parkingRepo.findOne({
        where: { id },
        relations: ["spots"],
      });

      if (!parking) {
        throw ApiError.notFound(`Parking with ID ${id} not found.`);
      }

      // Delete all referencing spots first (if any)
      if (parking.spots && parking.spots.length > 0) {
        const spotRepo = AppDataSource.getRepository(ParkingSpot);
        parking.spots.map((spot) => {
          spotRepo.delete(spot.id);
        })
      }

      // Now delete the parking itself
      await parkingRepo.delete(id);

      return {
        success: true,
        message: "Parking and related records deleted successfully.",
        code: 200,
      };
    } catch (error) {
      console.error(`Error deleting parking ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
