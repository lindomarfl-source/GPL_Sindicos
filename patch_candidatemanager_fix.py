import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateManager.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Fix toggleProposal
old_toggle = """  const toggleProposal = (e, id) => {
    e.stopPropagation();
    setVisibleProposals(prev => ({...prev, [id]: !prev[id]}));
  };"""

new_toggle = """  const toggleProposal = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibleProposals(prev => ({...prev, [id]: !prev[id]}));
  };"""

content = content.replace(old_toggle, new_toggle)

# Fix Desktop view missing value
old_desktop = """                        {visibleProposals[candidate.id] ? (
                          <>
                            {candidate.valor_proposta || '-'}
                            <EyeOff size={14} className="text-slate-500" />
                          </>
                        ) : ("""

new_desktop = """                        {visibleProposals[candidate.id] ? (
                          <>
                            <span>{candidate.valor_proposta ? candidate.valor_proposta : 'Não informado'}</span>
                            <EyeOff size={14} className="text-slate-500" />
                          </>
                        ) : ("""

content = content.replace(old_desktop, new_desktop)

# Fix Mobile view missing value
old_mobile = """const val = visibleProposals[c.id] ? (c.valor_proposta ? ` | Proposta: ${c.valor_proposta}` : '') : ' | Proposta: R$ •••••';"""

new_mobile = """const val = visibleProposals[c.id] ? (c.valor_proposta ? ` | Proposta: ${c.valor_proposta}` : ' | Proposta: Não informada') : ' | Proposta: R$ •••••';"""

content = content.replace(old_mobile, new_mobile)

with open(file_path, "w") as f:
    f.write(content)

print("Patch applied")
