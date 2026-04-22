import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CandidatesProvider } from './context/CandidatesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CandidatesProvider>
      <App />
    </CandidatesProvider>
  </React.StrictMode>,
)
