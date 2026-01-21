import { US_MARKET_HOLIDAYS_2026 } from '../constants/usMarketHolidays.js';
import { US_MARKET_TIME } from '../constants/usMarketTime.js';
import { getUsDateString, getUsTime } from './usTime.js';

export type UsMarketPhase = 'OPEN' | 'INTRADAY' | 'CLOSE' | 'NONE';

/**
 * NYSE 공식 휴장일 여부
 */
export function isUsMarketHoliday(): boolean {
  return US_MARKET_HOLIDAYS_2026.includes(getUsDateString());
}

/**
 * 미국 장 알림 단계 판별
 */
export function getUsMarketPhase(): UsMarketPhase {
  const { hour, minute } = getUsTime();

  const { OPEN, CLOSE } = US_MARKET_TIME;

  const toMinutes = (h: number, m: number) => h * 60 + m;

  const nowMinutes = toMinutes(hour, minute);
  const openMinutes = toMinutes(OPEN.hour, OPEN.minute);
  const closeMinutes = toMinutes(CLOSE.hour, CLOSE.minute);

  if (nowMinutes < openMinutes) return 'NONE';
  if (nowMinutes === openMinutes) return 'OPEN';
  if (nowMinutes < closeMinutes) return 'INTRADAY';
  if (nowMinutes === closeMinutes) return 'CLOSE';

  return 'NONE';
}
