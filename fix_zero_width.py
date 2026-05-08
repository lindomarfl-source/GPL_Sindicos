import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Fix AttributeGlow
old_attr = """    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000" style={{ width: `${(safeValue/5)*100}%`, backgroundColor: color }}></div>
    </div>"""

new_attr = """    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      {safeValue > 0 && <div className="h-full transition-all duration-1000" style={{ width: `${(safeValue/5)*100}%`, backgroundColor: color }}></div>}
    </div>"""

content = content.replace(old_attr, new_attr)

# Fix ScenarioMatch
old_scenario = """            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full transition-all" style={{ width: `${(s0/total)*100}%`, backgroundColor: '#3b82f6' }}></div>
              <div className="h-full transition-all" style={{ width: `${(s1/total)*100}%`, backgroundColor: '#a855f7' }}></div>
            </div>"""

new_scenario = """            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              {s0 > 0 && <div className="h-full transition-all" style={{ width: `${(s0/total)*100}%`, backgroundColor: '#3b82f6' }}></div>}
              {s1 > 0 && <div className="h-full transition-all" style={{ width: `${(s1/total)*100}%`, backgroundColor: '#a855f7' }}></div>}
            </div>"""

content = content.replace(old_scenario, new_scenario)

# Fix DocumentCompliance
old_doc = """      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-1000 bg-green-500" style={{ width: `${pct}%` }}></div>
      </div>"""

new_doc = """      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        {pct > 0 && <div className="h-full transition-all duration-1000 bg-green-500" style={{ width: `${pct}%` }}></div>}
      </div>"""

content = content.replace(old_doc, new_doc)

with open(file_path, "w") as f:
    f.write(content)

print("Zero-width elements conditionally removed.")
