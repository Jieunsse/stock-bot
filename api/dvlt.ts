// api/dvlt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_QUOTE_API = "https://finnhub.io/api/v1/quote";
const SYMBOL = "DVLT";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!apiKey || !webhookUrl) {
      throw new Error("환경 변수 누락");
    }

    const quoteRes = await fetch(
      `${FINNHUB_QUOTE_API}?symbol=${SYMBOL}&token=${apiKey}`
    );

    const quote = await quoteRes.json();

    if (quote.error) {
      throw new Error(`Finnhub error: ${quote.error}`);
    }

    const current = quote.c;
    const prevClose = quote.pc;

    if (current == null || prevClose == null) {
      throw new Error("유효하지 않은 주가 데이터");
    }

    const diff = current - prevClose;
    const diffRate = ((diff / prevClose) * 100).toFixed(2);
    const emoji = diff >= 0 ? "📈" : "📉";

    const message = `${emoji} **DVLT 주가 알림**
현재가: $${current}
전일 대비: ${diff >= 0 ? "+" : ""}${diff.toFixed(4)} (${diffRate}%)`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("DVLT ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
}
