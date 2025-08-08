/**
 * Privacy Detection Engine
 * Detects trackers, fingerprinting attempts, and privacy threats
 */

class PrivacyDetector {
    constructor() {
        this.detectionMethods = {
            canvas: this.detectCanvasFingerprinting.bind(this),
            webgl: this.detectWebGLFingerprinting.bind(this),
            audio: this.detectAudioFingerprinting.bind(this),
            fonts: this.detectFontFingerprinting.bind(this),
            webrtc: this.detectWebRTCLeaks.bind(this),
            battery: this.detectBatteryAPI.bind(this),
            sensors: this.detectSensorAccess.bind(this)
        };
        
        this.trackers = new Set();
        this.fingerprints = {};
    }
    
    startDetection() {
        console.log('Starting privacy detection...');
        
        // Hook into various APIs
        this.hookAPIs();
        
        // Monitor network requests
        this.monitorNetwork();
        
        // Scan for fingerprinting
        this.scanForFingerprinting();
        
        // Check permissions
        this.checkPermissions();
    }
    
    hookAPIs() {
        // Canvas API Hook
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
            console.log('Canvas fingerprinting detected!');
            if (window.falconGuardian && window.falconGuardian.state) {
                window.falconGuardian.state.threats.push({
                    type: 'canvas_fingerprint',
                    timestamp: Date.now(),
                    severity: 'medium'
                });
            }
            return originalToDataURL.apply(this, args);
        };
        
        // WebGL Hook
        const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(...args) {
            console.log('WebGL fingerprinting detected!');
            if (window.falconGuardian && window.falconGuardian.state) {
                window.falconGuardian.state.threats.push({
                    type: 'webgl_fingerprint',
                    timestamp: Date.now(),
                    severity: 'medium'
                });
            }
            return originalGetParameter.apply(this, args);
        };
        
        // AudioContext Hook
        if (window.AudioContext) {
            const OriginalAudioContext = window.AudioContext;
            window.AudioContext = function(...args) {
                console.log('Audio fingerprinting detected!');
                if (window.falconGuardian && window.falconGuardian.state) {
                    window.falconGuardian.state.threats.push({
                        type: 'audio_fingerprint',
                        timestamp: Date.now(),
                        severity: 'low'
                    });
                }
                return new OriginalAudioContext(...args);
            };
        }
        
        // Geolocation Hook
        if (navigator.geolocation) {
            const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
            navigator.geolocation.getCurrentPosition = function(...args) {
                console.log('Geolocation access detected!');
                if (window.falconGuardian && window.falconGuardian.state) {
                    window.falconGuardian.state.threats.push({
                        type: 'geolocation_access',
                        timestamp: Date.now(),
                        severity: 'high'
                    });
                }
                return originalGetCurrentPosition.apply(this, args);
            };
        }
    }
    
    monitorNetwork() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            // Check against known tracker domains
            if (this.isTrackerDomain(url)) {
                console.log('Tracker blocked:', url);
                if (window.falconGuardian && window.falconGuardian.state) {
                    window.falconGuardian.state.trackers.push({
                        url: url,
                        blocked: true,
                        timestamp: Date.now()
                    });
                }
                
                // Return empty response for blocked trackers
                return Promise.resolve(new Response('', {status: 204}));
            }
            
            return originalFetch.apply(this, args);
        }.bind(this);
        
        // Monitor XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (this.isTrackerDomain(url)) {
                console.log('XHR Tracker blocked:', url);
                if (window.falconGuardian && window.falconGuardian.state) {
                    window.falconGuardian.state.trackers.push({
                        url: url,
                        blocked: true,
                        timestamp: Date.now()
                    });
                }
                return;
            }
            return originalOpen.apply(this, [method, url, ...args]);
        }.bind(this);
    }
    
    isTrackerDomain(url) {
        try {
            const hostname = new URL(url).hostname;
            const trackerDomains = [
                'google-analytics.com',
                'googletagmanager.com',
                'facebook.com',
                'doubleclick.net',
                'scorecardresearch.com',
                'quantserve.com',
                'adsystem.com',
                'amazon-adsystem.com',
                'hotjar.com',
                'mixpanel.com',
                'amplitude.com',
                'segment.com',
                'heap.io',
                'fullstory.com',
                'clarity.ms',
                'mouseflow.com',
                'crazyegg.com',
                'optimizely.com',
                'vwo.com',
                'abtasty.com',
                'criteo.com',
                'outbrain.com',
                'taboola.com',
                'pubmatic.com',
                'rubiconproject.com',
                'openx.net',
                'adroll.com',
                'yandex.ru',
                'baidu.com',
                'live.com'
            ];
            return trackerDomains.some(domain => hostname.endsWith(domain));
        } catch (e) {
            return false; // Invalid URL
        }
    }
    
    scanForFingerprinting() {
        Object.entries(this.detectionMethods).forEach(([method, detector]) => {
            try {
                const result = detector();
                if (result) {
                    this.fingerprints[method] = result;
                }
            } catch(e) {
                console.error(`Error detecting ${method}:`, e);
            }
        });
    }
    
    detectCanvasFingerprinting() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Test for canvas fingerprinting
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test', 2, 2);
        
        return canvas.toDataURL();
    }
    
    detectWebGLFingerprinting() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return null;
        
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER)
        };
    }
    
    detectAudioFingerprinting() {
        // Check if AudioContext is being used
        return window.AudioContext || window.webkitAudioContext ? true : false;
    }
    
    detectFontFingerprinting() {
        // Detect font enumeration attempts
        const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
        const detectedFonts = [];
        
        testFonts.forEach(font => {
            if (this.doesFontExist(font)) {
                detectedFonts.push(font);
            }
        });
        
        return detectedFonts;
    }
    
    doesFontExist(fontName) {
        // Create test element
        const test = document.createElement('span');
        test.style.position = 'absolute';
        test.style.left = '-9999px';
        test.style.fontSize = '72px';
        test.style.fontFamily = 'monospace';
        test.innerHTML = 'mmmmmmmmmmlli';
        
        document.body.appendChild(test);
        const defaultWidth = test.offsetWidth;
        
        test.style.fontFamily = `'${fontName}', monospace`;
        const fontWidth = test.offsetWidth;
        
        document.body.removeChild(test);
        
        return defaultWidth !== fontWidth;
    }
    
    detectWebRTCLeaks() {
        // Check for WebRTC IP leaks
        if (!window.RTCPeerConnection) return null;
        
        const pc = new RTCPeerConnection({
            iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
        });
        
        pc.createDataChannel('');
        
        return new Promise((resolve) => {
            pc.onicecandidate = (e) => {
                if (!e.candidate) {
                    pc.close();
                    resolve(null);
                    return;
                }
                
                const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
                const match = e.candidate.candidate.match(ipRegex);
                
                if (match) {
                    pc.close();
                    resolve(match[0]);
                }
            };
            
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
        });
    }
    
    detectBatteryAPI() {
        // Check if Battery API is accessible
        return navigator.getBattery ? true : false;
    }
    
    detectSensorAccess() {
        // Check for sensor API access
        const sensors = {
            accelerometer: window.Accelerometer,
            gyroscope: window.Gyroscope,
            magnetometer: window.Magnetometer,
            ambientLight: window.AmbientLightSensor
        };
        
        return Object.entries(sensors)
            .filter(([_, api]) => api !== undefined)
            .map(([name, _]) => name);
    }
    
    async checkPermissions() {
        const permissions = [
            'camera',
            'microphone',
            'geolocation',
            'notifications',
            'clipboard-read',
            'clipboard-write'
        ];
        
        const results = {};
        
        for (const permission of permissions) {
            try {
                const result = await navigator.permissions.query({name: permission});
                results[permission] = result.state;
            } catch(e) {
                results[permission] = 'not-supported';
            }
        }
        
        return results;
    }
    
    getFingerprint() {
        return {
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            plugins: Array.from(navigator.plugins).map(p => p.name),
            canvas: this.fingerprints.canvas,
            webgl: this.fingerprints.webgl,
            fonts: this.fingerprints.fonts,
            audio: this.fingerprints.audio,
            battery: this.fingerprints.battery,
            sensors: this.fingerprints.sensors
        };
    }
}
