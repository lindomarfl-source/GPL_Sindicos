import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComplianceManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update calculation logic
old_calc = """        items.forEach(item => {
          if (c.documentacao && c.documentacao[item.id] === 'entregue') {
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
        };"""

new_calc = """        items.forEach(item => {
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
        
        // Technical Evaluation Score (from candidate's 'avaliacao' - 1 to 5 stars across 6 criteria = 30 max)
        const evalData = c.avaliacao || {};
        const evalSum = Object.values(evalData).reduce((a, b) => a + (Number(b) || 0), 0);
        const evalScore = Math.min((evalSum / 30) * 100, 100);

        // Final Blended Score (70% Documents/Compliance, 30% Technical/Soft Skills)
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
        };"""

# We need to make sure we don't duplicate the docStatus line if it's already there
# Let's replace the whole evaluated block
pattern_evaluated = re.compile(r"const evaluated = candidates.*?return evaluated.sort", re.DOTALL)

new_evaluated = """const evaluated = candidates
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
    return evaluated.sort"""

content = re.sub(pattern_evaluated, new_evaluated, content)


# 2. Add explanatory card and update card UI
header_area = """<div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">"""

explanatory_card = """      {/* EXPLANATORY CARD */}
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

      """ + header_area

content = content.replace(header_area, explanatory_card)

# Update card display
old_scores_display = """<div className="flex items-center gap-8 md:min-w-[300px] justify-end">
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
              </div>"""

new_scores_display = """<div className="flex items-center gap-6 md:min-w-[380px] justify-end">
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
              </div>"""

content = content.replace(old_scores_display, new_scores_display)

with open(file_path, "w") as f:
    f.write(content)

print("Patch v4 applied successfully.")
