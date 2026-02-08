import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { BikesModule } from "../bikes/bikes.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthModule,
    BikesModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
