import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComplianceManager.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Remove COMPLIANCE_MODEL static object
pattern = re.compile(r"const COMPLIANCE_MODEL = \{.*?\n\};\n", re.DOTALL)
content = re.sub(pattern, "", content)

# 2. Replace dynamicModel logic
old_dynamic_model = """  // Replaces the static juridica items with the ones from globalDocTypes
  const dynamicModel = {
    ...COMPLIANCE_MODEL,
    juridica: {
      ...COMPLIANCE_MODEL.juridica,
      items: (globalDocTypes || []).map(doc => ({
        id: doc.key,
        label: doc.label,
        peso: Math.round(30 / (globalDocTypes?.length || 1)),
        penalty: doc.key.toLowerCase().includes('criminal') ? 15 : (doc.key.toLowerCase().includes('fiscal') ? 10 : 0)
      }))
    }
  };"""

new_dynamic_model = """  // Calculates weights based on criticality and normalizes to 100 points
  const rawItems = (globalDocTypes || []).map(doc => {
    const key = doc.key.toLowerCase();
    const label = doc.label.toLowerCase();
    let rawPeso = 5;
    let penalty = 0;
    
    // Critérios de criticidade
    if (key.includes('criminal') || label.includes('criminal') || key.includes('processos') || label.includes('processos')) {
        rawPeso = 20;
        penalty = 25; // Risco Altíssimo
    } else if (key.includes('fiscal') || label.includes('fiscal') || key.includes('receita') || label.includes('receita') || key.includes('fgts') || key.includes('inss') || key.includes('trabalhista') || label.includes('trabalhista')) {
        rawPeso = 15;
        penalty = 15; // Risco Alto
    } else if (key.includes('contrato') || label.includes('contrato') || key.includes('estatuto') || label.includes('estatuto') || key.includes('cnpj') || label.includes('cnpj')) {
        rawPeso = 10;
        penalty = 10; // Risco Médio
    } else {
        rawPeso = 5;
        penalty = 0; // Risco Baixo
    }

    return { id: doc.key, label: doc.label, rawPeso, penalty };
  });

  const rawSum = rawItems.reduce((acc, item) => acc + item.rawPeso, 0) || 1;
  const items = rawItems.map(item => ({
    ...item,
    peso: parseFloat(((item.rawPeso / rawSum) * 100).toFixed(2))
  }));

  const dynamicModel = {
    conformidade: {
      title: "Conformidade Documental e Risco",
      icon: ShieldCheck,
      color: "text-indigo-400",
      bgIcon: "bg-indigo-500/10",
      weightTotal: 100,
      items: items
    }
  };"""

content = content.replace(old_dynamic_model, new_dynamic_model)

# 3. Update useEffect auto-select condition (pillarKey === 'conformidade' instead of 'juridica')
content = content.replace(
    "if (pillarKey === 'juridica' && c?.documentacao?.[item.id] === true) {",
    "if (pillarKey === 'conformidade' && c?.documentacao?.[item.id] === true) {"
)

with open(file_path, "w") as f:
    f.write(content)

print("Patch v2 applied successfully.")
