import express, { type Request, type Response } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { configureNestApp } from "../src/bootstrap";

type ExpressHandler = (req: Request, res: Response) => void;

let cachedHandler: ExpressHandler | null = null;
let initPromise: Promise<ExpressHandler> | null = null;

async function createHandler(): Promise<ExpressHandler> {
  const server = express();
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { bodyParser: false }
  );

  configureNestApp(app);
  await app.init();

  return server as ExpressHandler;
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!cachedHandler) {
      if (!initPromise) {
        initPromise = createHandler();
      }
      cachedHandler = await initPromise;
    }

    return cachedHandler(req, res);
  } catch (error) {
    initPromise = null;
    cachedHandler = null;
    console.error("Serverless bootstrap failed:", error);
    res.status(500).json({
      message: "Server bootstrap failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
