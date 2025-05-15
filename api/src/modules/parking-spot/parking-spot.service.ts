import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ParkingSpot } from "../../modals/parking-spot.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Parking } from "../../modals/parking.entity";
import { Utility } from "../../utils/Utility";

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
}
