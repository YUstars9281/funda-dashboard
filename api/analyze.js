export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY が未設定です' });
    }

    const stockCode = String(req.body?.stockCode || '').trim();
    const appModel = String(req.body?.model || 'sonnet').trim();

    if (!stockCode) {
      return res.status(400).json({ error: 'stockCode is required' });
    }

    const model = appModel === 'opus' ? 'gpt-4o' : 'gpt-4o-mini';

    const prompt = `
あなたは日本株アナリストです。
証券コード「${stockCode}」について、以下のJSON形式だけを返してください。
前置きや説明文やコードブロックは禁止です。

{
  "companyName": "",
  "stockCode": "${stockCode}",
  "market": "",
  "sector": "",
  "currentPrice": "",
  "analysisDate": "",
  "nextEarnings": "",
  "metrics": {
    "per": "",
    "pbr": "",
    "dividendYield": "",
    "roe": "",
    "eps": "",
    "marketCap": "",
    "sources": []
  },
  "steps": [
    {
      "id": 1,
      "name": "配当利回り",
      "criterion": "2.5%以上",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 2,
      "name": "配当推移",
      "criterion": "減配1回以下 / 5年1.5倍以上",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 3,
      "name": "売上・営業利益推移",
      "criterion": "5年増加傾向",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 4,
      "name": "株主資本推移",
      "criterion": "増加傾向",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 5,
      "name": "自己資本比率",
      "criterion": "40%以上",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 6,
      "name": "キャッシュフロー",
      "criterion": "営業+/投資-/財務-",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 7,
      "name": "IR・配当方針",
      "criterion": "株主還元意識",
      "value": "",
      "result": "pass",
      "detail": "",
      "tokimeki": false,
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 8,
      "name": "ビジネスモデル妄想タイム",
      "criterion": "1時間",
      "value": "",
      "result": "info",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "sources": []
    },
    {
      "id": 9,
      "name": "PL深掘り分析",
      "criterion": "3期以上の決算",
      "value": "",
      "result": "pass",
      "detail": "",
      "isException": false,
      "exceptionReason": "",
      "subItems": [
        { "name": "売上トレンド(3期以上)", "check": "増収の継続性", "result": "pass", "note": "" },
        { "name": "売上増減の要因", "check": "外部要因・一時的か", "result": "pass", "note": "" },
        { "name": "変動費の動向", "check": "上昇要因と改善余地", "result": "pass", "note": "" },
        { "name": "固定費の動向", "check": "増員orベア・売上で吸収できるか", "result": "pass", "note": "" },
        { "name": "特別損益・利益の質", "check": "償却前経常利益で判断", "result": "pass", "note": "" },
        { "name": "返済期間", "check": "長短借入金÷償却前経常利益<20年", "result": "pass", "note": "" },
        { "name": "配当性向", "check": "50%以下目安", "result": "pass", "note": "" },
        { "name": "固定資産減価償却リスク", "check": "償却済資産の補修建替えリスク", "result": "pass", "note": "" }
      ],
      "sources": []
    }
  ],
  "overallResult": "pass",
  "finalComment": ""
}

必ずJSONのみ返してください。
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || 'OpenAI API error'
      });
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      return res.status(500).json({ error: 'モデル応答が空です' });
    }

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({ result: parsed });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'analyze failed'
    });
  }
}
