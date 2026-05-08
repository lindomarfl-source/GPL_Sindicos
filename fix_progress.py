import re

file_path_cd = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateDetails.jsx"
with open(file_path_cd, "r") as f:
    cd_content = f.read()

old_progress_fn = """  const progress = React.useMemo(() => {
    console.log('📊 RECALCULANDO PROGRESSO PARA:', candidate?.nome);
    if (!candidate || !globalDocTypes || globalDocTypes.length === 0) return 0;
    
    // 1. Identifica quais documentos são REALMENTE exigidos deste candidato
    const requiredDocs = globalDocTypes.filter(doc => {
      if (doc.category === 'Pessoa Jurídica' && candidate.tipo === 'PF') return false;
      return true;
    });

    if (requiredDocs.length === 0) return 0;

    // 2. Conta apenas os exigidos que estão marcados como 'entregue'
    const docData = candidate.documentacao || {};
    const deliveredCount = requiredDocs.filter(doc => (docData[doc.key] || '').toLowerCase() === 'entregue').length;
    
    // 3. Cálculo final
    const rawProgress = (deliveredCount / requiredDocs.length) * 100;
    console.log(`✅ Progresso: ${deliveredCount} de ${requiredDocs.length} = ${rawProgress}%`);
    
    return Math.min(Math.max(rawProgress, 0), 100);
  }, [candidate, globalDocTypes]);"""

new_progress_fn = """  const docStats = React.useMemo(() => {
    if (!candidate || !globalDocTypes || globalDocTypes.length === 0) return { pct: 0, current: 0, total: 0 };
    
    const requiredDocs = globalDocTypes.filter(doc => {
      if (doc.category === 'Pessoa Jurídica' && candidate.tipo === 'PF') return false;
      return true;
    });

    if (requiredDocs.length === 0) return { pct: 0, current: 0, total: 0 };

    const docData = candidate.documentacao || {};
    const deliveredCount = requiredDocs.filter(doc => (docData[doc.key] || '').toLowerCase() === 'entregue').length;
    const rawProgress = (deliveredCount / requiredDocs.length) * 100;
    
    return {
      pct: Math.min(Math.max(Math.round(rawProgress), 0), 100),
      current: deliveredCount,
      total: requiredDocs.length
    };
  }, [candidate, globalDocTypes]);

  const progress = docStats.pct;"""

cd_content = cd_content.replace(old_progress_fn, new_progress_fn)

old_compliance = """              <ComplianceStatus 
                label="Checklist Documental" 
                total={globalDocTypes?.filter(d => !(d.category === 'Pessoa Jurídica' && candidate.tipo === 'PF')).length}
                current={Object.values(candidate.documentacao || {}).filter(v => v === 'entregue').length}
              />"""

new_compliance = """              <ComplianceStatus 
                label="Checklist Documental" 
                total={docStats.total}
                current={docStats.current}
              />"""

cd_content = cd_content.replace(old_compliance, new_compliance)

with open(file_path_cd, "w") as f:
    f.write(cd_content)


file_path_dash = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/Dashboard.jsx"
with open(file_path_dash, "r") as f:
    dash_content = f.read()

# Fix pending count in dashboard to properly use globalDocTypes
old_dash_stats = """  const stats = {
    total: candidates.length,
    pf: candidates.filter(c => c.tipo === 'PF').length,
    pj: candidates.filter(c => c.tipo === 'PJ').length,
    finalizado: candidates.filter(c => c.status === 'Finalizado').length,
    pendente: candidates.filter(c => Object.values(c.documentacao || {}).some(v => v !== 'entregue')).length,"""

# I need to use `useCandidates` to get globalDocTypes. Wait, globalDocTypes is already available via `useCandidates` inside Dashboard!
# Let's check Dashboard.jsx: `const { candidates } = useCandidates();`
# I should change it to `const { candidates, globalDocTypes } = useCandidates();`

dash_content = dash_content.replace("const { candidates } = useCandidates();", "const { candidates, globalDocTypes } = useCandidates();")

new_dash_stats = """  const stats = {
    total: candidates.length,
    pf: candidates.filter(c => c.tipo === 'PF').length,
    pj: candidates.filter(c => c.tipo === 'PJ').length,
    finalizado: candidates.filter(c => c.status === 'Finalizado').length,
    pendente: candidates.filter(c => {
      const required = (globalDocTypes || []).filter(d => !(d.category === 'Pessoa Jurídica' && c.tipo === 'PF'));
      if (required.length === 0) return false;
      const entregues = required.filter(d => ((c.documentacao || {})[d.key] || '').toLowerCase() === 'entregue').length;
      return entregues < required.length;
    }).length,"""

dash_content = dash_content.replace(old_dash_stats, new_dash_stats)

with open(file_path_dash, "w") as f:
    f.write(dash_content)

print("Progress calculations fixed.")
