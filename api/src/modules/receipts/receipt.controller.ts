import {
  Controller,
  Get,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ReceiptService } from "./receipt.service";

@Route("receipt")
@Tags("Receipt")
export class ReceiptController extends Controller {
  private service: ReceiptService = new ReceiptService();

  @Get("/by-id/:id")
  @Security("bearerAuth")
  @Response<ApiResponse>("200", "Receipt details retrieved")
  @Response<ApiResponse>("401", "Unauthorized")
  @Response<ApiResponse>("404", "Receipt not found")
  public async getReceiptById(id: string): Promise<ApiResponse> {
    const response = await this.service.getReceiptById(id);
    this.setStatus(response.code);
    return response;
  }

  @Get("/my-receipts")
  @Security("bearerAuth", ["CUSTOMER"])
  @Response<ApiResponse>("200", "User receipts retrieved")
  @Response<ApiResponse>("401", "Unauthorized")
  public async getMyReceipts(
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.getReceiptsByUser((req as any).user.id);
    this.setStatus(response.code);
    return response;
  }

   @Get("/")
  @Security("bearerAuth", ["ADMIN"])
  @Response<ApiResponse>("200", "All receipts retrieved")
  @Response<ApiResponse>("401", "Unauthorized")
  public async getAllReceipts(
    @Request() req: Express.Request
  ): Promise<ApiResponse> {
    const response = await this.service.getAllReceipts();
    this.setStatus(response.code);
    return response;
  }
}
