// api/dvlt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_QUOTE_API = "https://finnhub.io/api/v1/quote";
const SYMBOL = "DVLT";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1️⃣ DVLT 주가 조회
    const quoteRes = await fetch(
      `${FINNHUB_QUOTE_API}?symbol=${SYMBOL}&token=${process.env.FINNHUB_API_KEY}`
    );

    if (!quoteRes.ok) {
      throw new Error("Finnhub API 호출 실패");
    }

    const quote = await quoteRes.json();

    const current = quote.c; // 현재가
    const prevClose = quote.pc; // 전일 종가

    if (!current || !prevClose) {
      throw new Error("유효하지 않은 주가 데이터");
    }

    const diff = current - prevClose;
    const diffRate = ((diff / prevClose) * 100).toFixed(2);
    const emoji = diff >= 0 ? "📈" : "📉";

    // 2️⃣ 디스코드 메시지 포맷
    const message = `
${emoji} **DVLT 주가 알림**
현재가: $${current}
전일 대비: ${diff >= 0 ? "+" : ""}${diff.toFixed(4)} (${diffRate}%)
`;

    // 3️⃣ 디스코드로 전송
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    // 4️⃣ 응답
    res.status(200).json({
      success: true,
      current,
      diff,
      diffRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "DVLT 알림 실패" });
  }
}
