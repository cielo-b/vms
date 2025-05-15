import { Body, Controller, Post, Response, Route, Tags } from "tsoa";
import { UserService } from "./users.service";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { RegisterUserDto } from "./dto/register-user.dto";

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
}
