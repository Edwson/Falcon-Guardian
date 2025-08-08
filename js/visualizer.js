/**
 * Visualizer Module
 * Creates all visual representations of privacy data
 */

class Visualizer {
    constructor() {
        this.radarCanvas = null;
        this.radarCtx = null;
        this.timelineCanvas = null;
        this.timelineCtx = null;
        this.animationFrameId = null;
    }
    
    initRadar(canvasId) {
        this.radarCanvas = document.getElementById(canvasId);
        if (!this.radarCanvas) return;
        
        this.radarCtx = this.radarCanvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start radar animation
        this.animateRadar();
    }
    
    resizeCanvas() {
        if (!this.radarCanvas) return;
        
        const container = this.radarCanvas.parentElement;
        this.radarCanvas.width = container.offsetWidth;
        this.radarCanvas.height = container.offsetHeight;
    }
    
    animateRadar() {
        if (!this.radarCanvas || !this.radarCtx) return;
        
        const centerX = this.radarCanvas.width / 2;
        const centerY = this.radarCanvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        let sweepAngle = 0;
        
        const computedStyle = getComputedStyle(this.radarCanvas);

        const draw = () => {
            const paperColor = computedStyle.getPropertyValue('--paper').trim();
            const ashColor = computedStyle.getPropertyValue('--ash').trim();
            const accentColor = computedStyle.getPropertyValue('--accent').trim();

            // Clear canvas
            this.radarCtx.fillStyle = paperColor;
            this.radarCtx.fillRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
            
            // Draw concentric circles
            this.radarCtx.strokeStyle = ashColor;
            this.radarCtx.lineWidth = 1;
            
            for (let i = 1; i <= 4; i++) {
                this.radarCtx.beginPath();
                this.radarCtx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
                this.radarCtx.stroke();
            }
            
            // Draw cross lines
            this.radarCtx.beginPath();
            this.radarCtx.moveTo(centerX - maxRadius, centerY);
            this.radarCtx.lineTo(centerX + maxRadius, centerY);
            this.radarCtx.moveTo(centerX, centerY - maxRadius);
            this.radarCtx.lineTo(centerX, centerY + maxRadius);
            this.radarCtx.stroke();
            
            // Draw sweep line
            this.radarCtx.save();
            this.radarCtx.translate(centerX, centerY);
            this.radarCtx.rotate(sweepAngle);
            
            // Create gradient for sweep
            const gradient = this.radarCtx.createLinearGradient(0, 0, maxRadius, 0);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(1, 'transparent');
            
            this.radarCtx.strokeStyle = gradient;
            this.radarCtx.lineWidth = 2;
            this.radarCtx.beginPath();
            this.radarCtx.moveTo(0, 0);
            this.radarCtx.lineTo(maxRadius, 0);
            this.radarCtx.stroke();
            
            this.radarCtx.restore();
            
            // Draw threat dots
            this.drawThreats(centerX, centerY, maxRadius);
            
            // Update sweep angle
            sweepAngle += 0.02;
            if (sweepAngle > Math.PI * 2) sweepAngle = 0;
            
            this.animationFrameId = requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    drawThreats(centerX, centerY, maxRadius) {
        if (!window.falconGuardian || !window.falconGuardian.state) return;
        
        const threats = window.falconGuardian.state.threats;
        
        threats.forEach(threat => {
            // Use pre-calculated angle and distance if they exist
            const angle = threat.angle ?? 0;
            const distance = (threat.distance ?? 0.5) * maxRadius;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Draw threat dot
            this.radarCtx.fillStyle = this.getThreatColor(threat.severity);
            this.radarCtx.beginPath();
            this.radarCtx.arc(x, y, 4, 0, Math.PI * 2);
            this.radarCtx.fill();
            
            // Draw pulsing effect for recent threats
            const threatAge = Date.now() - threat.timestamp;
            if (threatAge < 2000) { // Pulse for 2 seconds
                const pulseAlpha = 1 - (threatAge / 2000);
                this.radarCtx.strokeStyle = this.getThreatColor(threat.severity);
                this.radarCtx.globalAlpha = pulseAlpha * 0.5;
                this.radarCtx.lineWidth = 2;
                this.radarCtx.beginPath();
                this.radarCtx.arc(x, y, 4 + (1 - pulseAlpha) * 10, 0, Math.PI * 2); // Expanding ring
                this.radarCtx.stroke();
                this.radarCtx.globalAlpha = 1;
            }
        });
    }
    
    _getComputedColor(variable) {
        if (!this.radarCanvas) return '#000000';
        return getComputedStyle(this.radarCanvas).getPropertyValue(variable).trim();
    }

    getThreatColor(severity) {
        switch(severity) {
            case 'critical': return this._getComputedColor('--danger');
            case 'high': return this._getComputedColor('--warning');
            case 'medium': return this._getComputedColor('--accent');
            default: return this._getComputedColor('--graphite');
        }
    }
    
    initTimeline(canvasId) {
        this.timelineCanvas = document.getElementById(canvasId);
        if (!this.timelineCanvas) return;
        
        this.timelineCtx = this.timelineCanvas.getContext('2d');
        
        // Initialize timeline
        this.drawTimeline();
    }
    
    updateTimeline() {
        this.drawTimeline();
    }

    drawTimeline() {
        if (!this.timelineCanvas || !this.timelineCtx) return;
        
        const canvas = this.timelineCanvas;
        const ctx = this.timelineCtx;
        
        // Set canvas size
        const currentWidth = canvas.offsetWidth;
        if (canvas.width !== currentWidth) {
            canvas.width = currentWidth;
        }
        canvas.height = canvas.offsetHeight;
        
        const paperColor = this._getComputedColor('--paper');
        const graphiteColor = this._getComputedColor('--graphite');
        const ashColor = this._getComputedColor('--ash');
        const inkColor = this._getComputedColor('--ink');

        // Clear canvas
        ctx.fillStyle = paperColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw timeline
        const timelineData = this.getTimelineData();
        
        if (timelineData.length === 0) {
            // Draw empty state
            ctx.fillStyle = graphiteColor;
            ctx.font = '14px var(--font-primary)';
            ctx.textAlign = 'center';
            ctx.fillText('No privacy events recorded', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw timeline line
        ctx.strokeStyle = ashColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height / 2);
        ctx.lineTo(canvas.width - 50, canvas.height / 2);
        ctx.stroke();
        
        // Draw events
        const spacing = timelineData.length > 1 ? (canvas.width - 100) / (timelineData.length - 1) : 0;
        timelineData.forEach((event, index) => {
            const x = 50 + index * spacing;
            const y = canvas.height / 2;
            
            // Draw event dot
            ctx.fillStyle = this.getEventColor(event.type);
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw event label
            ctx.fillStyle = inkColor;
            ctx.font = '12px var(--font-primary)';
            ctx.textAlign = 'center';
            ctx.fillText(event.type.replace(/_/g, ' '), x, y + 25);
        });
    }
    
    getTimelineData() {
        if (!window.falconGuardian || !window.falconGuardian.state) return [];
        
        const threats = window.falconGuardian.state.threats;
        const trackers = window.falconGuardian.state.trackers;
        
        const events = [];
        
        // Add threats
        threats.forEach(threat => {
            events.push({
                type: threat.type,
                timestamp: threat.timestamp,
                severity: threat.severity
            });
        });
        
        // Add trackers
        trackers.forEach(tracker => {
            events.push({
                type: 'tracker_blocked',
                timestamp: tracker.timestamp,
                severity: 'medium'
            });
        });
        
        // Sort by timestamp
        events.sort((a, b) => a.timestamp - b.timestamp);
        
        return events.slice(-10); // Show last 10 events
    }
    
    getEventColor(eventType) {
        switch(eventType) {
            case 'canvas_fingerprint':
            case 'webgl_fingerprint':
                return this._getComputedColor('--warning');
            case 'geolocation_access':
                return this._getComputedColor('--danger');
            case 'tracker_blocked':
                return this._getComputedColor('--safe');
            default:
                return this._getComputedColor('--accent');
        }
    }
    
    updateRadar(state) {
        // Update radar with new state data
        // Called from core.js during real-time updates
        if (state.threats.length > 0) {
            // Add visual feedback for new threats
            this.pulseRadar();
        }
    }
    
    pulseRadar() {
        // Add a pulse effect when new threats are detected
        if (this.radarCanvas) {
            const container = this.radarCanvas.parentElement;
            container.classList.add('pulse');
            setTimeout(() => {
                container.classList.remove('pulse');
            }, 1000);
        }
    }
    
    // Cleanup method
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
