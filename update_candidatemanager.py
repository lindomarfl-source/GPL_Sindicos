import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Desktop Table Header
old_th = """                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-center">Status</th>"""
new_th = """                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-center">Status</th>"""
content = content.replace(old_th, new_th)

# Desktop Table Row - Registro and Valor
old_td_reg = """                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{candidate.nome}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">{candidate.registro}</div>
                    </td>"""
new_td_reg = """                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{candidate.nome}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {candidate.registro}
                        {candidate.tipo === 'PJ' && candidate.responsavel ? ` • Resp: ${candidate.responsavel}` : ''}
                      </div>
                    </td>"""
content = content.replace(old_td_reg, new_td_reg)

old_td_status = """                    <td className="px-6 py-5 text-center">
                      <Badge status={candidate.status}>{candidate.status}</Badge>
                    </td>"""
new_td_status = """                    <td className="px-6 py-5 text-right">
                      <span className="font-mono text-slate-300 text-sm">{candidate.valor_proposta || '-'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge status={candidate.status}>{candidate.status}</Badge>
                    </td>"""
content = content.replace(old_td_status, new_td_status)

# Mobile View - Registro and Valor
old_mob_reg = """                    <h3 className="font-black text-white uppercase tracking-tight text-lg">{candidate.nome}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{candidate.registro}</p>"""
new_mob_reg = """                    <h3 className="font-black text-white uppercase tracking-tight text-lg">{candidate.nome}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {candidate.registro}
                      {candidate.tipo === 'PJ' && candidate.responsavel ? ` • Resp: ${candidate.responsavel}` : ''}
                    </p>"""
content = content.replace(old_mob_reg, new_mob_reg)

old_mob_val = """                  <div className="flex gap-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-tighter ${candidate.tipo === 'PJ' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {candidate.tipo}
                    </span>
                  </div>"""
new_mob_val = """                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-tighter ${candidate.tipo === 'PJ' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {candidate.tipo}
                    </span>
                    {candidate.valor_proposta && (
                      <span className="font-mono text-slate-400 text-xs">{candidate.valor_proposta}</span>
                    )}
                  </div>"""
content = content.replace(old_mob_val, new_mob_val)

with open(file_path, "w") as f:
    f.write(content)

print("CandidateManager updated.")
