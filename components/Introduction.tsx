import React, { useRef } from 'react';
import { BookOpen, PenTool, ArrowRight, Upload } from 'lucide-react';

interface IntroductionProps {
  onStart: () => void;
  onLoadHistory: () => void;
  onImportCsv: (file: File) => void;
  hasHistory: boolean;
}

export const Introduction: React.FC<IntroductionProps> = ({ onStart, onLoadHistory, onImportCsv, hasHistory }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCsv(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in print:hidden">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">葛藤マネジメント</h1>
        <p className="text-xl text-gray-600 font-medium">
          書くことで心を整理し、行動への一歩を踏み出す
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">認知行動療法のテクニック</h3>
            <p className="text-gray-600 leading-relaxed">
              葛藤マネジメントは、失敗を恐れて行動できない状況で効果的なワークです。
              心の中にある「変わりたいけれど、怖い」という葛藤を4つの視点から書き出すことで、
              客観的に自分を見つめ直し、行動しない理由を解消します。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <PenTool size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">エクスプレッシブ・ライティング</h3>
            <p className="text-gray-600 leading-relaxed">
              実際に手を動かして「書く」行為は、メンタルヘルスに良い影響を与えます。
              頭の中でぐるぐると回っている悩みを言語化し、外に出すことで、ストレスの改善やトラウマの緩和につながることが知られています。
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gray-900 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl"
        >
          <span>新しいセッションを始める</span>
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {hasHistory && (
          <button
            onClick={onLoadHistory}
            className="inline-flex items-center justify-center px-8 py-4 font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm"
          >
            過去の記録を見る
          </button>
        )}

        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold text-indigo-700 transition-all duration-200 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 shadow-sm"
          >
            <Upload className="mr-2 w-5 h-5" />
            CSV取込
          </button>
        </div>
      </div>
    </div>
  );
};