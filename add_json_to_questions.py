import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/QuestionsManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Imports
if "useRef" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useRef } from 'react';")

if "Upload" not in content:
    content = content.replace("import { \n  Mic, Plus, Edit3, Trash2, RotateCcw, \n  HelpCircle, MessageSquare, Save, X \n} from 'lucide-react';", 
                              "import { \n  Mic, Plus, Edit3, Trash2, RotateCcw, \n  HelpCircle, MessageSquare, Save, X, Download, Upload \n} from 'lucide-react';\nimport { supabase } from '../lib/supabaseClient';")

# 2. Add fileInputRef and functions inside component
hook_dest = "  const [deleteConfirm, setDeleteConfirm] = useState(null);"

functions = """  const fileInputRef = useRef(null);

  const downloadJSON = () => {
    const exportData = globalQuestions.map(({ id, created_at, updated_at, ...rest }) => rest);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "questionario_sindicos.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) throw new Error("Formato inválido");
        
        const cleanedData = importedData.map(({ id, created_at, updated_at, ...rest }) => ({
           ...rest,
           key: rest.key || `q_${Math.random().toString(36).substr(2, 9)}`,
           q: rest.q || 'Pergunta sem título',
           d: rest.d || ''
        }));

        // Confirmação para sobrescrever
        if (!window.confirm("Isso irá sobrescrever todo o questionário atual. Deseja continuar?")) return;

        // Limpa a tabela atual
        await supabase.from('config_perguntas').delete().neq('key', 'null');
        
        // Insere os novos
        const { error } = await supabase.from('config_perguntas').insert(cleanedData);

        if (error) throw error;
        
        alert(`${cleanedData.length} perguntas importadas com sucesso! A página será atualizada.`);
        window.location.reload();
      } catch (err) {
        console.error("Erro na importação", err);
        alert("Erro ao importar o arquivo JSON. Verifique o formato.");
      }
      e.target.value = null; // Reseta o input
    };
    reader.readAsText(file);
  };"""

content = content.replace(hook_dest, hook_dest + "\n\n" + functions)

# 3. Add buttons to UI
# We need to find the div that contains "Nova Pergunta" and add the buttons there.
old_buttons = """        <div className="flex gap-3 w-full md:w-auto">
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
        </div>"""

new_buttons = """        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImportJSON} 
          />
          <Button 
            variant="secondary" 
            icon={Upload} 
            onClick={() => fileInputRef.current?.click()}
            title="Importar JSON"
          >
            Importar
          </Button>
          <Button 
            variant="secondary" 
            icon={Download} 
            onClick={downloadJSON}
            title="Exportar JSON"
          >
            Exportar
          </Button>
          <Button 
            variant="secondary" 
            icon={RotateCcw} 
            onClick={() => window.confirm('Restaurar roteiro padrão?') && resetGlobalQuestions()}
            title="Restaurar Padrão"
          >
            Padrão
          </Button>
          <Button icon={Plus} onClick={() => { setIsAdding(true); setEditingKey(null); setFormData({ q: '', d: '' }); }}>
            Nova Pergunta
          </Button>
        </div>"""

content = content.replace(old_buttons, new_buttons)

with open(file_path, "w") as f:
    f.write(content)

print("JSON import/export added to QuestionsManager.")
