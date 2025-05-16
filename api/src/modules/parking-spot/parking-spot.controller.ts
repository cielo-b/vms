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
import { ParkingSpotService } from "./parking-spot.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ERole } from "../../enums/user-role.enum";
import { UpdateParkingSpotDto } from "./dto/update-parking-spot.dto";

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
  public async createParkingSpot(parkingId: string): Promise<ApiResponse> {
    const response = await this.parkingSpotService.createParkingSpot(parkingId);
    this.setStatus(201);
    return response;
  }

  @Get("/spots")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "All parking spots grouped by parking")
  @Response<ApiResponse>("401", "Unauthorized")
  public async getAllSpotsGroupedByParking(): Promise<ApiResponse> {
    const response =
      await this.parkingSpotService.getAllSpotsGroupedByParking();
    this.setStatus(200);
    return response;
  }

  @Get("/:parkingId/spots")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Parking spots for specified parking")
  @Response<ApiResponse>("400", "Bad request - Invalid parking ID")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Parking not found")
  public async getSpotsByParkingId(parkingId: string): Promise<ApiResponse> {
    const response = await this.parkingSpotService.getSpotsByParkingId(
      parkingId
    );
    this.setStatus(200);
    return response;
  }

  @Get("/spots/:spotId")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Parking spot details")
  @Response<ApiResponse>("400", "Bad request - Invalid spot ID")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Spot not found")
  public async getSpotById(spotId: string): Promise<ApiResponse> {
    const response = await this.parkingSpotService.getSpotById(spotId);
    this.setStatus(200);
    return response;
  }

  @Put("/spots/:spotId")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "Parking spot updated successfully")
  @Response<ApiResponse>("400", "Bad request")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Spot not found")
  public async updateSpot(
    spotId: string,
    @Body() dto: UpdateParkingSpotDto
  ): Promise<ApiResponse> {
    const response = await this.parkingSpotService.updateSpot(spotId, dto);
    this.setStatus(200);
    return response;
  }

  @Delete("/spots/:spotId")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "Parking spot deleted successfully")
  @Response<ApiResponse>("400", "Bad request - Invalid spot ID")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Spot not found")
  public async deleteSpot(spotId: string): Promise<ApiResponse> {
    const response = await this.parkingSpotService.deleteSpot(spotId);
    this.setStatus(200);
    return response;
  }

  @Post("/:spotId/start-direct-parking")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("201", "Direct parking started successfully")
  @Response<ApiResponse>("400", "Bad Request - Spot occupied or invalid data")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Spot, customer or vehicle not found")
  public async startDirectParking(
    spotId: string,
    @Body() body: { vehicleId: string },
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const customerId = (req as any).user.id;
    const response = await this.parkingSpotService.startDirectParking(
      spotId,
      customerId,
      body.vehicleId
    );
    this.setStatus(response.code);
    return response;
  }

  @Post("/:spotId/complete-direct-parking")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "Direct parking completed successfully")
  @Response<ApiResponse>("400", "Bad Request - No active session")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Spot not found")
  public async completeDirectParking(
    spotId: string,
    @Body() body: { hoursParked: number }
  ): Promise<ApiResponse> {
    const response = await this.parkingSpotService.completeDirectParking(
      spotId,
      body.hoursParked
    );
    this.setStatus(response.code);
    return response;
  }

  @Get("/:spotId/active-session")
  @Security("bearerAuth", ["ADMIN", "CUSTOMER"])
  @Response<ApiResponse>("200", "Active parking session details")
  @Response<ApiResponse>("404", "No active session found")
  public async getActiveParkingSession(spotId: string): Promise<ApiResponse> {
    const response = await this.parkingSpotService.getActiveParkingSession(
      spotId
    );
    this.setStatus(response.code);
    return response;
  }
}
