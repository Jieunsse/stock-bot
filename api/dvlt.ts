// api/dvlt.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getUsMarketPhase, isUsMarketHoliday } from '../src/stock/utils/usMarket';
import { isUsWeekend } from '../src/stock/utils/usTime';
import { buildMarketMessage } from '../src/stock/utils/marketMessage';
import type { FinnhubQuote } from '../src/stock/interfaces/FinnhubQuote';

const FINNHUB_QUOTE_API = 'https://finnhub.io/api/v1/quote';
const SYMBOL = 'DVLT';

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // 🛑 0️⃣ 미국 증시 휴장 가드
    if (isUsWeekend()) {
      console.log('미국 주말 -> 알림 스킵');
      return res.status(200).json({ skipped: 'us market weekend' });
    }

    if (isUsMarketHoliday()) {
      console.log('미국 증시 휴장일 -> 알림 스킵');
      return res.status(200).json({ skipped: 'us market holiday' });
    }

    // 1️⃣ 알림 시각 판단
    const phase = getUsMarketPhase();

    if (phase === 'NONE') {
      console.log('알림 대상 시간 아님 -> 스킵');
      return res.status(200).json({ skipped: 'not notify time' });
    }

    // 2️⃣ 환경 변수 확인
    const apiKey = process.env.FINNHUB_API_KEY;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!apiKey || !webhookUrl) {
      throw new Error('환경 변수 누락');
    }

    // 3️⃣ Finnhub 주가 조회
    const quoteRes = await fetch(
      `${FINNHUB_QUOTE_API}?symbol=${SYMBOL}&token=${apiKey}`,
    );

    const quote = (await quoteRes.json()) as FinnhubQuote;

    if (quote.error) {
      throw new Error(`Finnhub error: ${quote.error}`);
    }

    const { c, o, h, l, pc, d, dp } = quote;

    if ([c, o, h, l, pc, d, dp].some((v) => v == null)) {
      throw new Error('유효하지 않은 주가 데이터');
    }

    // 4️⃣ 단계별 디스코드 메시지 생성
    const message = buildMarketMessage(phase, SYMBOL, {
      c,
      o,
      h,
      l,
      pc,
      d,
      dp,
    });

    // 5️⃣ 디스코드 전송
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    return res.status(200).json({
      success: true,
      phase,
      price: c,
    });
  } catch (error: any) {
    console.error('DVLT ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
