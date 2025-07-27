(async function () {
    const ghost_hsw = {
        entropy: {},
        suspicious: [],
        token: "",

        collectEntropy: function () {
            try {
                // User Agent & Navigator Fingerprint
                this.entropy.userAgent = navigator.userAgent;
                // this.entropy.platform = navigator.platform;
                this.entropy.language = navigator.language;
                this.entropy.languages = navigator.languages;
                this.entropy.hardwareConcurrency = navigator.hardwareConcurrency;
                this.entropy.deviceMemory = navigator.deviceMemory || "unknown";

                // Screen and Display
                this.entropy.screen = {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                };

                // Bot/Headless Detection
                this.entropy.webdriver = navigator.webdriver || false;
                if (navigator.webdriver) this.suspicious.push("webdriver");

                if (window.callPhantom || window._phantom || window.__nightmare) {
                    this.suspicious.push("phantom/nightmare");
                }

                // Mouse/Touch Detection
                this.entropy.mouseMoved = false;
                this.entropy.touchDetected = false;

                window.addEventListener("mousemove", () => {
                    this.entropy.mouseMoved = true;
                });

                window.addEventListener("touchstart", () => {
                    this.entropy.touchDetected = true;
                });

                // Canvas Fingerprint
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                ctx.textBaseline = "top";
                ctx.font = "16px Arial";
                ctx.fillText("GHOST_HSW_CANVAS_TEST", 2, 2);
                const canvasData = canvas.toDataURL();
                this.entropy.canvas = canvasData.substring(0, 32); // partial hash

                // WebGL Fingerprint
                const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                if (gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    this.entropy.webglVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "unknown";
                    this.entropy.webglRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
                }

                // Time since load
                this.entropy.loadTime = Date.now() - performance.timeOrigin;
                if (this.entropy.loadTime < 100) this.suspicious.push("too fast load");

                // Timestamp
                this.entropy.timestamp = Date.now();
            } catch (err) {
                this.suspicious.push("entropy_exception");
            }
        },

        generateToken: async function () {
            const rawData = JSON.stringify(this.entropy);
            const encoder = new TextEncoder();
            const data = encoder.encode(rawData);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            this.token = btoa(hashArray.map(b => String.fromCharCode(b)).join("")).substring(0, 64);
        },

        sendToServer: function () {
            const payload = {
                entropy: this.entropy,
                suspicious: this.suspicious,
                token: this.token
            };

            const tokenInput = document.querySelector('input[name="token"]');
            if (tokenInput) {
                tokenInput.value = this.token;
            }

            navigator.sendBeacon("/verify_hsw", JSON.stringify(payload));
        },

        execute: async function () {
            this.collectEntropy();

            // Wait 1s for possible user interaction
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!this.entropy.mouseMoved && !this.entropy.touchDetected) {
                this.suspicious.push("no human input");
            }

            await this.generateToken();
            this.sendToServer();
        }
    };

    window.addEventListener("load", () => {
        ghost_hsw.execute();
    });
})();