class SpotifyPlayer {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        this.parentId = parentId;
        this.parent = document.getElementById(parentId);
        this.parent.insertAdjacentHTML("beforeend", `<div id="mod_spotify">
            <div id="mod_spotify_inner">
                <h1>
                    <span class="spotify_title">SPOTIFY LINK</span>
                    <span class="spotify_header_controls">
                        <button type="button" title="Fullscreen Spotify" data-spotify-action="fullscreen">${this.icon("fullscreen")}<span>MAX</span></button>
                        <i id="mod_spotify_state">OFFLINE</i>
                    </span>
                </h1>
                <div id="mod_spotify_body"></div>
            </div>
        </div>`);

        this.root = null;
        this.body = null;
        this.statusNode = null;
        this.boundRoot = null;
        this.documentBound = false;
        this.keyboardBound = false;
        this.fullscreenPointerHandledUntil = 0;
        this.fullscreen = false;
        this.running = false;
        this.state = null;
        this.paletteCache = new Map();
        this.paletteRequestId = 0;
        this.activePaletteKey = "";
        this.pollIntervalMs = window.settings && window.settings.spotify && window.settings.spotify.pollIntervalMs || 5000;
        this.refreshNodes();
        this.bind();
        this.renderLocalState();
        this.log("initialized", parentId);
        if (!window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("spotify")) this.start();
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    formatMs(value) {
        const total = Math.max(0, Math.floor((Number(value) || 0) / 1000));
        const minutes = Math.floor(total / 60);
        const seconds = String(total % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    spotifySettings() {
        return window.normalizeSpotifySettings ? window.normalizeSpotifySettings(window.settings.spotify || {}) : (window.settings.spotify || {});
    }

    dynamicPaletteMode() {
        const mode = this.spotifySettings().dynamicPalette || "fullscreen";
        return ["off", "fullscreen", "always"].includes(mode) ? mode : "fullscreen";
    }

    dynamicPaletteAllowed() {
        const mode = this.dynamicPaletteMode();
        if (mode === "off") return false;
        if (mode === "fullscreen" && this.fullscreen !== true) return false;
        return this.spotifySettings().showAlbumArt !== false;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, Number(value) || 0));
    }

    colorDistance(a, b) {
        const dr = (a[0] || 0) - (b[0] || 0);
        const dg = (a[1] || 0) - (b[1] || 0);
        const db = (a[2] || 0) - (b[2] || 0);
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    mixRgb(a, b, bWeight) {
        const weight = this.clamp(bWeight, 0, 1);
        return [0, 1, 2].map(index => Math.round((a[index] || 0) * (1 - weight) + (b[index] || 0) * weight));
    }

    rgbToHsl(rgb) {
        const r = (rgb[0] || 0) / 255;
        const g = (rgb[1] || 0) / 255;
        const b = (rgb[2] || 0) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                default:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {h, s, l};
    }

    hslToRgb(hsl) {
        const h = ((Number(hsl.h) || 0) % 1 + 1) % 1;
        const s = this.clamp(hsl.s, 0, 1);
        const l = this.clamp(hsl.l, 0, 1);
        if (s === 0) {
            const value = Math.round(l * 255);
            return [value, value, value];
        }
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return [
            Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
            Math.round(hue2rgb(p, q, h) * 255),
            Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
        ];
    }

    relativeLuminance(rgb) {
        const channel = value => {
            const next = (value || 0) / 255;
            return next <= 0.03928 ? next / 12.92 : Math.pow((next + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    }

    contrastRatio(a, b) {
        const light = Math.max(this.relativeLuminance(a), this.relativeLuminance(b));
        const dark = Math.min(this.relativeLuminance(a), this.relativeLuminance(b));
        return (light + 0.05) / (dark + 0.05);
    }

    cssRgb(rgb) {
        return [0, 1, 2].map(index => Math.round(this.clamp(rgb[index], 0, 255))).join(", ");
    }

    bestPaletteColor(colors, score) {
        return colors.reduce((best, color) => !best || score(color) > score(best) ? color : best, null);
    }

    tunedAccent(rgb, background) {
        const hsl = this.rgbToHsl(rgb);
        hsl.l = this.clamp(hsl.l, 0.46, 0.72);
        if (hsl.s >= 0.08) hsl.s = this.clamp(Math.max(0.36, hsl.s * 1.08), 0, 0.92);
        let tuned = this.hslToRgb(hsl);
        while (this.contrastRatio(tuned, background) < 3 && hsl.l < 0.86) {
            hsl.l += 0.05;
            tuned = this.hslToRgb(hsl);
        }
        return tuned;
    }

    paletteFromPixels(data) {
        const buckets = new Map();
        for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3];
            if (alpha < 48) continue;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const key = `${r >> 4},${g >> 4},${b >> 4}`;
            const bucket = buckets.get(key) || {count: 0, r: 0, g: 0, b: 0};
            bucket.count++;
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
            buckets.set(key, bucket);
        }
        const colors = Array.from(buckets.values()).map(bucket => {
            const rgb = [
                Math.round(bucket.r / bucket.count),
                Math.round(bucket.g / bucket.count),
                Math.round(bucket.b / bucket.count)
            ];
            return {rgb, count: bucket.count, hsl: this.rgbToHsl(rgb)};
        });
        if (!colors.length) return null;

        const usable = colors.filter(color => !(color.hsl.l > 0.93 && color.hsl.s < 0.18));
        const dominantSet = usable.length ? usable : colors;
        const dominant = this.bestPaletteColor(dominantSet, color => {
            const lightnessWeight = 1.25 - Math.min(0.95, Math.abs(color.hsl.l - 0.42));
            const blackPenalty = color.hsl.l < 0.05 ? 0.45 : 1;
            const whitePenalty = color.hsl.l > 0.88 ? 0.42 : 1;
            return color.count * (0.55 + color.hsl.s * 1.35) * lightnessWeight * blackPenalty * whitePenalty;
        }) || colors[0];
        const accentCandidates = colors.filter(color => color.hsl.l > 0.14 && color.hsl.l < 0.86 && color.hsl.s > 0.10);
        const accentSource = this.bestPaletteColor(accentCandidates.length ? accentCandidates : dominantSet, color => {
            const distance = Math.max(24, this.colorDistance(color.rgb, dominant.rgb)) / 255;
            const lightnessWeight = 1.1 - Math.min(0.75, Math.abs(color.hsl.l - 0.55));
            return color.count * (0.7 + color.hsl.s * 3.2) * lightnessWeight * distance;
        }) || dominant;

        const background = this.mixRgb(dominant.rgb, [2, 4, 6], 0.72);
        const backgroundAlt = this.mixRgb(accentSource.rgb, [3, 6, 8], 0.78);
        const accent = this.tunedAccent(accentSource.rgb, background);
        const muted = this.mixRgb(accent, background, 0.52);
        const text = this.contrastRatio([238, 248, 246], background) >= this.contrastRatio([5, 9, 12], background)
            ? [238, 248, 246]
            : [5, 9, 12];
        const buttonText = this.relativeLuminance(accent) > 0.42 ? [4, 8, 10] : [240, 248, 246];
        return {background, backgroundAlt, accent, muted, text, buttonText};
    }

    extractPalette(imageDataUrl) {
        return new Promise(resolve => {
            if (!imageDataUrl || typeof imageDataUrl !== "string") return resolve(null);
            const image = new Image();
            image.onload = () => {
                try {
                    const size = 48;
                    const canvas = document.createElement("canvas");
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext("2d", {willReadFrequently: true});
                    if (!context) return resolve(null);
                    context.drawImage(image, 0, 0, size, size);
                    resolve(this.paletteFromPixels(context.getImageData(0, 0, size, size).data));
                } catch(error) {
                    resolve(null);
                }
            };
            image.onerror = () => resolve(null);
            image.decoding = "async";
            image.src = imageDataUrl;
        });
    }

    clearDynamicPalette() {
        this.paletteRequestId++;
        this.activePaletteKey = "";
        const props = [
            "--spotify_palette_bg",
            "--spotify_palette_bg_alt",
            "--spotify_palette_accent",
            "--spotify_palette_muted",
            "--spotify_palette_text",
            "--spotify_palette_button_text"
        ];
        [this.root, document.body].forEach(element => {
            if (!element || !element.style) return;
            props.forEach(prop => element.style.removeProperty(prop));
            if (element.classList) element.classList.remove("spotify_palette_dynamic");
        });
        if (this.root && this.root.dataset) delete this.root.dataset.spotifyPalette;
    }

    applyDynamicPalette(palette, key) {
        this.refreshNodes();
        if (!this.root || !palette) return false;
        const values = {
            "--spotify_palette_bg": this.cssRgb(palette.background),
            "--spotify_palette_bg_alt": this.cssRgb(palette.backgroundAlt),
            "--spotify_palette_accent": this.cssRgb(palette.accent),
            "--spotify_palette_muted": this.cssRgb(palette.muted),
            "--spotify_palette_text": this.cssRgb(palette.text),
            "--spotify_palette_button_text": this.cssRgb(palette.buttonText)
        };
        [this.root, document.body].forEach(element => {
            if (!element || !element.style) return;
            Object.keys(values).forEach(prop => element.style.setProperty(prop, values[prop]));
            if (element.classList) element.classList.add("spotify_palette_dynamic");
        });
        this.root.dataset.spotifyPalette = "dynamic";
        this.activePaletteKey = key || "";
        return true;
    }

    updateDynamicPalette(item) {
        this.refreshNodes();
        if (!this.dynamicPaletteAllowed() || !item || !item.imageDataUrl) {
            this.clearDynamicPalette();
            return Promise.resolve(false);
        }
        const key = `${item.imageUrl || item.id || item.uri || "spotify"}:${item.imageDataUrl.length}`;
        if (this.activePaletteKey === key && this.root && this.root.classList.contains("spotify_palette_dynamic")) {
            return Promise.resolve(true);
        }
        const cached = this.paletteCache.get(key);
        if (cached) {
            this.applyDynamicPalette(cached, key);
            return Promise.resolve(true);
        }
        const requestId = ++this.paletteRequestId;
        return this.extractPalette(item.imageDataUrl).then(palette => {
            if (requestId !== this.paletteRequestId) return false;
            if (!palette) {
                this.clearDynamicPalette();
                return false;
            }
            this.paletteCache.set(key, palette);
            if (this.paletteCache.size > 12) {
                const first = this.paletteCache.keys().next().value;
                this.paletteCache.delete(first);
            }
            return this.applyDynamicPalette(palette, key);
        }).catch(() => {
            if (requestId === this.paletteRequestId) this.clearDynamicPalette();
            return false;
        });
    }

    icon(name) {
        const paths = {
            previous: '<rect x="6.2" y="6.4" width="2.2" height="11.2" rx=".3" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M17.5 6.6v10.8L9.8 12z"/>',
            next: '<rect x="15.6" y="6.4" width="2.2" height="11.2" rx=".3" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M6.5 6.6v10.8l7.7-5.4z"/>',
            play: '<path fill="currentColor" stroke="none" d="M9.4 6.35v11.3L17.6 12z"/>',
            pause: '<rect x="8.15" y="6.3" width="2.85" height="11.4" rx=".45" fill="currentColor" stroke="none"/><rect x="13" y="6.3" width="2.85" height="11.4" rx=".45" fill="currentColor" stroke="none"/>',
            shuffle: '<path fill="none" d="M4 7h3c2.5 0 4 2 5.4 5 1.3 3 2.5 5 4.6 5h3"/><path fill="none" d="M17 4l3 3-3 3"/><path fill="none" d="M17 14l3 3-3 3"/><path fill="none" d="M4 17h3c1.2 0 2.2-.5 3-1.6"/>',
            repeat: '<path fill="none" d="M6 7h10l-2-2"/><path fill="none" d="M18 17H8l2 2"/><path fill="none" d="M16 5l3 2-3 2"/><path fill="none" d="M8 19l-3-2 3-2"/>',
            open: '<path fill="none" d="M7 7h10v10H7z"/><path fill="none" d="M11 5h8v8"/><path fill="none" d="M19 5l-8 8"/>',
            sync: '<path fill="none" d="M6 9a6 6 0 0 1 10-3l2 2"/><path fill="none" d="M18 8h-5V3"/><path fill="none" d="M18 15a6 6 0 0 1-10 3l-2-2"/><path fill="none" d="M6 16h5v5"/>',
            logout: '<path fill="none" d="M9 5H5v14h4"/><path fill="none" d="M12 12h8"/><path fill="none" d="M17 8l4 4-4 4"/>',
            connect: '<path fill="none" d="M7 8a5 5 0 0 1 7 0"/><path fill="none" d="M4 5a9 9 0 0 1 13 0"/><path fill="none" d="M10.5 12.5l1.5 1.5 4-4"/><path fill="none" d="M12 18h.01"/>',
            reset: '<path fill="none" d="M7 7a7 7 0 1 1-1.5 7"/><path fill="none" d="M7 3v4H3"/>',
            fullscreen: '<path fill="none" d="M5 10V5h5"/><path fill="none" d="M14 5h5v5"/><path fill="none" d="M19 14v5h-5"/><path fill="none" d="M10 19H5v-5"/>',
            close: '<path fill="none" d="M6 6l12 12"/><path fill="none" d="M18 6L6 18"/>',
            volume: '<path fill="none" d="M4 10v4h4l5 4V6L8 10H4z"/><path fill="none" d="M16 9.5a4 4 0 0 1 0 5"/><path fill="none" d="M18.5 7a7 7 0 0 1 0 10"/>'
        };
        return `<svg class="spotify_icon spotify_icon_${this.escape(name || "play")}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.play}</svg>`;
    }

    actionButton(action, icon, label, title, className = "") {
        const text = label ? `<span>${this.escape(label)}</span>` : "";
        return `<button type="button" class="${className}" title="${this.escape(title || label || action)}" data-spotify-action="${this.escape(action)}">${this.icon(icon)}${text}</button>`;
    }

    asciiTitleMaxChars() {
        return this.fullscreen ? 20 : 16;
    }

    asciiTitle(value) {
        const font = {
            "A": [" ## ", "#  #", "####", "#  #", "#  #"],
            "B": ["### ", "#  #", "### ", "#  #", "### "],
            "C": [" ###", "#   ", "#   ", "#   ", " ###"],
            "D": ["### ", "#  #", "#  #", "#  #", "### "],
            "E": ["####", "#   ", "### ", "#   ", "####"],
            "F": ["####", "#   ", "### ", "#   ", "#   "],
            "G": [" ###", "#   ", "# ##", "#  #", " ###"],
            "H": ["#  #", "#  #", "####", "#  #", "#  #"],
            "I": ["###", " # ", " # ", " # ", "###"],
            "J": ["  ##", "   #", "   #", "#  #", " ## "],
            "K": ["#  #", "# # ", "##  ", "# # ", "#  #"],
            "L": ["#   ", "#   ", "#   ", "#   ", "####"],
            "M": ["#   #", "## ##", "# # #", "#   #", "#   #"],
            "N": ["#  #", "## #", "# ##", "#  #", "#  #"],
            "O": [" ## ", "#  #", "#  #", "#  #", " ## "],
            "P": ["### ", "#  #", "### ", "#   ", "#   "],
            "Q": [" ## ", "#  #", "#  #", "# ##", " ###"],
            "R": ["### ", "#  #", "### ", "# # ", "#  #"],
            "S": [" ###", "#   ", " ## ", "   #", "### "],
            "T": ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
            "U": ["#  #", "#  #", "#  #", "#  #", " ## "],
            "V": ["#   #", "#   #", "#   #", " # # ", "  #  "],
            "W": ["#   #", "#   #", "# # #", "## ##", "#   #"],
            "X": ["#   #", " # # ", "  #  ", " # # ", "#   #"],
            "Y": ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
            "Z": ["####", "   #", "  # ", " #  ", "####"],
            "0": [" ## ", "#  #", "#  #", "#  #", " ## "],
            "1": [" # ", "## ", " # ", " # ", "###"],
            "2": ["### ", "   #", " ## ", "#   ", "####"],
            "3": ["### ", "   #", " ## ", "   #", "### "],
            "4": ["#  #", "#  #", "####", "   #", "   #"],
            "5": ["####", "#   ", "### ", "   #", "### "],
            "6": [" ###", "#   ", "### ", "#  #", " ## "],
            "7": ["####", "   #", "  # ", " #  ", " #  "],
            "8": [" ## ", "#  #", " ## ", "#  #", " ## "],
            "9": [" ## ", "#  #", " ###", "   #", "### "],
            " ": ["  ", "  ", "  ", "  ", "  "],
            "-": ["   ", "   ", "###", "   ", "   "],
            "_": ["   ", "   ", "   ", "   ", "###"],
            ".": [" ", " ", " ", " ", "#"],
            "&": [" ## ", "# # ", " #  ", "# # ", " ## "]
        };
        const maxChars = this.asciiTitleMaxChars();
        const clean = String(value || "NO SIGNAL")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9 &_\-.]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, maxChars) || "NO SIGNAL";
        const rows = ["", "", "", "", ""];
        clean.split("").forEach(char => {
            const glyph = font[char] || font[" "];
            glyph.forEach((line, index) => {
                rows[index] += line.replace(/#/g, "█")+" ";
            });
        });
        return rows.join("\n");
    }

    setStatus(text, mode) {
        this.refreshNodes();
        if (!this.statusNode) return;
        this.statusNode.textContent = text;
        this.root.dataset.spotifyState = mode || "idle";
    }

    log(message, detail) {
        try {
            const suffix = detail ? ` ${detail}` : "";
            ipc.send("log", "info", `SpotifyPlayer: ${message}${suffix}`);
        } catch(error) {}
    }

    closestActionButton(target) {
        if (!target) return null;
        if (target.closest) return target.closest("[data-spotify-action]");
        if (target.parentElement && target.parentElement.closest) return target.parentElement.closest("[data-spotify-action]");
        return null;
    }

    refreshNodes() {
        const root = document.getElementById("mod_spotify");
        if (!root) return false;
        this.root = root;
        this.body = document.getElementById("mod_spotify_body");
        this.statusNode = document.getElementById("mod_spotify_state");
        this.root.classList.toggle("spotify_fullscreen", this.fullscreen === true);
        document.body.classList.toggle("spotify-focus-mode", this.fullscreen === true);
        document.querySelectorAll(".spotify-fullscreen-host").forEach(element => {
            if (element !== this.root.parentElement) element.classList.remove("spotify-fullscreen-host");
        });
        if (this.root.parentElement && this.root.parentElement.classList) {
            this.root.parentElement.classList.toggle("spotify-fullscreen-host", this.fullscreen === true);
        }
        const fullscreenButton = this.root.querySelector("[data-spotify-action='fullscreen']");
        if (fullscreenButton) {
            const iconName = this.fullscreen ? "close" : "fullscreen";
            const label = this.fullscreen ? "MIN" : "MAX";
            if (fullscreenButton.dataset.spotifyIcon !== iconName || fullscreenButton.dataset.spotifyLabel !== label) {
                fullscreenButton.innerHTML = `${this.icon(iconName)}<span>${label}</span>`;
                fullscreenButton.dataset.spotifyIcon = iconName;
                fullscreenButton.dataset.spotifyLabel = label;
            }
            fullscreenButton.title = this.fullscreen ? "Exit Spotify fullscreen" : "Fullscreen Spotify";
        }
        this.bindRoot();
        return true;
    }

    bind() {
        if (!this.documentBound) {
            document.addEventListener("pointerdown", event => this.handleDocumentPointer(event), true);
            this.documentBound = true;
        }
        if (!this.keyboardBound) {
            document.addEventListener("keydown", event => {
                if (event.key === "Escape" && this.fullscreen) this.setFullscreen(false);
            });
            this.keyboardBound = true;
        }
        this.bindRoot();
    }

    bindRoot() {
        if (!this.root || this.boundRoot === this.root) return false;
        this.boundRoot = this.root;
        this.root.addEventListener("pointerdown", event => {
            const button = this.closestActionButton(event.target);
            if (!button || button.dataset.spotifyAction !== "fullscreen") return;
            event.preventDefault();
            event.stopPropagation();
            this.fullscreenPointerHandledUntil = Date.now() + 750;
            this.handleAction("fullscreen", button);
        });
        this.root.addEventListener("click", event => {
            const button = this.closestActionButton(event.target);
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            if (button.dataset.spotifyAction === "fullscreen" && Date.now() < this.fullscreenPointerHandledUntil) return;
            this.handleAction(button.dataset.spotifyAction, button);
        });
        this.root.addEventListener("change", event => {
            const target = event.target;
            if (!target || !target.dataset) return;
            if (target.dataset.spotifyControl === "device") {
                this.control("transfer", {deviceId: target.value, play: true});
            }
            if (target.dataset.spotifyControl === "volume") {
                this.control("volume", {volumePercent: Number(target.value)});
            }
            if (target.dataset.spotifyControl === "seek") {
                this.control("seek", {positionMs: Number(target.value)});
            }
        });
        return true;
    }

    handleDocumentPointer(event) {
        this.refreshNodes();
        if (!this.root || !this.root.getBoundingClientRect) return;
        const rect = this.root.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!inside) return;

        const target = event.target;
        const targetName = target && target.tagName ? target.tagName.toLowerCase() : "node";
        const className = target && typeof target.className === "string" ? target.className : "";
        this.log("pointer", `${targetName}${target && target.id ? `#${target.id}` : ""}${className ? `.${className}` : ""}`);

        const interactive = this.closestActionButton(target) || target && target.closest && target.closest("button,input,select,textarea,[data-spotify-control]");
        if (interactive) return;

        const status = this.state && this.state.status || this.localStatus();
        if (status.enabled && status.configured && !status.connected && !status.authInProgress) {
            event.preventDefault();
            event.stopPropagation();
            this.handleAction("connect", null);
        }
    }

    bindButtons() {
        this.refreshNodes();
        if (!this.root) return;
        this.root.querySelectorAll("[data-spotify-action]").forEach(button => {
            if (button.dataset.spotifyBound === "true") return;
            button.dataset.spotifyBound = "true";
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                if (button.dataset.spotifyAction === "fullscreen" && Date.now() < this.fullscreenPointerHandledUntil) return;
                this.handleAction(button.dataset.spotifyAction, button);
            });
        });
    }

    setFullscreen(active) {
        this.fullscreen = active === true;
        this.refreshNodes();
        this.render();
        if (this.fullscreen) this.start();
        this.log("fullscreen", this.fullscreen ? "open" : "close");
        return true;
    }

    toggleFullscreen() {
        return this.setFullscreen(!this.fullscreen);
    }

    localStatus() {
        const spotify = window.normalizeSpotifySettings ? window.normalizeSpotifySettings(window.settings.spotify || {}) : (window.settings.spotify || {});
        const callbackPort = Number(spotify.callbackPort) || 43879;
        return {
            enabled: spotify.enabled === true,
            configured: spotify.enabled === true && !!spotify.clientId,
            clientId: spotify.clientId || "",
            callbackPort,
            redirectUri: `http://127.0.0.1:${callbackPort}/spotify/callback`,
            pollIntervalMs: Number(spotify.pollIntervalMs) || 5000,
            connected: false,
            authInProgress: false
        };
    }

    renderLocalState() {
        this.state = {status: this.localStatus(), playback: null, devices: []};
        this.render();
    }

    start() {
        if (this.running) return false;
        this.running = true;
        this.refresh();
        this.infoUpdater = setInterval(() => this.refresh(), this.pollIntervalMs);
        this.progressUpdater = setInterval(() => this.tickProgress(), 1000);
        return true;
    }

    stop() {
        if (this.infoUpdater) clearInterval(this.infoUpdater);
        if (this.progressUpdater) clearInterval(this.progressUpdater);
        this.infoUpdater = null;
        this.progressUpdater = null;
        this.running = false;
        return true;
    }

    async refresh() {
        if (!edex.spotify) {
            this.setStatus("UNAVAILABLE", "error");
            return false;
        }
        try {
            const data = await edex.spotify.state();
            this.state = data || {};
            const status = this.state.status || {};
            this.pollIntervalMs = status.pollIntervalMs || this.pollIntervalMs;
            this.render();
            return true;
        } catch(error) {
            this.setStatus("ERROR", "error");
            this.body.innerHTML = `<div class="spotify_empty">${this.escape(error.message || String(error))}</div>`;
            return false;
        }
    }

    tickProgress() {
        if (!this.state || !this.state.playback || !this.state.playback.isPlaying) return;
        const playback = this.state.playback;
        playback.progressMs = Math.min(Number(playback.durationMs) || 0, (Number(playback.progressMs) || 0) + 1000);
        const range = this.root.querySelector("[data-spotify-control='seek']");
        const elapsed = this.root.querySelector(".spotify_elapsed");
        if (range && document.activeElement !== range) range.value = playback.progressMs;
        if (elapsed) elapsed.textContent = this.formatMs(playback.progressMs);
    }

    render() {
        this.refreshNodes();
        const status = this.state && this.state.status || {};
        if (!status.enabled || !status.configured) return this.renderSetup(status);
        if (status.authInProgress && !status.connected) return this.renderConnecting(status);
        if (!status.connected) return this.renderDisconnected(status);
        return this.renderPlayer(this.state);
    }

    renderSetup(status) {
        this.clearDynamicPalette();
        const current = window.normalizeSpotifySettings ? window.normalizeSpotifySettings(window.settings.spotify || {}) : {};
        const callbackPort = status.callbackPort || current.callbackPort || 43879;
        const redirectUri = status.redirectUri || `http://127.0.0.1:${callbackPort}/spotify/callback`;
        this.setStatus("SETUP", "setup");
        this.body.innerHTML = `<div class="spotify_setup">
            <h6 class="spotify_hint">Use your own Spotify Developer app. Select Web API, add this Redirect URI, and paste only the Client ID.</h6>
            <label>
                <span>CLIENT ID</span>
                <input type="text" id="spotifyClientId" value="${this.escape(status.clientId || current.clientId || "")}" spellcheck="false">
            </label>
            <label>
                <span>CALLBACK PORT</span>
                <input type="number" id="spotifyCallbackPort" min="1024" max="65535" value="${callbackPort}">
            </label>
            <label>
                <span>REDIRECT URI</span>
                <input type="text" id="spotifyRedirectUri" value="${this.escape(redirectUri)}" readonly>
            </label>
            <div class="spotify_actions">
                <button type="button" data-spotify-action="save-connect">SAVE + CONNECT</button>
                <button type="button" data-spotify-action="copy-redirect">COPY URI</button>
            </div>
            <h6 class="spotify_hint">Do not paste a Client Secret. Spotify Dashboard must allow the Redirect URI above.</h6>
        </div>`;
        this.bindButtons();
    }

    renderConnecting(status) {
        this.clearDynamicPalette();
        this.setStatus("PAIRING", "auth");
        this.body.innerHTML = `<div class="spotify_empty">
            <strong>WAITING FOR SPOTIFY AUTH</strong>
            <span>${this.escape(status.redirectUri || "")}</span>
            ${status.authUrl ? `<span title="${this.escape(status.authUrl)}">${this.escape(status.authUrl)}</span>` : ""}
            <div class="spotify_actions">
                ${status.authUrl ? `<button type="button" data-spotify-action="open-auth">OPEN SSO</button>` : ""}
                <button type="button" data-spotify-action="refresh">REFRESH</button>
                <button type="button" data-spotify-action="disconnect">CANCEL</button>
            </div>
        </div>`;
        this.bindButtons();
    }

    renderDisconnected(status) {
        this.clearDynamicPalette();
        this.setStatus("READY", "ready");
        this.body.innerHTML = `<div class="spotify_empty">
            <strong>SPOTIFY CONNECT READY</strong>
            <span>${this.escape(status.redirectUri || "")}</span>
            <div class="spotify_actions">
                ${this.actionButton("connect", "connect", "CONNECT", "Connect Spotify")}
                ${this.actionButton("reset", "reset", "RESET", "Reset Spotify setup")}
            </div>
        </div>`;
        this.bindButtons();
    }

    renderPlayer(data) {
        const playback = data.playback || {};
        const item = playback.item || {};
        const devices = Array.isArray(data.devices) ? data.devices : [];
        const activeDevice = devices.find(device => device.isActive) || playback.device || {};
        const duration = Number(playback.durationMs) || 0;
        const progress = Math.max(0, Math.min(duration, Number(playback.progressMs) || 0));
        const image = item.imageDataUrl ? ` style="background-image:url('${item.imageDataUrl}')"` : "";
        const volume = Number(activeDevice.volumePercent);
        const volumeValue = Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) : 0;
        this.setStatus(playback.isPlaying ? "PLAYING" : "PAUSED", playback.isPlaying ? "playing" : "paused");
        this.body.innerHTML = `<div class="spotify_player">
            <div class="spotify_art_shell">
                <div class="spotify_art"${image}>
                    <div class="spotify_art_grid"></div>
                </div>
            </div>
            <div class="spotify_meta">
                <pre class="spotify_ascii_title" title="${this.escape(item.name || "No active playback")}">${this.escape(this.asciiTitle(item.name || "No active playback"))}</pre>
                <strong title="${this.escape(item.name || "No active playback")}">${this.escape(item.name || "No active playback")}</strong>
                <span title="${this.escape(item.artist || "")}">${this.escape(item.artist || "Spotify Connect")}</span>
                <em title="${this.escape(item.album || "")}">${this.escape(item.album || activeDevice.name || "No active device")}</em>
            </div>
            <div class="spotify_progress">
                <span class="spotify_elapsed">${this.formatMs(progress)}</span>
                <input type="range" data-spotify-control="seek" min="0" max="${duration || 1}" value="${progress}" ${duration ? "" : "disabled"}>
                <span>${this.formatMs(duration)}</span>
            </div>
            <div class="spotify_controls">
                ${this.actionButton("previous", "previous", "", "Previous track", "icon_only")}
                ${this.actionButton(playback.isPlaying ? "pause" : "play", playback.isPlaying ? "pause" : "play", "", playback.isPlaying ? "Pause" : "Play", "icon_only primary")}
                ${this.actionButton("next", "next", "", "Next track", "icon_only")}
            </div>
            <div class="spotify_volume" title="Volume ${volumeValue}%">
                <span class="spotify_volume_icon">${this.icon("volume")}</span>
                <input type="range" aria-label="Spotify volume" data-spotify-control="volume" min="0" max="100" value="${volumeValue}" ${activeDevice.supportsVolume === false ? "disabled" : ""}>
            </div>
            ${data.error ? `<h6 class="spotify_hint error">${this.escape(data.error)}</h6>` : ""}
        </div>`;
        this.bindButtons();
        this.updateDynamicPalette(item);
    }

    async handleAction(action, button) {
        try {
            this.log("action", action);
            if (action === "save-connect") return this.saveAndConnect();
            if (action === "copy-redirect") return this.copyRedirect();
            if (action === "connect") return this.connect();
            if (action === "fullscreen") return this.toggleFullscreen();
            if (action === "open-auth") {
                const url = this.state && this.state.status && this.state.status.authUrl;
                if (url) edex.openExternal(url);
                return true;
            }
            if (action === "disconnect" || action === "reset") return this.disconnect(action === "reset");
            if (action === "refresh") return this.refresh();
            if (action === "open") {
                const url = this.state && this.state.playback && this.state.playback.item && this.state.playback.item.externalUrl;
                if (url) edex.openExternal(url);
                return true;
            }
            if (action === "shuffle") return this.control("shuffle", {state: !(this.state && this.state.playback && this.state.playback.shuffleState)});
            if (action === "repeat") return this.control("repeat", {state: this.nextRepeatState()});
            return this.control(action, {});
        } catch(error) {
            this.setStatus("ERROR", "error");
            const hint = this.root.querySelector(".spotify_hint") || this.body;
            if (hint) hint.textContent = error.message || String(error);
            if (button) button.blur();
            return false;
        }
    }

    nextRepeatState() {
        const current = this.state && this.state.playback && this.state.playback.repeatState || "off";
        if (current === "off") return "context";
        if (current === "context") return "track";
        return "off";
    }

    async saveAndConnect() {
        const clientId = this.root.querySelector("#spotifyClientId").value.trim();
        const callbackPort = Number(this.root.querySelector("#spotifyCallbackPort").value);
        const status = await edex.spotify.configure({enabled: true, clientId, callbackPort});
        window.settings.spotify = window.normalizeSpotifySettings(Object.assign({}, window.settings.spotify || {}, status, {enabled: true, clientId, callbackPort}));
        return this.connect();
    }

    copyRedirect() {
        const input = this.root.querySelector("#spotifyRedirectUri");
        if (input && edex.devfs && edex.devfs.copyText) edex.devfs.copyText(input.value);
        return true;
    }

    async connect() {
        this.setStatus("OPENING", "auth");
        this.body.innerHTML = `<div class="spotify_empty">
            <strong>OPENING SPOTIFY SSO</strong>
            <span>Waiting for browser handoff...</span>
        </div>`;
        const result = await edex.spotify.connect();
        this.state = {status: result};
        this.render();
        return true;
    }

    async disconnect(resetConfig) {
        await edex.spotify.disconnect();
        if (resetConfig) {
            await edex.spotify.configure({enabled: false, clientId: ""});
            window.settings.spotify = window.normalizeSpotifySettings({enabled: false, clientId: ""});
        }
        return this.refresh();
    }

    async control(action, options) {
        await edex.spotify.control(action, options || {});
        setTimeout(() => this.refresh(), 500);
        return true;
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        SpotifyPlayer
    };
}
