import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { RegisterUserDto } from "./dto/register-user.dto";
import { User } from "../../modals/user.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";
import { Utility } from "../../utils/Utility";
import { ERole } from "../../enums/user-role.enum";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  public async getAllUsers(): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);
    try {
      const users = await userRepo.find({
        select: ["id", "name", "email", "role", "createdAt"],
      });
      return {
        success: true,
        message: "Users retrieved successfully.",
        data: users,
        code: 200,
      };
    } catch (err) {
      console.error("Error getting all users:", err);
      throw ApiError.internal();
    }
  }

  public async getUserById(id: string): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);
    try {
      const user = await userRepo.findOne({
        where: { id },
        select: ["id", "name", "email", "role", "createdAt"],
      });

      if (!user) {
        throw ApiError.notFound(`User with ID ${id} not found.`);
      }

      return {
        success: true,
        message: "User retrieved successfully.",
        data: user,
        code: 200,
      };
    } catch (err) {
      console.error(`Error getting user ${id}:`, err);
      throw err instanceof ApiError ? err : ApiError.internal();
    }
  }

  public async deleteUserById(id: string): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);
    try {
      const result = await userRepo.delete(id);
      if (result.affected === 0) {
        throw ApiError.notFound(`User with ID ${id} not found.`);
      }

      return {
        success: true,
        message: "User deleted successfully.",
        code: 200,
      };
    } catch (err) {
      console.error(`Error deleting user ${id}:`, err);
      throw err instanceof ApiError ? err : ApiError.internal();
    }
  }

  public async updateUser(
    id: string,
    dto: UpdateUserDto,
    req: any 
  ): Promise<ApiResponse> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);
    try {
      // Verify the user is updating their own account
      if (id !== (req as any).user.id) {
        throw ApiError.forbidden("You can only update your own account.");
      }

      const user = await userRepo.findOneBy({ id });
      if (!user) {
        throw ApiError.notFound(`User with ID ${id} not found.`);
      }

      if (dto.password) {
        user.password = await Utility.hash(dto.password);
      }
      if (dto.name) {
        user.name = dto.name;
      }
      if (dto.email) {
        const eu = await userRepo.findOne({ where: { email: dto.email } });
        if (eu) throw ApiError.badRequest(`Email ${dto.email} already in use.`);
        user.email = dto.email;
      }

      await userRepo.save(user);

      return {
        success: true,
        message: "User updated successfully.",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        code: 201,
      };
    } catch (err) {
      console.error(`Error updating user ${id}:`, err);
      throw err instanceof ApiError ? err : ApiError.internal();
    }
  }
}
