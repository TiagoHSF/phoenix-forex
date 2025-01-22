import { Injectable } from "@nestjs/common";

@Injectable()
export class CalculoEMAService {

    calcular(periodo: number, pares: any[]): number[] {
        const valores = pares;

        const k = 2 / (periodo + 1);
        const ema = [valores[0]]; // Primeiro valor é a média simples inicial.

        for (let i = 1; i < valores.length; i++) {
            const valorAtual = valores[i];
            const valorAnteriorEMA = ema[i - 1];
            ema.push(valorAtual * k + valorAnteriorEMA * (1 - k));
        }

        return ema;
    }

}