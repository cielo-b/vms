import { User } from "../modals/user.entity";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export class Utility {
  static generateToken(user: User): string {
    let secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in the environment variables"
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, secretKey, { expiresIn: "1h" });
  }

  static async validateHash(raw: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(raw, hash);
  }

  static async hash(raw: string): Promise<string> {
    return await bcrypt.hash(raw, 10);
  }
}
