// api/dvlt.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getUsMarketPhase, isUsMarketHoliday } from '../src/stock/utils/usMarket';
import { isUsWeekend } from '../src/stock/utils/usTime';

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

    // 3️⃣ 주가 조회
    const quoteRes = await fetch(
      `${FINNHUB_QUOTE_API}?symbol=${SYMBOL}&token=${apiKey}`,
    );

    const { c: current, pc: prevClose, error } = await quoteRes.json();

    if (error) throw new Error(`Finnhub error: ${error}`);
    if (current == null || prevClose == null) {
      throw new Error('유효하지 않은 주가 데이터');
    }

    // 4️⃣ 계산
    const diff = current - prevClose;
    const diffRate = ((diff / prevClose) * 100).toFixed(2);
    const emoji = diff >= 0 ? '📈' : '📉';

    // 5️⃣ 제목
    const title =
      phase === 'OPEN'
        ? '📢 DVLT 개장가 알림'
        : phase === 'CLOSE'
        ? '🔔 DVLT 마감가 알림'
        : 'DVLT 주가 알림';

    // 6️⃣ 디스코드 전송
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${emoji} **${title}**
현재가: $${current}
전일 대비: ${diff >= 0 ? '+' : ''}${diff.toFixed(4)} (${diffRate}%)`,
      }),
    });

    return res.status(200).json({ success: true, phase });
  } catch (error: any) {
    console.error('DVLT ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
