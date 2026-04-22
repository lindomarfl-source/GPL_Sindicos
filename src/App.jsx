import React, { useState } from 'react';
import { useCandidates } from './context/CandidatesContext';
import { Login } from './components/Login';
import { ShieldLogo, Button } from './components/Common';
import { Dashboard } from './components/Dashboard';
import { CandidateManager } from './components/CandidateManager';
import { CandidateDetails } from './components/CandidateDetails';
import { ComparisonView } from './components/ComparisonView';
import { LayoutDashboard, Users, BarChart2, LogOut, CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ notification }) => {
  if (!notification) return null;
  const isSuccess = notification.type === 'success';
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-8 duration-500">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isSuccess 
          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <span className="font-bold text-sm tracking-tight">{notification.message}</span>
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
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Painel de Inteligência' : 
               activeTab === 'candidatos' ? 'Gestão de Candidatos' : 
               activeTab === 'comparativo' ? 'Análise Comparativa' : 
               activeTab === 'detalhes' ? 'Ficha do Candidato' : 'Portal de Seleção'}
            </h2>
            <p className="text-slate-400 mt-1">Sincronizado com Supabase Cloud.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
               GPL
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard onSelectCandidate={(id) => { setSelectedCandidateId(id); setActiveTab('detalhes'); }} />}
        
        {activeTab === 'candidatos' && <CandidateManager onSelectCandidate={(id) => { setSelectedCandidateId(id); setActiveTab('detalhes'); }} />}

        {activeTab === 'comparativo' && <ComparisonView />}

        {activeTab === 'detalhes' && (
          <CandidateDetails 
            candidateId={selectedCandidateId} 
            onBack={() => setActiveTab('dashboard')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
