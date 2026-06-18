class LocationGlobe {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_globe">
            <div id="mod_globe_innercontainer">
                <h1>WORLD VIEW<i>GLOBAL NETWORK MAP</i></h1>
                <h2>ENDPOINT LAT/LON<i class="mod_globe_headerInfo">0.0000, 0.0000</i></h2>
                <div id="mod_globe_canvas_placeholder"></div>
                <h3>OFFLINE</h3>
            </div>
        </div>`;

        this.lastgeo = {};
        this.conns = [];
        this.running = false;
        this.loading = false;
        this.globeReady = false;
        this._geodata = null;
        this.ENCOM = null;
        this.mode = () => window.normalizeWidgetSettings ? window.normalizeWidgetSettings().globeMode || "full" : "full";
        this._animate = () => this.animate();

        this.addConn = ip => {
            if (!this.globe || !window.isGlobeConnectionMode || !window.isGlobeConnectionMode()) return false;
            let data = null;
            try {
                data = window.mods.netstat.geoLookup.get(ip);
            } catch(e) {
                // Geo database may not be loaded.
            }
            let geo = (data !== null ? data.location : {});
            if (geo.latitude && geo.longitude) {
                const lat = Number(geo.latitude);
                const lon = Number(geo.longitude);
                this.conns.push({
                    ip,
                    pin: this.globe.addPin(lat, lon, "", 1.2),
                });
            }
        };
        this.removeConn = ip => {
            let index = this.conns.findIndex(x => x.ip === ip);
            if (index === -1) return false;
            this.conns[index].pin.remove();
            this.conns.splice(index, 1);
            return true;
        };

        const widgets = window.normalizeWidgetSettings ? window.normalizeWidgetSettings() : {};
        const performance = window.performanceSettings ? window.performanceSettings() : {pauseHiddenWidgets: true};
        const visible = widgets.visible !== false && widgets.networkPanel !== false && widgets.globe !== false && widgets.globeMode !== "hidden";
        if (visible || performance.pauseHiddenWidgets === false) this.start();
    }

    static loadVendor() {
        if (window.ENCOM) return Promise.resolve(window.ENCOM);
        if (window.__edexEncomGlobePromise) return window.__edexEncomGlobePromise;

        window.__edexEncomGlobePromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "assets/vendor/encom-globe.js";
            script.onload = () => resolve(window.ENCOM);
            script.onerror = () => reject(new Error("Unable to load globe renderer"));
            document.head.appendChild(script);
        });
        return window.__edexEncomGlobePromise;
    }

    start() {
        const performance = window.performanceSettings ? window.performanceSettings() : {enableGlobeByDefault: true};
        if (this.running) return false;
        if (performance.enableGlobeByDefault === false || this.mode() === "hidden") {
            this.setOfflineLabel(this.mode() === "hidden" ? "HIDDEN" : "DISABLED");
            return false;
        }
        this.running = true;
        this.ensureGlobe().then(() => {
            if (!this.running || !this.globe) return;
            this.startAnimation();
            if (this.locUpdater || this.connsUpdater) return;
            this.refresh();
            this.locUpdater = setInterval(() => {
                this.updateLoc();
            }, window.performanceTiming ? window.performanceTiming().globeLocationInterval : 5000);
            this.connsUpdater = setInterval(() => {
                this.updateConns();
            }, window.performanceTiming ? window.performanceTiming().globeConnectionsInterval : 5000);
        }).catch(error => {
            console.warn(error);
            this.setOfflineLabel("UNAVAILABLE");
        });
        return true;
    }

    stop() {
        if (this.locUpdater) clearInterval(this.locUpdater);
        if (this.connsUpdater) clearInterval(this.connsUpdater);
        if (this.animationTimeout) clearTimeout(this.animationTimeout);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.locUpdater = null;
        this.connsUpdater = null;
        this.animationTimeout = null;
        this.animationFrame = null;
        this.running = false;
        return true;
    }

    refresh() {
        this.updateLoc();
        this.updateConns();
    }

    destroy() {
        this.stop();
        if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);
    }

    async ensureGlobe() {
        if (this.globeReady || this.loading) return this.loading || Promise.resolve(true);
        this.loading = Promise.all([
            LocationGlobe.loadVendor(),
            Promise.resolve().then(() => {
                const path = require("path");
                return require(path.join(__dirname, "assets/misc/grid.json"));
            })
        ]).then(([ENCOM, geodata]) => {
            this.ENCOM = ENCOM;
            this._geodata = geodata;
            this.loading = false;
            if (!this.running) return false;
            this.createGlobe();
            this.globeReady = !!this.globe;
            return this.globeReady;
        }).catch(error => {
            this.loading = false;
            throw error;
        });
        return this.loading;
    }

    createGlobe() {
        if (this.globe) return;

        let container = document.getElementById("mod_globe_innercontainer");
        let placeholder = document.getElementById("mod_globe_canvas_placeholder");
        if (!container || !placeholder || !this.ENCOM || !this._geodata) return;

        this.globe = new this.ENCOM.Globe(placeholder.offsetWidth, placeholder.offsetHeight, {
            font: window.theme.cssvars.font_main,
            data: [],
            tiles: this._geodata.tiles,
            baseColor: window.theme.globe.base || `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
            markerColor: window.theme.globe.marker || `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
            pinColor: window.theme.globe.pin || `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
            satelliteColor: window.theme.globe.satellite || `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
            scale: 1.1,
            viewAngle: 0.630,
            dayLength: 1000 * 45,
            introLinesDuration: 2000,
            introLinesColor: window.theme.globe.marker || `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
            maxPins: 300,
            maxMarkers: 100
        });

        placeholder.remove();
        container.append(this.globe.domElement);

        this.globe.init(window.theme.colors.light_black, () => {
            this.startAnimation();
            window.audioManager.scan.play();
        });

        this.resizeHandler = () => {
            if (!this.globe) return;
            let canvas = document.querySelector("div#mod_globe canvas");
            if (!canvas) return;
            this.globe.camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            this.globe.camera.updateProjectionMatrix();
            this.globe.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        };
        window.addEventListener("resize", this.resizeHandler);

        let constellation = [];
        for(var i = 0; i< 2; i++){
            for(var j = 0; j< 3; j++){
                constellation.push({
                    lat: 50 * i - 30 + 15 * Math.random(),
                    lon: 120 * j - 120 + 30 * i,
                    altitude: Math.random() * (1.7 - 1.3) + 1.3
                });
            }
        }

        this.globe.addConstellation(constellation);
    }

    startAnimation() {
        if (!this.running || !this.globe) return;
        if (this.animationFrame || this.animationTimeout) return;
        this.animate();
    }

    animate() {
        if (!this.running || !this.globe) return;
        const timing = window.performanceTiming ? window.performanceTiming() : {globeFPS: 18};
        if (!timing.globeFPS) return;
        this.globe.tick();
        this.animationTimeout = setTimeout(() => {
            this.animationTimeout = null;
            try {
                this.animationFrame = requestAnimationFrame(() => {
                    this.animationFrame = null;
                    this.animate();
                });
            } catch(e) {
                console.warn(e);
            }
        }, 1000 / timing.globeFPS);
    }

    setOfflineLabel(label) {
        const globe = document.querySelector("div#mod_globe");
        const header = document.querySelector("i.mod_globe_headerInfo");
        if (globe) globe.setAttribute("class", "offline");
        if (header) header.innerText = label;
    }

    addRandomConnectedMarkers() {
        if (!this.globe || !window.isGlobeConnectionMode || !window.isGlobeConnectionMode()) return false;
        const randomLat = this.getRandomInRange(40, 90, 3);
        const randomLong = this.getRandomInRange(-180, 0, 3);
        this.globe.addMarker(randomLat, randomLong, '');
        this.globe.addMarker(randomLat - 20, randomLong + 150, '', true);
    }

    addTemporaryConnectedMarker(ip) {
        if (!this.globe || !window.isGlobeConnectionMode || !window.isGlobeConnectionMode()) return false;
        let data = window.mods.netstat.geoLookup.get(ip);
        let geo = (data !== null ? data.location : {});
        if (geo.latitude && geo.longitude) {
            const lat = Number(geo.latitude);
            const lon = Number(geo.longitude);

            this.conns.push({
                ip,
                pin: this.globe.addPin(lat, lon, "", 1.2)
            });
            let mark = this.globe.addMarker(lat, lon, '', true);
            setTimeout(() => {
                mark.remove();
            }, 3000);
        }
    }

    removeMarkers() {
        if (!this.globe || !this.globe.markers) return;
        this.globe.markers.forEach(marker => { marker.remove(); });
        this.globe.markers = [];
    }

    removePins() {
        if (!this.globe || !this.globe.pins) return;
        this.globe.pins.forEach(pin => {
            pin.remove();
        });
        this.globe.pins = [];
    }

    getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    }

    updateLoc() {
        if (!this.running || !this.globe) return false;
        if (!window.isGlobeLiveMode || !window.isGlobeLiveMode() || !window.mods.netstat || window.mods.netstat.offline) {
            this.setOfflineLabel(this.mode() === "reduced" ? "(REDUCED)" : "(OFFLINE)");
            this.removePins();
            this.removeMarkers();
            this.conns = [];
            this.lastgeo = {
                latitude: 0,
                longitude: 0
            };
        } else {
            this.updateConOnlineConnection().then(() => {
                document.querySelector("div#mod_globe").setAttribute("class", "");
            }).catch(() => {
                document.querySelector("i.mod_globe_headerInfo").innerText = "UNKNOWN";
            });
        }
    }

    async updateConOnlineConnection() {
        if (!this.running || !this.globe || !window.isGlobeLiveMode || !window.isGlobeLiveMode()) return false;
        if (!window.mods.netstat.ipinfo || !window.mods.netstat.ipinfo.geo) return false;
        let newgeo = window.mods.netstat.ipinfo.geo;
        newgeo.latitude = Math.round(newgeo.latitude*10000)/10000;
        newgeo.longitude = Math.round(newgeo.longitude*10000)/10000;

        if (newgeo.latitude !== this.lastgeo.latitude || newgeo.longitude !== this.lastgeo.longitude) {
            document.querySelector("i.mod_globe_headerInfo").innerText = window.settings.widgets && window.settings.widgets.showGeo === false ? "HIDDEN" : `${newgeo.latitude}, ${newgeo.longitude}`;
            this.removePins();
            this.removeMarkers();
            this.conns = [];

            this._locPin = this.globe.addPin(newgeo.latitude, newgeo.longitude, "", 1.2);
            this._locMarker = this.globe.addMarker(newgeo.latitude, newgeo.longitude, "", false, 1.2);
        }

        this.lastgeo = newgeo;
        document.querySelector("div#mod_globe").setAttribute("class", "");
    }

    updateConns() {
        if (!this.running || !this.globe || !window.mods.netstat || window.mods.netstat.offline || !window.isGlobeConnectionMode || !window.isGlobeConnectionMode()) return false;
        window.si.networkConnections().then(conns => {
            if (!this.running || !this.globe) return;
            let newconns = [];
            (conns || []).forEach(conn => {
                let ip = conn.peeraddress;
                let state = conn.state;
                if (state === "ESTABLISHED" && ip !== "0.0.0.0" && ip !== "127.0.0.1" && ip !== "::") {
                    newconns.push(ip);
                }
            });

            this.conns.slice().forEach(conn => {
                if (newconns.indexOf(conn.ip) !== -1) {
                    newconns.splice(newconns.indexOf(conn.ip), 1);
                } else {
                    this.removeConn(conn.ip);
                }
            });

            newconns.forEach(ip => {
                this.addConn(ip);
            });
        });
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    LocationGlobe
    };
}
