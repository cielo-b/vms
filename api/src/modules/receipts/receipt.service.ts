import { Repository } from "typeorm";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { Receipt } from "../../modals/receipt.entity";
import { AppDataSource } from "../../config/data-source";
import { ApiError } from "../../errors/api-error";

export class ReceiptService {
  private receiptRepo: Repository<Receipt> =
    AppDataSource.getRepository(Receipt);

  public async getReceiptById(id: string): Promise<ApiResponse> {
    try {
      const receipt = await this.receiptRepo.findOne({
        where: { id },
        relations: ["booking", "payment", "issuedBy"],
      });

      if (!receipt) {
        throw ApiError.notFound("Receipt not found");
      }

      return {
        success: true,
        message: "Receipt retrieved successfully",
        data: receipt,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting receipt:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getReceiptsByUser(userId: string): Promise<ApiResponse> {
    try {
      const receipts = await this.receiptRepo.find({
        where: { booking: { customer: { id: userId } } },
        relations: ["booking", "payment"],
      });

      return {
        success: true,
        message: "User receipts retrieved successfully",
        data: receipts,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting user receipts:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }

  public async getAllReceipts(): Promise<ApiResponse> {
    try {
      const receipts = await this.receiptRepo.find({
        relations: ["booking", "payment"],
      });

      return {
        success: true,
        message: "User receipts retrieved successfully",
        data: receipts,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting user receipts:", error);
      throw error instanceof ApiError ? error : ApiError.internal();
    }
  }
}
