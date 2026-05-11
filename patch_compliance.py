import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComplianceManager.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Update useCandidates to include globalDocTypes
content = content.replace(
    "const { candidates, showNotification, refreshData } = useCandidates();",
    "const { candidates, showNotification, refreshData, globalDocTypes } = useCandidates();"
)

# 2. Add dynamicModel construction right after state declarations
state_declarations = """  const [candidate, setCandidate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);"""

dynamic_model_code = """  const [candidate, setCandidate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Replaces the static juridica items with the ones from globalDocTypes
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

content = content.replace(state_declarations, dynamic_model_code)

# 3. Update all COMPLIANCE_MODEL references inside the component to use dynamicModel
content = content.replace("Object.keys(COMPLIANCE_MODEL).forEach(pillarKey => {", "Object.keys(dynamicModel).forEach(pillarKey => {")
content = content.replace("COMPLIANCE_MODEL[pillarKey].items.forEach(item => {", "dynamicModel[pillarKey].items.forEach(item => {")
content = content.replace("Object.keys(COMPLIANCE_MODEL).map(pk => `", "Object.keys(dynamicModel).map(pk => `")
content = content.replace("[${COMPLIANCE_MODEL[pk].title}] - Nota: ${scores.pillarScores[pk].toFixed(2)} / ${COMPLIANCE_MODEL[pk].weightTotal}", "[${dynamicModel[pk].title}] - Nota: ${scores.pillarScores[pk].toFixed(2)} / ${dynamicModel[pk].weightTotal}")
content = content.replace("${COMPLIANCE_MODEL[pk].items.map(item => {", "${dynamicModel[pk].items.map(item => {")

# Render loop replace
content = content.replace("""          <div className="space-y-6">
            {Object.keys(COMPLIANCE_MODEL).map(pillarKey => {
              const pillar = COMPLIANCE_MODEL[pillarKey];""", """          <div className="space-y-6">
            {Object.keys(dynamicModel).map(pillarKey => {
              const pillar = dynamicModel[pillarKey];""")

# 4. Update the useEffect logic to use candidate.documentacao
use_effect_old = """    if (selectedCandidateId) {
      const c = candidates.find(c => c.id === selectedCandidateId);
      setCandidate(c);
      if (c && c.compliance) {
        setFormData(c.compliance);
      } else {
        // Initialize empty state
        const initial = {};
        Object.keys(COMPLIANCE_MODEL).forEach(pillarKey => {
          initial[pillarKey] = {};
          COMPLIANCE_MODEL[pillarKey].items.forEach(item => {
            initial[pillarKey][item.id] = { status: 'AUSENTE', qualidade: 'REGULAR', comments: '' };
          });
        });
        setFormData(initial);
      }
    } else {"""

use_effect_new = """    if (selectedCandidateId) {
      const c = candidates.find(c => c.id === selectedCandidateId);
      setCandidate(c);
      
      const initial = {};
      Object.keys(dynamicModel).forEach(pillarKey => {
        initial[pillarKey] = {};
        dynamicModel[pillarKey].items.forEach(item => {
          let defaultStatus = 'AUSENTE';
          // Auto-select if marked in candidate's documentacao
          if (pillarKey === 'juridica' && c?.documentacao?.[item.id] === true) {
            defaultStatus = 'ENTREGUE';
          }
          initial[pillarKey][item.id] = { status: defaultStatus, qualidade: 'REGULAR', comments: '' };
        });
      });

      if (c && c.compliance) {
        // Merge existing compliance data with the dynamically generated initial state
        const merged = { ...initial };
        Object.keys(c.compliance).forEach(pk => {
          if (merged[pk]) {
            Object.keys(c.compliance[pk]).forEach(itemKey => {
              merged[pk][itemKey] = c.compliance[pk][itemKey];
            });
          }
        });
        setFormData(merged);
      } else {
        setFormData(initial);
      }
    } else {"""

# Do the final replace carefully to not mismatch
content = content.replace(
"""    if (selectedCandidateId) {
      const c = candidates.find(c => c.id === selectedCandidateId);
      setCandidate(c);
      if (c && c.compliance) {
        setFormData(c.compliance);
      } else {
        // Initialize empty state
        const initial = {};
        Object.keys(dynamicModel).forEach(pillarKey => {
          initial[pillarKey] = {};
          dynamicModel[pillarKey].items.forEach(item => {
            initial[pillarKey][item.id] = { status: 'AUSENTE', qualidade: 'REGULAR', comments: '' };
          });
        });
        setFormData(initial);
      }
    } else {""", use_effect_new)

with open(file_path, "w") as f:
    f.write(content)

print("Patch applied successfully.")
