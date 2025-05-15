import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  BeforeInsert,
} from "typeorm";
import { Booking } from "./booking.entity";
import { Payment } from "./payment.entity";
import { User } from "./user.entity";
import { EPaymentMethod } from "../enums/payment-method.enum";

@Entity()
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  receiptNumber!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column()
  issueDate!: Date;

  @Column({ type: "enum", enum: EPaymentMethod })
  paymentMethod!: EPaymentMethod;

  // Relationships
  @ManyToOne(() => User, (user) => user.receipts)
  issuedBy!: User;

  @OneToOne(() => Booking, (booking) => booking.receipt)
  booking!: Booking;

  @OneToOne(() => Payment, (payment) => payment.receipt)
  payment!: Payment;

  @BeforeInsert()
  generateReceiptNumber() {
    this.receiptNumber = `RCP-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
  }
}
