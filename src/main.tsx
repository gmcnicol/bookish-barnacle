import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tailwind.css'
import ProgressionInput from './ui/ProgressionInput'
import VoicingCarousel from './ui/VoicingCarousel'
import VoicingInfoModal from './ui/VoicingInfoModal'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      <ProgressionInput />
      <VoicingCarousel />
      <VoicingInfoModal />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
