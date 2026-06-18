class Conninfo {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_conninfo">
            <div id="mod_conninfo_innercontainer">
                <h1>NETWORK TRAFFIC<i>UP / DOWN, MB/S</i></h1>
                <h2>TOTAL<i>0B OUT, 0B IN</i></h2>
                <canvas id="mod_conninfo_canvas_top"></canvas>
                <canvas id="mod_conninfo_canvas_bottom"></canvas>
                <h3>OFFLINE</h3>
            </div>
        </div>`;

        this.current = document.querySelector("#mod_conninfo_innercontainer > h1 > i");
        this.total = document.querySelector("#mod_conninfo_innercontainer > h2 > i");
        this._pb = require("pretty-bytes");

        // Init Smoothie
        let TimeSeries = window.TimeSeries;
        let SmoothieChart = window.SmoothieChart;

        // Set chart options
        let chartOptions = [{
            limitFPS: window.performanceTiming ? window.performanceTiming().networkChartFPS : 12,
            responsive: true,
            millisPerPixel: 70,
            interpolation: 'linear',
            grid:{
                millisPerLine: 5000,
                fillStyle:'transparent',
                strokeStyle:`rgba(${window.theme.r},${window.theme.g},${window.theme.b},0.4)`,
                verticalSections:3,
                borderVisible:false
            },
            labels:{
                fontSize: 10,
                fillStyle: `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
                precision: 2
            }
        }];
        chartOptions.push(Object.assign({}, chartOptions[0]));  // Deep copy object, see http://jsben.ch/bWfk9
        chartOptions[0].minValue = 0;
        chartOptions[1].maxValue = 0;

        // Create chart
        this.series = [new TimeSeries(), new TimeSeries()];
        this.charts = [new SmoothieChart(chartOptions[0]), new SmoothieChart(chartOptions[1])];

        this.charts[0].addTimeSeries(this.series[0], {lineWidth:1.7,strokeStyle:`rgb(${window.theme.r},${window.theme.g},${window.theme.b})`});
        this.charts[1].addTimeSeries(this.series[1], {lineWidth:1.7,strokeStyle:`rgb(${window.theme.r},${window.theme.g},${window.theme.b})`});

        // Init updater
        this.running = false;
        this.currentlyUpdating = false;
        if (!window.shouldStartWidgetInitially || window.shouldStartWidgetInitially("networkTraffic")) this.start();
    }
    start() {
        if (this.running) return false;
        this.running = true;
        this.charts[0].streamTo(document.getElementById("mod_conninfo_canvas_top"), 1000);
        this.charts[1].streamTo(document.getElementById("mod_conninfo_canvas_bottom"), 1000);
        this.updateInfo();
        this.infoUpdater = setInterval(() => {
            this.updateInfo();
        }, window.performanceTiming ? window.performanceTiming().networkTrafficInterval : 2000);
        return true;
    }
    stop() {
        if (this.infoUpdater) clearInterval(this.infoUpdater);
        this.infoUpdater = null;
        this.running = false;
        this.charts.forEach(chart => {
            if (chart && typeof chart.stop === "function") chart.stop();
        });
        return true;
    }
    refresh() {
        this.updateInfo();
    }
    updateInfo() {
        if (!this.running || this.currentlyUpdating) return;
        let time = new Date().getTime();

        if (!window.mods.netstat || window.mods.netstat.offline || window.mods.netstat.iface === null) {
            this.series[0].append(time, 0);
            this.series[1].append(time, 0);
            document.querySelector("div#mod_conninfo").setAttribute("class", "offline");
            return;
        } else {
            this.currentlyUpdating = true;
            document.querySelector("div#mod_conninfo").setAttribute("class", "");
            window.si.networkStats(window.mods.netstat.iface).then(data => {
                if (!this.running) {
                    this.currentlyUpdating = false;
                    return;
                }
                data = data && data[0] ? data : [{tx_sec: 0, rx_sec: 0, tx_bytes: 0, rx_bytes: 0}];

                let max0 = this.series[0].maxValue;
                let max1 = -this.series[1].minValue;
                if (max0 > max1) {
                    this.series[1].minValue = -max0;
                } else if (max1 > max0) {
                    this.series[0].maxValue = max1;
                }

                this.series[0].append(time, data[0].tx_sec/125000);
                this.series[1].append(time, -data[0].rx_sec/125000);

                this.total.innerText = `${this._pb(data[0].tx_bytes)} OUT, ${this._pb(data[0].rx_bytes)} IN`.toUpperCase();
                this.current.innerText = "UP " + parseFloat(data[0].tx_sec/125000).toFixed(2) + " DOWN " + parseFloat(data[0].rx_sec/125000).toFixed(2);
                this.currentlyUpdating = false;
            }).catch(() => {
                this.currentlyUpdating = false;
            });
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    Conninfo
    };
}
