-- ==========================================
-- SCRIPT DE ESTRUTURA: PORTAL SINDICO GPL
-- SCHEMA: sindico
-- DATA: 17/04/2026
-- ==========================================

-- 1. Criação do Schema Dedicado
CREATE SCHEMA IF NOT EXISTS sindico;

-- 2. Tabela Principal de Cadastro
-- Armazena os dados básicos do candidato (Aba 1 do seu pedido)
CREATE TABLE IF NOT EXISTS sindico.cadastro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
    registro TEXT UNIQUE NOT NULL, -- CPF ou CNPJ
    responsavel TEXT,
    email TEXT,
    telefone TEXT,
    cidade TEXT DEFAULT 'Porto Alegre',
    status TEXT DEFAULT 'Em análise' CHECK (status IN ('Em análise', 'Entrevistado', 'Finalizado', 'Desclassificado')),
    risco TEXT DEFAULT 'baixo' CHECK (risco IN ('baixo', 'moderado', 'alto')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Experiência e Porte (Mapa de Experiência)
-- Armazena VGV, Unidades e Torres
CREATE TABLE IF NOT EXISTS sindico.experiencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES sindico.cadastro(id) ON DELETE CASCADE,
    vgv TEXT, -- Ex: '150M+'
    total_unidades INTEGER DEFAULT 0,
    total_torres INTEGER DEFAULT 0,
    complexidade TEXT, -- Ex: 'Alta (Clube/Resort)'
    historico_resumo TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(candidato_id)
);

-- 4. Tabela de Documentação (Checklist)
-- Monitora o status de cada documento obrigatório
CREATE TABLE IF NOT EXISTS sindico.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES sindico.cadastro(id) ON DELETE CASCADE,
    codigo_documento TEXT NOT NULL, -- Ex: 'curriculo', 'certidao_criminal'
    status TEXT DEFAULT 'pendente' CHECK (status IN ('entregue', 'pendente', 'não entregue')),
    url_arquivo TEXT,
    data_entrega TIMESTAMPTZ,
    observacao TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(candidato_id, codigo_documento)
);

-- 5. Tabela de Avaliações Técnicas (Scores)
-- Armazena as notas de 0 a 5 e o parecer da comissão
CREATE TABLE IF NOT EXISTS sindico.avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES sindico.cadastro(id) ON DELETE CASCADE,
    comunicacao INTEGER DEFAULT 0 CHECK (comunicacao BETWEEN 0 AND 5),
    lideranca INTEGER DEFAULT 0 CHECK (lideranca BETWEEN 0 AND 5),
    tecnica INTEGER DEFAULT 0 CHECK (tecnica BETWEEN 0 AND 5),
    conflitos INTEGER DEFAULT 0 CHECK (conflitos BETWEEN 0 AND 5),
    planejamento INTEGER DEFAULT 0 CHECK (planejamento BETWEEN 0 AND 5),
    organizacao INTEGER DEFAULT 0 CHECK (organizacao BETWEEN 0 AND 5),
    parecer_comissao TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(candidato_id)
);

-- 6. Tabela de Contratos (Futuro/Expansão)
-- Guardar termos assinados ou contratos de prestação de serviços
CREATE TABLE IF NOT EXISTS sindico.contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES sindico.cadastro(id) ON DELETE CASCADE,
    titulo TEXT,
    status_assinatura TEXT DEFAULT 'pendente',
    arquivo_url TEXT,
    data_emissao TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Função Automática para Atualizar Datas (Sync)
CREATE OR REPLACE FUNCTION sindico.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
CREATE TRIGGER update_cadastro_modtime BEFORE UPDATE ON sindico.cadastro FOR EACH ROW EXECUTE PROCEDURE sindico.update_updated_at_column();
CREATE TRIGGER update_experiencia_modtime BEFORE UPDATE ON sindico.experiencia FOR EACH ROW EXECUTE PROCEDURE sindico.update_updated_at_column();
CREATE TRIGGER update_documentos_modtime BEFORE UPDATE ON sindico.documentos FOR EACH ROW EXECUTE PROCEDURE sindico.update_updated_at_column();
CREATE TRIGGER update_avaliacoes_modtime BEFORE UPDATE ON sindico.avaliacoes FOR EACH ROW EXECUTE PROCEDURE sindico.update_updated_at_column();
CREATE TRIGGER update_contratos_modtime BEFORE UPDATE ON sindico.contratos FOR EACH ROW EXECUTE PROCEDURE sindico.update_updated_at_column();

-- ==========================================
-- SCRIPT FINALIZADO
-- ==========================================
