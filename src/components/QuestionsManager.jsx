import React, { useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Button } from './Common';
import { 
  Mic, Plus, Edit3, Trash2, RotateCcw, 
  HelpCircle, MessageSquare, Save, X 
} from 'lucide-react';

export const QuestionsManager = () => {
  const { 
    globalQuestions, 
    addGlobalQuestion, 
    updateGlobalQuestion, 
    deleteGlobalQuestion, 
    resetGlobalQuestions 
  } = useCandidates();

  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({ q: '', d: '' });

  const handleSave = () => {
    if (!formData.q) return;
    
    if (editingKey) {
      updateGlobalQuestion(editingKey, formData);
      setEditingKey(null);
    } else {
      addGlobalQuestion(formData);
      setIsAdding(false);
    }
    setFormData({ q: '', d: '' });
  };

  const startEdit = (item) => {
    setEditingKey(item.key);
    setFormData({ q: item.q, d: item.d });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
            <Mic size={24} className="text-red-500" />
            Roteiro de Entrevista
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Configure as perguntas da sabatina técnica
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="secondary" 
            icon={RotateCcw} 
            onClick={() => window.confirm('Restaurar roteiro padrão?') && resetGlobalQuestions()}
          >
            Padrão
          </Button>
          <Button icon={Plus} onClick={() => { setIsAdding(true); setEditingKey(null); setFormData({ q: '', d: '' }); }}>
            Nova Pergunta
          </Button>
        </div>
      </div>

      {(isAdding || editingKey) && (
        <Card className="p-6 border-blue-500/30 bg-blue-500/5 animate-in zoom-in-95 duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white uppercase tracking-tighter">
                {editingKey ? 'Editar Pergunta' : 'Nova Pergunta Técnica'}
              </h4>
              <button onClick={() => { setIsAdding(false); setEditingKey(null); }} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Título da Pergunta (Curto)</label>
                <input 
                  type="text" 
                  value={formData.q}
                  onChange={(e) => setFormData({...formData, q: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Gestão Orçamentária"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Contexto/Dica para o Avaliador (Longo)</label>
                <textarea 
                  value={formData.d}
                  onChange={(e) => setFormData({...formData, d: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none"
                  placeholder="Ex: Descreva como você lidaria com um déficit imprevisto de 20% no fundo de reserva."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => { setIsAdding(false); setEditingKey(null); }}>Cancelar</Button>
                <Button onClick={handleSave} icon={Save}>Salvar no Roteiro</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {globalQuestions.map((item, idx) => (
          <Card key={item.key} className="p-5 border-slate-800 bg-slate-900/20 hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.q}</h5>
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed">{item.d}</p>
                </div>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(item)}
                  className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => window.confirm('Remover esta pergunta?') && deleteGlobalQuestion(item.key)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-slate-900/40 p-6 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <HelpCircle size={24} />
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] max-w-md mx-auto">
          As alterações feitas aqui serão aplicadas automaticamente na ficha de avaliação de todos os candidatos cadastrados no portal.
        </p>
      </div>
    </div>
  );
};
