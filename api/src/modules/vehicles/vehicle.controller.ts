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
import { VehicleService } from "./vehicle.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./update-vehicle.dto";

@Route("vehicle")
@Tags("Vehicle")
export class VehicleController extends Controller {
  private service: VehicleService = new VehicleService();

  @Post()
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("201", "Vehicle created successfully")
  @Response<ApiResponse>("400", "Bad Request - Vehicle already exists")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Owner not found")
  public async createVehicle(
    @Body() dto: CreateVehicleDto,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.createVehicle(dto, req);
    this.setStatus(response.code);
    return response;
  }

  @Get()
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "List of all vehicles")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  public async getAllVehicles(): Promise<ApiResponse> {
    const response = await this.service.getAllVehicles();
    this.setStatus(response.code);
    return response;
  }

  @Get("/my-vehicles")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "List of user's vehicles")
  @Response<ApiResponse>("401", "Unauthorized")
  public async getMyVehicles(
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.getVehiclesByOwner(req);
    this.setStatus(response.code);
    return response;
  }

  @Get("/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Vehicle details")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Vehicle not found")
  public async getVehicleById(id: string): Promise<ApiResponse> {
    const response = await this.service.getVehicleById(id);
    this.setStatus(response.code);
    return response;
  }

  @Put("/:id")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "Vehicle updated successfully")
  @Response<ApiResponse>("400", "Bad Request - License plate already in use")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Can only update your own vehicles")
  @Response<ApiResponse>("404", "Vehicle not found")
  public async updateVehicle(
    id: string,
    @Body() dto: UpdateVehicleDto,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.updateVehicle(id, dto, req);
    this.setStatus(response.code);
    return response;
  }

  @Delete("/:id")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "Vehicle deleted successfully")
  @Response<ApiResponse>("400", "Bad Request - Vehicle has active bookings")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Can only delete your own vehicles")
  @Response<ApiResponse>("404", "Vehicle not found")
  public async deleteVehicle(
    id: string,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.deleteVehicle(id, req);
    this.setStatus(response.code);
    return response;
  }
}
