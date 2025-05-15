import { ERole } from "../../../enums/user-role.enum";

export class RegisterUserDto {
  name!: string;
  password!: string;
  role?: ERole = ERole.CUSTOMER;
  email!: string;
}