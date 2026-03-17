export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const stockCode = String(req.body?.stockCode || '').trim();
    const companyName = String(req.body?.companyName || '').trim();

    return res.status(200).json({
      result: {
        stockCode,
        companyName,
        fiscalPeriod: '3Q',
        settlementDate: new Date().toLocaleDateString('ja-JP'),
        revenue: {
          actual: '—',
          forecast: '—',
          progressRate: '—',
          yoyChange: '—',
          result: 'watch',
          note: 'PDF解析未接続'
        },
        operatingProfit: {
          actual: '—',
          forecast: '—',
          progressRate: '—',
          yoyChange: '—',
          result: 'watch',
          note: 'PDF解析未接続'
        },
        guidance: {
          change: '未解析',
          newForecast: '',
          result: 'watch',
          note: '後でPDF解析を追加'
        },
        dividend: {
          change: '未解析',
          newAmount: '',
          note: '後でPDF解析を追加'
        },
        qualityNote: '現時点ではダミー応答です。',
        diffFromPast: [],
        verdict: '条件付き検討',
        verdictReason: '決算PDF解析バックエンドをまだ接続していないため仮判定です。',
        nextAction: 'earnings エンドポイントにPDF解析を追加する',
        summary: '現在は分析タブのみ本接続、決算タブはダミーです。'
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'earnings failed'
    });
  }
}
