import { Injectable } from "@nestjs/common";

@Injectable()
export class CalculoRSIService {

    calcular(pares: any[]): number {
        const periodoRSI = 14;
        const valores = pares
            .slice(-periodoRSI)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));
    
        if (valores.length < periodoRSI) return 50;
    
        let ganhos = 0;
        let perdas = 0;
    
        for (let i = 1; i < valores.length; i++) {
            const diferenca = valores[i] - valores[i - 1];
            if (diferenca > 0) ganhos += diferenca;
            else perdas += Math.abs(diferenca);
        }
    
        const rs = ganhos / (perdas || 1);
        return 100 - 100 / (1 + rs);
    }

}