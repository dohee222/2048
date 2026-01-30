import { useState } from 'react';
import { Agentation } from 'agentation';
import { Game2048 } from '@/app/components/Game2048';

export default function App() {
  const [agentationEnabled, setAgentationEnabled] = useState(false);

  return (
    <div className="size-full flex items-center justify-center bg-[#faf8ef] relative">
      {/* Agentation Toggle Button */}
      <button
        onClick={() => setAgentationEnabled(!agentationEnabled)}
        className="absolute top-4 right-4 z-50 bg-[#8f7a66] hover:bg-[#9f8a76] text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
      >
        {agentationEnabled ? '🔍 Agentation ON' : '🔍 Agentation OFF'}
      </button>
      
      {agentationEnabled && <Agentation />}
      
      <Game2048 />
    </div>
  );
}