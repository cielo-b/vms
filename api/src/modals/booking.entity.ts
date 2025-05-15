import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { Vehicle } from "./vehicle.entity";
import { ParkingSpot } from "./parking-spot.entity";
import { EBookingStatus } from "../enums/booking-status.enum";
import { Payment } from "./payment.entity";
import { Audit } from "../audits/Audit";
import { Receipt } from "./receipt.entity";

@Entity()
export class Booking extends Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  startTime!: Date;

  @Column({ nullable: true })
  endTime!: Date;

  @Column({ type: 'varchar' })
  status!: EBookingStatus;

  @Column({ nullable: true })
  requestedHours!: number;

  @ManyToOne(() => User, user => user.bookings)
  customer!: User;

  @ManyToOne(() => Vehicle, vehicle => vehicle.bookings)
  vehicle!: Vehicle;

  @ManyToOne(() => ParkingSpot, spot => spot.bookings)
  parkingSpot!: ParkingSpot;

  @OneToOne(() => Payment, payment => payment.booking)
  payment!: Payment;

  @OneToOne(() => Receipt, receipt => receipt.booking)
  receipt!: Receipt;
}