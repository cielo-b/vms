import { Body, Controller, Post, Response, Route, Tags } from "tsoa";
import { ParkingService } from "./parking.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateParkingDto } from "./dto/create-parking.dto";

@Route("parking")
@Tags("Parking")
export class ParkingController extends Controller {
  private parkingService: ParkingService = new ParkingService();

  @Post("/create")
  @Response<ApiResponse>("201", "Parking created successfully.")
  @Response<ApiResponse>("400", "Bad Request")
  public async createParking(
    @Body() dto: CreateParkingDto
  ): Promise<ApiResponse> {
    const response = await this.parkingService.createParking(dto);
    this.setStatus(response.code);
    return response;
  }
}
