let globalAudioContext = null;

export class WavRecorder {
  constructor() {
    this.scriptProcessor = null;
    this.mediaStreamSource = null;
    this.audioInput = [];
    this.recordingLength = 0;
    this.sampleRate = 44100;
    this.stream = null;
    this.onVolumeChange = null;
  }

  async start() {
    this.audioInput = [];
    this.recordingLength = 0;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }
    
    // Ensure context is resumed (crucial for Chrome gesture policy)
    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }
    
    this.sampleRate = globalAudioContext.sampleRate;

    this.mediaStreamSource = globalAudioContext.createMediaStreamSource(stream);
    
    // Create ScriptProcessorNode
    this.scriptProcessor = globalAudioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      this.audioInput.push(new Float32Array(input));
      this.recordingLength += input.length;

      // Real-time volume estimation (RMS)
      let sum = 0;
      for (let i = 0; i < input.length; i++) {
        sum += input[i] * input[i];
      }
      const rms = Math.sqrt(sum / input.length);
      const vol = Math.min(100, Math.round(rms * 400)); // slightly higher sensitivity
      if (this.onVolumeChange) {
        this.onVolumeChange(vol);
      }
    };

    this.mediaStreamSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(globalAudioContext.destination);
    
    this.stream = stream;
  }

  stop() {
    return new Promise((resolve) => {
      if (this.scriptProcessor) {
        try { this.scriptProcessor.disconnect(); } catch (e) {}
      }
      if (this.mediaStreamSource) {
        try { this.mediaStreamSource.disconnect(); } catch (e) {}
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      if (this.recordingLength === 0) {
        resolve(null);
        return;
      }

      // Merge buffers
      const mergedBuffer = this.mergeBuffers(this.audioInput, this.recordingLength);
      
      let maxVal = 0;
      for (let i = 0; i < mergedBuffer.length; i++) {
        const val = Math.abs(mergedBuffer[i]);
        if (val > maxVal) maxVal = val;
      }
      console.log(`[WAV] Stop called. Peak amplitude: ${maxVal.toFixed(5)}, Samples: ${mergedBuffer.length}`);

      // Encode as WAV
      const wavBuffer = this.encodeWAV(mergedBuffer, this.sampleRate);
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      resolve(wavBlob);
    });
  }

  mergeBuffers(buffers, length) {
    const result = new Float32Array(length);
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      result.set(buffers[i], offset);
      offset += buffers[i].length;
    }
    return result;
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    this.floatTo16BitPCM(view, 44, samples);

    return buffer;
  }

  floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
