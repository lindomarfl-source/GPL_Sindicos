import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateManager.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Update lucide imports
content = content.replace(
    "import { Search, Plus, Filter, ArrowRight, Edit2, Trash2, Users, Download, Upload, FileText } from 'lucide-react';",
    "import { Search, Plus, Filter, ArrowRight, Edit2, Trash2, Users, Download, Upload, FileText, Eye, EyeOff } from 'lucide-react';"
)

# 2. Add state
old_states = """  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');"""

new_states = """  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [visibleProposals, setVisibleProposals] = useState({});

  const toggleProposal = (e, id) => {
    e.stopPropagation();
    setVisibleProposals(prev => ({...prev, [id]: !prev[id]}));
  };"""
content = content.replace(old_states, new_states)

# 3. Replace Desktop TD
old_desktop_td = """<td className="px-6 py-5 text-right">
                      <span className="font-mono text-slate-300 text-sm">{candidate.valor_proposta || '-'}</span>
                    </td>"""

new_desktop_td = """<td className="px-6 py-5 text-right">
                      <button 
                        onClick={(e) => toggleProposal(e, candidate.id)}
                        className="font-mono text-slate-300 text-sm hover:text-white transition-colors flex items-center justify-end gap-2 w-full ml-auto"
                      >
                        {visibleProposals[candidate.id] ? (
                          <>
                            {candidate.valor_proposta || '-'}
                            <EyeOff size={14} className="text-slate-500" />
                          </>
                        ) : (
                          <>
                            R$ •••••
                            <Eye size={14} className="text-slate-500" />
                          </>
                        )}
                      </button>
                    </td>"""
content = content.replace(old_desktop_td, new_desktop_td)

# 4. Replace Mobile rendering
old_mobile_prop = """const val = c.valor_proposta ? ` | Proposta: ${c.valor_proposta}` : '';"""
new_mobile_prop = """const val = visibleProposals[c.id] ? (c.valor_proposta ? ` | Proposta: ${c.valor_proposta}` : '') : ' | Proposta: R$ •••••';"""
content = content.replace(old_mobile_prop, new_mobile_prop)

# But wait, there is another place in mobile:
old_mobile_div = """<div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {c.registro} {val}
                </div>"""
new_mobile_div = """<div className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-1">
                  <span>{c.registro}</span>
                  <button 
                    onClick={(e) => toggleProposal(e, c.id)} 
                    className="hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    {val}
                    {visibleProposals[c.id] ? <EyeOff size={10} className="ml-1" /> : <Eye size={10} className="ml-1" />}
                  </button>
                </div>"""
content = content.replace(old_mobile_div, new_mobile_div)

with open(file_path, "w") as f:
    f.write(content)

print("Patch applied")
