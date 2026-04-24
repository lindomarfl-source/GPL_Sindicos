import React, { useState } from 'react';
import { X, User, Building, MapPin, Mail, Phone, Hash, ShieldCheck } from 'lucide-react';
import { Button, Card } from './Common';

const InputField = ({ label, icon: Icon, name, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
      <Icon size={14} className="text-blue-500" />
      {label}
    </label>
    <input
      required
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
    />
  </div>
);

export const CandidateModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'PF',
    registro: '',
    responsavel: '',
    email: '',
    telefone: '',
    cidade: 'Porto Alegre',
    parecer: ''
  });

  // Sincroniza o estado com initialData quando o modal abre
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nome: '',
        tipo: 'PF',
        registro: '',
        responsavel: '',
        email: '',
        telefone: '',
        cidade: 'Porto Alegre',
        parecer: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Garantindo que TODOS os campos do formulário sejam enviados
    const candidateData = {
      ...initialData, // Preserva campos técnicos (documentacao, id, etc)
      nome: formData.nome,
      tipo: formData.tipo,
      registro: formData.registro,
      responsavel: formData.responsavel,
      email: formData.email,
      telefone: formData.telefone,
      cidade: formData.cidade,
      status: formData.status || initialData?.status || 'Em análise',
      risco: formData.risco || initialData?.risco || 'baixo',
      parecer: formData.parecer || initialData?.parecer || ''
    };
    
    console.log('📝 Enviando dados consolidadaos para salvar:', candidateData);
    onSave(candidateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-2xl bg-slate-800 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                {initialData ? 'Editar Perfil' : 'Novo Síndico'}
              </h3>
              <p className="text-[10px] md:text-xs text-slate-400">
                {initialData ? 'Atualize os dados cadastrais.' : 'Preencha os dados básicos abaixo.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:p-6 no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              
              <div className="md:col-span-2">
                <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">Tipo de Candidatura</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'PF' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.tipo === 'PF' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                  >
                    <User size={16} /> Pessoa Física
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'PJ' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.tipo === 'PJ' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                  >
                    <Building size={16} /> Administradora
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <InputField label="Nome / Razão Social" name="nome" value={formData.nome} onChange={handleChange} icon={ShieldCheck} placeholder="Ex: Alpha Gestão Condominial" />
              </div>

              <InputField label={formData.tipo === 'PF' ? "CPF" : "CNPJ"} name="registro" value={formData.registro} onChange={handleChange} icon={Hash} placeholder="000.000.000-00" />
              <InputField label="Responsável" name="responsavel" value={formData.responsavel} onChange={handleChange} icon={User} placeholder="Nome do representante" />
              
              <InputField label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="contato@email.com" />
              <InputField label="Telefone / WhatsApp" name="telefone" value={formData.telefone} onChange={handleChange} icon={Phone} placeholder="(51) 99999-9999" />
              
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Análise de Risco Inicial</label>
                <div className="flex gap-2">
                  {['baixo', 'moderado', 'alto'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, risco: level }))}
                      className={`flex-1 py-2 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${
                        formData.risco === level 
                          ? (level === 'baixo' ? 'bg-green-600 border-green-500 text-white' : level === 'moderado' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-red-600 border-red-500 text-white')
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <InputField label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} icon={MapPin} placeholder="Porto Alegre" />
              </div>

              {/* Espaçador para o teclado mobile não cobrir o último campo */}
              <div className="h-10 md:hidden" />
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="p-5 md:p-6 border-t border-slate-700 bg-slate-800/80 backdrop-blur-md flex justify-end gap-3 sticky bottom-0">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1 md:flex-none">Cancelar</Button>
            <Button type="submit" className="flex-1 md:flex-none">Salvar Dados</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
