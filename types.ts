export interface QuadrantData {
  keepPros: string; // 変わらないメリット
  keepCons: string; // 変わらないデメリット
  changeCons: string; // 変わるデメリット
  changePros: string; // 変わるメリット
}

export interface Session {
  id: string;
  timestamp: number;
  theme: string;
  data: QuadrantData;
  aiAnalysis?: string;
}

export enum Step {
  INTRO = 'INTRO',
  THEME_INPUT = 'THEME_INPUT',
  QUADRANT_1 = 'QUADRANT_1', // Not Changing Pros
  QUADRANT_2 = 'QUADRANT_2', // Not Changing Cons
  QUADRANT_3 = 'QUADRANT_3', // Changing Cons
  QUADRANT_4 = 'QUADRANT_4', // Changing Pros
  REVIEW = 'REVIEW',
}

export const STEP_DESCRIPTIONS = {
  [Step.QUADRANT_1]: {
    title: "変わらないメリット",
    subtitle: "現状維持の良さは何ですか？",
    description: "今のままでいることの安心感、楽な点、得られる利益などを書き出してみましょう。",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  [Step.QUADRANT_2]: {
    title: "変わらないデメリット",
    subtitle: "現状維持の代償は何ですか？",
    description: "このままでいることで失うもの、将来的な不安、嫌な点などを書き出してみましょう。",
    color: "bg-red-50 border-red-200 text-red-800",
  },
  [Step.QUADRANT_3]: {
    title: "変わるデメリット",
    subtitle: "行動することの不安は何ですか？",
    description: "新しい行動を起こすことへの恐怖、リスク、面倒な点、失うかもしれないものを書き出します。",
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
  [Step.QUADRANT_4]: {
    title: "変わるメリット",
    subtitle: "行動した未来に何がありますか？",
    description: "変化することで得られる希望、成長、新しい可能性、解決する問題を想像して書きましょう。",
    color: "bg-green-50 border-green-200 text-green-800",
  },
};