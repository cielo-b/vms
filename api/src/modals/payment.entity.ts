import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Booking } from "./booking.entity";
import { EPaymentMethod } from "../enums/payment-method.enum";
import { Audit } from "../audits/Audit";
import { Receipt } from "./receipt.entity";

@Entity()
export class Payment extends Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  amount!: number;

  @Column()
  paymentTime!: Date;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ type: "enum", enum: EPaymentMethod })
  paymentMethod!: EPaymentMethod;

  @OneToOne(() => Booking, (booking) => booking.payment)
  booking!: Booking;

  @OneToOne(() => Receipt, receipt => receipt.payment)
  receipt!: Receipt;
}
