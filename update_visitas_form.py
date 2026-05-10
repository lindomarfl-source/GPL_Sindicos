import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/VisitasManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update useCandidates
content = content.replace(
    "const { showNotification } = useCandidates();",
    "const { showNotification, candidates } = useCandidates();"
)

# 2. Update formData initial state
old_formdata = """  const [formData, setFormData] = useState({
    nome_candidato: '',
    data_visita: '',
    hora_visita: '',
    observacao: ''
  });"""
new_formdata = """  const [formData, setFormData] = useState({
    nome_candidato: '',
    responsavel: '',
    data_visita: '',
    hora_visita: '',
    hora_fim: '',
    observacao: ''
  });"""
content = content.replace(old_formdata, new_formdata)

# 3. Update resetForm
old_reset = """  const resetForm = () => {
    setFormData({ nome_candidato: '', data_visita: '', hora_visita: '', observacao: '' });"""
new_reset = """  const resetForm = () => {
    setFormData({ nome_candidato: '', responsavel: '', data_visita: '', hora_visita: '', hora_fim: '', observacao: '' });"""
content = content.replace(old_reset, new_reset)

# 4. Update executeEdit
old_update = """        .update({
          nome_candidato: formData.nome_candidato,
          data_visita: formData.data_visita,
          hora_visita: formData.hora_visita,
          observacao: formData.observacao
        })"""
new_update = """        .update({
          nome_candidato: formData.nome_candidato,
          responsavel: formData.responsavel,
          data_visita: formData.data_visita,
          hora_visita: formData.hora_visita,
          hora_fim: formData.hora_fim,
          observacao: formData.observacao
        })"""
content = content.replace(old_update, new_update)

# 5. Update handleEditClick
old_edit_click = """  const handleEditClick = (visita) => {
    setFormData({
      nome_candidato: visita.nome_candidato,
      data_visita: visita.data_visita,
      hora_visita: visita.hora_visita,
      observacao: visita.observacao || ''
    });"""
new_edit_click = """  const handleEditClick = (visita) => {
    setFormData({
      nome_candidato: visita.nome_candidato,
      responsavel: visita.responsavel || '',
      data_visita: visita.data_visita,
      hora_visita: visita.hora_visita,
      hora_fim: visita.hora_fim || '',
      observacao: visita.observacao || ''
    });"""
content = content.replace(old_edit_click, new_edit_click)

# 6. Form HTML Replacement
old_form_inputs = """          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Síndico / Condomínio</label>
              <input
                type="text"
                name="nome_candidato"
                value={formData.nome_candidato}
                onChange={handleInputChange}
                placeholder="Ex: João (Condomínio Flores)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data da Visita</label>
              <input
                type="date"
                name="data_visita"
                value={formData.data_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hora</label>
              <input
                type="time"
                name="hora_visita"
                value={formData.hora_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
          </div>"""

new_form_inputs = """          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Empresa / Síndico Aprovado</label>
              <select
                name="nome_candidato"
                value={formData.nome_candidato}
                onChange={(e) => {
                  const selNome = e.target.value;
                  const c = candidates.find(cnd => cnd.nome === selNome);
                  setFormData(prev => ({ 
                    ...prev, 
                    nome_candidato: selNome, 
                    responsavel: c ? (c.responsavel || '') : '' 
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              >
                <option value="">Selecione um candidato...</option>
                {candidates.filter(c => c.status === 'Aprovado').map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data da Visita</label>
              <input
                type="date"
                name="data_visita"
                value={formData.data_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hora Início</label>
              <input
                type="time"
                name="hora_visita"
                value={formData.hora_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hora Fim</label>
              <input
                type="time"
                name="hora_fim"
                value={formData.hora_fim}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>"""
content = content.replace(old_form_inputs, new_form_inputs)

# 7. Card UI Replacement
old_card_header = """                        <div className="flex justify-between items-start gap-4 pl-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-black text-white uppercase tracking-tight">{visita.nome_candidato}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                              <MapPin size={14} className="text-blue-400" />
                              <span className="font-medium line-clamp-2">{visita.observacao || 'Sem observações/endereço cadastrado'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                              <div className="text-xl font-black text-white">{visita.hora_visita.substring(0,5)}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Horário</div>
                            </div>
                          </div>
                        </div>"""

new_card_header = """                        <div className="flex justify-between items-start gap-4 pl-2">
                          <div className="flex-1">
                            <div className="flex flex-col gap-1 mb-2">
                              <h4 className="text-xl font-black text-white uppercase tracking-tight">{visita.nome_candidato}</h4>
                              {visita.responsavel && (
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded w-fit">
                                  Resp: {visita.responsavel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                              <MapPin size={14} className="text-blue-400" />
                              <span className="font-medium line-clamp-2">{visita.observacao || 'Sem observações/endereço cadastrado'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                              <div className="text-xl font-black text-white whitespace-nowrap">
                                {visita.hora_visita ? visita.hora_visita.substring(0,5) : ''}
                                {visita.hora_fim ? ` - ${visita.hora_fim.substring(0,5)}` : ''}
                              </div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Horário</div>
                            </div>
                          </div>
                        </div>"""
content = content.replace(old_card_header, new_card_header)

with open(file_path, "w") as f:
    f.write(content)

print("VisitasManager updated successfully.")
