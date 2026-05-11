import React, { useMemo } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, Download } from 'lucide-react';
import { Card } from './Common';

export const ComplianceManager = () => {
  const { candidates, globalDocTypes } = useCandidates();

  const ranking = useMemo(() => {
    if (!candidates || !globalDocTypes) return [];

    // Calcula os pesos globais
    const rawItems = globalDocTypes.map(doc => {
      const key = doc.key.toLowerCase();
      const label = doc.label.toLowerCase();
      let rawPeso = 5;
      let penalty = 0;

      if (key.includes('criminal') || label.includes('criminal') || key.includes('processos') || label.includes('processos')) {
          rawPeso = 20;
          penalty = 25;
      } else if (key.includes('fiscal') || label.includes('fiscal') || key.includes('receita') || label.includes('receita') || key.includes('fgts') || key.includes('inss') || key.includes('trabalhista') || label.includes('trabalhista')) {
          rawPeso = 15;
          penalty = 15;
      } else if (key.includes('contrato') || label.includes('contrato') || key.includes('estatuto') || label.includes('estatuto') || key.includes('cnpj') || label.includes('cnpj')) {
          rawPeso = 10;
          penalty = 10;
      } else {
          rawPeso = 5;
          penalty = 0;
      }
      return { id: doc.key, label: doc.label, rawPeso, penalty };
    });

    const rawSum = rawItems.reduce((acc, item) => acc + item.rawPeso, 0) || 1;
    const items = rawItems.map(item => ({
      ...item,
      peso: parseFloat(((item.rawPeso / rawSum) * 100).toFixed(2))
    }));

    // Avalia cada candidato
    const evaluated = candidates
      .filter(c => c.status !== 'Reprovado')
      .map(c => {
        let score = 0;
        let penalty = 0;
        const missingDocs = [];
        const deliveredDocs = [];

        items.forEach(item => {
          const docStatus = (c.documentacao && c.documentacao[item.id]) ? String(c.documentacao[item.id]).toLowerCase() : '';
          if (docStatus === 'entregue') {
            score += item.peso;
            deliveredDocs.push(item);
          } else {
            penalty += item.penalty;
            missingDocs.push(item);
          }
        });

        const docScore = Math.max(0, score - penalty);
        
        // Avaliação Técnica (Soft Skills / Technical Skills)
        const evalData = c.avaliacao || {};
        const evalSum = Object.values(evalData).reduce((a, b) => a + (Number(b) || 0), 0);
        const evalScore = Math.min((evalSum / 30) * 100, 100);

        // Score Combinado (70% Conformidade, 30% Qualidade Técnica)
        const finalScore = (docScore * 0.7) + (evalScore * 0.3);

        let riskLevel = 'BAIXO';
        if (penalty >= 15) riskLevel = 'ALTO';
        else if (penalty > 0) riskLevel = 'MÉDIO';

        return {
          ...c,
          complianceScore: finalScore,
          docScore: docScore,
          evalScore: evalScore,
          baseScore: score,
          penaltyTotal: penalty,
          riskLevel,
          missingDocs,
          deliveredDocs
        };
      });

    // Ordena do maior score pro menor
    return evaluated.sort((a, b) => b.complianceScore - a.complianceScore);
  }, [candidates, globalDocTypes]);

  const downloadGlobalReport = () => {
    let content = `RELATÓRIO GLOBAL DE COMPLIANCE E DUE DILIGENCE\n===============================================\n\n`;
    
    ranking.forEach((c, index) => {
      content += `${index + 1}. ${c.nome} (CNPJ: ${c.registro || 'N/A'})\n`;
      content += `   NOTA FINAL: ${c.complianceScore.toFixed(2)} / 100\n`;
      content += `   Risco: ${c.riskLevel} | Pontuação Base: ${c.baseScore.toFixed(2)} | Penalidades: -${c.penaltyTotal}\n`;
      if (c.missingDocs.length > 0) {
        content += `   Pendências Críticas:\n`;
        c.missingDocs.forEach(md => {
          content += `    - [FALTA] ${md.label} (Risco: -${md.penalty} pts)\n`;
        });
      }
      content += `\n-----------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking_compliance_global.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* EXPLANATORY CARD */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
          <ShieldCheck size={20} /> Entendendo o Algoritmo de Ranking
        </h3>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          O <strong>Score Final</strong> é uma composição inteligente de dois pilares: <strong>Conformidade Documental (70%)</strong> e <strong>Qualidade Técnica (30%)</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-200 mb-2">1. Conformidade Documental e Risco</h4>
            <p className="text-slate-400">
              O sistema distribui 100 pontos entre todos os documentos exigidos. Documentos com palavras-chave como <span className="text-red-400 font-bold">Criminal</span> e <span className="text-red-400 font-bold">Processos</span> têm peso maior e geram punição severa (-25 pts) se faltarem. Documentos Fiscais geram alerta alto (-15 pts). Se o documento não for anexado, a nota cai vertiginosamente.
            </p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-200 mb-2">2. Qualidade Técnica (Soft Skills)</h4>
            <p className="text-slate-400">
              O sistema lê as notas (estrelas) dadas na aba "Avaliação Técnica" do perfil do candidato (Comunicação, Liderança, Conhecimento Técnico, etc.). O total de 30 estrelas possíveis é convertido em uma nota de 0 a 100, impulsionando os síndicos que têm boa desenvoltura, mesmo com documentação simples.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Ranking de Conformidade</h1>
              <p className="text-slate-400 text-sm">Análise corporativa de risco gerada automaticamente via documentos entregues.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <button
            onClick={downloadGlobalReport}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold transition-colors border border-slate-700"
          >
            <Download size={18} />
            Exportar Ranking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ranking.map((c, index) => (
          <Card key={c.id} className="relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              c.riskLevel === 'ALTO' ? 'bg-red-500' :
              c.riskLevel === 'MÉDIO' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></div>
            
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black text-white">{index + 1}. {c.nome}</h3>
                  <div className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border ${
                    c.riskLevel === 'ALTO' ? 'bg-red-950/40 text-red-400 border-red-900/50' :
                    c.riskLevel === 'MÉDIO' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' :
                    'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                  }`}>
                    Risco {c.riskLevel}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.missingDocs.map(md => (
                    <span key={md.id} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-950/30 text-red-400/80 border border-red-900/30">
                      <XCircle size={12} /> {md.label} {md.penalty > 0 && `(-${md.penalty})`}
                    </span>
                  ))}
                  {c.missingDocs.length === 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950/30 text-emerald-400/80 border border-emerald-900/30">
                      <CheckCircle2 size={12} /> Toda documentação exigida foi entregue.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 md:min-w-[380px] justify-end">
                <div className="text-right border-r border-slate-800 pr-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score Técnico (30%)</p>
                  <p className="text-lg font-black text-blue-400">
                    {c.evalScore.toFixed(1)}<span className="text-xs text-slate-500 font-medium">/100</span>
                  </p>
                </div>
                
                <div className="text-right border-r border-slate-800 pr-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Docs e Risco (70%)</p>
                  <p className="text-lg font-black text-emerald-400">
                    {c.docScore.toFixed(1)}<span className="text-xs text-slate-500 font-medium">/100</span>
                  </p>
                  {c.penaltyTotal > 0 && <p className="text-[10px] text-red-500 font-bold mt-1">Penalidade: -{c.penaltyTotal}</p>}
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Score Final</p>
                  <div className="text-4xl font-black text-white">
                    {c.complianceScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {ranking.length === 0 && (
          <div className="text-center p-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl mt-6">
            <ShieldCheck size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Nenhum candidato encontrado</h3>
            <p className="text-slate-500 mt-2">Cadastre candidatos e atualize seus documentos para gerar o ranking de Diligência e Conformidade.</p>
          </div>
        )}
      </div>
    </div>
  );
};
