import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";
import { Audit } from "../audits/Audit";

@Entity()
export class Vehicle extends Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  licensePlate!: string;

  // relationships
  @ManyToOne(() => User, (user) => user.vehicles)
  owner!: User;

  @OneToMany(() => Booking, (booking) => booking.vehicle)
  bookings!: Booking[];
}
