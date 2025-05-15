import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { ParkingService } from "./parking.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateParkingDto } from "./dto/create-parking.dto";
import { Parking } from "../../modals/parking.entity";
import { UpdateParkingDto } from "./dto/update-parking.dto";

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

  @Get("/")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "List of all parkings")
  public async getAllParkings(): Promise<ApiResponse> {
    const response = await this.parkingService.getAllParkings();
    this.setStatus(200);
    return response;
  }

  @Get("/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Parking details")
  @Response<ApiResponse>("404", "Parking not found")
  public async getParkingById(id: string): Promise<ApiResponse> {
    const response = await this.parkingService.getParkingById(id);
    this.setStatus(200);
    return response;
  }

  @Put("/:id")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "Parking updated successfully")
  @Response<ApiResponse>("400", "Bad request")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Parking not found")
  public async updateParking(
    id: string,
    @Body() dto: UpdateParkingDto
  ): Promise<ApiResponse> {
    const response = await this.parkingService.updateParking(id, dto);
    this.setStatus(200);
    return response;
  }

  @Delete("/:id")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "Parking deleted successfully")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Parking not found")
  public async deleteParking(id: string): Promise<ApiResponse> {
    const response = await this.parkingService.deleteParking(id);
    this.setStatus(200);
    return response;
  }
}
