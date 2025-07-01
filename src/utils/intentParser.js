// src/utils/intentParser.js

export function parseIntent(transcript) {
  let text = transcript.toLowerCase();

  // 🔢 Convert number words to digits
  const numberWords = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  for (const word in numberWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    text = text.replace(regex, numberWords[word]);
  }

  // 🎧 Intent detection
  if (text.includes("reverb")) {
    return { effect: "reverb" };
  }

  if (text.includes("delay")) {
    return { effect: "delay" };
  }

  const pitchMatch = text.match(/pitch shift (up|down) (\d+)/);
  if (pitchMatch) {
    const direction = pitchMatch[1];
    const semitones = parseInt(pitchMatch[2], 10);
    return {
      effect: "pitch-shift",
      semitones: direction === "up" ? semitones : -semitones,
    };
  }

  if (text.includes("filter")) {
    return { effect: "filter" };
  }

  if (text.includes("gain") || text.includes("volume")) {
    return { effect: "gain" };
  }

  return { effect: "unknown" };
}

