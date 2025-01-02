import { Module } from '@nestjs/common';
import { PhoenixOperationService } from './phoenix-operation.service';
import { HttpModule } from '@nestjs/axios';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [HttpModule],
  providers: [PhoenixOperationService, AppGateway]
})
export class PhoenixOperationModule {}
