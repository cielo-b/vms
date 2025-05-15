import jwt from "jsonwebtoken";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../modals/user.entity";
import { ApiError } from "../../errors/api-error";
import { Utility } from "../../utils/Utility";

export class AuthService {
  public async authenticate(
    email: string,
    password: string
  ): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);

    try {
      const user = await userRepo.findOne({ where: { email } });
      if (!user) throw ApiError.badRequest("Invalid credentials provided.");

      const isPasswordValid: boolean = await Utility.validateHash(
        password,
        user.password
      );
      if (!isPasswordValid)
        throw ApiError.badRequest("Invalid credentials provided.");

      const token: string = Utility.generateToken(user);
      return {
        success: true,
        message: "Authentication successful.",
        data: token,
        status: "OK",
        code: 200,
      };
    } catch (error) {
      console.error("Error during login:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
