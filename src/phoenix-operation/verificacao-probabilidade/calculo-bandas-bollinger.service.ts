import { Injectable } from "@nestjs/common";

@Injectable()
export class CalculoBandasBollingerService {

    calcular(pares: any[]): 'Sobrecompra' | 'Sobrevenda' | 'Neutra' {
        const periodoBB = 20;
        const valores = pares
            .slice(-periodoBB)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));

        if (valores.length < periodoBB) return 'Neutra';

        const media = valores.reduce((total, valor) => total + valor, 0) / valores.length;
        const desvioPadrao = Math.sqrt(
            valores.reduce((total, valor) => total + Math.pow(valor - media, 2), 0) / valores.length,
        );

        const bandaSuperior = media + 2 * desvioPadrao;
        const bandaInferior = media - 2 * desvioPadrao;
        const ultimoValor = valores[valores.length - 1];

        if (ultimoValor > bandaSuperior) return 'Sobrecompra';
        if (ultimoValor < bandaInferior) return 'Sobrevenda';
        return 'Neutra';
    }

}