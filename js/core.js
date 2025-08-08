/**
 * Falcon Guardian Core
 * Main application controller
 */

class FalconGuardian {
    constructor() {
        this.modules = {
            detector: null,
            visualizer: null,
            predictor: null,
            shield: null,
            quantum: null
        };
        
        this.state = {
            privacyScore: 100,
            threats: [],
            trackers: [],
            fingerprints: {},
            isProtected: false,
            predictions: []
        };
        
        this.demoInterval = null;
        this.systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }
    
    async init() {
        this.updateStatus('Starting initialization...');
        
        try {
            // Initialize modules
            this.updateStatus('Creating detector module...');
            this.modules.detector = new PrivacyDetector();
            
            this.updateStatus('Creating visualizer module...');
            this.modules.visualizer = new Visualizer();
            
            this.updateStatus('Creating predictor module...');
            this.modules.predictor = new Predictor();
            
            this.updateStatus('Creating shield module...');
            this.modules.shield = new Shield();
            
            this.updateStatus('Creating quantum module...');
            this.modules.quantum = new QuantumEngine();
            
            // Initialize predictor and quantum modules
            this.updateStatus('Initializing predictor...');
            this.modules.predictor.init();
            
            this.updateStatus('Initializing quantum engine...');
            this.modules.quantum.init();
            
            // Start monitoring
            this.updateStatus('Starting monitoring...');
            await this.startMonitoring();
            
            // Initialize UI
            this.updateStatus('Initializing UI...');
            this.initializeUI();
            
            // Start real-time updates
            this.updateStatus('Starting real-time updates...');
            this.startRealtimeUpdates();
            
            // Initialize quantum privacy score
            this.updateStatus('Updating quantum score...');
            this.updateQuantumScore();
            
            // Hide loading screen
            this.updateStatus('Initialization complete!');
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Error during initialization:', error);
            this.updateStatus('Error: ' + error.message);
            
            // Fallback: Create basic functionality
            this.createFallbackUI();
            this.startBasicUpdates();
            this.hideLoadingScreen();
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000); // Show loading for at least 1 second
        }
    }
    
    async startMonitoring() {
        try {
            // Begin all detection systems
            await this.modules.detector.startDetection();
            
            // Activate protection
            this.modules.shield.activateProtection();
            
            // Update privacy score
            await this.updatePrivacyScore();
        } catch (error) {
            console.error('Error in startMonitoring:', error);
        }
    }
    
    async updatePrivacyScore() {
        // Calculate privacy score based on multiple factors
        const factors = {
            trackers: this.state.trackers.length * -5,
            https: window.location.protocol === 'https:' ? 10 : -20,
            permissions: await this.calculatePermissionScore(),
            fingerprint: this.calculateFingerprintScore()
        };
        
        let score = 100;
        for (const factor of Object.values(factors)) {
            score += factor;
        }
        
        this.state.privacyScore = Math.max(0, Math.min(100, score));
        this.updateUI('privacyScore', this.state.privacyScore);
    }
    
    async calculatePermissionScore() {
        let score = 0;
        const permissions = ['camera', 'microphone', 'geolocation', 'notifications'];
        
        for (const permission of permissions) {
            try {
                // Use a modern approach for permission names
                const name = permission;
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name });
                    if (result.state === 'granted') {
                        score -= 5;
                    }
                }
            } catch(e) {
                // Permission API not available or permission denied for query
                console.warn(`Could not query permission for ${permission}:`, e.message);
            }
        }
        
        return score;
    }
    
    calculateFingerprintScore() {
        // Analyze browser fingerprint uniqueness
        const fingerprint = this.modules.detector.getFingerprint();
        const uniqueness = this.calculateUniqueness(fingerprint);
        return uniqueness > 0.8 ? -20 : 0;
    }
    
    calculateUniqueness(fingerprint) {
        // In a real-world scenario, this would involve comparing the fingerprint
        // against a large database of known fingerprints to determine its rarity.
        // For this simulation, we'll create a "uniqueness score" based on a hash
        // of the fingerprint data. A more complex hash indicates more entropy and uniqueness.
        const fingerprintString = JSON.stringify(fingerprint);
        const hash = this._djb2Hash(fingerprintString);

        // Normalize the hash to a value between 0 and 1.
        // The division factor is arbitrary and chosen to spread the values.
        const uniqueness = (Math.abs(hash) % 10000) / 10000;
        return uniqueness;
    }

    _djb2Hash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
        }
        return hash;
    }
    
    initializeUI() {
        try {
            // Setup navigation
            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.switchView(e.target.dataset.view);
                });
            });
            
            // Initialize visualizations
            this.modules.visualizer.initRadar('privacyRadar');
            this.modules.visualizer.initTimeline('privacyTimeline');
            
            // Setup settings controls
            this.initializeSettings();

            // Setup mobile navigation
            const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
            const nav = document.querySelector('.nav');
            if (mobileNavToggle && nav) {
                mobileNavToggle.addEventListener('click', () => {
                    nav.classList.toggle('active');
                    // Close nav when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!nav.contains(e.target) && !mobileNavToggle.contains(e.target)) {
                            nav.classList.remove('active');
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error in initializeUI:', error);
        }
    }
    
    initializeSettings() {
        const settings = [
            'canvasProtection',
            'webrtcProtection', 
            'trackerBlocking',
            'realtimeUpdates',
            'notifications',
            'demoMode'
        ];
        
        settings.forEach(setting => {
            const checkbox = document.getElementById(setting);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateSetting(setting, e.target.checked);
                });
            }
        });

        // Initialize theme
        this.initializeTheme();
        
        // Add theme switcher event listener
        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('change', (e) => {
                this.updateTheme(e.target.value);
            });
        }
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('falcon-theme') || 'auto';
        const themeSwitcher = document.getElementById('themeSwitcher');
        
        if (themeSwitcher) {
            themeSwitcher.value = savedTheme;
            this.updateTheme(savedTheme);
        }
    }
 
    updateTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('light-theme', 'dark-theme');
        
        // Handle auto theme based on system preference
        let appliedTheme = theme;
        if (theme === 'auto') {
            appliedTheme = this.systemThemeMedia.matches ? 'dark' : 'light';
        }
        
        // Apply new theme
        if (appliedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else if (appliedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Reflect to color-scheme for native UI elements
        document.documentElement.style.colorScheme = appliedTheme === 'dark' ? 'dark' : 'light';
        
        // Manage system preference listener
        if (theme === 'auto') {
            // Ensure we react to OS changes when in auto
            if (!this._onSystemThemeChange) {
                this._onSystemThemeChange = (e) => {
                    const preferred = e.matches ? 'dark' : 'light';
                    document.body.classList.remove('light-theme', 'dark-theme');
                    document.body.classList.add(preferred === 'dark' ? 'dark-theme' : 'light-theme');
                    document.documentElement.style.colorScheme = preferred;
                };
                this.systemThemeMedia.addEventListener('change', this._onSystemThemeChange);
            }
        } else {
            // Remove listener if not in auto
            if (this._onSystemThemeChange) {
                this.systemThemeMedia.removeEventListener('change', this._onSystemThemeChange);
                this._onSystemThemeChange = null;
            }
        }
        
        // Store theme preference (the selected option, not applied)
        localStorage.setItem('falcon-theme', theme);
    }
    
    updateSetting(setting, enabled) {
        switch(setting) {
            case 'canvasProtection':
                this.modules.shield.toggleProtection('canvas', enabled);
                break;
            case 'webrtcProtection':
                this.modules.shield.toggleProtection('webrtc', enabled);
                break;
            case 'trackerBlocking':
                // For now, we will not allow disabling this.
                break;
            case 'realtimeUpdates':
                // Real-time updates are always active
                break;
            case 'notifications':
                // Notification settings
                break;
            case 'demoMode':
                // Demo mode toggle
                if (enabled) {
                    this.startDemoMode();
                } else {
                    clearInterval(this.demoInterval); // Stop demo mode
                }
                break;
        }
    }
    
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewName).classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            }
        });
        
        // Update view-specific content
        this.updateViewContent(viewName);
    }
    
    updateViewContent(viewName) {
        switch(viewName) {
            case 'analysis':
                this.updateAnalysisView();
                break;
            case 'reports':
                this.updateReportsView();
                break;
            case 'settings':
                this.updateSettingsView();
                break;
        }
    }
    
    updateAnalysisView() {
        // Update fingerprint details
        const fingerprintDetails = document.getElementById('fingerprintDetails');
        if (fingerprintDetails) {
            const fingerprint = this.modules.detector.getFingerprint();
            fingerprintDetails.innerHTML = this.formatFingerprint(fingerprint);
        }
        
        // Update network map
        const networkMap = document.getElementById('networkMap');
        if (networkMap) {
            networkMap.innerHTML = this.formatNetworkData();
        }

        // Update threat predictions
        const threatPredictions = document.getElementById('threatPredictions');
        if (threatPredictions) {
            threatPredictions.innerHTML = this.formatPredictions(this.state.predictions);
        }

        // Create placeholder for behavior pattern
        const behaviorPattern = document.getElementById('behaviorPattern');
        if(behaviorPattern) {
            this.createPlaceholderChart(behaviorPattern, 'Behavior Pattern');
        }
    }

    createPlaceholderChart(canvas, title) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.fillStyle = 'var(--paper)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'var(--graphite)';
        ctx.font = '14px var(--font-primary)';
        ctx.textAlign = 'center';
        ctx.fillText(`Placeholder for ${title}`, canvas.width / 2, canvas.height / 2);
    }
    
    formatFingerprint(fingerprint) {
        let html = '<div class="fingerprint-details">';
        
        Object.entries(fingerprint).forEach(([key, value]) => {
            html += `<div class="fingerprint-item">
                <strong>${key}:</strong> 
                <span>${typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>`;
        });
        
        html += '</div>';
        return html;
    }

    formatPredictions(predictions) {
        if (!predictions || predictions.length === 0) {
            return '<p>No predictions available.</p>';
        }

        let html = '<div class="prediction-list">';
        predictions.forEach(prediction => {
            html += `
                <div class="prediction-item">
                    <span class="prediction-type ${prediction.severity}">${prediction.type.replace(/_/g, ' ')}</span>
                    <p class="prediction-message">${prediction.message}</p>
                    <div class="prediction-meta">
                        <span>Confidence: ${(prediction.confidence * 100).toFixed(0)}%</span>
                        <span>Timeframe: ${prediction.timeframe}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
    
    formatNetworkData() {
        const trackers = this.state.trackers;
        let html = '<div class="network-data">';
        
        if (trackers.length === 0) {
            html += '<p>No network activity detected.</p>';
        } else {
            trackers.forEach(tracker => {
                html += `<div class="network-item">
                    <span class="tracker-url">${tracker.url}</span>
                    <span class="tracker-status ${tracker.blocked ? 'blocked' : 'allowed'}">
                        ${tracker.blocked ? 'Blocked' : 'Allowed'}
                    </span>
                </div>`;
            });
        }
        
        html += '</div>';
        return html;
    }
    
    updateReportsView() {
        // Generate reports based on current state
        const reports = this.generateReports();
        
        // Update report cards
        const reportCards = document.querySelectorAll('.report-card');
        if (reportCards.length >= 2) {
            // Daily Summary
            const dailySummary = reportCards[0].querySelector('.report-content');
            if (dailySummary) {
                dailySummary.innerHTML = this.formatDailySummary(reports.daily);
            }
            
            // Threat Analysis
            const threatAnalysis = reportCards[1].querySelector('.report-content');
            if (threatAnalysis) {
                threatAnalysis.innerHTML = this.formatThreatAnalysis(reports.threats);
            }
        }
    }
    
    generateReports() {
        const now = new Date();
        const today = now.toDateString();
        
        return {
            daily: {
                date: today,
                privacyScore: this.state.privacyScore,
                trackersBlocked: this.state.trackers.filter(t => t.blocked).length,
                threatsDetected: this.state.threats.length,
                protectionActive: this.state.isProtected
            },
            threats: this.state.threats
        };
    }
    
    formatDailySummary(daily) {
        return `
            <div class="daily-summary">
                <p><strong>Date:</strong> ${daily.date}</p>
                <p><strong>Privacy Score:</strong> ${daily.privacyScore}/100</p>
                <p><strong>Trackers Blocked:</strong> ${daily.trackersBlocked}</p>
                <p><strong>Threats Detected:</strong> ${daily.threatsDetected}</p>
                <p><strong>Protection Status:</strong> ${daily.protectionActive ? 'Active' : 'Inactive'}</p>
            </div>
        `;
    }
    
    formatThreatAnalysis(threats) {
        if (threats.length === 0) {
            return '<p>No threats detected in the current session.</p>';
        }
        
        let html = '<div class="threat-list">';
        threats.forEach(threat => {
            html += `
                <div class="threat-item">
                    <span class="threat-type">${threat.type}</span>
                    <span class="threat-severity ${threat.severity}">${threat.severity}</span>
                    <span class="threat-time">${new Date(threat.timestamp).toLocaleTimeString()}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
    
    updateSettingsView() {
        // Settings view is static for now
    }
    
    startRealtimeUpdates() {
        setInterval(async () => {
            await this.updatePrivacyScore();
            this.modules.visualizer.updateRadar(this.state);
            this.modules.visualizer.updateTimeline();
            this.updateMetrics();
            this.updateQuantumScore();
            this.analyzeThreats();
        }, 1000);
    }
    
    updateQuantumScore() {
        if (this.modules.quantum) {
            const quantumScoreData = this.modules.quantum.quantumPrivacyScore();
            const scoreValueElement = document.querySelector('.quantum-score-value');
            if (scoreValueElement) {
                scoreValueElement.textContent = `${quantumScoreData.score} (${quantumScoreData.interpretation})`;
            }
        }
    }
    
    analyzeThreats() {
        if (this.state.threats.length > 0) {
            const latestThreat = this.state.threats[this.state.threats.length - 1];
            if (this.modules.predictor) {
                const analysis = this.modules.predictor.analyzeThreat(latestThreat);
                let predictions = analysis.predictions;

                // Also get the next predicted threat
                const nextThreatPrediction = this.modules.predictor.predictNextThreat();
                if (nextThreatPrediction) {
                    predictions.push({
                        type: 'next_threat_prediction',
                        message: `High chance of encountering a ${nextThreatPrediction.predictedType.replace(/_/g, ' ')} threat next.`,
                        confidence: nextThreatPrediction.confidence,
                        timeframe: nextThreatPrediction.timeframe,
                        severity: 'medium' // Assign a default severity for display
                    });
                }

                this.state.predictions = predictions; // Store predictions
            }
        }
    }
    
    updateMetrics() {
        // Update metric cards
        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 4) {
            metricValues[0].textContent = this.state.trackers.filter(t => t.blocked).length;
            metricValues[1].textContent = Object.keys(this.state.fingerprints).length;
            metricValues[2].textContent = this.state.threats.length;
            
            // Update activity status with risk score
            const activityStatus = metricValues[3];
            const riskScore = this.modules.predictor.calculateRiskScore();
            activityStatus.textContent = `${riskScore}/100`;

            if (riskScore < 20) {
                activityStatus.style.color = 'var(--safe)';
            } else if (riskScore < 60) {
                activityStatus.style.color = 'var(--warning)';
            } else {
                activityStatus.style.color = 'var(--danger)';
            }
        }
    }
    
    updateUI(element, value) {
        if (element === 'privacyScore') {
            const scoreElement = document.querySelector('.score-value');
            const labelElement = document.querySelector('.score-label');
            
            if (scoreElement) {
                // Add visual feedback for score changes
                scoreElement.classList.add('updating');
                scoreElement.textContent = Math.round(value);
                setTimeout(() => {
                    scoreElement.classList.remove('updating');
                }, 500);
            }
            if (labelElement) {
                labelElement.textContent = this.getScoreLabel(value);
            }
        }
    }
    
    getScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        if (score >= 30) return 'Poor';
        return 'Critical';
    }

    // Method to simulate threats for testing
    simulateThreats() {
        const threatTypes = [
            { type: 'canvas_fingerprint', severity: 'medium' },
            { type: 'webgl_fingerprint', severity: 'medium' },
            { type: 'geolocation_access', severity: 'high' },
            { type: 'audio_fingerprint', severity: 'low' },
            { type: 'tracker_detected', severity: 'low' }
        ];
        
        const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        
        const newThreat = {
            ...randomThreat,
            timestamp: Date.now(),
            angle: Math.random() * Math.PI * 2,
            distance: 0.2 + Math.random() * 0.7
        };
        this.state.threats.push(newThreat);
    }
    
    // Auto-simulate threats for demo purposes
    startDemoMode() {
        this.demoInterval = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every second
                this.simulateThreats();
            }
        }, 1000);
    }

    createFallbackUI() {
        // Create basic UI functionality
        try {
            // Setup navigation
            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.switchView(e.target.dataset.view);
                });
            });
            
            // Setup basic metrics
            this.updateBasicMetrics();
            
        } catch (error) {
            console.error('Error in fallback UI:', error);
        }
    }
    
    updateBasicMetrics() {
        // Update basic metrics without complex modules
        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 4) {
            metricValues[0].textContent = '0';
            metricValues[1].textContent = '0';
            metricValues[2].textContent = '0';
            metricValues[3].textContent = 'Normal';
            metricValues[3].style.color = 'var(--safe)';
        }
        
        // Update privacy score
        const scoreElement = document.querySelector('.score-value');
        if (scoreElement) {
            scoreElement.textContent = '100';
        }
        
        const labelElement = document.querySelector('.score-label');
        if (labelElement) {
            labelElement.textContent = 'Excellent';
        }
    }
    
    startBasicUpdates() {
        // Start basic updates without complex modules
        setInterval(() => {
            this.updateBasicMetrics();
        }, 2000);
    }

    updateStatus(message) {
        const statusElement = document.getElementById('statusMessage');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Status:', message);
    }
}

// Global initialization
function initializeFalconGuardian() {
    if (!window.falconGuardianInitialized) {
        try {
            window.falconGuardian = new FalconGuardian();
            window.falconGuardianInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Falcon Guardian:', error);
        }
    }
}

// Initialize when DOM is ready and scripts are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(initializeFalconGuardian, 500);
});

// Fallback initialization
window.addEventListener('load', () => {
    if (!window.falconGuardianInitialized) {
        initializeFalconGuardian();
    }
});
