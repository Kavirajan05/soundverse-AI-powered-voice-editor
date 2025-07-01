'use client';

import React, { useRef, useState } from 'react';
import Recorder from './Recorder';
import AudioEngine from './AudioEngine';
import { parseIntent } from '../utils/intentParser';

const VoiceAssistant = () => {
  const audioEngineRef = useRef();
  const [messages, setMessages] = useState([
    '🎧 Assistant: Welcome! Click "Start Listening" and speak an effect like "add reverb" or "increase gain".',
  ]);
  const [listening, setListening] = useState(false);
  const [speakingUtterance, setSpeakingUtterance] = useState(null);

  // ✅ Speak and auto-listen after speaking
  const speak = (text, shouldContinue = false) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setSpeakingUtterance(null);
      if (shouldContinue) setListening(true); // loop continues
    };
    speechSynthesis.speak(utterance);
    setSpeakingUtterance(utterance);
    setMessages((msgs) => [...msgs, `🤖 Assistant: ${text}`]);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingUtterance(null);
    setMessages((msgs) => [...msgs, `⛔ Assistant speech stopped.`]);
  };

  const handleResult = (text) => {
    if (!text) return;
    setMessages((msgs) => [...msgs, `🧑 User: ${text}`]);

    const intent = parseIntent(text);
    let reply = '';
    switch (intent.effect) {
      case 'reverb':
        audioEngineRef.current?.addReverb();
        reply = 'Added reverb.';
        break;
      case 'reduce-reverb':
        audioEngineRef.current?.reduceReverb();
        reply = 'Reduced reverb.';
        break;
      case 'delay':
        audioEngineRef.current?.addDelay();
        reply = 'Added delay.';
        break;
      case 'gain':
        audioEngineRef.current?.increaseGain();
        reply = 'Increased volume.';
        break;
      case 'pitch-shift':
        if (intent.semitones > 0) {
          audioEngineRef.current?.pitchShiftUp();
          reply = `Pitch shifted up by ${intent.semitones} semitones.`;
        } else {
          audioEngineRef.current?.pitchShiftDown();
          reply = `Pitch shifted down by ${-intent.semitones} semitones.`;
        }
        break;
      default:
        reply = "Sorry, I didn't understand. Try again.";
    }

    // Continue the conversation
    speak(`${reply} What would you like to do next?`, true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioEngineRef.current?.setSource(url);
      setMessages((msgs) => [...msgs, `📂 Loaded file: ${file.name}`]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* 💬 Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold mb-2">🗣️ Chat</h2>
          <div className="h-[400px] overflow-y-auto space-y-2 border p-3 rounded bg-gray-50 text-sm">
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>

          {/* 🎙 Manual Controls - BELOW Chat */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setListening(true)}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              🎙 Start Listening
            </button>
            <button
              onClick={stopSpeaking}
              className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
            >
              🛑 Stop Assistant
            </button>
          </div>
        </div>

        {/* 🎛 Controls & Upload */}
        <div className="w-full md:w-[300px] bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2">🎛 Audio Controls</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="mb-4"
          />
          <AudioEngine
            ref={audioEngineRef}
            src="/sample.mp3"
            impulseUrl="/impulse.wav"
          />

          <div className="flex flex-col gap-2">
            <button
              onClick={() => audioEngineRef.current?.play()}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              ▶️ Play Audio
            </button>
            <button
              onClick={() => audioEngineRef.current?.stop()}
              className="bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              ⏹ Stop Audio
            </button>
            {/* <button
              onClick={() => audioEngineRef.current?.download()}
              className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              💾 Download Modified
            </button> */}
          </div>
        </div>
      </div>

      {/* 🎤 Mic handler */}
      <Recorder onResult={handleResult} listening={listening} onEnd={() => setListening(false)} />
    </div>
  );
};

export default VoiceAssistant;
