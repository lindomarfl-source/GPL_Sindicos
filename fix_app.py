import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/App.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Imports
content = content.replace(
    "import { VisitasManager } from './components/VisitasManager';",
    "import { VisitasManager } from './components/VisitasManager';\nimport { ComplianceManager } from './components/ComplianceManager';"
)

content = content.replace(
    "import { LayoutDashboard, Users, BarChart2, LogOut, CheckCircle2, AlertCircle, X, Mic, Swords, Calendar } from 'lucide-react';",
    "import { LayoutDashboard, Users, BarChart2, LogOut, CheckCircle2, AlertCircle, X, Mic, Swords, Calendar, ShieldCheck } from 'lucide-react';"
)

# NavItems (Desktop)
old_nav = """          <NavItem id="batalha" icon={Swords} label="Batalha" />
          <NavItem id="roteiro" icon={Mic} label="Questionário" />"""
new_nav = """          <NavItem id="batalha" icon={Swords} label="Batalha" />
          <NavItem id="roteiro" icon={Mic} label="Questionário" />
          <NavItem id="compliance" icon={ShieldCheck} label="Compliance" />"""
content = content.replace(old_nav, new_nav)

# Bottom Nav (Mobile)
# The user's mobile nav is pretty full, maybe replace "Batalha" with "Compliance" or just append it.
old_mobile = """        <BottomNavItem id="batalha" icon={Swords} label="Batalha" />
        <button"""
new_mobile = """        <BottomNavItem id="batalha" icon={Swords} label="Batalha" />
        <BottomNavItem id="compliance" icon={ShieldCheck} label="Auditoria" />
        <button"""
content = content.replace(old_mobile, new_mobile)

# Routing components
old_routes = """        {activeTab === 'roteiro' && <QuestionsManager />}"""
new_routes = """        {activeTab === 'roteiro' && <QuestionsManager />}
        {activeTab === 'compliance' && <ComplianceManager />}"""
content = content.replace(old_routes, new_routes)

# Title logic
old_title = """               activeTab === 'roteiro' ? 'Questionário Técnico' : 
               activeTab === 'detalhes' ? 'Ficha Técnica' : 'Portal GPL'}"""
new_title = """               activeTab === 'roteiro' ? 'Questionário Técnico' : 
               activeTab === 'compliance' ? 'Due Diligence & Compliance' :
               activeTab === 'detalhes' ? 'Ficha Técnica' : 'Portal GPL'}"""
content = content.replace(old_title, new_title)

with open(file_path, "w") as f:
    f.write(content)

print("App.jsx patched successfully.")
