import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Fix AttributeGlow
old_glow = """const AttributeGlow = ({ label, value, color, icon: Icon }) => (
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
);"""

new_glow = """const AttributeGlow = ({ label, value, color, icon: Icon }) => {
  const safeValue = Number(value) || 0;
  return (
  <div className="flex flex-col gap-2 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={16} />
      </div>
      <span className="text-xl font-black text-white">{safeValue}</span>
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">{label}</span>
    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000" style={{ width: `${(safeValue/5)*100}%`, backgroundColor: color }}></div>
    </div>
  </div>
)};"""

content = content.replace(old_glow, new_glow)

# 2. Fix ScenarioMatch
old_match = """const ScenarioMatch = ({ title, description, icon: Icon, scores }) => {
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
};"""

new_match = """const ScenarioMatch = ({ title, description, icon: Icon, scores }) => {
  const s0 = Number(scores[0].val) || 0;
  const s1 = Number(scores[1].val) || 0;
  const winner = s0 > s1 ? 0 : s1 > s0 ? 1 : -1;
  const total = s0 + s1 || 1;

  return (
    <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 hover:bg-slate-800/40 transition-all border-l-4" style={{ borderColor: winner === 0 ? '#3b82f6' : winner === 1 ? '#a855f7' : '#64748b' }}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-800 rounded-2xl text-blue-400">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">{title}</h5>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full transition-all" style={{ width: `${(s0/total)*100}%`, backgroundColor: '#3b82f6' }}></div>
              <div className="h-full transition-all" style={{ width: `${(s1/total)*100}%`, backgroundColor: '#a855f7' }}></div>
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase">Eficiência: {Math.max(s0, s1).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};"""

content = content.replace(old_match, new_match)

# 3. Add missing attributes and safe access
old_grid = """                <div className="grid grid-cols-2 gap-4">
                  <AttributeGlow label="Comunicação" value={selectedCandidates[0].avaliacao.comunicacao} color="#3b82f6" icon={Users} />
                  <AttributeGlow label="Comunicação" value={selectedCandidates[1].avaliacao.comunicacao} color="#a855f7" icon={Users} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[0].avaliacao.conflitos} color="#3b82f6" icon={Scale} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[1].avaliacao.conflitos} color="#a855f7" icon={Scale} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[0].avaliacao.lideranca} color="#3b82f6" icon={Shield} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[1].avaliacao.lideranca} color="#a855f7" icon={Shield} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[0].avaliacao.planejamento} color="#3b82f6" icon={Wallet} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[1].avaliacao.planejamento} color="#a855f7" icon={Wallet} />
                </div>"""

new_grid = """                <div className="grid grid-cols-2 gap-4">
                  <AttributeGlow label="Comunicação" value={selectedCandidates[0].avaliacao?.comunicacao} color="#3b82f6" icon={Users} />
                  <AttributeGlow label="Comunicação" value={selectedCandidates[1].avaliacao?.comunicacao} color="#a855f7" icon={Users} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[0].avaliacao?.conflitos} color="#3b82f6" icon={Scale} />
                  <AttributeGlow label="Gestão Conflitos" value={selectedCandidates[1].avaliacao?.conflitos} color="#a855f7" icon={Scale} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[0].avaliacao?.lideranca} color="#3b82f6" icon={Shield} />
                  <AttributeGlow label="Liderança" value={selectedCandidates[1].avaliacao?.lideranca} color="#a855f7" icon={Shield} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[0].avaliacao?.planejamento} color="#3b82f6" icon={Wallet} />
                  <AttributeGlow label="Orçamento" value={selectedCandidates[1].avaliacao?.planejamento} color="#a855f7" icon={Wallet} />
                  <AttributeGlow label="Conh. Técnico" value={selectedCandidates[0].avaliacao?.tecnica} color="#3b82f6" icon={Brain} />
                  <AttributeGlow label="Conh. Técnico" value={selectedCandidates[1].avaliacao?.tecnica} color="#a855f7" icon={Brain} />
                  <AttributeGlow label="Organização" value={selectedCandidates[0].avaliacao?.organizacao} color="#3b82f6" icon={Target} />
                  <AttributeGlow label="Organização" value={selectedCandidates[1].avaliacao?.organizacao} color="#a855f7" icon={Target} />
                </div>"""

content = content.replace(old_grid, new_grid)

# 4. Scenario usage safe access
old_scenarios = """                  <ScenarioMatch 
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
                  />"""

new_scenarios = """                  <ScenarioMatch 
                    title="Obras de Grande Porte" 
                    description="Como o candidato lidará com reformas estruturais e modernização da fachada no GPL."
                    icon={Construction}
                    scores={[
                      { val: ((selectedCandidates[0].avaliacao?.tecnica || 0) + (selectedCandidates[0].avaliacao?.planejamento || 0))/2 },
                      { val: ((selectedCandidates[1].avaliacao?.tecnica || 0) + (selectedCandidates[1].avaliacao?.planejamento || 0))/2 }
                    ]}
                  />
                  <ScenarioMatch 
                    title="Gestão de Tesouraria" 
                    description="Eficiência na redução de inadimplência e otimização de contratos de manutenção."
                    icon={Wallet}
                    scores={[
                      { val: ((selectedCandidates[0].avaliacao?.planejamento || 0) + (selectedCandidates[0].avaliacao?.organizacao || 0))/2 },
                      { val: ((selectedCandidates[1].avaliacao?.planejamento || 0) + (selectedCandidates[1].avaliacao?.organizacao || 0))/2 }
                    ]}
                  />
                  <ScenarioMatch 
                    title="Mediação de Conflitos" 
                    description="Postura diplomática em assembleias e brigas entre vizinhos no cotidiano."
                    icon={Gavel}
                    scores={[
                      { val: ((selectedCandidates[0].avaliacao?.conflitos || 0) + (selectedCandidates[0].avaliacao?.comunicacao || 0))/2 },
                      { val: ((selectedCandidates[1].avaliacao?.conflitos || 0) + (selectedCandidates[1].avaliacao?.comunicacao || 0))/2 }
                    ]}
                  />"""

content = content.replace(old_scenarios, new_scenarios)

# 5. Final verdict safe access
old_verdict = """                    const s1 = Object.values(selectedCandidates[0].avaliacao).reduce((a,b) => a+b, 0);
                    const s2 = Object.values(selectedCandidates[1].avaliacao).reduce((a,b) => a+b, 0);"""

new_verdict = """                    const s1 = Object.values(selectedCandidates[0].avaliacao || {}).reduce((a,b) => a+(Number(b)||0), 0);
                    const s2 = Object.values(selectedCandidates[1].avaliacao || {}).reduce((a,b) => a+(Number(b)||0), 0);"""

content = content.replace(old_verdict, new_verdict)

with open(file_path, "w") as f:
    f.write(content)

print("ComparisonView updated.")
