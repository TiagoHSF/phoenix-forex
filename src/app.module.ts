import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhoenixOperationModule } from './phoenix-operation/phoenix-operation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppGateway } from './app.gateway';
@Module({
  imports: [PhoenixOperationModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
