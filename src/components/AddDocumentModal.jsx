import React, { useState } from 'react';
import { X, FilePlus, Bookmark, Type, AlertCircle } from 'lucide-react';
import { Button, Card } from './Common';

export const AddDocumentModal = ({ isOpen, onClose, onAdd }) => {
  const [docLabel, setDocLabel] = useState('');
  const [category, setCategory] = useState('Geral');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docLabel.trim()) return;

    // Gera uma chave simplificada a partir do nome do documento
    const key = docLabel
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    onAdd({ key, label: docLabel, category });
    setDocLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-md bg-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
              <FilePlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Novo Documento</h3>
              <p className="text-xs text-slate-400">Adicione uma nova exigência ao edital.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Type size={14} className="text-blue-500" />
              Nome do Documento
            </label>
            <input
              autoFocus
              required
              type="text"
              value={docLabel}
              onChange={(e) => setDocLabel(e.target.value)}
              placeholder="Ex: Certidão de Quitação Eleitoral"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Bookmark size={14} className="text-blue-500" />
              Categoria
            </label>
            <div className="flex gap-2">
              {['Geral', 'Técnico', 'Pessoa Jurídica', 'Outros'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-all ${category === cat ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-3">
            <AlertCircle size={18} className="text-blue-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Este novo documento será aplicado a todos os candidatos em análise para manter a paridade da seleção.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Adicionar Documento</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
