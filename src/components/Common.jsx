import React from 'react';

export const ShieldLogo = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300"
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-medium active:scale-95 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Badge = ({ children, status }) => {
  const colors = {
    "entregue": "bg-green-500/10 text-green-400 border-green-500/20",
    "pendente": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "não entregue": "bg-red-500/10 text-red-400 border-red-500/20",
    "Em análise": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Finalizado": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
      {children}
    </span>
  );
};
