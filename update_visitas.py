import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/VisitasManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add activeTab state
old_state = "const [visitas, setVisitas] = useState([]);"
new_state = "const [visitas, setVisitas] = useState([]);\n  const [activeTab, setActiveTab] = useState(1);"
content = content.replace(old_state, new_state)

# 2. Add rodada in insert
old_insert = ".insert([{ ...formData, realizada: false }])"
new_insert = ".insert([{ ...formData, realizada: false, rodada: activeTab }])"
content = content.replace(old_insert, new_insert)

# 3. Add rodada in import
old_import = """           nome_candidato: rest.nome_candidato || 'Importado sem nome',
           realizada: rest.realizada || false
        }));"""
new_import = """           nome_candidato: rest.nome_candidato || 'Importado sem nome',
           realizada: rest.realizada || false,
           rodada: activeTab
        }));"""
content = content.replace(old_import, new_import)

# 4. Filter visitas by activeTab
old_stats = """  // Agrupar visitas por data
  const groupedVisitas = visitas.reduce((acc, visita) => {"""
new_stats = """  const filteredVisitas = visitas.filter(v => (v.rodada || 1) === activeTab);

  // Agrupar visitas por data
  const groupedVisitas = filteredVisitas.reduce((acc, visita) => {"""
content = content.replace(old_stats, new_stats)

old_totals = """  const totalVisitas = visitas.length;
  const visitasRealizadas = visitas.filter(v => v.realizada).length;
  const visitasPendentes = totalVisitas - visitasRealizadas;"""
new_totals = """  const totalVisitas = filteredVisitas.length;
  const visitasRealizadas = filteredVisitas.filter(v => v.realizada).length;
  const visitasPendentes = totalVisitas - visitasRealizadas;"""
content = content.replace(old_totals, new_totals)

# 5. Add Tab UI right after <div className="space-y-6">
old_ui_start = """  return (
    <div className="space-y-6">
      
      {/* Dashboard Cards */}"""

new_ui_start = """  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* TABS DE RODADAS */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-0">
        <button 
           onClick={() => setActiveTab(1)}
           className={`px-8 py-4 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 1 ? 'bg-blue-600 text-white shadow-[0_-5px_20px_rgba(37,99,235,0.2)]' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
          1ª Rodada
        </button>
        <button 
           onClick={() => setActiveTab(2)}
           className={`px-8 py-4 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 2 ? 'bg-purple-600 text-white shadow-[0_-5px_20px_rgba(147,51,234,0.2)]' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
          2ª Rodada
        </button>
      </div>
      
      {/* Dashboard Cards */}"""
content = content.replace(old_ui_start, new_ui_start)

# In case the user adds dates in 2nd round, we should allow them to type or select dates. 
# Right now the select input has hardcoded options:
# <option value="2026-05-06">Quarta-feira - 06/05/2026</option>
# <option value="2026-05-07">Quinta-feira - 07/05/2026</option>
# I should change the select to a standard date input so they can pick any date, since the 2nd round dates are "in blank to be created".
old_select = """              <select
                name="data_visita"
                value={formData.data_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              >
                <option value="" disabled>Selecione a data...</option>
                <option value="2026-05-06">Quarta-feira - 06/05/2026</option>
                <option value="2026-05-07">Quinta-feira - 07/05/2026</option>
              </select>"""

new_select = """              <input
                type="date"
                name="data_visita"
                value={formData.data_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />"""
content = content.replace(old_select, new_select)

with open(file_path, "w") as f:
    f.write(content)

print("VisitasManager updated.")
