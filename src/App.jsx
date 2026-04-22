import React, { useState } from 'react';
import { useCandidates } from './context/CandidatesContext';
import { Login } from './components/Login';
import { ShieldLogo, Button } from './components/Common';
import { Dashboard } from './components/Dashboard';
import { CandidateManager } from './components/CandidateManager';
import { CandidateDetails } from './components/CandidateDetails';
import { ComparisonView } from './components/ComparisonView';
import { QuestionsManager } from './components/QuestionsManager';
import { LayoutDashboard, Users, BarChart2, LogOut, CheckCircle2, AlertCircle, X, Mic } from 'lucide-react';

const Toast = ({ notification }) => {
  if (!notification) return null;
  const isSuccess = notification.type === 'success';
  
  return (
    <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-8 duration-500 w-[90%] md:w-auto">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isSuccess 
          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span className="font-bold text-xs md:text-sm tracking-tight">{notification.message}</span>
      </div>
    </div>
  );
};

const App = () => {
  const { isAuthenticated, logout, notification } = useCandidates();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  if (!isAuthenticated) return <Login />;

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedCandidateId(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id || (activeTab === 'detalhes' && id === 'candidatos')
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const BottomNavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedCandidateId(null); }}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
        activeTab === id || (activeTab === 'detalhes' && id === 'candidatos')
          ? 'text-blue-500 scale-110' 
          : 'text-slate-500'
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans relative">
      <Toast notification={notification} />
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <ShieldLogo className="w-8 h-8" />
          <h1 className="font-bold text-lg text-white leading-tight">GPL <span className="text-blue-500">Sindicos</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="candidatos" icon={Users} label="Candidatos" />
          <NavItem id="comparativo" icon={BarChart2} label="Comparativo" />
          <NavItem id="roteiro" icon={Mic} label="Roteiro" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-24 lg:pb-10">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'candidatos' ? 'Candidatos' : 
               activeTab === 'comparativo' ? 'Comparativo' : 
               activeTab === 'roteiro' ? 'Roteiro Técnico' : 
               activeTab === 'detalhes' ? 'Ficha Técnica' : 'Portal GPL'}
            </h2>
            <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 font-bold uppercase tracking-widest">
              Sincronizado com Supabase
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
               GPL
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard onSelectCandidate={(id) => { setSelectedCandidateId(id); setActiveTab('detalhes'); }} />}
        
        {activeTab === 'candidatos' && <CandidateManager onSelectCandidate={(id) => { setSelectedCandidateId(id); setActiveTab('detalhes'); }} />}

        {activeTab === 'comparativo' && <ComparisonView />}

        {activeTab === 'roteiro' && <QuestionsManager />}

        {activeTab === 'detalhes' && (
          <CandidateDetails 
            candidateId={selectedCandidateId} 
            onBack={() => setActiveTab('candidatos')} 
          />
        )}
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 flex lg:hidden z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <BottomNavItem id="dashboard" icon={LayoutDashboard} label="Home" />
        <BottomNavItem id="candidatos" icon={Users} label="Candidatos" />
        <BottomNavItem id="roteiro" icon={Mic} label="Roteiro" />
        <BottomNavItem id="comparativo" icon={BarChart2} label="Análise" />
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-500"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
