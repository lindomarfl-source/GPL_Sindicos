import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCandidates } from '../context/CandidatesContext';
import { ShieldCheck, AlertTriangle, CheckCircle, FileText, Activity, Lock, Search, Download, ChevronDown, Save } from 'lucide-react';


const FACTORS = {
  status: {
    'ENTREGUE': 1.0,
    'PENDENTE': 0.4,
    'AUSENTE': 0.0
  },
  qualidade: {
    'EXCELENTE': 1.0,
    'BOA': 0.85,
    'REGULAR': 0.65,
    'FRACA': 0.4
  }
};

export const ComplianceManager = () => {
  const { candidates, showNotification, refreshData, globalDocTypes } = useCandidates();
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Calculates weights based on criticality and normalizes to 100 points
  const rawItems = (globalDocTypes || []).map(doc => {
    const key = doc.key.toLowerCase();
    const label = doc.label.toLowerCase();
    let rawPeso = 5;
    let penalty = 0;
    
    // Critérios de criticidade
    if (key.includes('criminal') || label.includes('criminal') || key.includes('processos') || label.includes('processos')) {
        rawPeso = 20;
        penalty = 25; // Risco Altíssimo
    } else if (key.includes('fiscal') || label.includes('fiscal') || key.includes('receita') || label.includes('receita') || key.includes('fgts') || key.includes('inss') || key.includes('trabalhista') || label.includes('trabalhista')) {
        rawPeso = 15;
        penalty = 15; // Risco Alto
    } else if (key.includes('contrato') || label.includes('contrato') || key.includes('estatuto') || label.includes('estatuto') || key.includes('cnpj') || label.includes('cnpj')) {
        rawPeso = 10;
        penalty = 10; // Risco Médio
    } else {
        rawPeso = 5;
        penalty = 0; // Risco Baixo
    }

    return { id: doc.key, label: doc.label, rawPeso, penalty };
  });

  const rawSum = rawItems.reduce((acc, item) => acc + item.rawPeso, 0) || 1;
  const items = rawItems.map(item => ({
    ...item,
    peso: parseFloat(((item.rawPeso / rawSum) * 100).toFixed(2))
  }));

  const dynamicModel = {
    conformidade: {
      title: "Conformidade Documental e Risco",
      icon: ShieldCheck,
      color: "text-indigo-400",
      bgIcon: "bg-indigo-500/10",
      weightTotal: 100,
      items: items
    }
  };

  // Initialize form data when a candidate is selected
  useEffect(() => {
    if (selectedCandidateId) {
      const c = candidates.find(c => c.id === selectedCandidateId);
      setCandidate(c);
      
      const initial = {};
      Object.keys(dynamicModel).forEach(pillarKey => {
        initial[pillarKey] = {};
        dynamicModel[pillarKey].items.forEach(item => {
          let defaultStatus = 'AUSENTE';
          // Auto-select if marked in candidate's documentacao
          if (pillarKey === 'conformidade' && c?.documentacao?.[item.id] === true) {
            defaultStatus = 'ENTREGUE';
          }
          initial[pillarKey][item.id] = { status: defaultStatus, qualidade: 'REGULAR', comments: '' };
        });
      });

      if (c && c.compliance) {
        // Merge existing compliance data with the dynamically generated initial state
        const merged = { ...initial };
        Object.keys(c.compliance).forEach(pk => {
          if (merged[pk]) {
            Object.keys(c.compliance[pk]).forEach(itemKey => {
              // Copia os dados do compliance salvo (ex: qualidade)
              merged[pk][itemKey] = { ...merged[pk][itemKey], ...c.compliance[pk][itemKey] };
              
              // Sempre forca o status ENTREGUE se a documentacao oficial estiver flegada como true
              if (pk === 'conformidade' && c?.documentacao?.[itemKey] === true) {
                merged[pk][itemKey].status = 'ENTREGUE';
              }
            });
          }
        });
        setFormData(merged);
      } else {
        setFormData(initial);
      }
    } else {
      setCandidate(null);
      setFormData({});
    }
  }, [selectedCandidateId, candidates]);

  const handleUpdateItem = (pillarKey, itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [pillarKey]: {
        ...prev[pillarKey],
        [itemId]: {
          ...prev[pillarKey][itemId],
          [field]: value
        }
      }
    }));
  };

  const calculateScores = () => {
    let totalScore = 0;
    let totalPenalty = 0;
    const pillarScores = {};

    Object.keys(dynamicModel).forEach(pillarKey => {
      let pScore = 0;
      dynamicModel[pillarKey].items.forEach(item => {
        const data = formData[pillarKey]?.[item.id] || { status: 'AUSENTE', qualidade: 'REGULAR' };
        const sFactor = FACTORS.status[data.status] || 0;
        const qFactor = data.status === 'AUSENTE' ? 0 : (FACTORS.qualidade[data.qualidade] || 0);
        
        pScore += (item.peso * sFactor * qFactor);

        // Calculate penalty if ABSENT
        if (data.status === 'AUSENTE' && item.penalty) {
          totalPenalty += item.penalty;
        }
      });
      pillarScores[pillarKey] = pScore;
      totalScore += pScore;
    });

    const finalScore = Math.max(0, totalScore - totalPenalty);

    let riskLevel = 'BAIXO';
    if (totalPenalty >= 15) riskLevel = 'ALTO';
    else if (totalPenalty > 0) riskLevel = 'MÉDIO';

    return { totalScore, totalPenalty, finalScore, pillarScores, riskLevel };
  };

  const scores = selectedCandidateId ? calculateScores() : null;

  const saveCompliance = async () => {
    if (!selectedCandidateId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('cadastro')
        .update({ compliance: formData })
        .eq('id', selectedCandidateId);
      
      if (error) throw error;
      showNotification('Avaliação de Compliance salva com sucesso!');
      await refreshData();
    } catch (error) {
      console.error(error);
      showNotification('Erro ao salvar avaliação de Compliance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadReport = () => {
    if (!candidate || !scores) return;
    const content = `
RELATÓRIO DE COMPLIANCE E DUE DILIGENCE
=======================================
Candidato: ${candidate.nome}
CNPJ: ${candidate.registro}
Risco: ${scores.riskLevel}

NOTA FINAL: ${scores.finalScore.toFixed(2)} / 100
(Pontuação Técnica: ${scores.totalScore.toFixed(2)} | Penalidades: -${scores.totalPenalty})

--- DETALHAMENTO POR PILAR ---
${Object.keys(dynamicModel).map(pk => `
[${dynamicModel[pk].title}] - Nota: ${scores.pillarScores[pk].toFixed(2)} / ${dynamicModel[pk].weightTotal}
${dynamicModel[pk].items.map(item => {
  const d = formData[pk]?.[item.id] || {};
  return ` - ${item.label}: ${d.status} | Qualidade: ${d.qualidade}`;
}).join('\\n')}
`).join('')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_${candidate.nome}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER & SELECTOR */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2"></div>
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Compliance & Due Diligence</h1>
              <p className="text-slate-400 text-sm">Análise corporativa de risco e maturidade de gestão.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-96 relative z-10">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Selecionar Candidato</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white font-medium appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:border-slate-600"
            >
              <option value="">-- Selecione uma Administradora/Síndico --</option>
              {candidates.filter(c => c.status !== 'Reprovado').map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {selectedCandidateId && scores && (
        <div className="space-y-6">
          {/* DASHBOARD SCORES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 z-10">Nota Final</p>
              <div className="text-5xl font-black text-white z-10">
                {scores.finalScore.toFixed(1)}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 z-10 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, scores.finalScore)}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Score Técnico</p>
              <div className="text-3xl font-black text-slate-200">
                {scores.totalScore.toFixed(1)} <span className="text-lg text-slate-600 font-medium">/ 100</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-red-900/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative">
              {scores.totalPenalty > 0 && <div className="absolute top-0 right-0 w-full h-1 bg-red-500/50"></div>}
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Penalidades (Hard Fail)</p>
              <div className={`text-3xl font-black ${scores.totalPenalty > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                -{scores.totalPenalty} <span className="text-lg text-slate-600 font-medium">pts</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-colors ${
              scores.riskLevel === 'ALTO' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' :
              scores.riskLevel === 'MÉDIO' ? 'bg-amber-950/40 border-amber-500/50' :
              'bg-emerald-950/40 border-emerald-500/50'
            }`}>
              <AlertTriangle className={`mb-2 ${scores.riskLevel === 'ALTO' ? 'text-red-500' : scores.riskLevel === 'MÉDIO' ? 'text-amber-500' : 'text-emerald-500'}`} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Nível de Risco</p>
              <div className={`text-2xl font-black ${scores.riskLevel === 'ALTO' ? 'text-red-400' : scores.riskLevel === 'MÉDIO' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {scores.riskLevel}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-4 mt-8 sticky top-4 z-40 bg-slate-950/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-2xl">
            <button
              onClick={saveCompliance}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold transition-colors border border-slate-700"
            >
              <Download size={18} />
              <span className="hidden md:inline">Exportar Relatório</span>
            </button>
          </div>

          {/* PILARES */}
          <div className="space-y-6">
            {Object.keys(dynamicModel).map(pillarKey => {
              const pillar = dynamicModel[pillarKey];
              const Icon = pillar.icon;
              const pScore = scores.pillarScores[pillarKey];
              const pPercent = (pScore / pillar.weightTotal) * 100;

              return (
                <div key={pillarKey} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                  {/* Pillar Header */}
                  <div className="p-6 border-b border-slate-800/50 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${pillar.bgIcon} ${pillar.color} border border-slate-700/50`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{pillar.title}</h2>
                        <p className="text-slate-400 text-sm">Peso máximo: {pillar.weightTotal} pontos</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end w-full md:w-auto">
                      <div className="text-2xl font-black text-white">
                        {pScore.toFixed(1)} <span className="text-slate-500 text-base font-medium">/ {pillar.weightTotal}</span>
                      </div>
                      <div className="w-full md:w-32 bg-slate-800 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${pillar.color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, pPercent)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Pillar Items */}
                  <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="p-4 w-1/3">Critério Avaliado</th>
                          <th className="p-4 w-48 text-center">Status</th>
                          <th className="p-4 w-48 text-center">Qualidade</th>
                          <th className="p-4 text-right">Peso/Risco</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {pillar.items.map(item => {
                          const val = formData[pillarKey]?.[item.id] || { status: 'AUSENTE', qualidade: 'REGULAR' };
                          const isAusente = val.status === 'AUSENTE';
                          const hasPenalty = isAusente && item.penalty > 0;
                          
                          return (
                            <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-200">{item.label}</div>
                                {hasPenalty && (
                                  <div className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Risco Crítico Identificado
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <select
                                  value={val.status}
                                  onChange={(e) => handleUpdateItem(pillarKey, item.id, 'status', e.target.value)}
                                  className={`w-full text-xs font-bold p-2.5 rounded-xl border appearance-none text-center outline-none transition-colors cursor-pointer ${
                                    val.status === 'ENTREGUE' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50 focus:border-emerald-500' :
                                    val.status === 'PENDENTE' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50 focus:border-amber-500' :
                                    'bg-slate-900 text-slate-400 border-slate-700 focus:border-slate-500'
                                  }`}
                                >
                                  <option value="ENTREGUE">✓ Entregue</option>
                                  <option value="PENDENTE">⏱ Pendente</option>
                                  <option value="AUSENTE">✕ Ausente</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <select
                                  value={val.qualidade}
                                  onChange={(e) => handleUpdateItem(pillarKey, item.id, 'qualidade', e.target.value)}
                                  disabled={isAusente}
                                  className={`w-full text-xs font-bold p-2.5 rounded-xl border appearance-none text-center outline-none transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                    val.qualidade === 'EXCELENTE' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' :
                                    val.qualidade === 'BOA' ? 'bg-blue-950/40 text-blue-400 border-blue-900/50' :
                                    val.qualidade === 'REGULAR' ? 'bg-slate-800/40 text-slate-300 border-slate-700' :
                                    'bg-red-950/20 text-red-400 border-red-900/30'
                                  }`}
                                >
                                  <option value="EXCELENTE">Excelente (100%)</option>
                                  <option value="BOA">Boa (85%)</option>
                                  <option value="REGULAR">Regular (65%)</option>
                                  <option value="FRACA">Fraca (40%)</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <div className="text-sm font-black text-slate-300">{item.peso} pts</div>
                                {item.penalty > 0 && (
                                  <div className="text-[10px] font-bold text-red-500/70 uppercase mt-0.5 tracking-wider">Fail: -{item.penalty}</div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {!selectedCandidateId && (
        <div className="text-center p-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl mt-6">
          <ShieldCheck size={48} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Nenhum candidato selecionado</h3>
          <p className="text-slate-500 mt-2">Selecione uma administradora no topo para iniciar a análise de Due Diligence.</p>
        </div>
      )}
    </div>
  );
};
