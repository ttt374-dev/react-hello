let animationFrameRef = null;
let audioContext = null;
let analyser = null;
let source = null;

export function startVolumeMonitor(stream, setVolume) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const updateVolume = () => {
    
    analyser.getByteFrequencyData(dataArray); 
    const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    setVolume(average)
    animationFrameRef = requestAnimationFrame(updateVolume);
  
    
  };

  updateVolume();
}

export function stopVolumeMonitor() {
  cancelAnimationFrame(animationFrameRef);
  source?.disconnect();
  analyser?.disconnect();
  audioContext?.close();

  animationFrameRef = null;
  audioContext = null;
  analyser = null;
  source = null;
}
