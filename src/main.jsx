import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// No StrictMode: dev double-mount would mint two sessions per visit.
createRoot(document.getElementById('root')).render(<App />)
