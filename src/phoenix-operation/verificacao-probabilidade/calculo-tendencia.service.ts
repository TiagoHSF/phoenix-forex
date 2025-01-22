import { Injectable } from "@nestjs/common";

@Injectable()
export class CalculoTendenciaService {

    calcular(periodo: number, offset = 0, pares: any[]): 'Alta' | 'Baixa' | 'Neutra' {
        const valores = pares
            .slice(-periodo - offset, -offset || undefined)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));

        if (valores.length < periodo) return 'Neutra';

        const media = valores.reduce((total, valor) => total + valor, 0) / valores.length;
        const ultimoValor = valores[valores.length - 1];

        if (ultimoValor > media) return 'Alta';
        if (ultimoValor < media) return 'Baixa';
        return 'Neutra';
    }

}