class Cpuinfo {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create initial DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_cpuinfo">
        </div>`;
        this.container = document.getElementById("mod_cpuinfo");
        this.running = false;
        this.ready = false;
        this.shouldStart = !window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("cpu");

        // Init Smoothie
        let TimeSeries = window.TimeSeries;
        let SmoothieChart = window.SmoothieChart;

        this.series = [];
        this.charts = [];
        window.si.cpu().then(data => {
            data = data || {};
            data.cores = Math.max(1, Number(data.cores) || require("os").cpus().length || 1);
            data.manufacturer = data.manufacturer || "";
            data.brand = data.brand || "CPU";
            let divide = Math.max(1, Math.floor(data.cores/2));
            this.divide = divide;

            let cpuName = data.manufacturer+data.brand;
            cpuName = cpuName.substr(0, 30);
            cpuName.substr(0, Math.min(cpuName.length, cpuName.lastIndexOf(" ")));

            let innercontainer = document.createElement("div");
            innercontainer.setAttribute("id", "mod_cpuinfo_innercontainer");
            innercontainer.innerHTML = `<h1>CPU USAGE<i>${cpuName}</i></h1>
                <div>
                    <h1># <em>1</em> - <em>${divide}</em><br>
                    <i id="mod_cpuinfo_usagecounter0">Avg. --%</i></h1>
                    <canvas id="mod_cpuinfo_canvas_0" height="60"></canvas>
                </div>
                <div>
                    <h1># <em>${divide+1}</em> - <em>${data.cores}</em><br>
                    <i id="mod_cpuinfo_usagecounter1">Avg. --%</i></h1>
                    <canvas id="mod_cpuinfo_canvas_1" height="60"></canvas>
                </div>
                <div>
                    <div>
                        <h1>${(process.platform === "win32") ? "CORES" : "TEMP"}<br>
                        <i id="mod_cpuinfo_temp">${(process.platform === "win32") ? data.cores : "--°C"}</i></h1>
                    </div>
                    <div>
                        <h1>SPD<br>
                        <i id="mod_cpuinfo_speed_min">--GHz</i></h1>
                    </div>
                    <div>
                        <h1>MAX<br>
                        <i id="mod_cpuinfo_speed_max">--GHz</i></h1>
                    </div>
                    <div>
                        <h1>TASKS<br>
                        <i id="mod_cpuinfo_tasks">---</i></h1>
                    </div>
                </div>`;
            this.container.append(innercontainer);

            for (var i = 0; i < 2; i++) {
                this.charts.push(new SmoothieChart({
                    limitFPS: window.performanceTiming ? window.performanceTiming().cpuChartFPS : 12,
                    responsive: true,
                    millisPerPixel: 50,
                    grid:{
                        fillStyle:'transparent',
                        strokeStyle:'transparent',
                        verticalSections:0,
                        borderVisible:false
                    },
                    labels:{
                        disabled: true
                    },
                    yRangeFunction: () => {
                        return {min:0,max:100};
                    }
                }));
            }

            for (var i = 0; i < data.cores; i++) {
                // Create TimeSeries
                this.series.push(new TimeSeries());

                let serie = this.series[i];
                let options = {
                    lineWidth: 1.7,
                    strokeStyle: `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`
                };

                if (i < divide) {
                    this.charts[0].addTimeSeries(serie, options);
                } else {
                    this.charts[1].addTimeSeries(serie, options);
                }
            }

            this.updatingCPUload = false;
            this.updatingCPUspeed = false;
            this.updatingCPUtasks = false;
            this.ready = true;
            if (this.shouldStart) this.start();
        });
    }
    start() {
        this.shouldStart = true;
        if (!this.ready || this.running) return false;
        this.running = true;
        for (var i = 0; i < 2; i++) {
            this.charts[i].streamTo(document.getElementById(`mod_cpuinfo_canvas_${i}`), 500);
        }
        this.refresh();
        this.loadUpdater = setInterval(() => {
            this.updateCPUload();
        }, window.performanceTiming ? window.performanceTiming().cpuLoadInterval : 1500);
        if (process.platform !== "win32") {
            this.tempUpdater = setInterval(() => {
                this.updateCPUtemp();
            }, window.performanceTiming ? window.performanceTiming().cpuTempInterval : 5000);
        }
        this.speedUpdater = setInterval(() => {
            this.updateCPUspeed();
        }, window.performanceTiming ? window.performanceTiming().cpuSpeedInterval : 5000);
        this.tasksUpdater = setInterval(() => {
            this.updateCPUtasks();
        }, window.performanceTiming ? window.performanceTiming().cpuTasksInterval : 5000);
        return true;
    }
    stop() {
        this.shouldStart = false;
        if (this.loadUpdater) clearInterval(this.loadUpdater);
        if (this.tempUpdater) clearInterval(this.tempUpdater);
        if (this.speedUpdater) clearInterval(this.speedUpdater);
        if (this.tasksUpdater) clearInterval(this.tasksUpdater);
        this.loadUpdater = null;
        this.tempUpdater = null;
        this.speedUpdater = null;
        this.tasksUpdater = null;
        if (this.charts) this.charts.forEach(chart => {
            if (chart && typeof chart.stop === "function") chart.stop();
        });
        this.running = false;
        return true;
    }
    refresh() {
        this.updateCPUload();
        if (process.platform !== "win32") this.updateCPUtemp();
        this.updateCPUspeed();
        this.updateCPUtasks();
    }
    updateCPUload() {
        if (!this.running || this.updatingCPUload) return;
        this.updatingCPUload = true;
        window.si.currentLoad().then(data => {
            if (!this.running) {
                this.updatingCPUload = false;
                return;
            }
            let average = [[], []];

            if (!data || !data.cpus) {
                this.updatingCPUload = false;
                return;
            } // Prevent memleak in rare case where systeminformation takes extra time to retrieve CPU info (see github issue #216)

            data.cpus.forEach((e, i) => {
                if (!this.series[i]) return;
                this.series[i].append(new Date().getTime(), e.load);

                if (i < this.divide) {
                    average[0].push(e.load);
                } else {
                    average[1].push(e.load);
                }
            });
            average.forEach((stats, i) => {
                if (!stats.length) return;
                average[i] = Math.round(stats.reduce((a, b) => a + b, 0)/stats.length);

                try {
                    document.getElementById(`mod_cpuinfo_usagecounter${i}`).innerText = `Avg. ${average[i]}%`;
                } catch(e) {
                    // Fail silently, DOM element is probably getting refreshed (new theme, etc)
                }
            });
            this.updatingCPUload = false;
        }).catch(() => {
            this.updatingCPUload = false;
        });
    }
    updateCPUtemp() {
        if (!this.running) return;
        window.si.cpuTemperature().then(data => {
            if (!this.running) return;
            try {
                document.getElementById("mod_cpuinfo_temp").innerText = `${data.max}°C`;
            } catch(e) {
                // See above notice
            }
        });
    }
    updateCPUspeed() {
        if (!this.running || this.updatingCPUspeed) return;
        this.updatingCPUspeed = true;
        window.si.cpu().then(data => {
            if (!this.running) {
                this.updatingCPUspeed = false;
                return;
            }
            try {
                document.getElementById("mod_cpuinfo_speed_min").innerText = `${data.speed}GHz`;
                document.getElementById("mod_cpuinfo_speed_max").innerText = `${data.speedMax}GHz`;
            } catch(e) {
                // See above notice
            }
            this.updatingCPUspeed = false;
        }).catch(() => {
            this.updatingCPUspeed = false;
        });
    }
    updateCPUtasks() {
        if (!this.running || this.updatingCPUtasks) return;
        this.updatingCPUtasks = true;
        window.si.processes().then(data => {
            if (!this.running) {
                this.updatingCPUtasks = false;
                return;
            }
            try {
                document.getElementById("mod_cpuinfo_tasks").innerText = `${data.all}`;
            } catch(e) {
                // See above notice
            }
            this.updatingCPUtasks = false;
        }).catch(() => {
            this.updatingCPUtasks = false;
        });
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    Cpuinfo
    };
}
