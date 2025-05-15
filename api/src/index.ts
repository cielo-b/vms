import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { asyncContext, CONTEXT_KEYS } from "./common/async-context";
import swaggerUI from "swagger-ui-express";
import { errorHandler } from "./middlewares/error.middleware";
import { RegisterRoutes } from "./routes/routes";

dotenv.config();
const app = express();

AppDataSource.initialize().then(() => {
  console.log("Database connected.");
  app.listen(3000, () =>
    console.log("Server running on http://127.0.0.1:3000")
  );
});

const swaggerJson = require("./swagger/swagger.json");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJson));

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  asyncContext.run(() => {
    const user = (req as any).user;
    if (user) {
      asyncContext.set(CONTEXT_KEYS.USER_ID, user.id);
    }
    next();
  });
});

RegisterRoutes(app);

app.use(errorHandler);
