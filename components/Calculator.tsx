import React, { useState, useEffect } from 'react';
import { X, Delete, Save } from 'lucide-react';
import { Button } from './UI';

interface CalculatorProps {
  onClose?: () => void;
  onSave?: (amountJPY: number, amountTWD: number) => void;
  initialRate?: number;
  mode?: 'global' | 'embedded'; // Embedded is for the expense page
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose, onSave, initialRate = 0.21, mode = 'global' }) => {
  const [display, setDisplay] = useState('0');
  const [rate, setRate] = useState(initialRate);

  const handleNum = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleClear = () => setDisplay('0');
  const handleDelete = () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');

  const jpy = parseFloat(display);
  const twd = Math.round(jpy * rate);

  const containerClass = mode === 'global' 
    ? "fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    : "w-full";

  const cardClass = mode === 'global'
    ? "bg-white border-2 border-black shadow-hard-lg w-full max-w-sm p-4 animate-in fade-in zoom-in duration-200"
    : "w-full";

  const content = (
    <div className={cardClass}>
      {mode === 'global' && (
        <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
          <h2 className="font-display text-xl">QUICK CALC</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
      )}

      {/* Screen */}
      <div className="bg-ind-gray border-2 border-black p-4 mb-4 text-right">
        <div className="text-sm text-gray-500 mb-1">JPY (Rate: {rate})</div>
        <div className="text-4xl font-display text-ind-black break-all">{display}</div>
        <div className="text-2xl font-bold text-ind-orange mt-2">= NT$ {twd}</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {[7, 8, 9].map(n => <Button key={n} variant="secondary" onClick={() => handleNum(n.toString())} className="text-xl h-14">{n}</Button>)}
        <Button variant="danger" onClick={handleClear} className="text-xl h-14">C</Button>

        {[4, 5, 6].map(n => <Button key={n} variant="secondary" onClick={() => handleNum(n.toString())} className="text-xl h-14">{n}</Button>)}
        <Button variant="secondary" onClick={handleDelete} className="text-xl h-14"><Delete size={20}/></Button>

        {[1, 2, 3].map(n => <Button key={n} variant="secondary" onClick={() => handleNum(n.toString())} className="text-xl h-14">{n}</Button>)}
        {mode === 'embedded' ? (
           <Button variant="primary" onClick={() => onSave && onSave(jpy, twd)} className="row-span-2 text-xl h-full flex flex-col">
             <Save size={24} />
             <span className="text-xs">SAVE</span>
           </Button>
        ) : (
           <Button variant="primary" onClick={() => {}} className="row-span-2 text-xl h-full flex items-center justify-center font-display text-3xl">=</Button>
        )}

        <Button variant="secondary" onClick={() => handleNum('0')} className="col-span-2 text-xl h-14">0</Button>
        <Button variant="secondary" onClick={() => handleNum('.')} className="text-xl h-14">.</Button>
      </div>
    </div>
  );

  if (mode === 'global') {
    return (
      <div className={containerClass}>
        {content}
      </div>
    );
  }

  return content;
};