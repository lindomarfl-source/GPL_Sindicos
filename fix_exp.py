import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateDetails.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add localExp state
old_state = """  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localParecer, setLocalParecer] = useState('');
  const reportRef = useRef();"""

new_state = """  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localParecer, setLocalParecer] = useState('');
  const [localExp, setLocalExp] = useState({ vgv: '', unidades: '', torres: '' });
  const reportRef = useRef();"""

content = content.replace(old_state, new_state)

# 2. Update useEffect to sync localExp
old_effect = """  React.useEffect(() => {
    if (candidate) {
      setLocalParecer(candidate.parecer || '');
    }
  }, [candidateId, candidate?.id]);"""

new_effect = """  React.useEffect(() => {
    if (candidate) {
      setLocalParecer(candidate.parecer || '');
      setLocalExp(candidate.experiencia || { vgv: '', unidades: '', torres: '' });
    }
  }, [candidateId, candidate?.id]);"""

content = content.replace(old_effect, new_effect)

# 3. Modify updateExperience function
old_update_exp = """  const updateExperience = (key, val) => {
    const expData = { ...(candidate.experiencia || {}) };
    updateCandidate(candidate.id, {
      experiencia: { ...expData, [key]: val }
    });
  };"""

new_update_exp = """  const updateExperience = () => {
    updateCandidate(candidate.id, {
      experiencia: localExp
    });
  };"""

content = content.replace(old_update_exp, new_update_exp)

# 4. Modify the inputs
old_inputs = """              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Activity size={14} /> VGV Sob Gestão
                </div>
                <input 
                  type="text" 
                  value={candidate.experiencia?.vgv || ''} 
                  onChange={(e) => updateExperience('vgv', e.target.value)}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-32"
                  placeholder="Ex: 50M"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Building size={14} /> Total Unidades
                </div>
                <input 
                  type="number" 
                  value={candidate.experiencia?.unidades || ''} 
                  onChange={(e) => updateExperience('unidades', e.target.value)}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Layers size={14} /> Máx. de Torres
                </div>
                <input 
                  type="number" 
                  value={candidate.experiencia?.torres || ''} 
                  onChange={(e) => updateExperience('torres', e.target.value)}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>"""

new_inputs = """              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Activity size={14} /> VGV Sob Gestão
                </div>
                <input 
                  type="text" 
                  value={localExp.vgv || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, vgv: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-32"
                  placeholder="Ex: 50M"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Building size={14} /> Total Unidades
                </div>
                <input 
                  type="number" 
                  value={localExp.unidades || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, unidades: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Layers size={14} /> Máx. de Torres
                </div>
                <input 
                  type="number" 
                  value={localExp.torres || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, torres: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>"""

content = content.replace(old_inputs, new_inputs)

with open(file_path, "w") as f:
    f.write(content)

print("CandidateDetails experience update fixed.")
