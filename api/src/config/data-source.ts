import { DataSource } from "typeorm";
import { User } from "../modals/user.entity";
import { Vehicle } from "../modals/vehicle.entity";
import { Parking } from "../modals/parking.entity";
import { ParkingSpot } from "../modals/parking-spot.entity";
import { Booking } from "../modals/booking.entity";
import { Payment } from "../modals/payment.entity";
import { Receipt } from "../modals/receipt.entity";
import { AuditSubscriber } from "../audits/audit.subscriber";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Password@2001",
  database: "vms",
  synchronize: true,
  logging: true,
  entities: [User, Vehicle, Parking, ParkingSpot, Booking, Payment, Receipt],
  subscribers: [AuditSubscriber],
});
