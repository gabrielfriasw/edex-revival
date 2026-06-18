class RAMwatcher {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        let modExtContainer = document.createElement("div");
        let ramwatcherDOM = `<div id="mod_ramwatcher_inner">
                <h1>MEMORY<i id="mod_ramwatcher_info"></i></h1>
                <div id="mod_ramwatcher_pointmap">`;

        for (var i = 0; i < 440; i++) {
            ramwatcherDOM += `<div class="mod_ramwatcher_point free"></div>`;
        }

        ramwatcherDOM += `</div>
                <div id="mod_ramwatcher_swapcontainer">
                    <h1>SWAP</h1>
                    <progress id="mod_ramwatcher_swapbar" max="100" value="0"></progress>
                    <h3 id="mod_ramwatcher_swaptext">0.0 GiB</h3>
                </div>
        </div>`;

        modExtContainer.innerHTML = ramwatcherDOM;
        modExtContainer.setAttribute("id", "mod_ramwatcher");
        this.parent.append(modExtContainer);

        this.points = Array.from(document.querySelectorAll("div.mod_ramwatcher_point"));
        this.shuffleArray(this.points);

        // Init updaters
        this.running = false;
        this.currentlyUpdating = false;
        if (!window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("memory")) this.start();
    }
    start() {
        if (this.running) return false;
        this.running = true;
        this.updateInfo();
        this.infoUpdater = setInterval(() => {
            this.updateInfo();
        }, window.performanceTiming ? window.performanceTiming().memoryInterval : 3000);
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
        window.si.mem().then(data => {
            if (!this.running) {
                this.currentlyUpdating = false;
                return;
            }
            if (!data || !data.total) {
                this.currentlyUpdating = false;
                return;
            }

            // Convert the data for the 440-points grid
            let activeMem = data.active || data.used || Math.max(0, data.total - data.available);
            let availableMem = Math.max(0, (data.available || data.free || 0) - (data.free || 0));
            let active = Math.max(0, Math.min(440, Math.round((440*activeMem)/data.total)));
            let available = Math.max(0, Math.min(440 - active, Math.round((440*availableMem)/data.total)));

            // Update grid
            this.points.slice(0, active).forEach(domPoint => {
                if (domPoint.attributes.class.value !== "mod_ramwatcher_point active") {
                    domPoint.setAttribute("class", "mod_ramwatcher_point active");
                }
            });
            this.points.slice(active, active+available).forEach(domPoint => {
                if (domPoint.attributes.class.value !== "mod_ramwatcher_point available") {
                    domPoint.setAttribute("class", "mod_ramwatcher_point available");
                }
            });
            this.points.slice(active+available, this.points.length).forEach(domPoint => {
                if (domPoint.attributes.class.value !== "mod_ramwatcher_point free") {
                    domPoint.setAttribute("class", "mod_ramwatcher_point free");
                }
            });

            // Update info text
            let totalGiB = Math.round((data.total/1073742000)*10)/10; // 1073742000 bytes = 1 Gibibyte (GiB), the *10 is to round to .1 decimal
            let usedGiB = Math.round((activeMem/1073742000)*10)/10;
            document.getElementById("mod_ramwatcher_info").innerText = `USING ${usedGiB} OUT OF ${totalGiB} GiB`;

            // Update swap indicator
            let usedSwap = Math.round((100*data.swapused)/data.swaptotal);
            document.getElementById("mod_ramwatcher_swapbar").value = usedSwap || 0;

            let usedSwapGiB = Math.round((data.swapused/1073742000)*10)/10;
            document.getElementById("mod_ramwatcher_swaptext").innerText = `${usedSwapGiB} GiB`;

            this.currentlyUpdating = false;
        }).catch(e => {
            console.warn(e);
            this.currentlyUpdating = false;
        });
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    RAMwatcher
    };
}
