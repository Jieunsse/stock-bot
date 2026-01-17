export function buildDailySummary({
  high,
  low,
  close,
}: {
  high: number;
  low: number;
  close: number;
}) {
  const intradayRange = high - low;
  const fromHighRate = ((close - high) / high) * 100;

  return `📊 오늘 요약
• 장중 변동폭: $${intradayRange.toFixed(2)}
• 고점 대비 ${fromHighRate.toFixed(2)}%에서 마감`;
}
