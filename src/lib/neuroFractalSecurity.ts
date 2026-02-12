import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

// Encryption utilities for NeuroFractal states
export class NeuroFractalSecurity {
  private static readonly ENCRYPTION_KEY = process.env.VITE_NEURO_FRACTAL_ENCRYPTION_KEY || 'default-neuro-key-2024';
  private static readonly ALGORITHM = 'AES';

  // Encrypt sensitive neural state data
  static encryptNeuralState(data: Record<string, any>): string {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonString, this.ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt neural state');
    }
  }

  // Decrypt neural state data
  static decryptNeuralState(encryptedData: string): Record<string, any> {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt neural state');
    }
  }

  // Generate quantum-resistant hash for state integrity
  static generateStateHash(state: Record<string, any>): string {
    const stateString = JSON.stringify(state, Object.keys(state).sort());
    return CryptoJS.SHA256(stateString).toString();
  }

  // Verify state integrity
  static verifyStateIntegrity(state: Record<string, any>, hash: string): boolean {
    const computedHash = this.generateStateHash(state);
    return computedHash === hash;
  }

  // Create secure session token
  static generateSessionToken(sessionId: string, userId: string): string {
    const payload = {
      sessionId,
      userId,
      timestamp: Date.now(),
      nonce: CryptoJS.lib.WordArray.random(16).toString()
    };
    return this.encryptNeuralState(payload);
  }

  // Validate session token
  static validateSessionToken(token: string): { sessionId: string; userId: string } | null {
    try {
      const payload = this.decryptNeuralState(token);
      const now = Date.now();
      const tokenAge = now - payload.timestamp;

      // Token expires after 24 hours
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return {
        sessionId: payload.sessionId,
        userId: payload.userId
      };
    } catch (error) {
      return null;
    }
  }
}

// Audit trail system for cognitive security
export class NeuroFractalAudit {
  static async logAccess(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('neuro_fractal_metrics')
        .insert({
          user_id: userId,
          metric_type: 'audit_access',
          metric_value: 1,
          metric_metadata: {
            action,
            resource,
            resourceId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ipAddress: 'client-side', // Would be server-side in production
            ...metadata
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit failures shouldn't break functionality
    }
  }

  static async logStateChange(
    sessionId: string,
    userId: string,
    oldState: Record<string, any>,
    newState: Record<string, any>,
    changeReason: string
  ): Promise<void> {
    try {
      const changeDelta = this.calculateStateDelta(oldState, newState);

      const { error } = await supabase
        .from('neuro_fractal_metrics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          metric_type: 'state_change',
          metric_value: changeDelta.magnitude,
          metric_metadata: {
            changeReason,
            oldStateHash: NeuroFractalSecurity.generateStateHash(oldState),
            newStateHash: NeuroFractalSecurity.generateStateHash(newState),
            delta: changeDelta,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('State change logging failed:', error);
    }
  }

  static async logAnomaly(
    sessionId: string,
    userId: string,
    anomalyType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): Promise<void> {
    try {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 1;

      const { error } = await supabase
        .from('neuro_fractal_metrics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          metric_type: 'anomaly_detected',
          metric_value: severityScore,
          metric_metadata: {
            anomalyType,
            severity,
            details,
            timestamp: new Date().toISOString(),
            requiresAttention: severity === 'high' || severity === 'critical'
          }
        });

      if (error) throw error;

      // Trigger alerts for high-severity anomalies
      if (severity === 'high' || severity === 'critical') {
        await this.triggerSecurityAlert(sessionId, userId, anomalyType, severity, details);
      }
    } catch (error) {
      console.error('Anomaly logging failed:', error);
    }
  }

  private static calculateStateDelta(oldState: Record<string, any>, newState: Record<string, any>) {
    const delta: Record<string, { old: any; new: any; change: number }> = {};
    let totalMagnitude = 0;

    const allKeys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);

    for (const key of allKeys) {
      const oldVal = oldState[key] || 0;
      const newVal = newState[key] || 0;

      if (typeof oldVal === 'number' && typeof newVal === 'number') {
        const change = Math.abs(newVal - oldVal);
        delta[key] = { old: oldVal, new: newVal, change };
        totalMagnitude += change;
      } else {
        delta[key] = { old: oldVal, new: newVal, change: oldVal !== newVal ? 1 : 0 };
        if (oldVal !== newVal) totalMagnitude += 1;
      }
    }

    return {
      delta,
      magnitude: totalMagnitude,
      significant: totalMagnitude > 0.5 // Threshold for significant changes
    };
  }

  private static async triggerSecurityAlert(
    sessionId: string,
    userId: string,
    anomalyType: string,
    severity: string,
    details: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would send alerts to administrators
    // For now, we'll log it as a special metric
    try {
      const { error } = await supabase
        .from('neuro_fractal_metrics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          metric_type: 'security_alert',
          metric_value: 1,
          metric_metadata: {
            alertType: 'anomaly_detected',
            anomalyType,
            severity,
            details,
            timestamp: new Date().toISOString(),
            status: 'pending_review'
          }
        });

      if (error) throw error;

      console.warn(`Security Alert: ${severity} severity ${anomalyType} detected in session ${sessionId}`);
    } catch (error) {
      console.error('Security alert creation failed:', error);
    }
  }
}

// Cognitive pattern analysis for anomaly detection
export class CognitivePatternAnalyzer {
  private static readonly NORMAL_RANGES = {
    coherence: { min: 0.3, max: 0.9 },
    complexity: { min: 0.2, max: 0.8 },
    resonance: { min: 0.4, max: 0.95 },
    adaptationLevel: { min: 0.1, max: 0.9 },
    emotionalStability: { min: 0.2, max: 0.9 },
    cognitiveLoad: { min: 0.1, max: 0.7 }
  };

  static analyzeStateAnomalies(state: Record<string, any>): {
    anomalies: Array<{ type: string; severity: string; description: string }>;
    riskScore: number;
  } {
    const anomalies = [];
    let riskScore = 0;

    // Check coherence anomalies
    if (state.coherence < this.NORMAL_RANGES.coherence.min) {
      anomalies.push({
        type: 'low_coherence',
        severity: state.coherence < 0.1 ? 'critical' : 'high',
        description: 'Coherence level critically low - potential cognitive dissonance'
      });
      riskScore += state.coherence < 0.1 ? 10 : 5;
    }

    if (state.coherence > this.NORMAL_RANGES.coherence.max) {
      anomalies.push({
        type: 'high_coherence',
        severity: 'medium',
        description: 'Unusually high coherence - possible overfitting or rigidity'
      });
      riskScore += 3;
    }

    // Check complexity anomalies
    if (state.complexity < this.NORMAL_RANGES.complexity.min) {
      anomalies.push({
        type: 'low_complexity',
        severity: 'medium',
        description: 'Complexity too low - potential oversimplification'
      });
      riskScore += 3;
    }

    if (state.complexity > this.NORMAL_RANGES.complexity.max) {
      anomalies.push({
        type: 'high_complexity',
        severity: 'high',
        description: 'Complexity critically high - potential cognitive overload'
      });
      riskScore += 5;
    }

    // Check resonance anomalies
    if (state.resonance < this.NORMAL_RANGES.resonance.min) {
      anomalies.push({
        type: 'low_resonance',
        severity: 'high',
        description: 'Resonance critically low - poor neural synchronization'
      });
      riskScore += 5;
    }

    // Check adaptation anomalies
    if (state.adaptationLevel < this.NORMAL_RANGES.adaptationLevel.min) {
      anomalies.push({
        type: 'low_adaptation',
        severity: 'medium',
        description: 'Adaptation level low - system not learning effectively'
      });
      riskScore += 3;
    }

    // Check for sudden changes (would need historical data in real implementation)
    if (state.cognitiveLoad > this.NORMAL_RANGES.cognitiveLoad.max) {
      anomalies.push({
        type: 'high_cognitive_load',
        severity: 'high',
        description: 'Cognitive load critically high - risk of mental fatigue'
      });
      riskScore += 5;
    }

    return { anomalies, riskScore };
  }

  static detectPatternDrift(
    currentPatterns: Record<string, any>,
    baselinePatterns: Record<string, any>
  ): { driftDetected: boolean; driftScore: number; concerns: string[] } {
    const concerns = [];
    let driftScore = 0;

    // Compare pattern distributions
    for (const [pattern, currentValue] of Object.entries(currentPatterns)) {
      const baselineValue = baselinePatterns[pattern];

      if (baselineValue !== undefined) {
        const drift = Math.abs(currentValue - baselineValue);

        if (drift > 0.3) { // Significant drift threshold
          concerns.push(`Significant drift in ${pattern}: ${drift.toFixed(3)}`);
          driftScore += drift;
        }
      }
    }

    return {
      driftDetected: driftScore > 0.5,
      driftScore,
      concerns
    };
  }
}

// Privacy-preserving data processing
export class PrivacyGuard {
  static anonymizeUserData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };

    // Remove or hash personally identifiable information
    if (anonymized.userId) {
      anonymized.userId = CryptoJS.SHA256(anonymized.userId).toString().substring(0, 16);
    }

    if (anonymized.email) {
      delete anonymized.email;
    }

    if (anonymized.fullName) {
      delete anonymized.fullName;
    }

    // Add noise to prevent re-identification
    if (anonymized.location && typeof anonymized.location === 'object') {
      anonymized.location = {
        ...anonymized.location,
        noise: Math.random() * 0.01 // Add small random noise
      };
    }

    return anonymized;
  }

  static checkDataRetention(sessionCreated: string): { shouldRetain: boolean; reason: string } {
    const createdDate = new Date(sessionCreated);
    const now = new Date();
    const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > 365) { // 1 year retention
      return {
        shouldRetain: false,
        reason: 'Data exceeds retention period (1 year)'
      };
    }

    return {
      shouldRetain: true,
      reason: 'Within retention period'
    };
  }

  static async generatePrivacyReport(userId: string): Promise<Record<string, any>> {
    // Generate a privacy report for the user
    const { data, error } = await supabase
      .from('neuro_fractal_metrics')
      .select('metric_type, metric_metadata, created_at')
      .eq('user_id', userId)
      .eq('metric_type', 'audit_access');

    if (error) throw error;

    return {
      userId: CryptoJS.SHA256(userId).toString().substring(0, 16),
      dataPoints: data?.length || 0,
      lastAccess: data?.[0]?.created_at || null,
      accessPatterns: data?.map(d => {
        const metadata = d.metric_metadata as Record<string, any>;
        return {
          action: metadata?.action,
          timestamp: d.created_at,
          resource: metadata?.resource
        };
      }) || [],
      privacyScore: Math.min(100, Math.max(0, 100 - (data?.length || 0) * 2)) // Simple scoring
    };
  }
}
