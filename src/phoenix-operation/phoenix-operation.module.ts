import { Module } from '@nestjs/common';
import { PhoenixOperationService } from './phoenix-operation.service';
import { HttpModule } from '@nestjs/axios';
import { AppGateway } from 'src/app.gateway';
import { CalculoTendenciaService } from './verificacao-probabilidade/calculo-tendencia.service';
import { CalculoBandasBollingerService } from './verificacao-probabilidade/calculo-bandas-bollinger.service';
import { CalculoEMAService } from './verificacao-probabilidade/calculo-ema.service';
import { CalculoMACDService } from './verificacao-probabilidade/calculo-macd.service';
import { CalculoRSIService } from './verificacao-probabilidade/calculo-rsi.service';

@Module({
  imports: [HttpModule],
  providers: [
    PhoenixOperationService,
    AppGateway,
    CalculoBandasBollingerService,
    CalculoEMAService,
    CalculoMACDService,
    CalculoRSIService,
    CalculoTendenciaService
  ]
})
export class PhoenixOperationModule { }
