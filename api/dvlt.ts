// api/dvlt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_QUOTE_API = "https://finnhub.io/api/v1/quote";
const SYMBOL = "DVLT";

/**
 * 미국 장 알림 단계 판별
 * OPEN     : 09:30 (개장)
 * INTRADAY : 10:00 ~ 15:00 정각
 * CLOSE    : 16:00 (마감)
 * NONE     : 그 외
 */
function getUsMarketPhase(): "OPEN" | "INTRADAY" | "CLOSE" | "NONE" {
  const now = new Date();
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();

  if (hours === 9 && minutes === 30) return "OPEN";
  if (hours >= 10 && hours <= 15 && minutes === 0) return "INTRADAY";
  if (hours === 16 && minutes === 0) return "CLOSE";

  return "NONE";
}

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    // 1️⃣ 지금 알림을 보내야 하는 시각인지 판단
    const phase = getUsMarketPhase();

    if (phase === "NONE") {
      console.log("알림 대상 시간 아님 → 스킵");
      return res.status(200).json({ skipped: "not notify time" });
    }

    // 2️⃣ 환경 변수 확인
    const apiKey = process.env.FINNHUB_API_KEY;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!apiKey || !webhookUrl) {
      throw new Error("환경 변수 누락");
    }

    // 3️⃣ DVLT 주가 조회
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

    // 4️⃣ 가격 계산
    const diff = current - prevClose;
    const diffRate = ((diff / prevClose) * 100).toFixed(2);
    const emoji = diff >= 0 ? "📈" : "📉";

    // 5️⃣ 단계별 제목 분기
    let title = "DVLT 주가 알림";

    if (phase === "OPEN") {
      title = "📢 DVLT 개장가 알림";
    } else if (phase === "CLOSE") {
      title = "🔔 DVLT 마감가 알림";
    }

    // 6️⃣ 디스코드 메시지 생성
    const message = `${emoji} **${title}**
현재가: $${current}
전일 대비: ${diff >= 0 ? "+" : ""}${diff.toFixed(4)} (${diffRate}%)`;

    // 7️⃣ 디스코드 전송
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    return res.status(200).json({
      success: true,
      phase,
      current,
      diff,
      diffRate,
    });
  } catch (error: any) {
    console.error("DVLT ERROR:", error.message);
    return res.status(500).json({ error: error.message });
  }
}


