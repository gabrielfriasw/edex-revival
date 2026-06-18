class HardwareInspector {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        this._element = document.createElement("div");
        this._element.setAttribute("id", "mod_hardwareInspector");
        this._element.innerHTML = `<div id="mod_hardwareInspector_inner">
            <div>
                <h1>MANUFACTURER</h1>
                <h2 id="mod_hardwareInspector_manufacturer" >NONE</h2>
            </div>
            <div>
                <h1>MODEL</h1>
                <h2 id="mod_hardwareInspector_model" >NONE</h2>
            </div>
            <div>
                <h1>CHASSIS</h1>
                <h2 id="mod_hardwareInspector_chassis" >NONE</h2>
            </div>
        </div>`;

        this.parent.append(this._element);

        this.running = false;
        this.currentlyUpdating = false;
        if (!window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("hardware")) this.start();
    }
    start() {
        if (this.running) return false;
        this.running = true;
        this.updateInfo();
        return true;
    }
    stop() {
        this.running = false;
        return true;
    }
    refresh() {
        this.updateInfo();
    }
    updateInfo() {
        if (!this.running || this.currentlyUpdating) return;
        this.currentlyUpdating = true;
        window.si.system().then(d => {
            return window.si.chassis().then(e => {
                if (!this.running) {
                    this.currentlyUpdating = false;
                    return;
                }
                document.getElementById("mod_hardwareInspector_manufacturer").innerText = this._trimDataString(d.manufacturer);
                document.getElementById("mod_hardwareInspector_model").innerText = this._trimDataString(d.model, d.manufacturer, e.type);
                document.getElementById("mod_hardwareInspector_chassis").innerText = e.type;
                this.currentlyUpdating = false;
            });
        }).catch(() => {
            this.currentlyUpdating = false;
        });
    }
    _trimDataString(str, ...filters) {
        return String(str || "").trim().split(" ").filter(word => {
            if (typeof filters !== "object") return true;

            return !filters.includes(word);
        }).slice(0, 2).join(" ");
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    HardwareInspector
    };
}
