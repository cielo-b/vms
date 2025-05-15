import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Parking } from "./parking.entity";
import { Booking } from "./booking.entity";
import { Audit } from "../audits/Audit";

@Entity("parking_spot")
export class ParkingSpot extends Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  spotNumber!: string;

  @Column({ default: false })
  isOccupied!: boolean;

  @ManyToOne(() => Parking, (lot) => lot.spots)
  parkingLot!: Parking;

  @OneToMany(() => Booking, (booking) => booking.parkingSpot)
  bookings!: Booking[];
}
