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
import { BookingService } from "./booking.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Booking } from "../../modals/booking.entity";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { EBookingStatus } from "../../enums/booking-status.enum";

@Route("booking")
@Tags("Booking")
export class BookingController extends Controller {
  private bookingService: BookingService = new BookingService();

  @Post("/create")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("201", "Booking created successfully")
  @Response<ApiResponse>(
    "400",
    "Bad Request - Spot not available or invalid data"
  )
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Customer access required")
  public async createBooking(
    @Body() dto: CreateBookingDto,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.bookingService.createBooking(dto);
    this.setStatus(response.code);
    return response;
  }

  @Get("/")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "List of all bookings")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  public async getAllBookings(): Promise<ApiResponse> {
    const response = await this.bookingService.getAllBookings();
    this.setStatus(200);
    return response;
  }

  @Get("/mine")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "List of my bookings")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Customer access required")
  public async getMyBookings(
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.bookingService.getMyBookings(req);
    this.setStatus(200);
    return response;
  }

  @Get("/by-id/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Booking details")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Owner or admin access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async getBookingById(id: string): Promise<ApiResponse> {
    const response = await this.bookingService.getBookingById(id);
    this.setStatus(200);
    return response;
  }

  @Put("/:id")
  @Security("bearerAuth", ["ADMIN", "CUSTOMER"])
  @Response<ApiResponse>("200", "Booking updated successfully")
  @Response<ApiResponse>("400", "Bad request - Invalid status transition")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Owner or admin access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async updateBooking(
    id: string,
    @Body() dto: UpdateBookingDto
  ): Promise<ApiResponse> {
    const response = await this.bookingService.updateBooking(id, dto);
    this.setStatus(200);
    return response;
  }

  @Delete("/:id")
  @Security("bearerAuth", ["ADMIN", "CUSTOMER"])
  @Response<ApiResponse>("200", "Booking cancelled successfully")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Owner or admin access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async deleteBooking(id: string): Promise<ApiResponse> {
    const response = await this.bookingService.deleteBooking(id);
    this.setStatus(200);
    return response;
  }

  @Post("/:id/start-parking")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "Parking started successfully")
  @Response<ApiResponse>("400", "Bad request - Invalid booking status")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Owner access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async startParking(id: string): Promise<ApiResponse> {
    const response = await this.bookingService.updateBooking(id, {
      status: EBookingStatus.ACTIVE,
      startTime: new Date().toISOString(),
    });
    this.setStatus(200);
    return response;
  }

  @Post("/:id/complete-parking")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "Parking completed successfully")
  @Response<ApiResponse>("400", "Bad request - Invalid booking status")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Owner access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async completeParking(id: string): Promise<ApiResponse> {
    const response = await this.bookingService.updateBooking(id, {
      status: EBookingStatus.COMPLETED,
      endTime: new Date().toISOString(),
    });
    this.setStatus(200);
    return response;
  }
}
