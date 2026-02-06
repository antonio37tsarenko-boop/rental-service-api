import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as cookieParser from "cookie-parser";
import { TrimPipe } from "./common/pipes/trim.pipe";

dotenv.config();

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new TrimPipe(),
  );
  app.use(cookieParser());

  await app.listen(3000);
}

bootstrap();
