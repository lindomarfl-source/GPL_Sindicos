import React, { useState, useMemo } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Badge } from './Common';
import { 
  Zap, Swords, Target, Shield, 
  TrendingUp, Activity, Briefcase, 
  Users, Scale, AlertTriangle, 
  ChevronRight, Brain, Rocket, 
  Search, FileDown, Trophy, 
  Construction, Gavel, Wallet
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip as RechartsTooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- SUB-COMPONENTES ESTILIZADOS ---

const AttributeGlow = ({ label, value, color, icon: Icon }) => (
  <div className="flex flex-col gap-2 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={16} />
      </div>
      <span className="text-xl font-black text-white">{value}</span>
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">{label}</span>
    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000" style={{ width: `${(value/5)*100}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

const ScenarioMatch = ({ title, description, icon: Icon, scores }) => {
  const winner = scores[0].val > scores[1].val ? 0 : 1;
  const diff = Math.abs(scores[0].val - scores[1].val);

  return (
    <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 hover:bg-slate-800/40 transition-all border-l-4" style={{ borderColor: winner === 0 ? '#3b82f6' : '#a855f7' }}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-800 rounded-2xl text-blue-400">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">{title}</h5>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full transition-all" style={{ width: `${(scores[0].val/(scores[0].val+scores[1].val))*100}%`, backgroundColor: '#3b82f6' }}></div>
              <div className="h-full transition-all" style={{ width: `${(scores[1].val/(scores[0].val+scores[1].val))*100}%`, backgroundColor: '#a855f7' }}></div>
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase">Eficiência: {Math.max(...scores.map(s => s.val)).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export const ComparisonView = () => {
  const { candidates } = useCandidates();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedCandidates = useMemo(() => {
    return candidates.filter(c => selectedIds.includes(c.id));
  }, [candidates, selectedIds]);

  const handleExportPDF = async () => {
    const element = document.getElementById('battle-arena');
    const canvas = await html2canvas(element, { backgroundColor: '#020617', scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save('GPL_Battle_Report.pdf');
  };

  if (candidates.length < 2) return <div className="p-20 text-center text-slate-500">Cadastre candidatos primeiro.</div>;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      {/* SELEÇÃO DE DUELO */}
      <div className="flex flex-col items-center justify-center gap-6 py-10 bg-slate-900/20 rounded-[40px] border border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="text-center relative z-10">
          <Badge status="Em análise">Arena de Duelo Técnico</Badge>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mt-4">Selection Battlefield</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Selecione dois perfis para iniciar o confronto direto de dados.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          {candidates.map(c => (
            <button 
              key={c.id}
              onClick={() => toggleSelect(c.id)}
              className={`px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                selectedIds.includes(c.id) 
                ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-900/40' 
                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedIds.includes(c.id) ? 'bg-blue-400' : 'bg-slate-700'}`}></div>
              <span className="font-black uppercase text-xs tracking-widest">{c.nome}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCandidates.length === 2 ? (
        <div id="battle-arena" className="space-y-12 bg-slate-950 p-10 rounded-[50px] border border-slate-800 shadow-2xl relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Swords size={600} className="text-white" />
          </div>

          {/* HEAD TO HEAD HEADER */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-24 relative z-10">
            <div className="text-center space-y-4 animate-in slide-in-from-left duration-700">
               <div className="w-40 h-40 rounded-[40px] bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/40">
                  <Shield size={80} className="text-blue-500" />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedCandidates[0].nome}</h3>
                 <Badge status={selectedCandidates[0].risco}>Perfil {selectedCandidates[0].tipo}</Badge>
               </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-xl">
                 <span className="text-2xl font-black italic text-slate-400">VS</span>
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-slate-700 to-transparent"></div>
            </div>

            <div className="text-center space-y-4 animate-in slide-in-from-right duration-700">
               <div className="w-40 h-40 rounded-[40px] bg-purple-600/20 border-2 border-purple-500/50 flex items-center justify-center mx-auto shadow-2xl shadow-purple-900/40">
                  <Rocket size={80} className="text-purple-500" />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedCandidates[1].nome}</h3>
                 <Badge status={selectedCandidates[1].risco}>Perfil {selectedCandidates[1].tipo}</Badge>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
             {/* POWER ATTRIBUTES */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="text-blue-400" />
                  <h4 className="font-black text-white uppercase tracking-widest text-sm">DNA de Competências</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AttributeGlow label="Comunicação" value={selectedCandidates[0].avaliacao.comunicacao} color="#3b82f6" icon={Users} />
                  <AttributeGlow label="Comunicação" value={selectedCandidates[1].avaliacao.comunicacao} color="#a855f7" icon={Users} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[0].avaliacao.conflitos} color="#3b82f6" icon={Scale} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[1].avaliacao.conflitos} color="#a855f7" icon={Scale} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[0].avaliacao.lideranca} color="#3b82f6" icon={Shield} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[1].avaliacao.lideranca} color="#a855f7" icon={Shield} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[0].avaliacao.planejamento} color="#3b82f6" icon={Wallet} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[1].avaliacao.planejamento} color="#a855f7" icon={Wallet} />
                </div>
             </div>

             {/* SCENARIO SIMULATOR */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="text-yellow-500" />
                  <h4 className="font-black text-white uppercase tracking-widest text-sm">Predição de Sucesso no GPL</h4>
                </div>
                <div className="space-y-4">
                  <ScenarioMatch 
                    title="Obras de Grande Porte" 
                    description="Como o candidato lidará com reformas estruturais e modernização da fachada no GPL."
                    icon={Construction}
                    scores={[
                      { val: (selectedCandidates[0].avaliacao.tecnica + selectedCandidates[0].avaliacao.planejamento)/2 },
                      { val: (selectedCandidates[1].avaliacao.tecnica + selectedCandidates[1].avaliacao.planejamento)/2 }
                    ]}
                  />
                  <ScenarioMatch 
                    title="Gestão de Tesouraria" 
                    description="Eficiência na redução de inadimplência e otimização de contratos de manutenção."
                    icon={Wallet}
                    scores={[
                      { val: (selectedCandidates[0].avaliacao.planejamento + selectedCandidates[0].avaliacao.organizacao)/2 },
                      { val: (selectedCandidates[1].avaliacao.planejamento + selectedCandidates[1].avaliacao.organizacao)/2 }
                    ]}
                  />
                  <ScenarioMatch 
                    title="Mediação de Conflitos" 
                    description="Postura diplomática em assembleias e brigas entre vizinhos no cotidiano."
                    icon={Gavel}
                    scores={[
                      { val: (selectedCandidates[0].avaliacao.conflitos + selectedCandidates[0].avaliacao.comunicacao)/2 },
                      { val: (selectedCandidates[1].avaliacao.conflitos + selectedCandidates[1].avaliacao.comunicacao)/2 }
                    ]}
                  />
                </div>
             </div>
          </div>

          {/* FINAL VERDICT BOX */}
          <div className="p-8 bg-blue-600 rounded-[30px] shadow-2xl shadow-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-8 animate-in bounce-in duration-1000 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="flex items-center gap-6 relative z-10">
               <div className="p-4 bg-white rounded-2xl text-blue-600">
                  <Trophy size={40} />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Veredito da Arena</h3>
                  <p className="text-blue-100 font-bold opacity-80 uppercase text-[10px] tracking-[0.3em]">Baseado em matriz lógica de 18 KPIs</p>
               </div>
             </div>
             <div className="text-right relative z-10">
                <p className="text-white text-xs font-black uppercase mb-1">Candidato Recomendado:</p>
                <span className="text-4xl font-black text-white uppercase tracking-tighter underline decoration-white/30 underline-offset-8">
                  {(() => {
                    const s1 = Object.values(selectedCandidates[0].avaliacao).reduce((a,b) => a+b, 0);
                    const s2 = Object.values(selectedCandidates[1].avaliacao).reduce((a,b) => a+b, 0);
                    return s1 > s2 ? selectedCandidates[0].nome : selectedCandidates[1].nome;
                  })()}
                </span>
             </div>
          </div>

          <div className="flex justify-center pt-10">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-sm font-bold opacity-40 hover:opacity-100"
            >
              <FileDown size={16} /> DOWNLOAD BATTLE REPORT PDF
            </button>
          </div>
        </div>
      ) : (
        <Card className="p-32 text-center border-dashed border-2 border-slate-800 bg-transparent">
           <div className="flex flex-col items-center gap-4 opacity-20">
              <Swords size={80} className="text-slate-600" />
              <p className="font-black uppercase tracking-[0.4em] text-slate-500">Aguardando Desafiantes</p>
           </div>
        </Card>
      )}
    </div>
  );
};
