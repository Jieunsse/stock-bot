const US_TIMEZONE = 'America/New_York';

/**
 * 미국 동부시간 Date 객체 반환
 */
export function getUsDate(date = new Date()): Date {
  return new Date(
    date.toLocaleString('en-US', { timeZone: US_TIMEZONE }),
  );
}

/**
 * 미국 동부시간 기준 YYYY-MM-DD 문자열
 */
export function getUsDateString(date = new Date()): string {
  return getUsDate(date).toISOString().slice(0, 10);
}

/**
 * 미국 동부시간 기준 주말 여부
 */
export function isUsWeekend(date = new Date()): boolean {
  const day = getUsDate(date).getDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}
