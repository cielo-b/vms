import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { UserService } from "./users.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Route("user")
@Tags("User")
export class UserController extends Controller {
  private userService: UserService = new UserService();

  @Post("/register")
  @Response<ApiResponse>("201", "User registered successfully.")
  @Response<ApiResponse>("400", "Bad Request")
  public async registerUser(
    @Body() dto: RegisterUserDto
  ): Promise<ApiResponse> {
    const response = await this.userService.register(dto);
    this.setStatus(response.code);
    return response;
  }

  @Get("/")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "List of all users")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  public async getAllUsers(): Promise<ApiResponse> {
    const response = await this.userService.getAllUsers();
    this.setStatus(200);
    return response;
  }

  @Get("/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "User details")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "User not found")
  public async getUserById(id: string): Promise<ApiResponse> {
    const response = await this.userService.getUserById(id);
    this.setStatus(200);
    return response;
  }

  @Delete("/:id")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "User deleted successfully")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Admin access required")
  @Response<ApiResponse>("404", "User not found")
  public async deleteUserById(id: string): Promise<ApiResponse> {
    const response = await this.userService.deleteUserById(id);
    this.setStatus(200);
    return response;
  }

  @Put("/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "User updated successfully")
  @Response<ApiResponse>("400", "Bad request - Validation error")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("403", "Forbidden - Can only update own account")
  @Response<ApiResponse>("404", "User not found")
  public async updateUser(
    id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.userService.updateUser(id, dto, req);
    this.setStatus(200);
    return response;
  }
}
