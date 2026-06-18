const cluster = require("cluster");

const CACHE_TTLS = {
    battery: 10000,
    chassis: 60000,
    cpu: 5000,
    cpuTemperature: 2500,
    currentLoad: 750,
    fsSize: 10000,
    mem: 1500,
    networkConnections: 2000,
    networkInterfaces: 5000,
    networkStats: 900,
    processes: 2500,
    system: 60000
};

const FALLBACKS = {
    battery: {hasBattery: false, percent: 0},
    chassis: {},
    cpu: {},
    cpuTemperature: {},
    currentLoad: {cpus: []},
    fsSize: [],
    mem: {},
    networkConnections: [],
    networkInterfaces: [],
    networkStats: [],
    processes: {all: 0, list: []},
    system: {}
};

function clone(value) {
    if (value == null || typeof value !== "object") return value;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch(e) {
        return value;
    }
}

function cacheKey(type, args) {
    try {
        return `${type}:${JSON.stringify(args || [])}`;
    } catch(e) {
        return `${type}:uncacheable`;
    }
}

function normalizePerformance(settings) {
    const source = settings && settings.performance && typeof settings.performance === "object"
        ? settings.performance
        : {};
    const profile = ["balanced", "max", "cinematic"].includes(source.profile) ? source.profile : "cinematic";
    const workers = Number(source.systemInfoWorkers);
    const maxWorkers = Number(source.maxSystemInfoWorkers);
    const idleWorkerMs = Number(source.systemInfoWorkerIdleMs);
    const scaleDelayMs = Number(source.systemInfoWorkerScaleDelayMs);
    const systemInfoWorkers = Number.isInteger(workers) ? Math.max(1, Math.min(4, workers)) : 2;
    const maxSystemInfoWorkers = Number.isInteger(maxWorkers) ? Math.max(systemInfoWorkers, Math.min(4, maxWorkers)) : Math.max(systemInfoWorkers, 2);
    const systemInfoWorkerIdleMs = Number.isInteger(idleWorkerMs) ? Math.max(5000, Math.min(300000, idleWorkerMs)) : 30000;
    const defaultScaleDelayMs = profile === "cinematic" ? 750 : (profile === "max" ? 15000 : 5000);
    const minimumScaleDelayMs = profile === "cinematic" ? 100 : defaultScaleDelayMs;
    const systemInfoWorkerScaleDelayMs = Number.isInteger(scaleDelayMs) ? Math.max(minimumScaleDelayMs, Math.min(60000, scaleDelayMs)) : defaultScaleDelayMs;

    return {
        profile,
        systemInfoWorkers,
        maxSystemInfoWorkers,
        systemInfoWorkerIdleMs,
        systemInfoWorkerScaleDelayMs
    };
}

function fallbackFor(type) {
    if (Object.prototype.hasOwnProperty.call(FALLBACKS, type)) return clone(FALLBACKS[type]);
    return null;
}

function runWorker() {
    const signale = require("signale");
    const si = require("systeminformation");

    signale.info("Systeminformation worker started at "+process.pid);

    process.on("message", msg => {
        let payload;
        try {
            payload = typeof msg === "string" ? JSON.parse(msg) : msg;
        } catch(error) {
            return;
        }

        if (!payload || !payload.type || !si[payload.type]) {
            process.send(JSON.stringify({
                id: payload && payload.id,
                error: "invalid-method"
            }));
            return;
        }

        Promise.resolve()
            .then(() => si[payload.type](...(Array.isArray(payload.args) ? payload.args : [])))
            .then(res => {
                process.send(JSON.stringify({
                    id: payload.id,
                    res
                }));
            })
            .catch(error => {
                process.send(JSON.stringify({
                    id: payload.id,
                    error: error && error.message || String(error)
                }));
            });
    });
}

if (cluster.isWorker) {
    runWorker();
} else {
    const controller = {
        _started: false,
        _ipc: null,
        _settings: normalizePerformance({}),
        _trusted: () => true,
        _signale: console,
        _si: null,
        _workers: [],
        _queue: [],
        _activeTasks: new Map(),
        _dedupe: new Map(),
        _cache: new Map(),
        _idleReapTimer: null,
        _pressurePumpTimer: null,
        _lastScaleUpAt: 0,
        _metrics: {
            calls: {},
            cacheHits: {},
            deduped: {},
            failures: {},
            timeouts: {},
            completed: {},
            startedAt: null,
            workersForked: 0,
            workersExited: 0,
            workersReaped: 0,
            lastReapedAt: null
        },

        init(options = {}) {
            if (this._started) return this;

            const electron = require("electron");
            this._ipc = options.ipc || electron.ipcMain;
            this._settings = normalizePerformance(options.settings || {});
            this._trusted = typeof options.isTrustedSender === "function" ? options.isTrustedSender : () => true;
            this._signale = options.signale || require("signale");
            this._si = require("systeminformation");
            this._metrics.startedAt = new Date().toISOString();

            cluster.setupPrimary({
                exec: require("path").join(__dirname, "_multithread.js")
            });

            cluster.on("message", (worker, msg) => this._handleWorkerMessage(worker, msg));
            cluster.on("exit", worker => this._handleWorkerExit(worker));

            this._ipc.on("systeminformation-call", (event, type, id, ...args) => {
                this._handleRequest(event, type, id, args);
            });

            this._started = true;
            this._signale.success(`Lazy systeminformation scheduler ready (${this._settings.systemInfoWorkers}/${this._settings.maxSystemInfoWorkers} workers)`);
            return this;
        },

        getMetrics() {
            return {
                started: this._started,
                startedAt: this._metrics.startedAt,
                settings: Object.assign({}, this._settings),
                activeWorkers: this._workers.length,
                busyWorkers: this._workers.filter(worker => worker.busy).length,
                pendingQueue: this._queue.length,
                inFlight: this._activeTasks.size,
                dedupeKeys: this._dedupe.size,
                cacheEntries: this._cache.size,
                idleReapMs: this._settings.systemInfoWorkerIdleMs,
                scaleDelayMs: this._settings.systemInfoWorkerScaleDelayMs,
                lastScaleUpAt: this._lastScaleUpAt ? new Date(this._lastScaleUpAt).toISOString() : null,
                calls: Object.assign({}, this._metrics.calls),
                cacheHits: Object.assign({}, this._metrics.cacheHits),
                deduped: Object.assign({}, this._metrics.deduped),
                completed: Object.assign({}, this._metrics.completed),
                failures: Object.assign({}, this._metrics.failures),
                timeouts: Object.assign({}, this._metrics.timeouts),
                workersForked: this._metrics.workersForked,
                workersExited: this._metrics.workersExited,
                workersReaped: this._metrics.workersReaped,
                lastReapedAt: this._metrics.lastReapedAt
            };
        },

        _inc(bucket, type) {
            if (!this._metrics[bucket]) this._metrics[bucket] = {};
            this._metrics[bucket][type] = (this._metrics[bucket][type] || 0) + 1;
        },

        _send(sender, id, res) {
            try {
                if (sender && !sender.isDestroyed()) sender.send("systeminformation-reply-"+id, res);
            } catch(e) {
                // Renderer closed.
            }
        },

        _handleRequest(event, type, id, args) {
            if (!this._trusted(event)) return;
            if (typeof type !== "string" || !this._si || !this._si[type]) {
                this._signale.warn("Illegal request for systeminformation");
                this._send(event.sender, id, fallbackFor(type));
                return;
            }

            this._inc("calls", type);
            const argsList = Array.isArray(args) ? args.filter(arg => typeof arg !== "function") : [];
            const key = cacheKey(type, argsList);
            const now = Date.now();
            const cached = this._cache.get(key);
            if (cached && cached.expires > now) {
                this._inc("cacheHits", type);
                this._send(event.sender, id, clone(cached.value));
                return;
            }

            const existing = this._dedupe.get(key);
            if (existing) {
                this._inc("deduped", type);
                existing.callbacks.push({sender: event.sender, id});
                return;
            }

            const task = {
                id,
                key,
                type,
                args: argsList,
                callbacks: [{sender: event.sender, id}],
                timeout: null,
                workerId: null,
                startedAt: 0,
                queuedAt: Date.now()
            };
            this._dedupe.set(key, task);
            this._queue.push(task);
            this._pump();
        },

        _desiredWorkers() {
            const busy = this._workers.filter(worker => worker.busy).length;
            const oldestTask = this._queue[0];
            const queueWaitMs = oldestTask ? Date.now() - oldestTask.queuedAt : 0;
            if (
                this._queue.length > 0
                && busy >= this._workers.length
                && this._workers.length >= this._settings.systemInfoWorkers
                && queueWaitMs >= this._settings.systemInfoWorkerScaleDelayMs
            ) {
                return this._settings.maxSystemInfoWorkers;
            }
            return this._settings.systemInfoWorkers;
        },

        _ensureWorkers() {
            const desired = this._desiredWorkers();
            while (this._queue.length > 0 && this._workers.length < desired) {
                const worker = cluster.fork();
                if (this._workers.length >= this._settings.systemInfoWorkers) this._lastScaleUpAt = Date.now();
                const record = {id: worker.id, worker, busy: false, task: null, lastIdleAt: Date.now()};
                this._workers.push(record);
                this._metrics.workersForked++;
            }
        },

        _pump() {
            this._ensureWorkers();
            while (this._queue.length > 0) {
                const record = this._workers.find(worker => !worker.busy && worker.worker && !worker.worker.isDead());
                if (!record) {
                    this._ensureWorkers();
                    this._schedulePressurePump();
                    return;
                }

                const task = this._queue.shift();
                record.busy = true;
                record.task = task;
                record.lastIdleAt = null;
                task.workerId = record.id;
                task.startedAt = Date.now();
                this._activeTasks.set(task.id, task);
                task.timeout = setTimeout(() => {
                    this._inc("timeouts", task.type);
                    const stuckWorkerIndex = this._workers.findIndex(worker => worker.id === task.workerId);
                    if (stuckWorkerIndex !== -1) {
                        const [stuckWorker] = this._workers.splice(stuckWorkerIndex, 1);
                        try {
                            stuckWorker.worker.kill();
                        } catch(e) {}
                    }
                    this._finishTask(task, fallbackFor(task.type), new Error("systeminformation call timed out"));
                }, 15000);

                try {
                    record.worker.send(JSON.stringify({
                        id: task.id,
                        type: task.type,
                        args: task.args
                    }));
                } catch(error) {
                    this._finishTask(task, fallbackFor(task.type), error);
                }
            }
            this._scheduleIdleReaper();
        },

        _cancelIdleReaper() {
            if (!this._idleReapTimer) return;
            clearTimeout(this._idleReapTimer);
            this._idleReapTimer = null;
        },

        _schedulePressurePump() {
            if (this._pressurePumpTimer || this._queue.length === 0) return;
            const oldestTask = this._queue[0];
            const queueWaitMs = oldestTask ? Date.now() - oldestTask.queuedAt : 0;
            const delay = Math.max(50, this._settings.systemInfoWorkerScaleDelayMs - queueWaitMs);
            this._pressurePumpTimer = setTimeout(() => {
                this._pressurePumpTimer = null;
                this._pump();
            }, delay);
            if (typeof this._pressurePumpTimer.unref === "function") this._pressurePumpTimer.unref();
        },

        _scheduleIdleReaper() {
            if (this._idleReapTimer) return;
            if (this._workers.length <= this._settings.systemInfoWorkers) return;

            const now = Date.now();
            const scaleAge = this._lastScaleUpAt ? now - this._lastScaleUpAt : this._settings.systemInfoWorkerIdleMs;
            const delay = Math.max(1000, this._settings.systemInfoWorkerIdleMs - scaleAge);

            this._idleReapTimer = setTimeout(() => {
                this._idleReapTimer = null;
                if (this._queue.length > 0) {
                    this._scheduleIdleReaper();
                    return;
                }
                if (this._lastScaleUpAt && Date.now() - this._lastScaleUpAt < this._settings.systemInfoWorkerIdleMs) {
                    this._scheduleIdleReaper();
                    return;
                }
                const excess = this._workers.length - this._settings.systemInfoWorkers;
                if (excess <= 0) {
                    return;
                }

                const removable = this._workers
                    .filter(record => {
                        return !record.busy
                            && record.worker
                            && !record.worker.isDead();
                    })
                    .sort((a, b) => b.id - a.id)
                    .slice(0, excess);

                removable.forEach(record => {
                    const index = this._workers.indexOf(record);
                    if (index !== -1) this._workers.splice(index, 1);
                    try {
                        record.worker.kill();
                    } catch(e) {}
                    this._metrics.workersReaped++;
                    this._metrics.lastReapedAt = new Date().toISOString();
                });
                if (this._workers.length > this._settings.systemInfoWorkers) this._scheduleIdleReaper();
            }, delay);

            if (typeof this._idleReapTimer.unref === "function") this._idleReapTimer.unref();
        },

        _handleWorkerMessage(worker, msg) {
            let payload;
            try {
                payload = typeof msg === "string" ? JSON.parse(msg) : msg;
            } catch(error) {
                return;
            }
            const task = payload && this._activeTasks.get(payload.id);
            if (!task) return;
            const result = payload.error ? fallbackFor(task.type) : payload.res;
            this._finishTask(task, result, payload.error ? new Error(payload.error) : null);
        },

        _handleWorkerExit(worker) {
            this._metrics.workersExited++;
            const index = this._workers.findIndex(record => record.id === worker.id);
            if (index === -1) return;
            const [record] = this._workers.splice(index, 1);
            if (record && record.task) {
                this._finishTask(record.task, fallbackFor(record.task.type), new Error("systeminformation worker exited"));
            }
            this._pump();
        },

        _finishTask(task, result, error) {
            if (!task || !this._dedupe.has(task.key)) return;
            clearTimeout(task.timeout);
            this._activeTasks.delete(task.id);
            this._dedupe.delete(task.key);

            const record = this._workers.find(worker => worker.id === task.workerId);
            if (record) {
                record.busy = false;
                record.task = null;
                record.lastIdleAt = Date.now();
            }

            if (error) this._inc("failures", task.type);
            else this._inc("completed", task.type);

            const ttl = CACHE_TTLS[task.type] || 0;
            if (!error && ttl > 0) {
                this._cache.set(task.key, {
                    expires: Date.now() + ttl,
                    value: clone(result)
                });
            }

            task.callbacks.forEach(callback => {
                this._send(callback.sender, callback.id, clone(result));
            });
            this._pump();
        }
    };

    module.exports = controller;
}
