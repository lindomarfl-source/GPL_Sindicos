import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/Dashboard.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add Legend to recharts imports
content = content.replace(
    "PieChart, Pie, Cell",
    "PieChart, Pie, Cell, Legend"
)

# 2. Fix NaN in highScore
old_high_score = """    highScore: Math.max(...candidates.map(c => {
      const vals = Object.values(c.avaliacao || {});
      return vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
    })).toFixed(1)"""

new_high_score = """    highScore: Math.max(...candidates.map(c => {
      const vals = Object.values(c.avaliacao || {});
      return vals.length ? (vals.reduce((a,b) => a+(Number(b)||0), 0) / vals.length) : 0;
    })).toFixed(1)"""

content = content.replace(old_high_score, new_high_score)

# 3. Fix NaN in topCandidates
old_top_cands = """  const topCandidates = [...candidates].sort((a,b) => {
    const scoreA = Object.values(a.avaliacao || {}).reduce((x,y) => x+y, 0) / 6;
    const scoreB = Object.values(b.avaliacao || {}).reduce((x,y) => x+y, 0) / 6;
    return scoreB - scoreA;
  }).slice(0, 3);"""

new_top_cands = """  const topCandidates = [...candidates].sort((a,b) => {
    const scoreA = Object.values(a.avaliacao || {}).reduce((x,y) => x+(Number(y)||0), 0) / 6;
    const scoreB = Object.values(b.avaliacao || {}).reduce((x,y) => x+(Number(y)||0), 0) / 6;
    return scoreB - scoreA;
  }).slice(0, 3);"""

content = content.replace(old_top_cands, new_top_cands)

# 4. Add docs to barData
old_bar_data = """  const barData = candidates
    .filter(c => c.status === 'Aprovado')
    .map(c => ({
      name: c.nome.split(' ')[0],
      score: (Object.values(c.avaliacao || {}).reduce((a,b) => a+b, 0) / 6).toFixed(1)
    }));"""

new_bar_data = """  const barData = candidates
    .filter(c => c.status === 'Aprovado')
    .map(c => ({
      name: c.nome.split(' ')[0],
      score: (Object.values(c.avaliacao || {}).reduce((a,b) => a+(Number(b)||0), 0) / 6).toFixed(1),
      docs: Object.values(c.documentacao || {}).filter(v => v === 'entregue').length
    }));"""

content = content.replace(old_bar_data, new_bar_data)

# 5. Fix NaN in topCandidates display (down in the JSX)
old_top_jsx = """                  <div className="text-lg font-black text-white">
                    {(Object.values(c.avaliacao || {}).reduce((a,b) => a+b, 0) / 6).toFixed(1)}
                  </div>"""

new_top_jsx = """                  <div className="text-lg font-black text-white">
                    {(Object.values(c.avaliacao || {}).reduce((a,b) => a+(Number(b)||0), 0) / 6).toFixed(1)}
                  </div>"""

content = content.replace(old_top_jsx, new_top_jsx)

# 6. Update BarChart JSX
old_chart = """              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>"""

new_chart = """              <BarChart data={barData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} domain={[0, 5]} tickFormatter={(val) => val.toFixed(1)} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="score" name="Score Técnico" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="docs" name="Docs Entregues" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>"""

content = content.replace(old_chart, new_chart)

with open(file_path, "w") as f:
    f.write(content)

print("Dashboard updated.")
