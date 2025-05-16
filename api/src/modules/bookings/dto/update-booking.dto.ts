import { EBookingStatus } from "../../../enums/booking-status.enum";

export class UpdateBookingDto {
  endTime?: string;
  status?: EBookingStatus;
  startTime?: string;
}