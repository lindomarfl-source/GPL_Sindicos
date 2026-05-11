import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComplianceManager.jsx"

content = """import React, { useMemo } from 'react';
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
          if (c.documentacao && c.documentacao[item.id] === true) {
            score += item.peso;
            deliveredDocs.push(item);
          } else {
            penalty += item.penalty;
            missingDocs.push(item);
          }
        });

        const finalScore = Math.max(0, score - penalty);
        let riskLevel = 'BAIXO';
        if (penalty >= 15) riskLevel = 'ALTO';
        else if (penalty > 0) riskLevel = 'MÉDIO';

        return {
          ...c,
          complianceScore: finalScore,
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
    let content = `RELATÓRIO GLOBAL DE COMPLIANCE E DUE DILIGENCE\\n===============================================\\n\\n`;
    
    ranking.forEach((c, index) => {
      content += `${index + 1}. ${c.nome} (CNPJ: ${c.registro || 'N/A'})\\n`;
      content += `   NOTA FINAL: ${c.complianceScore.toFixed(2)} / 100\\n`;
      content += `   Risco: ${c.riskLevel} | Pontuação Base: ${c.baseScore.toFixed(2)} | Penalidades: -${c.penaltyTotal}\\n`;
      if (c.missingDocs.length > 0) {
        content += `   Pendências Críticas:\\n`;
        c.missingDocs.forEach(md => {
          content += `    - [FALTA] ${md.label} (Risco: -${md.penalty} pts)\\n`;
        });
      }
      content += `\\n-----------------------------------------------\\n\\n`;
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

              <div className="flex items-center gap-8 md:min-w-[300px] justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base / Penalidades</p>
                  <p className="text-sm font-black text-slate-300">
                    {c.baseScore.toFixed(1)} <span className="text-red-400/70">-{c.penaltyTotal}</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score Final</p>
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
            <p className="text-slate-500 mt-2">Cadastre candidatos e atualize seus documentos para gerar o ranking de Due Diligence.</p>
          </div>
        )}
      </div>
    </div>
  );
};
"""

with open(file_path, "w") as f:
    f.write(content)

print("Patch v3 applied successfully.")
