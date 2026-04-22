import React, { useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { ShieldLogo, Card, Button } from './Common';
import { Lock } from 'lucide-react';

export const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useCandidates();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldLogo className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal de Seleção Síndico GPL</h1>
          <p className="text-slate-400 mt-2">Área restrita à Comissão Organizadora</p>
        </div>

        <Card className="bg-slate-800/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                <Lock className="absolute right-3 top-3 text-slate-500" size={18} />
              </div>
              {error && <p className="text-red-400 text-xs mt-1">Senha incorreta. Tente novamente.</p>}
            </div>
            <Button type="submit" className="w-full py-3">
              Entrar no Sistema
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-slate-500 text-xs mt-8">
          © 2026 Condomínio Grand Park Lindóia. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
