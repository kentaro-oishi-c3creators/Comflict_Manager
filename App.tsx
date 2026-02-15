import React, { useState, useEffect } from 'react';
import { Step, QuadrantData, Session } from './types';
import { Introduction } from './components/Introduction';
import { MatrixEditor } from './components/MatrixEditor';
import { AnalysisView } from './components/AnalysisView';
import { analyzeConflict, generateDraft } from './services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  // State
  const [step, setStep] = useState<Step>(Step.INTRO);
  const [theme, setTheme] = useState<string>('');
  const [data, setData] = useState<QuadrantData>({
    keepPros: '',
    keepCons: '',
    changeCons: '',
    changePros: '',
  });
  const [aiAnalysis, setAiAnalysis] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('conflict_mgmt_sessions');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save current session to history
  const saveSession = (newAnalysis?: string) => {
    if (!theme.trim()) return;

    const newSession: Session = {
      id: generateId(), // In a real app, maintain stable ID for updates
      timestamp: Date.now(),
      theme,
      data,
      aiAnalysis: newAnalysis || aiAnalysis
    };
    
    // Naive implementation: just prepend and keep top 20
    const updatedHistory = [newSession, ...history.filter(h => h.theme !== theme || (Date.now() - h.timestamp > 3600000))].slice(0, 20); 
    
    setHistory(updatedHistory);
    localStorage.setItem('conflict_mgmt_sessions', JSON.stringify(updatedHistory));
  };

  const handleStart = () => {
    setStep(Step.THEME_INPUT);
    setTheme('');
    setData({ keepPros: '', keepCons: '', changeCons: '', changePros: '' });
    setAiAnalysis(undefined);
    setShowHistory(false);
  };

  const handleHistoryLoad = (session: Session) => {
    setTheme(session.theme);
    setData(session.data);
    setAiAnalysis(session.aiAnalysis);
    setStep(Step.REVIEW);
    setShowHistory(false);
  };

  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      
      // Simple CSV parsing: Expect header, then data.
      // Format: Theme,KeepPros,KeepCons,ChangeCons,ChangePros
      // Very basic handling of quotes/commas for this demo
      const lines = text.split('\n');
      if (lines.length < 2) {
        alert("CSVの形式が正しくないようです。");
        return;
      }
      
      // Try to parse the second line (index 1)
      // Note: This split is naive and breaks on commas inside fields. 
      // A proper CSV parser library is recommended for production.
      // For this demo, let's assume a simplified CSV without internal commas or standard quote escaping
      // Or use a slightly smarter regex split.
      const parseCsvLine = (line: string) => {
         const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
         if (!matches) return line.split(',');
         return matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
      };

      const values = parseCsvLine(lines[1]);
      
      if (values.length >= 5) {
        setTheme(values[0]);
        setData({
          keepPros: values[1] || '',
          keepCons: values[2] || '',
          changeCons: values[3] || '',
          changePros: values[4] || '',
        });
        setStep(Step.REVIEW);
        setAiAnalysis(undefined);
      } else {
        alert("データが不足しているようです。Theme, KeepPros, KeepCons, ChangeCons, ChangeProsの順で記載してください。");
      }
    };
    reader.readAsText(file);
  };

  const handleAiAutoFill = async () => {
    if (!theme.trim()) return;
    setIsDrafting(true);
    const draft = await generateDraft(theme);
    if (draft) {
      setData(draft);
      // Move to first step to let user review/edit
      setStep(Step.QUADRANT_1);
    } else {
      alert("下書きの生成に失敗しました。");
    }
    setIsDrafting(false);
  };

  const handleNextStep = () => {
    switch (step) {
      case Step.THEME_INPUT:
        if (theme.trim()) setStep(Step.QUADRANT_1);
        break;
      case Step.QUADRANT_1:
        setStep(Step.QUADRANT_2);
        break;
      case Step.QUADRANT_2:
        setStep(Step.QUADRANT_3);
        break;
      case Step.QUADRANT_3:
        setStep(Step.QUADRANT_4);
        break;
      case Step.QUADRANT_4:
        setStep(Step.REVIEW);
        break;
      default:
        break;
    }
  };

  const handleBackStep = () => {
    switch (step) {
      case Step.THEME_INPUT:
        setStep(Step.INTRO);
        break;
      case Step.QUADRANT_1:
        setStep(Step.THEME_INPUT);
        break;
      case Step.QUADRANT_2:
        setStep(Step.QUADRANT_1);
        break;
      case Step.QUADRANT_3:
        setStep(Step.QUADRANT_2);
        break;
      case Step.QUADRANT_4:
        setStep(Step.QUADRANT_3);
        break;
      case Step.REVIEW:
        setStep(Step.QUADRANT_4);
        break;
      default:
        break;
    }
  };

  const updateQuadrantData = (key: keyof QuadrantData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeConflict(theme, data);
    setAiAnalysis(result);
    setIsAnalyzing(false);
    saveSession(result);
  };

  // Render Helpers
  const renderContent = () => {
    if (showHistory) {
      return (
        <div className="max-w-3xl mx-auto p-6 print:hidden">
          <div className="flex items-center mb-6">
            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-800 mr-4">
              ← 戻る
            </button>
            <h2 className="text-2xl font-bold">過去の記録</h2>
          </div>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">記録はまだありません。</p>
            ) : (
              history.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => handleHistoryLoad(session)}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg text-gray-800">{session.theme}</span>
                    <span className="text-xs text-gray-400">{new Date(session.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{session.data.keepPros}</p>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    switch (step) {
      case Step.INTRO:
        return <Introduction onStart={handleStart} onLoadHistory={() => setShowHistory(true)} onImportCsv={handleCsvImport} hasHistory={history.length > 0} />;
      
      case Step.THEME_INPUT:
        return (
          <div className="max-w-xl mx-auto w-full p-6 animate-fade-in-up print:hidden">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">悩んでいるテーマは何ですか？</h2>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例：転職すべきかどうか？"
                className="w-full text-center text-xl p-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors mb-6 bg-transparent"
                autoFocus
                disabled={isDrafting}
              />
              
              <div className="mb-8">
                <button
                  onClick={handleAiAutoFill}
                  disabled={!theme.trim() || isDrafting}
                  className="inline-flex items-center text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  {isDrafting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isDrafting ? 'AIが考え中...' : 'AIで下書きを作成'}
                </button>
              </div>

              <div className="flex justify-between">
                <button onClick={handleBackStep} className="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  戻る
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!theme.trim() || isDrafting}
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold shadow-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                  はじめる
                </button>
              </div>
            </div>
          </div>
        );

      case Step.QUADRANT_1:
        return (
          <MatrixEditor
            step={step}
            value={data.keepPros}
            onChange={(v) => updateQuadrantData('keepPros', v)}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onSaveDraft={() => saveSession()}
          />
        );

      case Step.QUADRANT_2:
        return (
          <MatrixEditor
            step={step}
            value={data.keepCons}
            onChange={(v) => updateQuadrantData('keepCons', v)}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onSaveDraft={() => saveSession()}
          />
        );

      case Step.QUADRANT_3:
        return (
          <MatrixEditor
            step={step}
            value={data.changeCons}
            onChange={(v) => updateQuadrantData('changeCons', v)}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onSaveDraft={() => saveSession()}
          />
        );

      case Step.QUADRANT_4:
        return (
          <MatrixEditor
            step={step}
            value={data.changePros}
            onChange={(v) => updateQuadrantData('changePros', v)}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onSaveDraft={() => saveSession()}
          />
        );

      case Step.REVIEW:
        return (
          <AnalysisView
            theme={theme}
            data={data}
            aiAnalysis={aiAnalysis}
            onAnalyze={handleAnalyze}
            onReset={() => setStep(Step.INTRO)}
            onUpdateData={setData}
            onSaveDraft={() => saveSession()}
            isAnalyzing={isAnalyzing}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col print:bg-white">
      {/* Navbar */}
      <header className="bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(Step.INTRO)}>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              葛
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">Conflict Management</span>
          </div>
          {step !== Step.INTRO && !showHistory && (
             <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
               {step === Step.REVIEW ? 'Review Mode' : 'Writing Mode'}
             </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 print:block print:p-0">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm print:hidden">
        <p>© {new Date().getFullYear()} Conflict Management App. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;