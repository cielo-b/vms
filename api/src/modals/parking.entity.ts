import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ParkingSpot } from "./parking-spot.entity";
import { Audit } from "../audits/Audit";

@Entity()
export class Parking extends Audit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  pricePerHour!: number;

  // relationships
  @OneToMany(() => ParkingSpot, (spot) => spot.parkingLot)
  spots!: ParkingSpot[];
}
