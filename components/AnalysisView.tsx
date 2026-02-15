import React, { useState } from 'react';
import { QuadrantData } from '../types';
import { Sparkles, Printer, RotateCcw, Pencil, Save, X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  theme: string;
  data: QuadrantData;
  aiAnalysis: string | undefined;
  onAnalyze: () => void;
  onReset: () => void;
  onUpdateData: (newData: QuadrantData) => void;
  onSaveDraft: () => void;
  isAnalyzing: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  theme, 
  data, 
  aiAnalysis, 
  onAnalyze, 
  onReset, 
  onUpdateData,
  onSaveDraft,
  isAnalyzing 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<QuadrantData>(data);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ["Theme", "KeepPros", "KeepCons", "ChangeCons", "ChangePros", "AI Analysis"];
    const escape = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
    
    const row = [
      theme,
      data.keepPros,
      data.keepCons,
      data.changeCons,
      data.changePros,
      aiAnalysis || ''
    ].map(escape).join(",");

    const csvContent = [headers.join(","), row].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `conflict_management_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStartEdit = () => {
    setEditData(data);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(data);
  };

  const handleSaveEdit = () => {
    onUpdateData(editData);
    setIsEditing(false);
    onSaveDraft(); // Save to local storage
  };

  const handleChange = (key: keyof QuadrantData, val: string) => {
    setEditData(prev => ({ ...prev, [key]: val }));
  };

  const QuadrantCard = ({ title, contentKey, type }: { title: string, contentKey: keyof QuadrantData, type: 'keep' | 'change' }) => {
    const isKeep = type === 'keep';
    const content = isEditing ? editData[contentKey] : data[contentKey];

    return (
      <div className={`flex flex-col h-full p-4 md:p-6 border rounded-xl ${isKeep ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
        <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b ${isKeep ? 'text-slate-500 border-slate-200' : 'text-indigo-500 border-indigo-100'}`}>
          {title}
        </h4>
        <div className="flex-grow">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => handleChange(contentKey, e.target.value)}
              className="w-full h-full min-h-[120px] p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              placeholder={`${title}を入力`}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base font-medium">
              {content || <span className="text-gray-400 italic">（記述なし）</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 animate-fade-in print:p-0">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:mb-4">
        <div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Theme</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{theme}</h1>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} className="flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <X className="w-4 h-4 mr-2" />
                キャンセル
              </button>
              <button onClick={handleSaveEdit} className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Save className="w-4 h-4 mr-2" />
                保存して終了
              </button>
            </>
          ) : (
            <>
              <button onClick={onReset} className="flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-4 h-4 mr-2" />
                最初から
              </button>
              <button onClick={handleStartEdit} className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Pencil className="w-4 h-4 mr-2" />
                修正する
              </button>
              <button onClick={handleDownloadCsv} className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                CSV保存
              </button>
              <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="w-4 h-4 mr-2" />
                印刷
              </button>
            </>
          )}
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 print:shadow-none print:border-2">
        
        {/* Background Cross Decoration */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 hidden md:block"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0">
          {/* Top Left: Keep Pros */}
          <div className="border-b md:border-b-0 md:border-r border-gray-100 p-2">
            <QuadrantCard title="変わらないメリット" contentKey="keepPros" type="keep" />
          </div>
          
          {/* Top Right: Keep Cons */}
          <div className="border-b border-gray-100 p-2">
            <QuadrantCard title="変わらないデメリット" contentKey="keepCons" type="keep" />
          </div>

          {/* Bottom Left: Change Cons */}
          <div className="border-b md:border-b-0 md:border-r border-gray-100 p-2">
            <QuadrantCard title="変わるデメリット" contentKey="changeCons" type="change" />
          </div>

          {/* Bottom Right: Change Pros */}
          <div className="p-2">
            <QuadrantCard title="変わるメリット" contentKey="changePros" type="change" />
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="mt-12 space-y-6 print:mt-8">
        <div className="flex items-center justify-between print:hidden">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-500" />
            AIカウンセラーの分析
          </h3>
          {!aiAnalysis && !isAnalyzing && !isEditing && (
            <button
              onClick={onAnalyze}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              分析を実行する
            </button>
          )}
        </div>
        
        {/* Print Only Header for Analysis */}
        {aiAnalysis && (
          <div className="hidden print:block mt-8 border-t pt-4">
             <h3 className="text-lg font-bold text-gray-900 mb-2">AIカウンセラーの分析結果</h3>
          </div>
        )}

        {isAnalyzing && (
           <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm flex flex-col items-center justify-center space-y-4 print:hidden">
             <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium animate-pulse">あなたの思考を整理しています...</p>
           </div>
        )}

        {aiAnalysis && !isAnalyzing && (
          <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-lg prose prose-purple max-w-none print:shadow-none print:border print:p-4">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};