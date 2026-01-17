// api/dvlt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_QUOTE_API = "https://finnhub.io/api/v1/quote";
const SYMBOL = "DVLT";

function isUsMarketOpen(): boolean {
  const now = new Date();

  // 미국 동부시간(ET)으로 변환
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();

  // 09:30 이전 → 장 닫힘
  if (hours < 9 || (hours === 9 && minutes < 30)) {
    return false;
  }

  // 16:00 이후 → 장 닫힘
  if (hours > 16 || (hours === 16 && minutes >= 0)) {
    return false;
  }

  return true;
}


export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {

    if(!isUsMarketOpen()) {
      console.log("미장 폐장 시간 -> 알림 스킵");
      return res.status(200).json({ skipped: "market closed"});
    }

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
