import {
  Controller,
  Post,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { ParkingSpotService } from "./parking-spot.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ERole } from "../../enums/user-role.enum";

@Route("parking")
@Tags("Parking Spots")
export class ParkingSpotController extends Controller {
  private parkingSpotService: ParkingSpotService = new ParkingSpotService();

  @Post("/:parkingId/spots/create")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("201", "Parking spot created successfully")
  @Response<ApiResponse>("400", "Bad request - Invalid parking ID")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Parking lot not found")
  public async createParkingSpot(
    parkingId: string
  ): Promise<ApiResponse> {
    const response = await this.parkingSpotService.createParkingSpot(parkingId);
    this.setStatus(201);
    return response;
  }
}
