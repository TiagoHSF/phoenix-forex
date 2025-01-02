import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { PairDTO } from './dtos/pair-dto';
import { AppGateway } from 'src/app.gateway';

@Injectable()
export class PhoenixOperationService {

    // url = 'https://www.investing.com/currencies/streaming-forex-rates-majors';
    url = 'https://br.advfn.com/cambio'
    // url = 'https://br.advfn.com/cambio#google_vignette'
    // const urlWithTimestamp = `${url}?nocache=${new Date().getTime()}`;
    pairsData = [];

    //EURUSD
    //USDCAD
    //USDJPY

    constructor(private readonly httpService: HttpService,
        private readonly appGateway: AppGateway) {

    }

    //  @Cron('*/10 * * * * *')
    // async teste(){
    //     this.sendSignal(`Tendência de VENDA para ${'EUR/USD'}`);
    // }

    @Cron('*/5 * * * * *')
    async findPairs() {
        await this.fetchHtmlData(this.url);
    }

    async fetchHtmlData(url: string): Promise<any> {
        try {

            const response = await lastValueFrom(
                this.httpService.get(`${url}?nocache=${new Date().getTime()}`, {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        Pragma: 'no-cache',
                        Expires: '0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },

                }),
            );
            const html = response.data;

            const $ = cheerio.load(html);


            $('tr').each((rowIndex, rowElement) => {
                const columns: string[] = [];
                $(rowElement)
                    .find('td, th')
                    .each((colIndex, colElement) => {
                        columns.push($(colElement).text().trim());
                    });
                if (columns[1].includes("EUR/USD")) {
                    this.pairsData.push(this.buildPair(columns));
                }
                if (columns[0].includes("EURUSD")) {
                    if (!columns[2].includes("%")) {
                        this.pairsData.push(this.buildPair2(columns));
                    }
                }
            });

            console.log("Nova Busca");

            this.callPutChance();
        } catch (error) {
            console.error('Erro ao buscar HTML:', error);
            throw new Error('Não foi possível buscar os dados do site.');
        }
    }

    buildPair(tableItem: string[]) {
        try {
            return {
                pair: tableItem[1],
                bid: tableItem[2],
                ask: tableItem[3],
                high: tableItem[4],
                low: tableItem[5],
                time: tableItem[8]
            } as PairDTO;
        } catch (e) {
            throw Error(e);
        }
    }

    buildPair2(tableItem: string[]) {
        try {

            return {
                pair: tableItem[0],
                bid: tableItem[2],
            } as PairDTO;

        } catch (e) {
            throw Error(e);
        }
    }

    async callPutChance() {
        if (this.pairsData.length > 5) {
            const signalAgressivo = this.processarAgressivo();
            const signalModerado = this.processarModerado();
            const signalConservador = this.processarConservador();

            this.sendSignal(`{ agressivo: ${signalAgressivo}, moderado: ${signalModerado}, conservador: ${signalConservador}}`)
        }

    }

    private processarAgressivo() {
        const tendenciaAtual = this.calcularTendenciaAtual();
        const tendenciaAnterior = this.calcularTendenciaAnterior();
        const rsi = this.calcularRSI();
        const bandasBollinger = this.calcularBandasBollinger();
        const macd = this.calcularMACD();

        if (
            tendenciaAtual === "Alta" &&
            tendenciaAnterior === "Alta" &&
            // rsi > 70 &&
            // bandasBollinger === "Sobrecompra" &&
            macd === "Sinal de Venda"
        ) {
            console.log(`Forte tendência de BAIXA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            return `Tendência de VENDA para ${'EUR/USD'}`;
            // this.sendSignal(`Tendência de VENDA para ${'EUR/USD'}`);
        } else if (
            tendenciaAtual === "Baixa" &&
            tendenciaAnterior === "Baixa" &&
            // rsi < 30 &&
            // bandasBollinger === "Sobrevenda" &&
            macd === "Sinal de Compra"
        ) {
            console.log(`Forte tendência de ALTA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            // this.sendSignal(`Tendência de COMPRA para ${'EUR/USD'}`);
            return `Tendência de COMPRA para ${'EUR/USD'}`;
        } else {
            console.log("NEUTRO")
            // this.sendSignal(`Tendência NEUTRA para ${'EUR/USD'}`);
        }
    }

    private processarModerado() {
        const tendenciaAtual = this.calcularTendenciaAtual();
        const tendenciaAnterior = this.calcularTendenciaAnterior();
        const rsi = this.calcularRSI();
        const bandasBollinger = this.calcularBandasBollinger();
        const macd = this.calcularMACD();

        if (
            tendenciaAtual === "Alta" &&
            tendenciaAnterior === "Alta" &&
            rsi > 70 &&
            // bandasBollinger === "Sobrecompra" &&
            macd === "Sinal de Venda"
        ) {
            console.log(`Forte tendência de BAIXA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            return `Tendência de VENDA para ${'EUR/USD'}`;
            // this.sendSignal(`Tendência de VENDA para ${'EUR/USD'}`);
        } else if (
            tendenciaAtual === "Baixa" &&
            tendenciaAnterior === "Baixa" &&
            rsi < 30 &&
            // bandasBollinger === "Sobrevenda" &&
            macd === "Sinal de Compra"
        ) {
            console.log(`Forte tendência de ALTA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            return `Tendência de COMPRA para ${'EUR/USD'}`;
            // this.sendSignal(`Tendência de COMPRA para ${'EUR/USD'}`);
        } else {
            console.log("NEUTRO")
            // this.sendSignal(`Tendência NEUTRA para ${'EUR/USD'}`);
        }
    }

    private processarConservador() {
        const tendenciaAtual = this.calcularTendenciaAtual();
        const tendenciaAnterior = this.calcularTendenciaAnterior();
        const rsi = this.calcularRSI();
        const bandasBollinger = this.calcularBandasBollinger();
        const macd = this.calcularMACD();

        if (
            tendenciaAtual === "Alta" &&
            tendenciaAnterior === "Alta" &&
            rsi > 70 &&
            bandasBollinger === "Sobrecompra" &&
            macd === "Sinal de Venda"
        ) {
            console.log(`Forte tendência de BAIXA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            // this.sendSignal(`Tendência de VENDA para ${'EUR/USD'}`);
            return `Tendência de VENDA para ${'EUR/USD'}`;
        } else if (
            tendenciaAtual === "Baixa" &&
            tendenciaAnterior === "Baixa" &&
            rsi < 30 &&
            bandasBollinger === "Sobrevenda" &&
            macd === "Sinal de Compra"
        ) {
            console.log(`Forte tendência de ALTA p/ ${new Date().setMinutes(new Date().getMinutes() + 1)}`)
            return `Tendência de COMPRA para ${'EUR/USD'}`;
            // this.sendSignal(`Tendência de COMPRA para ${'EUR/USD'}`);
        } else {
            console.log("NEUTRO")
            // this.sendSignal(`Tendência NEUTRA para ${'EUR/USD'}`);
        }
    }

    private calcularTendenciaAtual(): "Alta" | "Baixa" | "Neutra" {
        // Calcular a média móvel simples (SMA) para o período desejado
        const periodoSMA = 5; // Número de períodos para a média móvel simples
        const valores = this.pairsData
            .slice(-periodoSMA)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));
        const mediaSMA =
            valores.reduce((total, valor) => total + valor, 0) / periodoSMA;
        const valorAtual = this.pairsData[this.pairsData.length - 1].bid;

        // Determinar a tendência com base na comparação entre o valor atual e a média móvel
        if (Number(valorAtual.replace(',', '.')) > mediaSMA) {
            return "Alta";
        } else if (Number(valorAtual.replace(',', '.')) < mediaSMA) {
            return "Baixa";
        } else {
            return "Neutra";
        }
    }

    private calcularTendenciaAnterior(): "Alta" | "Baixa" | "Neutra" {
        const periodoSMA = 5; // Número de períodos para a média móvel simples
        const valores = this.pairsData
            .slice(-periodoSMA * 2, -periodoSMA)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));
        const mediaSMA =
            valores.reduce((total, valor) => total + valor, 0) / periodoSMA;
        const valorAnterior = this.pairsData[this.pairsData.length - 1].bid;

        if (Number(valorAnterior.replace(',', '.')) > mediaSMA) {
            return "Alta";
        } else if (Number(valorAnterior.replace(',', '.')) < mediaSMA) {
            return "Baixa";
        } else {
            return "Neutra";
        }
    }

    private calcularRSI(): number {
        const periodoRSI = 14; // Número de períodos para o cálculo do RSI
        const valores = this.pairsData.slice(-periodoRSI).map((operacao) => Number(operacao.bid.replace(',', '.')));
        const ganhos = [];
        const perdas = [];

        for (let i = 1; i < valores.length; i++) {
            const diferenca = valores[i] - valores[i - 1];
            if (diferenca > 0) {
                ganhos.push(diferenca);
                perdas.push(0);
            } else if (diferenca < 0) {
                ganhos.push(0);
                perdas.push(Math.abs(diferenca));
            } else {
                ganhos.push(0);
                perdas.push(0);
            }
        }

        const mediaGanhos =
            ganhos.reduce((total, ganho) => total + ganho, 0) / periodoRSI;
        const mediaPerdas =
            perdas.reduce((total, perda) => total + perda, 0) / periodoRSI;
        const rs = mediaGanhos / mediaPerdas;
        const rsi = 100 - 100 / (1 + rs);

        return rsi;
    }

    private calcularBandasBollinger(): "Sobrecompra" | "Sobrevenda" | "Neutra" {
        const periodoBB = 20; // Número de períodos para o cálculo das Bandas de Bollinger
        const desvioPadrao = this.calcularDesvioPadrao(periodoBB);
        let valores: number[] = [];
        this.pairsData.forEach((item) => {
            valores.push(item.bid);
        });
        const media = this.calcularMedia(periodoBB, valores);
        const valorAtual =
            this.pairsData[this.pairsData.length - 1].bid;

        const bandaSuperior = media + 2 * desvioPadrao;
        const bandaInferior = media - 2 * desvioPadrao;

        if (valorAtual > bandaSuperior) {
            return "Sobrecompra";
        } else if (valorAtual < bandaInferior) {
            return "Sobrevenda";
        } else {
            return "Neutra";
        }
    }

    private calcularMedia(periodo: number, valores: number[]): number {
        const soma = valores.reduce((total, valor) => total + valor, 0);
        const media = soma / periodo;

        return media;
    }

    private calcularDesvioPadrao(periodo: number): number {
        const valores = this.pairsData
            .slice(-periodo)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));
        const media = this.calcularMedia(periodo, valores);

        const somaDiferencasQuadrado = valores.reduce(
            (total, valor) => total + Math.pow(valor - media, 2),
            0
        );
        const variancia = somaDiferencasQuadrado / periodo;
        const desvioPadrao = Math.sqrt(variancia);

        return desvioPadrao;
    }

    private calcularMACD(): "Sinal de Compra" | "Sinal de Venda" | "Neutro" {
        const periodoCurto = 12; // Período curto para o cálculo do MACD
        const periodoLongo = 26; // Período longo para o cálculo do MACD
        const periodoSinal = 9; // Período para o cálculo do sinal do MACD

        const valores = this.pairsData
            .slice(-periodoLongo)  // Pegue os últimos 26 valores (período longo)
            .map((operacao) => Number(operacao.bid.replace(',', '.')));

        // Calcula as EMAs para o MACD
        const emaCurto = this.calcularEMA(periodoCurto, valores);
        const emaLongo = this.calcularEMA(periodoLongo, valores);

        // Calcula o MACD (diferença entre as duas EMAs)
        const macd = emaCurto[emaCurto.length - 1] - emaLongo[emaLongo.length - 1];

        // Calcula a linha de sinal (EMA do MACD)
        const macdValues = emaCurto.map((value, index) => value - emaLongo[index]);
        const linhaSinal = this.calcularEMA(periodoSinal, macdValues);

        // Verifica o sinal
        if (macd > linhaSinal[linhaSinal.length - 1]) {
            return "Sinal de Compra"; // MACD acima da linha de sinal
        } else if (macd < linhaSinal[linhaSinal.length - 1]) {
            return "Sinal de Venda"; // MACD abaixo da linha de sinal
        } else {
            return "Neutro"; // MACD igual à linha de sinal
        }
    }

    private calcularEMA(periodo: number, valores: number[]): number[] {
        const k = 2 / (periodo + 1); // Fator de suavização da EMA
        let ema = [valores[0]]; // Inicializa a EMA com o primeiro valor

        for (let i = 1; i < valores.length; i++) {
            ema.push(valores[i] * k + ema[i - 1] * (1 - k));
        }

        return ema;
    }

    sendSignal(signal: string) {
        const message = { text: signal, timestamp: new Date() };
        this.appGateway.sendMessage('signals', message);
    }


}
