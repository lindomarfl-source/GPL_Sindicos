import React from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Badge, Button } from './Common';
import { 
  Users, CheckCircle, Clock, TrendingUp, 
  Target, AlertTriangle, ArrowRight, Trophy,
  BarChart3, PieChart as PieChartIcon, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer as Rc,
  PieChart, Pie, Cell
} from 'recharts';

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${color}`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl md:text-3xl font-black text-white">{value}</h3>
          {trend && <span className="text-[10px] text-green-400 font-bold">{trend}</span>}
        </div>
        <p className="text-slate-500 text-[9px] md:text-[10px] mt-1 font-medium">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 text-white`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </Card>
);

export const Dashboard = ({ onSelectCandidate }) => {
  const { candidates } = useCandidates();

  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-20 text-center">
        <Users size={64} className="mx-auto text-slate-700 mb-4 opacity-20" />
        <h3 className="text-xl font-bold text-slate-500">Nenhum candidato cadastrado para análise.</h3>
      </div>
    );
  }

  const stats = {
    total: candidates.length,
    pf: candidates.filter(c => c.tipo === 'PF').length,
    pj: candidates.filter(c => c.tipo === 'PJ').length,
    finalizado: candidates.filter(c => c.status === 'Finalizado').length,
    pendente: candidates.filter(c => Object.values(c.documentacao || {}).some(v => v !== 'entregue')).length,
    highScore: Math.max(...candidates.map(c => {
      const vals = Object.values(c.avaliacao || {});
      return vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
    })).toFixed(1)
  };

  const topCandidates = [...candidates].sort((a,b) => {
    const scoreA = Object.values(a.avaliacao || {}).reduce((x,y) => x+y, 0) / 6;
    const scoreB = Object.values(b.avaliacao || {}).reduce((x,y) => x+y, 0) / 6;
    return scoreB - scoreA;
  }).slice(0, 3);

  const pieData = [
    { name: 'Pessoa Física', value: stats.pf, color: '#3b82f6' },
    { name: 'Pessoa Jurídica', value: stats.pj, color: '#a855f7' }
  ];

  const barData = candidates.slice(0, 6).map(c => ({
    name: c.nome.split(' ')[0],
    score: (Object.values(c.avaliacao || {}).reduce((a,b) => a+b, 0) / 6).toFixed(1)
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* KPI Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard 
          title="Inscritos" 
          value={stats.total} 
          subtitle="Candidatos em processo" 
          icon={Users} 
          color="bg-blue-600" 
          trend="+12%"
        />
        <KPICard 
          title="Top Score" 
          value={stats.highScore} 
          subtitle="Maior média técnica" 
          icon={Trophy} 
          color="bg-yellow-600" 
        />
        <KPICard 
          title="Qualificados" 
          value={stats.finalizado} 
          subtitle="Análises concluídas" 
          icon={CheckCircle} 
          color="bg-green-600" 
        />
        <KPICard 
          title="Pendentes" 
          value={stats.pendente} 
          subtitle="Aguardando docs/avaliação" 
          icon={Clock} 
          color="bg-red-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Desempenho */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <BarChart3 size={20} />
              </div>
              <h4 className="font-black text-white uppercase text-sm tracking-widest">Comparativo de Scores Técnicos</h4>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribuição de Perfil */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <PieChartIcon size={20} />
            </div>
            <h4 className="font-black text-white uppercase text-sm tracking-widest">Tipicidade</h4>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 uppercase tracking-tighter">{item.name}</span>
                </div>
                <span className="text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Líderes de Ranking */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="text-yellow-500" size={20} />
              <h4 className="font-black text-white uppercase text-sm tracking-widest">Líderes de Score (Top 3)</h4>
            </div>
          </div>
          <div className="space-y-4">
            {topCandidates.map((c, i) => (
              <div 
                key={c.id} 
                onClick={() => onSelectCandidate(c.id)}
                className="flex items-center justify-between p-4 bg-slate-800/20 rounded-2xl hover:bg-slate-800/40 transition-all cursor-pointer border border-slate-800/50 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    i === 1 ? 'bg-slate-400/20 text-slate-400' :
                    'bg-orange-600/20 text-orange-600'
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{c.nome}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={c.status}>{c.status}</Badge>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{c.tipo}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">
                    {(Object.values(c.avaliacao || {}).reduce((a,b) => a+b, 0) / 6).toFixed(1)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Média Técnica</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas e Insights */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-blue-500" size={20} />
            <h4 className="font-black text-white uppercase text-sm tracking-widest">Insights do Processo</h4>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
              <div className="p-2 bg-blue-500/20 rounded-xl h-fit text-blue-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-100 italic">Tendência de Mercado</h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  O perfil predominante nesta eleição é de **Gestão Profissional (PJ)** com foco em condomínios de grande porte.
                </p>
              </div>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-4">
              <div className="p-2 bg-red-500/20 rounded-xl h-fit text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-100 italic">Alerta Documental</h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                   Existem **{stats.pendente} candidatos** com pendências críticas. Verifique as certidões negativas na aba de documentos.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => document.getElementById('tab-candidatos')?.click()}
                className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-2 group"
              >
                Gerenciar Todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
