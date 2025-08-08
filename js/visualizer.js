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
        
        const draw = () => {
            // Clear canvas
            this.radarCtx.fillStyle = 'var(--paper)';
            this.radarCtx.fillRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
            
            // Draw concentric circles
            this.radarCtx.strokeStyle = 'var(--ash)';
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
            gradient.addColorStop(0, 'var(--accent)');
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
        
        threats.forEach((threat, index) => {
            const angle = (index / Math.max(threats.length, 1)) * Math.PI * 2;
            const distance = Math.random() * maxRadius * 0.8;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Draw threat dot
            this.radarCtx.fillStyle = this.getThreatColor(threat.severity);
            this.radarCtx.beginPath();
            this.radarCtx.arc(x, y, 4, 0, Math.PI * 2);
            this.radarCtx.fill();
            
            // Draw pulsing effect
            this.radarCtx.strokeStyle = this.getThreatColor(threat.severity);
            this.radarCtx.globalAlpha = 0.3;
            this.radarCtx.beginPath();
            this.radarCtx.arc(x, y, 8, 0, Math.PI * 2);
            this.radarCtx.stroke();
            this.radarCtx.globalAlpha = 1;
        });
    }
    
    getThreatColor(severity) {
        switch(severity) {
            case 'critical': return 'var(--danger)';
            case 'high': return 'var(--warning)';
            case 'medium': return 'var(--accent)';
            default: return 'var(--graphite)';
        }
    }
    
    initTimeline(canvasId) {
        this.timelineCanvas = document.getElementById(canvasId);
        if (!this.timelineCanvas) return;
        
        this.timelineCtx = this.timelineCanvas.getContext('2d');
        
        // Initialize timeline
        this.drawTimeline();
    }
    
    drawTimeline() {
        if (!this.timelineCanvas || !this.timelineCtx) return;
        
        const canvas = this.timelineCanvas;
        const ctx = this.timelineCtx;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.fillStyle = 'var(--paper)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw timeline
        const timelineData = this.getTimelineData();
        
        if (timelineData.length === 0) {
            // Draw empty state
            ctx.fillStyle = 'var(--graphite)';
            ctx.font = '14px var(--font-primary)';
            ctx.textAlign = 'center';
            ctx.fillText('No privacy events recorded', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw timeline line
        ctx.strokeStyle = 'var(--ash)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height / 2);
        ctx.lineTo(canvas.width - 50, canvas.height / 2);
        ctx.stroke();
        
        // Draw events
        timelineData.forEach((event, index) => {
            const x = 50 + (index / (timelineData.length - 1)) * (canvas.width - 100);
            const y = canvas.height / 2;
            
            // Draw event dot
            ctx.fillStyle = this.getEventColor(event.type);
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw event label
            ctx.fillStyle = 'var(--ink)';
            ctx.font = '12px var(--font-primary)';
            ctx.textAlign = 'center';
            ctx.fillText(event.type, x, y + 20);
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
                return 'var(--warning)';
            case 'geolocation_access':
                return 'var(--danger)';
            case 'tracker_blocked':
                return 'var(--safe)';
            default:
                return 'var(--accent)';
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
