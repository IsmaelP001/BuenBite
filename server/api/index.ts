import express, { type Request, type Response } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { configureNestApp } from "../src/bootstrap";

type ExpressHandler = (req: Request, res: Response) => void;

let cachedHandler: ExpressHandler | null = null;

async function createHandler(): Promise<ExpressHandler> {
  const server = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );

  configureNestApp(app);
  await app.init();

  return server as ExpressHandler;
}

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    cachedHandler = await createHandler();
  }

  return cachedHandler(req, res);
}
