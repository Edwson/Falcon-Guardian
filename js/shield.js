/**
 * Shield Module
 * Active protection mechanisms
 */

class Shield {
    constructor() {
        this.originalFunctions = {};
        this.protectionMethods = {
            canvas: {
                enable: this.spoofCanvas.bind(this),
                disable: this.restoreCanvas.bind(this)
            },
            webrtc: {
                enable: this.blockWebRTC.bind(this),
                disable: this.restoreWebRTC.bind(this)
            },
            tracker: {
                enable: () => {},
                disable: () => {}
            }
        };
        
        this.isActive = false;
        this.mediaAccessBlocked = { camera: false, microphone: false };
    }
    
    activateProtection() {
        this.isActive = true;

        this.scrambleFingerprint();
        
        // Apply all protection methods
        Object.values(this.protectionMethods).forEach(method => {
            try {
                if (method.enable) {
                    method.enable();
                }
            } catch(e) {
                console.error('Protection method failed:', e);
            }
        });

        this.patchGetUserMedia();
    }
    
    scrambleFingerprint() {
        // Randomize various fingerprinting vectors
        
        // Spoof screen resolution
        Object.defineProperty(window.screen, 'width', {
            get: () => 1920 + Math.floor(Math.random() * 100)
        });
        
        Object.defineProperty(window.screen, 'height', {
            get: () => 1080 + Math.floor(Math.random() * 100)
        });
        
        // Spoof plugin list
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                const fakePlugins = [
                    {name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer'},
                    {name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai'},
                    {name: 'Native Client', filename: 'internal-nacl-plugin'}
                ];
                return fakePlugins.slice(0, Math.floor(Math.random() * 3) + 1);
            }
        });
        
        // Spoof user agent
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        
        Object.defineProperty(navigator, 'userAgent', {
            get: () => userAgents[Math.floor(Math.random() * userAgents.length)]
        });
        
        // Spoof language
        const languages = ['en-US', 'en-GB', 'en-CA', 'en-AU'];
        Object.defineProperty(navigator, 'language', {
            get: () => languages[Math.floor(Math.random() * languages.length)]
        });
        
        // Spoof platform
        const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
        Object.defineProperty(navigator, 'platform', {
            get: () => platforms[Math.floor(Math.random() * platforms.length)]
        });
    }
    
    
    spoofTimezone() {
        // Randomize timezone
        const timezones = [
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo',
            'Australia/Sydney'
        ];
        
        const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];
        
        // Override Intl.DateTimeFormat
        const OriginalDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat = function(...args) {
            if (args[1] && !args[1].timeZone) {
                args[1].timeZone = randomTimezone;
            }
            return new OriginalDateTimeFormat(...args);
        };
    }
    
    spoofBattery() {
        // Spoof battery API
        if (navigator.getBattery) {
            navigator.getBattery = async () => {
                return {
                    charging: Math.random() > 0.5,
                    chargingTime: Math.random() * 3600,
                    dischargingTime: Math.random() * 7200,
                    level: Math.random(),
                    addEventListener: () => {},
                    removeEventListener: () => {}
                };
            };
        }
    }
    
    // Additional protection methods
    
    blockGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition = function() {
                throw new Error('Geolocation blocked by Falcon Guardian');
            };
            
            navigator.geolocation.watchPosition = function() {
                throw new Error('Geolocation blocked by Falcon Guardian');
            };
        }
    }
    
    blockNotifications() {
        if (window.Notification) {
            window.Notification = function() {
                throw new Error('Notifications blocked by Falcon Guardian');
            };
        }
    }
    
    patchGetUserMedia() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !this.originalFunctions.getUserMedia) {
            this.originalFunctions.getUserMedia = navigator.mediaDevices.getUserMedia;

            const self = this;
            navigator.mediaDevices.getUserMedia = function(constraints) {
                if (self.mediaAccessBlocked.camera && constraints && constraints.video) {
                    return Promise.reject(new Error('Camera access blocked by Falcon Guardian'));
                }
                if (self.mediaAccessBlocked.microphone && constraints && constraints.audio) {
                    return Promise.reject(new Error('Microphone access blocked by Falcon Guardian'));
                }

                return self.originalFunctions.getUserMedia.apply(navigator.mediaDevices, arguments);
            };
        }
    }
    
    blockClipboard() {
        // Block clipboard access
        if (navigator.clipboard) {
            navigator.clipboard.readText = function() {
                throw new Error('Clipboard read blocked by Falcon Guardian');
            };
            
            navigator.clipboard.writeText = function() {
                throw new Error('Clipboard write blocked by Falcon Guardian');
            };
        }
    }
    
    // Method to enable/disable specific protections
    toggleProtection(type, enabled) {
        switch(type) {
            case 'canvas':
                if (enabled) this.spoofCanvas();
                else this.restoreCanvas();
                break;
            case 'webrtc':
                if (enabled) this.blockWebRTC();
                else this.restoreWebRTC();
                break;
            case 'geolocation':
                // This protection is not currently toggleable from the UI
                break;
            case 'notifications':
                // This protection is not currently toggleable from the UI
                break;
            case 'camera':
                this.mediaAccessBlocked.camera = enabled;
                break;
            case 'microphone':
                this.mediaAccessBlocked.microphone = enabled;
                break;
            case 'clipboard':
                // This protection is not currently toggleable from the UI
                break;
        }
    }

    spoofCanvas() {
        if (!this.originalFunctions.toDataURL) {
            this.originalFunctions.toDataURL = HTMLCanvasElement.prototype.toDataURL;
        }
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
            const canvas = this;
            const ctx = canvas.getContext('2d');
            
            // Add random noise
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] += Math.random() * 10 - 5;     // Red
                imageData.data[i+1] += Math.random() * 10 - 5;   // Green
                imageData.data[i+2] += Math.random() * 10 - 5;   // Blue
            }
            ctx.putImageData(imageData, 0, 0);
            
            return this.originalFunctions.toDataURL.apply(this, args);
        }.bind(this);
    }

    restoreCanvas() {
        if (this.originalFunctions.toDataURL) {
            HTMLCanvasElement.prototype.toDataURL = this.originalFunctions.toDataURL;
        }
    }

    blockWebRTC() {
        if (!this.originalFunctions.RTCPeerConnection) {
            this.originalFunctions.RTCPeerConnection = window.RTCPeerConnection;
        }
        window.RTCPeerConnection = function() {
            throw new Error('WebRTC blocked by Falcon Guardian');
        };
    }

    restoreWebRTC() {
        if (this.originalFunctions.RTCPeerConnection) {
            window.RTCPeerConnection = this.originalFunctions.RTCPeerConnection;
        }
    }
}
