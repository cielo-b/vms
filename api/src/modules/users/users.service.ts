import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { RegisterUserDto } from "./dto/register-user.dto";
import { User } from "../../modals/user.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Utility } from "../../utils/Utility";
import { ERole } from "../../enums/user-role.enum";

export class UserService {
  public async register(dto: RegisterUserDto): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);

    try {
      const user = await userRepo.findOne({ where: { email: dto.email } });
      if (user)
        throw ApiError.badRequest(
          "User with this email " + dto.email + " already exists."
        );

      // get the password
      // and hash it
      const hPass: string = await Utility.hash(dto.password);

      // work on the role
      let role: ERole = dto.role ? dto.role : ERole.CUSTOMER;

      // Check if the role is valid
      if (!Object.values(ERole).includes(role)) {
        throw ApiError.badRequest("Invalid role provided.");
      }

      // save the user
      const u: User = new User();
      u.password = hPass;
      u.email = dto.email;
      u.role = role;
      u.name = dto.name;

      await userRepo.save(u);

      return {
        success: true,
        message: "User registered successfully.",
        data: {
          id: u.id,
          email: u.email,
          role: u.role,
          name: u.name,
        },
        code: 201,
      };
    } catch (err) {
      console.log("Error in registration", err);
      throw err instanceof ApiError ? err : ApiError.internal();
    }
  }
}
