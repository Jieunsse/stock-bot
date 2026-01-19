import { US_MARKET_HOLIDAYS_2026 } from '../../src/stock/constants/usMarketHolidays';
import { US_MARKET_TIME } from '../../src/stock/constants/usMarketTime';
import { getUsDate, getUsDateString } from './usTime';

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
  const usDate = getUsDate();
  const hours = usDate.getHours();
  const minutes = usDate.getMinutes();

  const { OPEN, INTRADAY_START_HOUR, INTRADAY_END_HOUR, CLOSE } = US_MARKET_TIME;

  if (hours === OPEN.hour && minutes === OPEN.minute) return 'OPEN';

  if (
    hours >= INTRADAY_START_HOUR &&
    hours <= INTRADAY_END_HOUR &&
    minutes === 0
  ) {
    return 'INTRADAY';
  }

  if (hours === CLOSE.hour && minutes === CLOSE.minute) return 'CLOSE';

  return 'NONE';
}
