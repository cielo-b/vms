import { Body, Controller, Post, Response, Route, Tags } from "tsoa";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { ApiError } from "../../errors/api-error";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private authService: AuthService = new AuthService();

  @Post("/login")
  @Response<ApiResponse>("200", "Login successful")
  @Response<ApiResponse>("401", "Invalid credentials")
  public async login(@Body() requestBody: LoginDto): Promise<ApiResponse> {
    if (!requestBody)
      throw ApiError.badRequest("The login credentials are required.");
    const response = await this.authService.authenticate(
      requestBody.email,
      requestBody.password
    );

    this.setStatus(response.code);
    return response;
  }
}
