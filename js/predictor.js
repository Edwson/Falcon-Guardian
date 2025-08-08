/**
 * Predictor Module
 * AI prediction algorithms for privacy threats
 */

class Predictor {
    constructor() {
        this.patterns = [];
        this.threatHistory = [];
        this.predictionModel = null;
    }
    
    init() {
        console.log('Initializing privacy predictor...');
        this.loadPredictionModel();
    }
    
    loadPredictionModel() {
        // Simple pattern-based prediction model
        this.predictionModel = {
            // Known threat patterns
            patterns: {
                canvas_fingerprint: {
                    frequency: 0.8,
                    severity: 'medium',
                    indicators: ['canvas_access', 'toDataURL_call']
                },
                webgl_fingerprint: {
                    frequency: 0.6,
                    severity: 'medium',
                    indicators: ['webgl_context', 'getParameter_call']
                },
                geolocation_access: {
                    frequency: 0.3,
                    severity: 'high',
                    indicators: ['location_request', 'gps_access']
                },
                tracker_network: {
                    frequency: 0.9,
                    severity: 'low',
                    indicators: ['analytics_domain', 'tracking_script']
                }
            },
            
            // Behavioral patterns
            behaviors: {
                rapid_requests: {
                    threshold: 10,
                    timeWindow: 5000, // 5 seconds
                    severity: 'medium'
                },
                suspicious_domains: {
                    threshold: 3,
                    timeWindow: 10000, // 10 seconds
                    severity: 'high'
                }
            }
        };
    }
    
    analyzeThreat(threat) {
        // Add threat to history
        this.threatHistory.push({
            ...threat,
            timestamp: Date.now()
        });
        
        // Keep only last 100 threats
        if (this.threatHistory.length > 100) {
            this.threatHistory = this.threatHistory.slice(-100);
        }
        
        // Analyze patterns
        const patterns = this.detectPatterns(threat);
        const predictions = this.generatePredictions(patterns);
        
        return {
            threat,
            patterns,
            predictions
        };
    }
    
    detectPatterns(currentThreat) {
        const patterns = [];
        const now = Date.now();
        const timeWindow = 60000; // 1 minute
        
        // Filter recent threats
        const recentThreats = this.threatHistory.filter(
            threat => now - threat.timestamp < timeWindow
        );
        
        // Pattern 1: Rapid threats of same type
        const sameTypeThreats = recentThreats.filter(
            threat => threat.type === currentThreat.type
        );
        
        if (sameTypeThreats.length > 3) {
            patterns.push({
                type: 'rapid_repetition',
                threatType: currentThreat.type,
                count: sameTypeThreats.length,
                severity: 'medium'
            });
        }
        
        // Pattern 2: Multiple different threat types
        const uniqueThreatTypes = new Set(recentThreats.map(t => t.type));
        if (uniqueThreatTypes.size > 5) {
            patterns.push({
                type: 'multiple_threat_types',
                count: uniqueThreatTypes.size,
                severity: 'high'
            });
        }
        
        // Pattern 3: High severity threats
        const highSeverityThreats = recentThreats.filter(
            threat => threat.severity === 'high' || threat.severity === 'critical'
        );
        
        if (highSeverityThreats.length > 2) {
            patterns.push({
                type: 'high_severity_cluster',
                count: highSeverityThreats.length,
                severity: 'critical'
            });
        }
        
        return patterns;
    }
    
    generatePredictions(patterns) {
        const predictions = [];
        
        patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'rapid_repetition':
                    predictions.push({
                        type: 'escalation_prediction',
                        message: `Expected escalation of ${pattern.threatType} attacks`,
                        confidence: 0.8,
                        timeframe: '5-10 minutes',
                        severity: pattern.severity
                    });
                    break;
                    
                case 'multiple_threat_types':
                    predictions.push({
                        type: 'coordinated_attack',
                        message: 'Detected coordinated privacy attack pattern',
                        confidence: 0.9,
                        timeframe: 'immediate',
                        severity: 'high'
                    });
                    break;
                    
                case 'high_severity_cluster':
                    predictions.push({
                        type: 'critical_threat',
                        message: 'Critical privacy threat detected - immediate action required',
                        confidence: 0.95,
                        timeframe: 'immediate',
                        severity: 'critical'
                    });
                    break;
            }
        });
        
        return predictions;
    }
    
    predictNextThreat() {
        if (this.threatHistory.length < 3) {
            return null;
        }
        
        const recentThreats = this.threatHistory.slice(-10);
        const threatTypes = recentThreats.map(t => t.type);
        
        // Simple frequency-based prediction
        const frequency = {};
        threatTypes.forEach(type => {
            frequency[type] = (frequency[type] || 0) + 1;
        });
        
        // Find most frequent threat type
        const mostFrequent = Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (mostFrequent && mostFrequent[1] > 2) {
            return {
                predictedType: mostFrequent[0],
                confidence: Math.min(0.8, mostFrequent[1] / 10),
                timeframe: 'within 30 seconds'
            };
        }
        
        return null;
    }
    
    calculateRiskScore() {
        const now = Date.now();
        const timeWindow = 300000; // 5 minutes
        const recentThreats = this.threatHistory.filter(
            threat => now - threat.timestamp < timeWindow
        );
        
        let riskScore = 0;
        
        recentThreats.forEach(threat => {
            switch (threat.severity) {
                case 'critical':
                    riskScore += 10;
                    break;
                case 'high':
                    riskScore += 5;
                    break;
                case 'medium':
                    riskScore += 2;
                    break;
                case 'low':
                    riskScore += 1;
                    break;
            }
        });
        
        // Normalize to 0-100 scale
        return Math.min(100, riskScore);
    }
    
    getThreatTrends() {
        const now = Date.now();
        const timeWindows = {
            '1min': 60000,
            '5min': 300000,
            '15min': 900000
        };
        
        const trends = {};
        
        Object.entries(timeWindows).forEach(([window, duration]) => {
            const threatsInWindow = this.threatHistory.filter(
                threat => now - threat.timestamp < duration
            );
            
            trends[window] = {
                count: threatsInWindow.length,
                types: [...new Set(threatsInWindow.map(t => t.type))],
                severity: this.calculateAverageSeverity(threatsInWindow)
            };
        });
        
        return trends;
    }
    
    calculateAverageSeverity(threats) {
        if (threats.length === 0) return 'none';
        
        const severityValues = {
            'critical': 4,
            'high': 3,
            'medium': 2,
            'low': 1
        };
        
        const totalSeverity = threats.reduce((sum, threat) => {
            return sum + (severityValues[threat.severity] || 0);
        }, 0);
        
        const average = totalSeverity / threats.length;
        
        if (average >= 3.5) return 'critical';
        if (average >= 2.5) return 'high';
        if (average >= 1.5) return 'medium';
        return 'low';
    }
    
    // Machine learning inspired methods
    
    trainModel() {
        // In a real implementation, this would use actual ML
        // For now, we use pattern recognition
        console.log('Training prediction model...');
        
        // Analyze historical patterns
        const patterns = this.extractPatterns();
        this.updateModel(patterns);
    }
    
    extractPatterns() {
        const patterns = {
            timeBased: {},
            typeBased: {},
            severityBased: {}
        };
        
        this.threatHistory.forEach(threat => {
            const hour = new Date(threat.timestamp).getHours();
            patterns.timeBased[hour] = (patterns.timeBased[hour] || 0) + 1;
            
            patterns.typeBased[threat.type] = (patterns.typeBased[threat.type] || 0) + 1;
            patterns.severityBased[threat.severity] = (patterns.severityBased[threat.severity] || 0) + 1;
        });
        
        return patterns;
    }
    
    updateModel(patterns) {
        // Update prediction model with new patterns
        this.predictionModel.patterns = {
            ...this.predictionModel.patterns,
            ...patterns
        };
    }
}
