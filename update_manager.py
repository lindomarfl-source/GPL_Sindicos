import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add state for filterStatus
content = content.replace("const [searchTerm, setSearchTerm] = useState('');", "const [searchTerm, setSearchTerm] = useState('');\n  const [filterStatus, setFilterStatus] = useState('Todos');")

# 2. Update filteredCandidates logic
old_filter = """  const filteredCandidates = candidates.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );"""

new_filter = """  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    todos: candidates.length,
    aprovados: candidates.filter(c => c.status === 'Aprovado').length,
    reprovados: candidates.filter(c => c.status === 'Reprovado').length,
    analise: candidates.filter(c => c.status === 'Em análise' || !c.status).length
  };"""
content = content.replace(old_filter, new_filter)

# 3. Add Tabs above the Table
old_card_open = '<Card className="p-0 overflow-hidden border-slate-800 shadow-2xl bg-transparent md:bg-slate-900/40">'
new_tabs = """      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button onClick={() => setFilterStatus('Todos')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === 'Todos' ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
          Todos ({counts.todos})
        </button>
        <button onClick={() => setFilterStatus('Aprovado')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${filterStatus === 'Aprovado' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-slate-800/50 text-slate-400 hover:text-green-400 hover:bg-slate-800'}`}>
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Aprovados ({counts.aprovados})
        </button>
        <button onClick={() => setFilterStatus('Em análise')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${filterStatus === 'Em análise' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-blue-400 hover:bg-slate-800'}`}>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Em Análise ({counts.analise})
        </button>
        <button onClick={() => setFilterStatus('Reprovado')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${filterStatus === 'Reprovado' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-red-400 hover:bg-slate-800'}`}>
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Reprovados ({counts.reprovados})
        </button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-800 shadow-2xl bg-transparent md:bg-slate-900/40">"""
content = content.replace(old_card_open, new_tabs)

# 4. Row styling for table
old_tr = """className="hover:bg-blue-500/5 transition-colors cursor-pointer group border-b border-slate-800/50" """
new_tr = """className={`cursor-pointer group border-b transition-all ${
                      candidate.status === 'Aprovado' ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' :
                      candidate.status === 'Reprovado' ? 'border-slate-800/30 opacity-60 hover:opacity-100 bg-transparent' :
                      'border-slate-800/50 hover:bg-blue-500/5'
                    }`} """
content = content.replace(old_tr, new_tr)

# 5. Card styling for mobile
old_card = """className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 active:scale-[0.98] transition-all space-y-4\""""
new_card = """className={`rounded-2xl p-5 active:scale-[0.98] transition-all space-y-4 border ${
                  candidate.status === 'Aprovado' ? 'border-green-500/40 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]' :
                  candidate.status === 'Reprovado' ? 'border-slate-800/50 bg-slate-900/30 opacity-70' :
                  'bg-slate-900/60 border-slate-800'
                }`}"""
content = content.replace(old_card, new_card)

with open(file_path, "w") as f:
    f.write(content)

print("Manager updated.")
