import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/Dashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Add the calculateComplianceScore function inside the component, before stats calculation
helper_func = """
  const calculateComplianceScore = (c) => {
    if (!globalDocTypes || globalDocTypes.length === 0) return 0;
    
    let score = 0;
    let penalty = 0;
    
    const rawItems = globalDocTypes.map(doc => {
      const key = doc.key.toLowerCase();
      const label = doc.label.toLowerCase();
      let rawPeso = 5;
      let penaltyVal = 0;

      if (key.includes('criminal') || label.includes('criminal') || key.includes('processos') || label.includes('processos')) {
          rawPeso = 20; penaltyVal = 25;
      } else if (key.includes('fiscal') || label.includes('fiscal') || key.includes('receita') || label.includes('receita') || key.includes('fgts') || key.includes('inss') || key.includes('trabalhista') || label.includes('trabalhista')) {
          rawPeso = 15; penaltyVal = 15;
      } else if (key.includes('contrato') || label.includes('contrato') || key.includes('estatuto') || label.includes('estatuto') || key.includes('cnpj') || label.includes('cnpj')) {
          rawPeso = 10; penaltyVal = 10;
      } else {
          rawPeso = 5; penaltyVal = 0;
      }
      return { id: doc.key, rawPeso, penalty: penaltyVal };
    });

    const rawSum = rawItems.reduce((acc, item) => acc + item.rawPeso, 0) || 1;
    
    rawItems.forEach(item => {
      const peso = parseFloat(((item.rawPeso / rawSum) * 100).toFixed(2));
      const docStatus = (c.documentacao && c.documentacao[item.id]) ? String(c.documentacao[item.id]).toLowerCase() : '';
      if (docStatus === 'entregue') {
        score += peso;
      } else {
        penalty += item.penalty;
      }
    });

    const docScore = Math.max(0, score - penalty);
    
    const evalData = c.avaliacao || {};
    const evalSum = Object.values(evalData).reduce((a, b) => a + (Number(b) || 0), 0);
    const evalScore = Math.min((evalSum / 30) * 100, 100);

    return (docScore * 0.7) + (evalScore * 0.3);
  };
"""

content = content.replace("  const stats = {", helper_func + "\n  const stats = {")

# 2. Update highScore and topCandidates
old_highScore = """    highScore: Math.max(...candidates.map(c => {
      const vals = Object.values(c.avaliacao || {});
      return vals.length ? (vals.reduce((a,b) => a+(Number(b)||0), 0) / vals.length) : 0;
    })).toFixed(1)"""
new_highScore = """    highScore: Math.max(...candidates.map(c => calculateComplianceScore(c))).toFixed(1)"""
content = content.replace(old_highScore, new_highScore)

old_topCandidates = """  const topCandidates = [...candidates].sort((a,b) => {
    const scoreA = Object.values(a.avaliacao || {}).reduce((x,y) => x+(Number(y)||0), 0) / 6;
    const scoreB = Object.values(b.avaliacao || {}).reduce((x,y) => x+(Number(y)||0), 0) / 6;
    return scoreB - scoreA;
  }).slice(0, 3);"""

new_topCandidates = """  const topCandidates = [...candidates].sort((a,b) => {
    return calculateComplianceScore(b) - calculateComplianceScore(a);
  }).slice(0, 3);"""

content = content.replace(old_topCandidates, new_topCandidates)

# 3. Update barData
old_barData = """  const barData = candidates
    .filter(c => c.status === 'Aprovado')
    .map(c => ({
      name: c.nome.split(' ')[0],
      score: (Object.values(c.avaliacao || {}).reduce((a,b) => a+(Number(b)||0), 0) / 6).toFixed(1),
      docs: Object.values(c.documentacao || {}).filter(v => v === 'entregue').length
    }));"""

new_barData = """  const barData = candidates
    .filter(c => c.status === 'Aprovado')
    .map(c => ({
      name: c.nome.split(' ')[0],
      score: calculateComplianceScore(c).toFixed(1),
      docs: Object.values(c.documentacao || {}).filter(v => v === 'entregue').length
    }));"""

content = content.replace(old_barData, new_barData)

# 4. Update YAxis max domain from 5 to 100
content = content.replace("domain={[0, 5]}", "domain={[0, 100]}")

# 5. Fix display in Top 3 Cards
old_score_display = """<div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Score</p>
                  <Badge color="bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black">
                    {((Object.values(c.avaliacao || {}).reduce((x,y) => x+(Number(y)||0), 0) / 6) || 0).toFixed(1)} / 5.0
                  </Badge>
                </div>"""

new_score_display = """<div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Score Compliance</p>
                  <Badge color="bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black">
                    {calculateComplianceScore(c).toFixed(1)} / 100
                  </Badge>
                </div>"""

content = content.replace(old_score_display, new_score_display)

with open(file_path, "w") as f:
    f.write(content)

print("Patch Dashboard applied successfully.")
