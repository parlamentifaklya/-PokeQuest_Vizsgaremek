import React, { createContext, useContext, useState, useEffect } from 'react';

type AudioContextType = {
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const savedVolume = localStorage.getItem('volume');
  const initialVolume = savedVolume ? Number(savedVolume) : 50;

  const [volume, setVolume] = useState<number>(initialVolume); 

  useEffect(() => {
    const audioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (audioCtx) {
      const context = new audioCtx();

    } else {
      console.error('Your browser does not support AudioContext');
    }
  }, []); 

  useEffect(() => {
    localStorage.setItem('volume', String(volume)); 
  }, [volume]);

  return (
    <AudioContext.Provider value={{ volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
