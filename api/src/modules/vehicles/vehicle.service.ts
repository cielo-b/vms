import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { Vehicle } from "../../modals/vehicle.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { User } from "../../modals/user.entity";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

export class VehicleService {
  private vehicleRepo: Repository<Vehicle> =
    AppDataSource.getRepository(Vehicle);
  private userRepo: Repository<User> = AppDataSource.getRepository(User);

  public async createVehicle(
    dto: CreateVehicleDto,
    req: any
  ): Promise<ApiResponse> {
    try {
      // Validate owner exists
      const owner = await this.userRepo.findOne({
        where: { id: (req as any).user.id },
        relations: ["vehicles"],
      });

      if (!owner) {
        throw ApiError.notFound("User not found");
      }

      // Check for duplicate license plate for this user
      const existingVehicle = await this.vehicleRepo.findOne({
        where: {
          licensePlate: dto.plateNumber,
          owner: { id: (req as any).user.id },
        },
      });

      if (existingVehicle) {
        throw ApiError.badRequest("This vehicle is already registered to you");
      }

      const vehicle = this.vehicleRepo.create({
        licensePlate: dto.plateNumber,
        owner,
      });

      await this.vehicleRepo.save(vehicle);

      return {
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
        code: 201,
      };
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getAllVehicles(): Promise<ApiResponse> {
    try {
      const vehicles = await this.vehicleRepo.find({
        relations: ["owner", "bookings"],
      });

      return {
        success: true,
        message: "Vehicles retrieved successfully",
        data: vehicles,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting all vehicles:", error);
      throw ApiError.internal();
    }
  }

  public async getVehicleById(id: string): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicleRepo.findOne({
        where: { id },
        relations: ["owner", "bookings"],
      });

      if (!vehicle) {
        throw ApiError.notFound("Vehicle not found");
      }

      return {
        success: true,
        message: "Vehicle retrieved successfully",
        data: vehicle,
        code: 200,
      };
    } catch (error) {
      console.error(`Error getting vehicle ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getVehiclesByOwner(req: any): Promise<ApiResponse> {
    try {
      const vehicles = await this.vehicleRepo.find({
        where: { owner: { id: (req as any).user.id } },
        relations: ["bookings"],
      });

      return {
        success: true,
        message: "User vehicles retrieved successfully",
        data: vehicles,
        code: 200,
      };
    } catch (error) {
      console.error(
        `Error getting vehicles for owner ${(req as any).user.id}:`,
        error
      );
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async updateVehicle(
    id: string,
    dto: UpdateVehicleDto,
    req: any
  ): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicleRepo.findOne({
        where: { id },
        relations: ["owner"],
      });

      if (!vehicle) {
        throw ApiError.notFound("Vehicle not found");
      }

      // Only owner can update
      if (vehicle.owner.id !== (req as any).user.id) {
        throw ApiError.forbidden("You can only update your own vehicles");
      }

      // Check for duplicate license plate
      if (dto.plateNumber && dto.plateNumber !== vehicle.licensePlate) {
        const existingVehicle = await this.vehicleRepo.findOne({
          where: {
            licensePlate: dto.plateNumber,
            owner: { id: (req as any).user.id },
          },
        });

        if (existingVehicle) {
          throw ApiError.badRequest(
            "You already have a vehicle with this license plate"
          );
        }
      }

      if (dto.plateNumber) {
        vehicle.licensePlate = dto.plateNumber;
      }
      await this.vehicleRepo.save(vehicle);

      return {
        success: true,
        message: "Vehicle updated successfully",
        data: vehicle,
        code: 200,
      };
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async deleteVehicle(id: string, req: any): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicleRepo.findOne({
        where: { id },
        relations: ["owner", "bookings"],
      });

      if (!vehicle) {
        throw ApiError.notFound("Vehicle not found");
      }

      // Only owner or admin can delete
      if (vehicle.owner.id !== (req as any).user.id) {
        throw ApiError.forbidden("You can only delete your own vehicles");
      }

      // Check for active bookings
      const activeBooking = vehicle.bookings?.find(
        (b) => b.status === "ACTIVE" || b.status === "PENDING"
      );

      if (activeBooking) {
        throw ApiError.badRequest(
          "Cannot delete vehicle with active or pending bookings"
        );
      }

      await this.vehicleRepo.delete(id);

      return {
        success: true,
        message: "Vehicle deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error(`Error deleting vehicle ${id}:`, error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
