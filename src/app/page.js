'use client';
import VoiceAssistant from '../components/VoiceAssistant'; // adjust path if needed

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
        🎧 Soundverse Voice Assistant
      </h1>
      <p className='text-center font-bold mb-4'>Upload your audio, apply effects in real-time, and download your custom remix instantly.</p>

      <VoiceAssistant />
    </main>
  );
}
