import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { Payment } from "../../modals/payment.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Booking } from "../../modals/booking.entity";
import { EPaymentMethod } from "../../enums/payment-method.enum";
import { Receipt } from "../../modals/receipt.entity";
import { User } from "../../modals/user.entity";
import { EBookingStatus } from "../../enums/booking-status.enum";
import { ParkingSpot } from "../../modals/parking-spot.entity";

export class PaymentService {
  private paymentRepo: Repository<Payment> =
    AppDataSource.getRepository(Payment);
  private bookingRepo: Repository<Booking> =
    AppDataSource.getRepository(Booking);
  private receiptRepo: Repository<Receipt> =
    AppDataSource.getRepository(Receipt);
  private userRepo: Repository<User> = AppDataSource.getRepository(User);

  public async processPayment(
    bookingId: string,
    paymentMethod: EPaymentMethod,
    adminId: string
  ): Promise<ApiResponse> {
    try {
      const booking = await this.bookingRepo.findOne({
        where: { id: bookingId },
        relations: ["payment", "parkingSpot", "customer"],
      });

      if (!booking) {
        throw ApiError.notFound("Booking not found");
      }

      // Validate booking status
      if (booking.status !== "ACTIVE") {
        throw ApiError.badRequest(
          "Payment can only be processed for active bookings"
        );
      }

      // Calculate payment amount
      const endTime = new Date();
      const startTime = new Date(booking.startTime);
      const hoursParked = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      );
      const amount = hoursParked * booking.parkingSpot.parkingLot.pricePerHour;

      // Create or update payment
      let payment = booking.payment;
      if (!payment) {
        payment = this.paymentRepo.create({
          amount,
          paymentTime: endTime,
          isPaid: true,
          paymentMethod,
          booking,
        });
      } else {
        payment.amount = amount;
        payment.paymentTime = endTime;
        payment.isPaid = true;
        payment.paymentMethod = paymentMethod;
      }

      await this.paymentRepo.save(payment);

      // Generate receipt
      const admin = await this.userRepo.findOne({ where: { id: adminId } });
      if (!admin) throw ApiError.notFound("Admin not found");

      const receipt = this.receiptRepo.create({
        amount,
        issueDate: endTime,
        paymentMethod,
        issuedBy: admin,
        booking,
        payment,
      });

      await this.receiptRepo.save(receipt);

      // Update booking status
      booking.status = EBookingStatus.COMPLETED;
      booking.endTime = endTime;
      await this.bookingRepo.save(booking);

      // Free up parking spot
      booking.parkingSpot.isOccupied = false;
      await AppDataSource.getRepository(ParkingSpot).save(booking.parkingSpot);

      return {
        success: true,
        message: "Payment processed successfully",
        data: { payment, receipt },
        code: 200,
      };
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getPaymentByBookingId(bookingId: string): Promise<ApiResponse> {
    try {
      const payment = await this.paymentRepo.findOne({
        where: { booking: { id: bookingId } },
        relations: ["booking", "receipt"],
      });

      if (!payment) {
        throw ApiError.notFound("Payment record not found");
      }

      return {
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting payment:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
