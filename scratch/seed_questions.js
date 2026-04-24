import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  db: { schema: 'sindico' }
});

const questions = [
  { key: 'obras_aditivos', q: 'Gestão de Obras e Aditivos', d: 'Como o senhor(a) gerencia o equilíbrio financeiro em obras estruturais que extrapolam o orçamento inicial?' },
  { key: 'inadimplencia_estrategia', q: 'Redução de Inadimplência', d: 'Qual sua estratégia técnica para reduzir a dívida do condomínio sem gerar conflitos judiciais excessivos?' },
  { key: 'governanca_transparencia', q: 'Governança e Prestação de Contas', d: 'Qual o seu procedimento ao ser questionado por um morador sobre uma nota fiscal específica durante uma assembleia?' },
  { key: 'lideranca_conflitos', q: 'Liderança e Mediação de Conflitos', d: 'Descreva uma situação real onde o senhor(a) teve que retomar as rédeas de uma assembleia emocionalmente carregada.' },
  { key: 'manutencao_preventiva', q: 'Manutenção Preventiva vs. Corretiva', d: 'Qual sua visão sobre o cronograma de manutenção nos primeiros 90 dias de gestão?' },
  { key: 'gestao_operacional', q: 'Gestão de Staff e Operação', d: 'Como o senhor(a) pretende lidar com a equipe operacional legada para evitar vícios de trabalho?' },
  { key: 'seguranca_lgpd', q: 'Segurança e LGPD no Condomínio', d: 'Como o condomínio está protegido em relação às imagens das câmeras sob sua gestão?' },
  { key: 'prontidao_emergencia', q: 'Compromisso 24h e Protocolos de Crise', d: 'Qual o seu protocolo de resposta para uma emergência grave às 3h da manhã de um domingo?' },
  { key: 'etica_integridade', q: 'Ética e Dilemas de Integridade', d: 'Já enfrentou alguma situação onde teve que negar um pedido irregular de um conselheiro?' },
  { key: 'valor_agregado', q: 'Diferencial Competitivo e VGV', d: 'Por que a GPL deve escolher sua gestão especificamente?' }
];

async function seed() {
  console.log('🚀 Iniciando carga do roteiro oficial...');
  
  // Limpar
  await supabase.from('config_perguntas').delete().neq('key', '0');

  // Inserir
  const { error } = await supabase.from('config_perguntas').insert(questions);
  
  if (error) {
    console.error('❌ Erro na carga:', error);
  } else {
    console.log('✅ Roteiro de 10 perguntas cadastrado com sucesso no banco!');
  }
}

seed();
