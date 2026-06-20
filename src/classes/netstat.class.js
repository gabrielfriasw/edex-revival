class Netstat {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_netstat">
            <div id="mod_netstat_inner">
                <h1>NETWORK STATUS<i id="mod_netstat_iname"></i></h1>
                <div id="mod_netstat_innercontainer">
                    <div>
                        <h1>STATE</h1>
                        <h2>UNKNOWN</h2>
                    </div>
                    <div>
                        <h1>PING</h1>
                        <h2>--ms</h2>
                    </div>
                </div>
            </div>
        </div>`;

        this.offline = false;
        this.lastconn = {finished: false}; // Prevent geoip lookup attempt until maxminddb is loaded
        this.iface = null;
        this.failedAttempts = {};
        this.runsBeforeGeoIPUpdate = 0;
        this.geoReady = false;
        this.running = false;
        this.currentlyUpdating = false;

        this.geoLookup = {
            get: () => null
        };
        this.shouldHideInterface = () => {
            return (window.isScreenShareMode && window.isScreenShareMode())
                || (window.settings.widgets && window.settings.widgets.showInterface === false);
        };
        this.ensureGeoLookup = () => {
            if (this.geoReady || (window.shouldResolvePublicNetworkInfo && !window.shouldResolvePublicNetworkInfo())) return Promise.resolve(false);
            if (window.normalizeWidgetSettings && window.normalizeWidgetSettings().showGeo === false) return Promise.resolve(false);
            return edex.geoip.init().then(() => {
                this.geoReady = true;
                this.lastconn.finished = true;
                this.geoLookup = {
                    get: ip => edex.geoip.lookup(ip)
                };
                return true;
            }).catch(e => {
                ipc.send("log", "note", "NetStat: GeoIP initialization failed.");
                ipc.send("log", "debug", `Error: ${e}`);
                return false;
            });
        };
        this.ensureGeoLookup().then(() => {
            this.geoLookup = {
                get: ip => edex.geoip.lookup(ip)
            };
            this.lastconn.finished = true;
        });
        if (!window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("networkStatus")) this.start();
    }
    start() {
        if (this.running) return false;
        this.running = true;
        this.updateInfo();
        this.infoUpdater = setInterval(() => {
            this.updateInfo();
        }, window.performanceTiming ? window.performanceTiming().networkStatusInterval : 2000);
        return true;
    }
    stop() {
        if (this.infoUpdater) clearInterval(this.infoUpdater);
        this.infoUpdater = null;
        this.running = false;
        return true;
    }
    refresh() {
        this.updateInfo();
    }
    updateInfo() {
        if (!this.running || this.currentlyUpdating) return;
        this.currentlyUpdating = true;
        window.si.networkInterfaces().then(async data => {
            if (!this.running) {
                this.currentlyUpdating = false;
                return;
            }
            let offline = false;

            data = Array.isArray(data) ? data : [];
            let net = data[0];
            let netID = 0;
            if (!net) {
                this.iface = null;
                document.getElementById("mod_netstat_iname").innerText = this.shouldHideInterface() ? "Interface: hidden" : "Interface: (offline)";
                this.offline = true;
                document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--ms";
                this.currentlyUpdating = false;
                return false;
            }

            const configuredIface = typeof window.settings.iface === "string" ? window.settings.iface : "auto";
            if (configuredIface && configuredIface !== "auto") {
                while (net.iface !== window.settings.iface) {
                    netID++;
                    if (data[netID]) {
                        net = data[netID];
                    } else {
                        // No detected interface has the custom iface name, fallback to automatic detection on next loop
                        window.settings.iface = false;
                        this.currentlyUpdating = false;
                        return false;
                    }
                }
            } else {
                // Find the first external, IPv4 connected networkInterface that has a MAC address set

                while (net.operstate !== "up" || net.internal === true || net.ip4 === "" || net.mac === "") {
                    netID++;
                    if (data[netID]) {
                        net = data[netID];
                    } else {
                        // No external connection!
                        this.iface = null;
                        document.getElementById("mod_netstat_iname").innerText = this.shouldHideInterface() ? "Interface: hidden" : "Interface: (offline)";

                        this.offline = true;
                        document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                        document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--ms";
                        this.currentlyUpdating = false;
                        return false;
                    }
                }
            }

            if (net.ip4 !== this.internalIPv4) this.runsBeforeGeoIPUpdate = 0;

            this.iface = net.iface;
            this.internalIPv4 = net.ip4;
            const ifaceDetail = net.iface;
            document.getElementById("mod_netstat_iname").innerText = this.shouldHideInterface() ? "Interface: hidden" : "Interface: "+ifaceDetail;

            if (net.ip4 === "127.0.0.1") {
                offline = true;
            } else {
                if (window.shouldResolvePublicNetworkInfo && !window.shouldResolvePublicNetworkInfo()) {
                    this.ipinfo = null;
                    this.runsBeforeGeoIPUpdate = 10;
                } else if (this.runsBeforeGeoIPUpdate === 0 && this.lastconn.finished) {
                    await this.ensureGeoLookup();
                    this.lastconn = edex.netstat.externalIp(net.ip4).then(data => {
                        this.ipinfo = {
                            ip: data.ip,
                            geo: this.geoLookup.get(data.ip) && this.geoLookup.get(data.ip).location || {}
                        };

                        this.runsBeforeGeoIPUpdate = 10;
                        this.lastconn.finished = true;
                    }).catch(e => {
                        this.lastconn.finished = true;
                        this.failedAttempts[e] = (this.failedAttempts[e] || 0) + 1;
                        if (this.failedAttempts[e] > 2) return false;
                        console.warn(e);
                        ipc.send("log", "note", "NetStat: Error parsing data from myexternalip.com");
                        ipc.send("log", "debug", `Error: ${e}`);
                    });
                    this.lastconn.finished = false;
                } else if (this.runsBeforeGeoIPUpdate !== 0) {
                    this.runsBeforeGeoIPUpdate = this.runsBeforeGeoIPUpdate - 1;
                }

                let p = await this.ping(window.settings.pingAddr || "1.1.1.1", 80, net.ip4).catch(() => { offline = true });

                this.offline = offline;
                if (offline) {
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--ms";
                } else {
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "ONLINE";
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = Math.round(p)+"ms";
                }
            }
            this.currentlyUpdating = false;
        }).catch(() => {
            this.currentlyUpdating = false;
        });
    }
    ping(target, port, local) {
        return edex.netstat.ping(target, port, local);
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        Netstat
    };
}
