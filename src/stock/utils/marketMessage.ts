import type { UsMarketPhase } from './usMarket';

type Quote = {
  c: number;
  o: number;
  h: number;
  l: number;
  pc: number;
  d: number;
  dp: number;
};

export function buildMarketMessage(
  phase: UsMarketPhase,
  symbol: string,
  quote: Quote,
): string {

  switch (phase) {
    case 'OPEN':
      return `📢 ${symbol} 개장가 알림
현재가: $${quote.c.toFixed(2)}
시가: $${quote.o.toFixed(2)}
고가 / 저가: $${quote.h.toFixed(2)} / $${quote.l.toFixed(2)}`;

    case 'INTRADAY':
      return `⏱ ${symbol} 장중 현황
현재가: $${quote.c.toFixed(2)} (${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%)
금일 변동폭: $${(quote.h - quote.l).toFixed(2)}`;

    case 'CLOSE':
      return `🔔 ${symbol} 마감가 알림
종가: $${quote.c.toFixed(2)}
전일 대비: ${quote.d >= 0 ? '+' : ''}${quote.d.toFixed(2)} (${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%)
금일 고가 / 저가: $${quote.h.toFixed(2)} / $${quote.l.toFixed(2)}`;

    default:
      return '';
  }
}
