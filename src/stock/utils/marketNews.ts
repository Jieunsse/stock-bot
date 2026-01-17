import type { FinnhubNews } from '../interfaces/FinnhubNews';

const FINNHUB_NEWS_API = 'https://finnhub.io/api/v1/company-news';

export async function fetchCompanyNews(
  symbol: string,
  apiKey: string,
): Promise<FinnhubNews[]> {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 1); // 최근 1일

  const fromDate = from.toISOString().slice(0, 10);
  const toDate = today.toISOString().slice(0, 10);

  const res = await fetch(
    `${FINNHUB_NEWS_API}?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`,
  );

  const news = (await res.json()) as FinnhubNews[];

  // headline + summary가 있는 기사만, 최대 5개
  return news
    .filter((n) => n.headline && n.summary)
    .slice(0, 5);
}
