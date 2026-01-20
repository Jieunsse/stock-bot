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

  const { OPEN, INTRADAY_START_HOUR, INTRADAY_END_HOUR, CLOSE } = US_MARKET_TIME;

  // GitHub Actions 호출 지연을 고려해 ±2분 허용
  const isWithinMinute = (
    targetHour: number,
    targetMinute: number,
    toleranceMinutes = 2,
  ) => {
    if (hour !== targetHour) return false;
    return Math.abs(minute - targetMinute) <= toleranceMinutes;
  };

  if (isWithinMinute(OPEN.hour, OPEN.minute)) return 'OPEN';

  if (hour >= INTRADAY_START_HOUR && hour <= INTRADAY_END_HOUR && minute <= 2) {
    return 'INTRADAY';
  }

  if (isWithinMinute(CLOSE.hour, CLOSE.minute)) return 'CLOSE';

  return 'NONE';
}
