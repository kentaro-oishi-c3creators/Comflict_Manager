import React, { useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { Step, STEP_DESCRIPTIONS } from '../types';

interface MatrixEditorProps {
  step: Step;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export const MatrixEditor: React.FC<MatrixEditorProps> = ({ step, value, onChange, onNext, onBack, onSaveDraft }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step]);

  const stepInfo = STEP_DESCRIPTIONS[step as keyof typeof STEP_DESCRIPTIONS];

  if (!stepInfo) return null;

  return (
    <div className="max-w-2xl mx-auto w-full p-4 animate-fade-in-up">
      <div className={`rounded-3xl p-8 shadow-lg border border-opacity-50 transition-colors duration-500 ${stepInfo.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-30 ')} bg-white`}>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${stepInfo.color} bg-opacity-20`}>
                Step {Object.keys(STEP_DESCRIPTIONS).indexOf(step) + 1} / 4
              </span>
            </div>
            <button
              onClick={onSaveDraft}
              className="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-medium"
              title="途中保存"
            >
              <Save size={16} />
              <span className="hidden sm:inline">一時保存</span>
            </button>
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${stepInfo.color.split(' ')[2]}`}>
            {stepInfo.title}
          </h2>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {stepInfo.subtitle}
          </p>
          <p className="text-sm text-gray-500">
            {stepInfo.description}
          </p>
        </div>

        {/* Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-64 p-4 text-lg text-gray-800 bg-paper border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-0 resize-none transition-all leading-relaxed placeholder-gray-300"
            placeholder="ここに思いつくまま書き出してください..."
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>

          <button
            onClick={onNext}
            disabled={value.trim().length === 0}
            className={`flex items-center px-6 py-3 rounded-full font-bold text-white shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              ${step === Step.QUADRANT_4 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}
            `}
          >
            {step === Step.QUADRANT_4 ? '完了して全体を見る' : '次へ進む'}
            {step === Step.QUADRANT_4 ? <CheckCircle2 className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};