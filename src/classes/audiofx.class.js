class AudioManager {
    constructor() {
        this.path = require("path");
        this.sounds = {};
        this.handles = {};
        this.definitions = {
            stdout: {file: "stdout.wav", volume: 0.4, feedback: true},
            stdin: {file: "stdin.wav", volume: 0.4, feedback: true},
            folder: {file: "folder.wav", feedback: true},
            granted: {file: "granted.wav", feedback: true},
            keyboard: {file: "keyboard.wav", feedback: true},
            theme: {file: "theme.wav", cinematic: true},
            expand: {file: "expand.wav", feedback: true},
            panels: {file: "panels.wav", feedback: true},
            scan: {file: "scan.wav", feedback: true},
            denied: {file: "denied.wav", feedback: true},
            info: {file: "info.wav", feedback: true},
            alarm: {file: "alarm.wav", feedback: true},
            error: {file: "error.wav", feedback: true}
        };
        this.noop = {
            play: () => true,
            stop: () => true,
            unload: () => true
        };
        if (window.settings && window.settings.audio === true && this.performanceSettings().lazyAudio !== true) {
            this.preloadSounds();
        }

        // Return a proxy to avoid errors if sounds aren't loaded
        return new Proxy(this, {
            get: (target, sound) => {
                if (typeof sound !== "string") return target[sound];
                if (sound in target) {
                    return typeof target[sound] === "function" ? target[sound].bind(target) : target[sound];
                }
                return target.soundHandle(sound);
            }
        });
    }

    performanceSettings() {
        if (window.performanceSettings) return window.performanceSettings();
        return {
            profile: "cinematic",
            enableFeedbackAudio: true,
            enableCinematicAudio: true,
            lazyAudio: false
        };
    }

    soundAllowed(name) {
        const definition = this.definitions[name];
        if (!definition || !window.settings || window.settings.audio !== true) return false;

        const performance = this.performanceSettings();
        if (performance.profile === "max") return false;
        if (definition.feedback === true) {
            return window.settings.disableFeedbackAudio === false && performance.enableFeedbackAudio === true;
        }
        if (definition.cinematic === true) {
            return performance.enableCinematicAudio === true;
        }
        return performance.profile !== "max";
    }

    applyVolume() {
        if (!window.Howler || typeof window.Howler.volume !== "function") return;
        const volume = Number(window.settings && window.settings.audioVolume);
        window.Howler.volume(Number.isFinite(volume) ? volume : 1.0);
    }

    ensureSound(name) {
        if (this.sounds[name]) return this.sounds[name];
        const definition = this.definitions[name];
        if (!definition || !window.Howl) return this.noop;

        const options = {
            src: [this.path.join(__dirname, "assets", "audio", definition.file)]
        };
        if (typeof definition.volume === "number") options.volume = definition.volume;

        this.sounds[name] = new window.Howl(options);
        return this.sounds[name];
    }

    preloadSounds() {
        this.applyVolume();
        Object.keys(this.definitions).forEach(name => {
            if (this.soundAllowed(name)) this.ensureSound(name);
        });
    }

    soundHandle(name) {
        if (this.handles[name]) return this.handles[name];
        this.handles[name] = {
            play: (...args) => {
                if (!this.soundAllowed(name)) return true;
                this.applyVolume();
                const sound = this.ensureSound(name);
                return sound && typeof sound.play === "function" ? sound.play(...args) : true;
            },
            stop: (...args) => {
                const sound = this.sounds[name];
                return sound && typeof sound.stop === "function" ? sound.stop(...args) : true;
            },
            unload: () => {
                const sound = this.sounds[name];
                if (sound && typeof sound.unload === "function") sound.unload();
                delete this.sounds[name];
                return true;
            }
        };
        return this.handles[name];
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    AudioManager
    };
}
