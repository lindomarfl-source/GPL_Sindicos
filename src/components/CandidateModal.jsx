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
    const candidateData = initialData 
      ? { ...initialData, ...formData }
      : {
          ...formData,
          status: 'Em análise',
          documentacao: {},
          avaliacao: {
            comunicacao: 0, lideranca: 0, tecnica: 0, 
            conflitos: 0, planejamento: 0, organizacao: 0
          }
        };
    
    onSave(candidateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-2xl bg-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {initialData ? 'Editar Candidato' : 'Cadastrar Candidato'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialData ? 'Atualize as informações do candidato.' : 'Preencha os dados básicos para iniciar a triagem técnica.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Tipo de Candidatura</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'PF' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${formData.tipo === 'PF' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <User size={18} /> Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'PJ' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${formData.tipo === 'PJ' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <Building size={18} /> Pessoa Jurídica
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
            
            <div className="md:col-span-2">
              <InputField label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} icon={MapPin} placeholder="Porto Alegre" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Finalizar Cadastro</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
