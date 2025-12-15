import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  colSpan?: number;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, title, colSpan = 1, highlight = false }) => {
  const spanClass = colSpan === 2 ? 'col-span-2' : 'col-span-1';
  const bgClass = highlight ? 'bg-ind-orange text-white' : 'bg-white text-ind-black';
  const hoverClass = onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-hard-lg transition-all active:translate-y-0 active:shadow-hard' : '';
  
  return (
    <div 
      onClick={onClick}
      className={`
        ${spanClass} 
        ${bgClass} 
        ${hoverClass}
        ${className}
        border-2 border-black shadow-hard p-4 flex flex-col relative overflow-hidden
      `}
    >
      {title && (
        <div className={`font-display text-lg uppercase mb-2 ${highlight ? 'text-black' : 'text-ind-orange'}`}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseClasses = "border-2 border-black font-bold uppercase transition-all active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2";
  
  let variantClasses = "";
  switch (variant) {
    case 'primary':
      variantClasses = "bg-ind-orange text-black shadow-hard hover:-translate-y-[1px] hover:shadow-hard-lg";
      break;
    case 'secondary':
      variantClasses = "bg-white text-black shadow-hard hover:-translate-y-[1px] hover:shadow-hard-lg";
      break;
    case 'danger':
      variantClasses = "bg-red-500 text-white shadow-hard";
      break;
    case 'icon':
      variantClasses = "bg-white p-2 shadow-hard-sm rounded-none";
      break;
  }

  const widthClass = fullWidth ? "w-full py-4 text-xl" : "px-4 py-2";

  return (
    <button className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const FloatingButton: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-6 right-6 w-14 h-14 bg-ind-orange border-2 border-black shadow-hard z-50 flex items-center justify-center rounded-full hover:scale-110 transition-transform active:scale-90"
  >
    {icon}
  </button>
);
