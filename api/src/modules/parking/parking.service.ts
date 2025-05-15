import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateParkingDto } from "./dto/create-parking.dto";
import { Parking } from "../../modals/parking.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";

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
        data: parking,
        code: 201,
      };
    } catch (error) {
      console.log("Error in parking creation", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
