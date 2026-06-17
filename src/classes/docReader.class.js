class DocReader {
    constructor(opts) {
        this.init(opts);
    }

    async init(opts) {
        const pdfjsLib = await import("./node_modules/pdfjs-dist/build/pdf.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./node_modules/pdfjs-dist/build/pdf.worker.mjs", window.location.href).toString();

        const modalElementId = "modal_" + opts.modalId;
        const pdfPath = opts.path;
        const pdfUrl = /^[a-z]+:\/\//i.test(pdfPath)
            ? pdfPath
            : "file:///" + pdfPath.replace(/\\/g, "/").replace(/^\/+/, "");
        const scale = 1;
        const canvas = document.getElementById(modalElementId).querySelector(".pdf_canvas");
        const context = canvas.getContext("2d");
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        let pdfDoc = null;
        let pageNum = 1;
        let pageRendering = false;
        let pageNumPending = null;
        let zoom = 100;

        this.renderPage = num => {
            pageRendering = true;
            pdfDoc.getPage(num).then(page => {
                const viewport = page.getViewport({scale});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderTask = page.render({
                    canvasContext: context,
                    viewport
                });
                renderTask.promise.then(() => {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        this.renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });
            document.getElementById(modalElementId).querySelector(".page_num").textContent = num;
        };

        this.queueRenderPage = num => {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                this.renderPage(num);
            }
        };

        this.onPrevPage = () => {
            if (pageNum <= 1) return;
            pageNum--;
            this.queueRenderPage(pageNum);
        };

        this.onNextPage = () => {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            this.queueRenderPage(pageNum);
        };

        this.zoomIn = () => {
            if (zoom >= 200) return;
            zoom = zoom + 10;
            canvas.style.zoom = zoom + "%";
        };

        this.zoomOut = () => {
            if (zoom <= 50) return;
            zoom = zoom - 10;
            canvas.style.zoom = zoom + "%";
        };

        document.getElementById(modalElementId).querySelector(".previous_page").addEventListener("click", this.onPrevPage);
        document.getElementById(modalElementId).querySelector(".next_page").addEventListener("click", this.onNextPage);
        document.getElementById(modalElementId).querySelector(".zoom_in").addEventListener("click", this.zoomIn);
        document.getElementById(modalElementId).querySelector(".zoom_out").addEventListener("click", this.zoomOut);

        pdfDoc = await loadingTask.promise;
        document.getElementById(modalElementId).querySelector(".page_count").textContent = pdfDoc.numPages;
        this.renderPage(pageNum);
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        DocReader
    };
}
