'use client';

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

const AudioEngine = forwardRef(({ src, impulseUrl }, ref) => {
  const contextRef = useRef(null);
  const sourceRef = useRef(null);
  const srcRef = useRef(src);
  const gainNode = useRef(null);
  const convolverNode = useRef(null);
  const delayNode = useRef(null);
  const filterNode = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    contextRef.current = ctx;

    gainNode.current = ctx.createGain();
    delayNode.current = ctx.createDelay();
    delayNode.current.delayTime.value = 0.3;

    filterNode.current = ctx.createBiquadFilter();
    filterNode.current.type = 'highpass';
    filterNode.current.frequency.value = 1000;

    convolverNode.current = ctx.createConvolver();

    fetch(impulseUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => ctx.decodeAudioData(buffer))
      .then((decoded) => {
        convolverNode.current.buffer = decoded;
      });

    return () => ctx.close();
  }, [impulseUrl]);

  const connectChain = (buffer, rate = 1.0) => {
    const ctx = contextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;

    source.connect(gainNode.current);
    gainNode.current.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
  };

  useImperativeHandle(ref, () => ({
    play: () => {
      fetch(srcRef.current)
        .then((res) => res.arrayBuffer())
        .then((buffer) => contextRef.current.decodeAudioData(buffer))
        .then((decoded) => connectChain(decoded));
    },

    stop: () => {
      try {
        sourceRef.current?.stop();
      } catch (err) {
        console.warn('Stop failed:', err.message);
      }
    },

    setSource: (newSrc) => {
      if (newSrc) srcRef.current = newSrc;
    },

    addReverb: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(convolverNode.current);
      convolverNode.current.connect(contextRef.current.destination);
    },

    reduceReverb: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(contextRef.current.destination);
    },

    addDelay: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(delayNode.current);
      delayNode.current.connect(contextRef.current.destination);
    },

    removeDelay: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(contextRef.current.destination);
    },

    pitchShiftUp: () => {
      fetch(srcRef.current)
        .then((res) => res.arrayBuffer())
        .then((buffer) => contextRef.current.decodeAudioData(buffer))
        .then((decoded) => connectChain(decoded, Math.pow(2, 2 / 12)));
    },

    pitchShiftDown: () => {
      fetch(srcRef.current)
        .then((res) => res.arrayBuffer())
        .then((buffer) => contextRef.current.decodeAudioData(buffer))
        .then((decoded) => connectChain(decoded, Math.pow(2, -2 / 12)));
    },

    increaseGain: () => {
      gainNode.current.gain.value = 2.0;
    },

    decreaseGain: () => {
      gainNode.current.gain.value = 0.5;
    },

    addFilter: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(filterNode.current);
      filterNode.current.connect(contextRef.current.destination);
    },

    removeFilter: () => {
      gainNode.current.disconnect();
      gainNode.current.connect(contextRef.current.destination);
    },

    async download() {
      const ctx = new OfflineAudioContext(2, 44100 * 40, 44100);
      const res = await fetch(srcRef.current);
      const buffer = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource();
      source.buffer = decoded;

      const gain = ctx.createGain();
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);

      const rendered = await ctx.startRendering();
      const wavBlob = bufferToWav(rendered);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modified_audio.wav';
      a.click();
    },
  }));

  const bufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferView = new ArrayBuffer(length);
    const view = new DataView(bufferView);
    let channels = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos++, str.charCodeAt(i));
      }
    };

    writeString('RIFF');
    view.setUint32(pos, length - 8, true); pos += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numOfChan, true); pos += 2;
    view.setUint32(pos, sampleRate, true); pos += 4;
    view.setUint32(pos, sampleRate * 2 * numOfChan, true); pos += 4;
    view.setUint16(pos, numOfChan * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    writeString('data');
    view.setUint32(pos, length - pos - 4, true); pos += 4;

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  return null;
});

export default AudioEngine;
