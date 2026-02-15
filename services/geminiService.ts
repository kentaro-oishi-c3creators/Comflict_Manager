import { GoogleGenAI } from "@google/genai";
import { QuadrantData } from "../types";

const API_KEY = process.env.API_KEY || '';

const getClient = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const analyzeConflict = async (theme: string, data: QuadrantData): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    console.warn("API Key is missing. Returning mock response.");
    return "APIキーが設定されていないため、AI分析を実行できません。";
  }

  try {
    const prompt = `
      あなたは認知行動療法（CBT）の専門家です。
      ユーザーは「葛藤マネジメント」のワークシートを作成しました。
      以下の内容を分析し、ユーザーの背中を優しく押すような、あるいは客観的な気づきを与えるフィードバックを行ってください。
      
      ## ユーザーのテーマ
      ${theme}

      ## ワークシートの内容
      1. 変わらないメリット (現状維持の利点): ${data.keepPros}
      2. 変わらないデメリット (現状維持の欠点): ${data.keepCons}
      3. 変わるデメリット (変化の不安・コスト): ${data.changeCons}
      4. 変わるメリット (変化の利点・希望): ${data.changePros}

      ## あなたへの指示
      - まず、ユーザーがこの葛藤に向き合ったこと自体を肯定してください。
      - 4つの視点から見えてくる「ユーザーが本当に大切にしている価値観」や「恐れている本質」を分析してください。
      - 最後に、小さな「行動実験」（失敗してもリスクの少ない小さな第一歩）を提案してください。
      - トーンは温かく、受容的で、かつ論理的に整理された文章にしてください。
      - マークダウン形式で出力してください。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "分析結果を生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "申し訳ありません。AIによる分析中にエラーが発生しました。しばらく待ってから再試行してください。";
  }
};

export const generateDraft = async (theme: string): Promise<QuadrantData | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const prompt = `
      ユーザーの悩みテーマ: 「${theme}」
      
      このテーマについて、葛藤マネジメント（メリット・デメリットの整理）のワークシートの下書きを作成してください。
      以下の4つの項目について、一般的または考えられる具体的な内容を日本語で記述してください。
      
      出力は必ず以下のJSON形式にしてください:
      {
        "keepPros": "変わらないメリット（現状維持の利点）",
        "keepCons": "変わらないデメリット（現状維持の欠点）",
        "changeCons": "変わるデメリット（変化の不安・コスト）",
        "changePros": "変わるメリット（変化の利点・希望）"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as QuadrantData;
  } catch (error) {
    console.error("Gemini Draft Error:", error);
    return null;
  }
};