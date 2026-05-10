import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    '<th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-right">Valor</th>',
    '<th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-right">Proposta R$</th>'
)

with open(file_path, "w") as f:
    f.write(content)

print("Title updated.")
