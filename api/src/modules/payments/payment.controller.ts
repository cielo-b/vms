import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { PaymentService } from "./payment.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { EPaymentMethod } from "../../enums/payment-method.enum";

@Route("payment")
@Tags("Payment")
export class PaymentController extends Controller {
  private service: PaymentService = new PaymentService();

  @Post("/process/:bookingId")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "Payment processed successfully")
  @Response<ApiResponse>("400", "Bad Request - Invalid booking status")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "Booking not found")
  public async processPayment(
    bookingId: string,
    @Body() body: { paymentMethod: EPaymentMethod },
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.processPayment(
      bookingId,
      body.paymentMethod,
      (req as any).user.id
    );
    this.setStatus(response.code);
    return response;
  }

  @Get("/booking/:bookingId")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Payment details retrieved")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Payment not found")
  public async getPaymentByBookingId(bookingId: string): Promise<ApiResponse> {
    const response = await this.service.getPaymentByBookingId(bookingId);
    this.setStatus(response.code);
    return response;
  }
}
