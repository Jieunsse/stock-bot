/**
 * Finnhub /quote API 응답 타입
 * https://finnhub.io/docs/api/quote
 */
export interface FinnhubQuote {
  /** 현재가 */
  c: number;

  /** 시가 */
  o: number;

  /** 고가 */
  h: number;

  /** 저가 */
  l: number;

  /** 전일 종가 */
  pc: number;

  /** 전일 대비 변화량 */
  d: number;

  /** 전일 대비 변화율 (%) */
  dp: number;

  /** 에러 메시지 (에러 발생 시에만 존재) */
  error?: string;
}
