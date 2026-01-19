import OpenAI from 'openai';
import type { FinnhubNews } from '../interfaces/FinnhubNews';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeNewsToKorean(
  symbol: string,
  news: FinnhubNews[],
): Promise<string> {
  const newsText = news
    .map(
      (n, i) => `
[기사 ${i + 1}]
제목: ${n.headline}
요약: ${n.summary}
`,
    )
    .join('\n');

  const prompt = `
다음은 미국 주식 종목 ${symbol}와 관련된 최근 뉴스 기사들입니다.

요구사항:
1. 여러 기사를 종합해서 핵심만 정리하세요.
2. 투자자 관점에서 중요한 사실 위주로 요약하세요.
3. 추측이나 과도한 해석은 하지 마세요.
4. 한국어로 작성하세요.
5. 3~5줄 이내로 작성하세요.

[뉴스 목록]
${newsText}
`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0].message.content ?? '';
}
