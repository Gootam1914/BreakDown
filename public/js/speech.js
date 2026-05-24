class VoiceEngine {
    constructor() {
        this.input = document.getElementById('directiveInput');
        this.btn = document.getElementById('voiceToggle');
        this.waveform = document.getElementById('waveform');
        this.chipBay = document.getElementById('chipBay');
        this.isRecording = false;
        this.recognition = null;
        this.initSpeech();
    }
    initSpeech() {
        const SpeechAuth = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechAuth) return console.warn("Web Speech API not supported in this browser.");

        this.recognition = new SpeechAuth();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.onresult = (e) => this.handleResult(e);
        this.btn.addEventListener('click', () => this.toggleRecording());
    }
    toggleRecording() {
        if (this.isRecording) {
            this.recognition.stop();
            this.waveform.classList.add('hidden');
            this.btn.style.background = '#1a1a1a';
            this.analyzeIntent();
        } 
        else {
            this.recognition.start();
            this.waveform.classList.remove('hidden');
            this.btn.style.background = 'var(--neon-cyan)';
        }
        this.isRecording = !this.isRecording;
    }
    handleResult(e) {
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
        }
        if (finalTranscript) this.input.value += finalTranscript + ' ';
    }
    async analyzeIntent() {
        const text = this.input.value;
        if (text.length < 20) return;
        try {
            const res = await fetch('/api/ai/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: text })
            });
            const data = await res.json();

            if (data.chips) {
                this.chipBay.innerHTML = '';
                this.chipBay.classList.remove('hidden');
                data.chips.forEach(chip => {
                    const el = document.createElement('div');
                    el.className = 'chip';
                    el.innerText = chip;
                    el.onclick = () => { this.input.value += ` [${chip}]`; el.remove(); };
                    this.chipBay.appendChild(el);
                });
            }
        } 
        catch (e) { console.error(e); }
    }
}
window.addEventListener('DOMContentLoaded', () => new VoiceEngine());