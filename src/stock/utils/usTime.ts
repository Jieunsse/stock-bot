const US_TIMEZONE = 'America/New_York';

const usFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: US_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

type UsDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isoDate: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 6 = Sat
};

function getUsParts(date = new Date()): UsDateParts {
  const parts = usFormatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    },
    {},
  );

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  // 요일 계산은 UTC로 고정해서 타임존 영향을 제거
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    year,
    month,
    day,
    hour,
    minute,
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    dayOfWeek,
  };
}

/**
 * 미국 동부시간 Date 객체를 UTC 기준으로 생성 (시각 파트만 필요할 때 사용)
 */
export function getUsDate(date = new Date()): Date {
  const { year, month, day, hour, minute } = getUsParts(date);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

/**
 * 미국 동부시간 기준 YYYY-MM-DD 문자열
 */
export function getUsDateString(date = new Date()): string {
  return getUsParts(date).isoDate;
}

/**
 * 미국 동부시간 기준 시/분 정보
 */
export function getUsTime(date = new Date()): { hour: number; minute: number } {
  const { hour, minute } = getUsParts(date);
  return { hour, minute };
}

/**
 * 미국 동부시간 기준 주말 여부
 */
export function isUsWeekend(date = new Date()): boolean {
  const { dayOfWeek } = getUsParts(date); // 0 = Sun, 6 = Sat
  return dayOfWeek === 0 || dayOfWeek === 6;
}
