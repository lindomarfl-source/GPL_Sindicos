import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/VisitasManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

tabs_snippet = """      {/* TABS DE RODADAS */}
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
      </div>"""

# Remove from top
content = content.replace(tabs_snippet, "")

# Insert above Timeline
timeline_marker = "{/* Timeline */}"

new_timeline = tabs_snippet + "\n\n      " + timeline_marker

content = content.replace(timeline_marker, new_timeline)

with open(file_path, "w") as f:
    f.write(content)

print("Tabs moved.")
