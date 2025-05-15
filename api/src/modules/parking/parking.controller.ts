import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { ParkingService } from "./parking.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateParkingDto } from "./dto/create-parking.dto";

@Route("parking")
@Tags("Parking")
export class ParkingController extends Controller {
  private parkingService: ParkingService = new ParkingService();

  @Post("/create")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("201", "Parking created successfully.")
  @Response<ApiResponse>("400", "Bad Request")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  public async createParking(
    @Body() dto: CreateParkingDto,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.parkingService.createParking(dto);
    this.setStatus(response.code);
    return response;
  }
}
