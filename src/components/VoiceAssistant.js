'use client';

import React, { useRef, useState } from 'react';
import AudioEngine from './AudioEngine';

const VoiceAssistant = () => {
  const audioEngineRef = useRef();
  const [messages, setMessages] = useState([
    'Upload a file and use the buttons above to apply effects.'
  ]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    }
    setMessages((msgs) => [...msgs, `🤖 Assistant: ${text}`]);
  };

  const handleEffect = (action) => {
    try {
      switch (action) {
        case 'play':
          audioEngineRef.current?.play();
          speak('Playing audio.');
          break;
        case 'stop':
          audioEngineRef.current?.stop();
          speak('Stopped audio.');
          break;
        case 'reverb':
          audioEngineRef.current?.addReverb();
          speak('Reverb added.');
          break;
        case 'delay':
          audioEngineRef.current?.addDelay();
          speak('Delay added.');
          break;
        case 'pitch-up':
          audioEngineRef.current?.pitchShiftUp();
          speak('Pitch shifted up.');
          break;
        case 'pitch-down':
          audioEngineRef.current?.pitchShiftDown();
          speak('Pitch shifted down.');
          break;
        case 'gain-up':
          audioEngineRef.current?.increaseGain();
          speak('Gain increased.');
          break;
        case 'gain-down':
          audioEngineRef.current?.decreaseGain();
          speak('Gain decreased.');
          break;
        case 'download':
          audioEngineRef.current?.download();
          speak('Download started.');
          break;
        default:
          speak('Unknown action.');
      }
    } catch (error) {
      console.error(error);
      setMessages((msgs) => [...msgs, `❌ Error: ${error.message}`]);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">🎧 Soundverse Audio Editor</h1>

      {/* Upload Section */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Upload your audio file:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              audioEngineRef.current?.setSource(url);
              setMessages((msgs) => [...msgs, `📂 Loaded file: ${file.name}`]);
            }
          }}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Audio Engine */}
      <AudioEngine
        ref={audioEngineRef}
        src="/sample.mp3"
        impulseUrl="/impulse.wav"
      />

      {/* Button Controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => handleEffect('play')} className="bg-green-600 text-white px-4 py-2 rounded">▶️ Play</button>
        <button onClick={() => handleEffect('stop')} className="bg-red-600 text-white px-4 py-2 rounded">⏹ Stop</button>
        <button onClick={() => handleEffect('reverb')} className="bg-blue-600 text-white px-4 py-2 rounded">🎛 Add Reverb</button>
        <button onClick={() => handleEffect('delay')} className="bg-purple-600 text-white px-4 py-2 rounded">⏱ Add Delay</button>
        <button onClick={() => handleEffect('pitch-up')} className="bg-indigo-600 text-white px-4 py-2 rounded">🔼 Pitch Up</button>
        <button onClick={() => handleEffect('pitch-down')} className="bg-pink-600 text-white px-4 py-2 rounded">🔽 Pitch Down</button>
        <button onClick={() => handleEffect('gain-up')} className="bg-yellow-500 text-white px-4 py-2 rounded">🔊 Gain Up</button>
        <button onClick={() => handleEffect('gain-down')} className="bg-yellow-700 text-white px-4 py-2 rounded">🔉 Gain Down</button>
        <button onClick={() => handleEffect('download')} className="bg-gray-800 text-white px-4 py-2 rounded col-span-2">💾 Download Modified</button>
      </div>

      {/* Message Log */}
      <div className="space-y-1 text-sm text-gray-800">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default VoiceAssistant;
