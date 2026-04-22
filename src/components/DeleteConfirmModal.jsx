import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button, Card } from './Common';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, candidateName }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText.toUpperCase() === 'EXCLUIR') {
      onConfirm();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-md bg-slate-900 border-red-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
          <p className="text-slate-400 text-sm mb-6">
            Você está prestes a remover permanentemente o candidato <span className="text-white font-bold">"{candidateName}"</span>. Esta ação não poderá ser desfeita.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">
              Digite <span className="text-red-400">EXCLUIR</span> para confirmar
            </label>
            <input
              autoFocus
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(false);
              }}
              placeholder="Digite aqui..."
              className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg py-2.5 px-3 text-white outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono`}
            />
            {error && <p className="text-red-500 text-[10px] mt-1 font-bold italic">A palavra chave está incorreta.</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-500 shadow-lg shadow-red-900/20" 
              onClick={handleConfirm}
              icon={Trash2}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
