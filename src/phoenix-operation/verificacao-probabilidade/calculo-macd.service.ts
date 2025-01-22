import { Injectable } from "@nestjs/common";
import { CalculoEMAService } from "./calculo-ema.service";

@Injectable()
export class CalculoMACDService {

    constructor(
        private readonly calculoEmaService: CalculoEMAService
    ) {

    }

    // calcular(pares: any[]): 'Sinal de Compra' | 'Sinal de Venda' | 'Neutro' {
    //     const periodoCurto = 12;
    //     const periodoLongo = 26;
    //     const periodoSinal = 9;

    //     const valores = pares
    //         .slice(-periodoLongo)
    //         .map((operacao) => Number(operacao.bid.replace(',', '.')));

    //     if (valores.length < periodoLongo) return 'Neutro';

    //     const emaCurto = this.calculoEmaService.calcular(periodoCurto, valores);
    //     const emaLongo = this.calculoEmaService.calcular(periodoLongo, valores);
    //     const macdLinha = emaCurto.map((curto, index) => curto - emaLongo[index]);
    //     const linhaSinal = this.calculoEmaService.calcular(periodoSinal, macdLinha);

    //     const ultimoMacd = macdLinha[macdLinha.length - 1];
    //     const ultimoSinal = linhaSinal[linhaSinal.length - 1];

    //     if (ultimoMacd > ultimoSinal) return 'Sinal de Compra';
    //     if (ultimoMacd < ultimoSinal) return 'Sinal de Venda';
    //     return 'Neutro';
    // }

    calcular(pares: any[]): 'Sinal de Compra' | 'Sinal de Venda' | 'Neutro' {
        const periodoCurto = 12;
        const periodoLongo = 26;
        const periodoSinal = 9;

        const valores = pares
            .slice(-periodoLongo)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));

        if (valores.length < periodoLongo) return 'Neutro';

        const emaCurto = this.calculoEmaService.calcular(periodoCurto, valores);
        const emaLongo = this.calculoEmaService.calcular(periodoLongo, valores);

        // Verificar se emaCurto e emaLongo são arrays válidos
        if (!Array.isArray(emaCurto) || emaCurto.length !== periodoCurto || !Array.isArray(emaLongo) || emaLongo.length !== periodoLongo) {
            return 'Neutro'; // Ou outro comportamento de fallback desejado
        }

        const macdLinha = emaCurto.map((curto, index) => curto - emaLongo[index]);
        const linhaSinal = this.calculoEmaService.calcular(periodoSinal, macdLinha);

        // Verificar se linhaSinal é válido
        if (!Array.isArray(linhaSinal) || linhaSinal.length !== periodoSinal) {
            return 'Neutro';
        }

        const ultimoMacd = macdLinha[macdLinha.length - 1];
        const ultimoSinal = linhaSinal[linhaSinal.length - 1];

        if (ultimoMacd > ultimoSinal) return 'Sinal de Compra';
        if (ultimoMacd < ultimoSinal) return 'Sinal de Venda';
        return 'Neutro';
    }


}