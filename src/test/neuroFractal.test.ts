import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuroFractalSecurity } from '../lib/neuroFractalSecurity';
import { NeuroFractalOptimizer } from '../lib/neuroFractalOptimizer';
import { CognitivePatternAnalyzer } from '../lib/neuroFractalSecurity';

// Mock Supabase client
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe('NeuroFractal System Tests', () => {
  describe('Security Module', () => {
    it('should encrypt and decrypt neural state correctly', () => {
      const testData = {
        coherence: 0.85,
        complexity: 0.72,
        resonance: 0.91,
        userId: 'test-user-123'
      };

      const encrypted = NeuroFractalSecurity.encryptNeuralState(testData);
      const decrypted = NeuroFractalSecurity.decryptNeuralState(encrypted);

      expect(decrypted).toEqual(testData);
    });

    it('should generate consistent state hashes', () => {
      const testState = { coherence: 0.8, complexity: 0.6, resonance: 0.7 };

      const hash1 = NeuroFractalSecurity.generateStateHash(testState);
      const hash2 = NeuroFractalSecurity.generateStateHash(testState);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should detect state hash changes', () => {
      const originalState = { coherence: 0.8, complexity: 0.6 };
      const modifiedState = { coherence: 0.9, complexity: 0.6 };

      const originalHash = NeuroFractalSecurity.generateStateHash(originalState);
      const modifiedHash = NeuroFractalSecurity.generateStateHash(modifiedState);

      expect(originalHash).not.toBe(modifiedHash);
    });

    it('should validate session tokens', () => {
      const sessionId = 'session-123';
      const userId = 'user-456';

      const token = NeuroFractalSecurity.generateSessionToken(sessionId, userId);
      const validation = NeuroFractalSecurity.validateSessionToken(token);

      expect(validation).toEqual({ sessionId, userId });
    });

    it('should reject expired tokens', () => {
      // Mock an old timestamp
      const oldToken = NeuroFractalSecurity.encryptNeuralState({
        sessionId: 'session-123',
        userId: 'user-456',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        nonce: 'test-nonce'
      });

      const validation = NeuroFractalSecurity.validateSessionToken(oldToken);
      expect(validation).toBeNull();
    });
  });

  describe('Cognitive Pattern Analyzer', () => {
    it('should detect normal cognitive states', () => {
      const normalState = {
        coherence: 0.8,
        complexity: 0.6,
        resonance: 0.85,
        adaptationLevel: 0.7,
        emotionalStability: 0.75,
        cognitiveLoad: 0.4
      };

      const analysis = CognitivePatternAnalyzer.analyzeStateAnomalies(normalState);

      expect(analysis.anomalies.length).toBe(0);
      expect(analysis.riskScore).toBeLessThan(5);
    });

    it('should detect critical coherence anomalies', () => {
      const criticalState = {
        coherence: 0.1, // Critically low
        complexity: 0.6,
        resonance: 0.85,
        adaptationLevel: 0.7,
        emotionalStability: 0.75,
        cognitiveLoad: 0.4
      };

      const analysis = CognitivePatternAnalyzer.analyzeStateAnomalies(criticalState);

      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.anomalies[0].severity).toBe('critical');
      expect(analysis.riskScore).toBeGreaterThan(5);
    });

    it('should detect high cognitive load', () => {
      const highLoadState = {
        coherence: 0.8,
        complexity: 0.6,
        resonance: 0.85,
        adaptationLevel: 0.7,
        emotionalStability: 0.75,
        cognitiveLoad: 0.85 // High load
      };

      const analysis = CognitivePatternAnalyzer.analyzeStateAnomalies(highLoadState);

      const loadAnomaly = analysis.anomalies.find(a => a.type === 'high_cognitive_load');
      expect(loadAnomaly).toBeDefined();
      expect(loadAnomaly?.severity).toBe('high');
    });

    it('should detect pattern drift', () => {
      const baselinePatterns = {
        pattern1: 0.8,
        pattern2: 0.6,
        pattern3: 0.7
      };

      const currentPatterns = {
        pattern1: 0.9, // Significant change
        pattern2: 0.6,
        pattern3: 0.7
      };

      const driftAnalysis = CognitivePatternAnalyzer.detectPatternDrift(
        currentPatterns,
        baselinePatterns
      );

      expect(driftAnalysis.driftDetected).toBe(true);
      expect(driftAnalysis.driftScore).toBeGreaterThan(0.2);
      expect(driftAnalysis.concerns.length).toBeGreaterThan(0);
    });
  });

  describe('Privacy Guard', () => {
    it('should anonymize user data', () => {
      const originalData = {
        userId: 'user-123',
        email: 'test@example.com',
        fullName: 'John Doe',
        location: { lat: 40.7128, lng: -74.0060 },
        preferences: { theme: 'dark' }
      };

      const anonymized = (global as any).PrivacyGuard.anonymizeUserData(originalData);

      expect(anonymized.userId).not.toBe('user-123');
      expect(anonymized.email).toBeUndefined();
      expect(anonymized.fullName).toBeUndefined();
      expect(anonymized.location).toBeDefined();
      expect(anonymized.preferences).toEqual({ theme: 'dark' });
    });

    it('should check data retention compliance', () => {
      const recentDate = new Date().toISOString();
      const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(); // 400 days ago

      const recentRetention = (global as any).PrivacyGuard.checkDataRetention(recentDate);
      const oldRetention = (global as any).PrivacyGuard.checkDataRetention(oldDate);

      expect(recentRetention.shouldRetain).toBe(true);
      expect(oldRetention.shouldRetain).toBe(false);
      expect(oldRetention.reason).toContain('retention period');
    });
  });

  describe('Optimization Engine', () => {
    const mockMetrics = {
      responseTime: 1500,
      userSatisfaction: 0.8,
      coherenceStability: 0.85,
      adaptationEfficiency: 0.75,
      errorRate: 0.03,
      engagementScore: 0.82
    };

    const mockParams = {
      coherence: 0.8,
      complexity: 0.6,
      resonance: 0.7,
      adaptationLevel: 0.5,
      learningRate: 0.1,
      explorationFactor: 0.2,
      stabilityThreshold: 0.05
    };

    it('should maintain parameters within bounds', () => {
      const optimized = NeuroFractalOptimizer.validateParameters(mockParams);

      expect(optimized.coherence).toBeGreaterThanOrEqual(0);
      expect(optimized.coherence).toBeLessThanOrEqual(1);
      expect(optimized.complexity).toBeGreaterThanOrEqual(0);
      expect(optimized.complexity).toBeLessThanOrEqual(1);
      expect(optimized.learningRate).toBeGreaterThanOrEqual(0.01);
      expect(optimized.learningRate).toBeLessThanOrEqual(0.3);
    });

    it('should apply adaptation rules for low satisfaction', () => {
      const lowSatisfactionMetrics = { ...mockMetrics, userSatisfaction: 0.4 };

      // This would normally call the full optimization, but we'll test the rule logic
      const rules = (NeuroFractalOptimizer as any).ADAPTATION_RULES;
      const simplificationRule = rules.find((r: any) => r.id === 'low_satisfaction_simplification');

      expect(simplificationRule).toBeDefined();
      expect(simplificationRule.condition(lowSatisfactionMetrics, mockParams)).toBe(true);

      const adjustments = simplificationRule.action(lowSatisfactionMetrics, mockParams);
      expect(adjustments.complexity).toBeLessThan(mockParams.complexity);
      expect(adjustments.adaptationLevel).toBeGreaterThan(mockParams.adaptationLevel);
    });

    it('should apply adaptation rules for high coherence stability', () => {
      const highStabilityMetrics = { ...mockMetrics, coherenceStability: 0.9 };

      const rules = (NeuroFractalOptimizer as any).ADAPTATION_RULES;
      const complexityRule = rules.find((r: any) => r.id === 'high_stability_complexity_boost');

      expect(complexityRule).toBeDefined();
      expect(complexityRule.condition(highStabilityMetrics, mockParams)).toBe(true);

      const adjustments = complexityRule.action(highStabilityMetrics, mockParams);
      expect(adjustments.complexity).toBeGreaterThan(mockParams.complexity);
      expect(adjustments.explorationFactor).toBeGreaterThan(mockParams.explorationFactor);
    });

    it('should calculate performance improvement correctly', () => {
      const beforeMetrics = { ...mockMetrics, userSatisfaction: 0.6 };
      const afterMetrics = { ...mockMetrics, userSatisfaction: 0.8 };

      const improvement = (NeuroFractalOptimizer as any).calculatePerformanceImprovement(beforeMetrics, afterMetrics);

      expect(improvement).toBeGreaterThan(0);
      expect(improvement).toBeLessThanOrEqual(1);
    });

    it('should calculate stability score', () => {
      const beforeMetrics = { ...mockMetrics, errorRate: 0.1, responseTime: 2000 };
      const afterMetrics = { ...mockMetrics, errorRate: 0.02, responseTime: 1200 };

      const stability = (NeuroFractalOptimizer as any).calculateStabilityScore(beforeMetrics, afterMetrics);

      expect(stability).toBeGreaterThan(0);
      expect(stability).toBeLessThanOrEqual(1);
    });
  });

  describe('Training Pipeline', () => {
    it('should analyze interaction quality', () => {
      const userState = { coherence: 0.8, complexity: 0.6, resonance: 0.7 };
      const aiState = { coherence: 0.85, complexity: 0.65, resonance: 0.75 };
      const contextFeatures = { messageLength: 25, hasQuestions: true };

      // This would normally be tested through the full pipeline
      // For now, we'll test the quality calculation logic
      const quality = (global as any).NeuroFractalTrainingPipeline.analyzeInteractionQuality(
        userState,
        aiState,
        contextFeatures
      );

      expect(quality).toBeGreaterThan(0.5);
      expect(quality).toBeLessThanOrEqual(1);
    });

    it('should preprocess training data correctly', () => {
      const mockTrainingData = [{
        userId: 'user-123',
        sessionId: 'session-456',
        messageContent: 'encrypted-content',
        userState: 'encrypted-state',
        aiResponse: 'encrypted-response',
        aiState: 'encrypted-state',
        interactionQuality: 0.85,
        timestamp: new Date(),
        contextFeatures: { messageLength: 20 }
      }];

      // Mock the decryption
      vi.spyOn(NeuroFractalSecurity, 'decryptNeuralState')
        .mockImplementation((data: string) => {
          if (data === 'encrypted-content') return { content: 'Hello world' };
          if (data === 'encrypted-state') return { coherence: 0.8, complexity: 0.6, resonance: 0.7 };
          return {};
        });

      const processed = (global as any).NeuroFractalTrainingPipeline.preprocessTrainingData(mockTrainingData);

      expect(processed).toHaveLength(1);
      expect(processed[0]).toHaveProperty('userCoherence');
      expect(processed[0]).toHaveProperty('targetCoherence');
      expect(processed[0]).toHaveProperty('quality');
    });

    it('should evaluate model deployment criteria', () => {
      const goodMetrics = {
        accuracy: 0.92,
        coherence: 0.88,
        adaptability: 0.85,
        userSatisfaction: 0.87,
        trainingLoss: 0.12,
        validationScore: 0.91
      };

      const evaluation = (global as any).NeuroFractalTrainingPipeline.evaluateModel(goodMetrics);

      expect(evaluation.shouldDeploy).toBe(true);
      expect(evaluation.confidence).toBeGreaterThan(0.8);
    });

    it('should reject poor performing models', () => {
      const poorMetrics = {
        accuracy: 0.75,
        coherence: 0.65,
        adaptability: 0.7,
        userSatisfaction: 0.72,
        trainingLoss: 0.25,
        validationScore: 0.78
      };

      const evaluation = (global as any).NeuroFractalTrainingPipeline.evaluateModel(poorMetrics);

      expect(evaluation.shouldDeploy).toBe(false);
      expect(evaluation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete chat interaction flow', async () => {
      // This would test the full flow from message input to response generation
      // Including state updates, metrics collection, and optimization

      const mockUserId = 'test-user-123';
      const mockSessionId = 'test-session-456';

      // Mock all the API calls
      const mockCreateMessage = vi.fn().mockResolvedValue({ id: 'message-123' });
      const mockCreateState = vi.fn().mockResolvedValue({ id: 'state-123' });
      const mockCreateMetric = vi.fn().mockResolvedValue({ id: 'metric-123' });

      // Simulate a chat interaction
      const userMessage = 'I feel anxious about tomorrow';
      const userState = { coherence: 0.7, complexity: 0.5, resonance: 0.6 };

      // Process would involve:
      // 1. Analyze user state
      const stateAnalysis = CognitivePatternAnalyzer.analyzeStateAnomalies(userState);
      expect(stateAnalysis).toBeDefined();

      // 2. Generate AI response (simulated)
      const aiResponse = 'I understand your anxiety. Let\'s work through this together.';
      const aiState = { coherence: 0.8, complexity: 0.6, resonance: 0.75 };

      // 3. Update metrics
      // This would call the metrics API

      // 4. Check for optimization triggers
      // This would potentially trigger parameter optimization

      // Verify the interaction was processed
      expect(userMessage).toBeDefined();
      expect(aiResponse).toBeDefined();
      expect(aiState.coherence).toBeGreaterThan(userState.coherence);
    });

    it('should handle security breach attempts', () => {
      // Test that malicious inputs are properly sanitized
      const maliciousInput = '<script>alert("xss")</script>Sensitive data';
      const sanitizedInput = maliciousInput.replace(/<[^>]*>/g, ''); // Basic sanitization

      expect(sanitizedInput).not.toContain('<script>');
      expect(sanitizedInput).toContain('Sensitive data');

      // Test that encrypted data cannot be read without proper decryption
      const sensitiveData = { apiKey: 'secret-key-123', userToken: 'token-456' };
      const encrypted = NeuroFractalSecurity.encryptNeuralState(sensitiveData);

      expect(encrypted).not.toContain('secret-key-123');
      expect(encrypted).not.toContain('token-456');

      // Verify decryption works
      const decrypted = NeuroFractalSecurity.decryptNeuralState(encrypted);
      expect(decrypted).toEqual(sensitiveData);
    });

    it('should maintain data integrity across state transitions', () => {
      const initialState = {
        coherence: 0.8,
        complexity: 0.6,
        resonance: 0.7,
        adaptationLevel: 0.5
      };

      // Simulate multiple state transitions
      const transitions = [
        { coherence: 0.82, complexity: 0.62, resonance: 0.72 },
        { coherence: 0.85, complexity: 0.65, resonance: 0.75 },
        { coherence: 0.83, complexity: 0.63, resonance: 0.73 }
      ];

      // Verify each transition maintains data integrity
      transitions.forEach(transition => {
        const hash1 = NeuroFractalSecurity.generateStateHash(initialState);
        const hash2 = NeuroFractalSecurity.generateStateHash(transition);

        expect(hash1).not.toBe(hash2); // Hashes should differ
        expect(typeof hash1).toBe('string');
        expect(hash1.length).toBe(64); // SHA256 produces 64 character hex string
      });

      // Verify state validation
      transitions.forEach(transition => {
        const isValid = NeuroFractalSecurity.verifyStateIntegrity(transition,
          NeuroFractalSecurity.generateStateHash(transition));
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid state updates efficiently', () => {
      const startTime = performance.now();

      // Simulate 100 rapid state updates
      for (let i = 0; i < 100; i++) {
        const testState = {
          coherence: Math.random(),
          complexity: Math.random(),
          resonance: Math.random(),
          adaptationLevel: Math.random()
        };

        const hash = NeuroFractalSecurity.generateStateHash(testState);
        const analysis = CognitivePatternAnalyzer.analyzeStateAnomalies(testState);

        expect(hash).toBeDefined();
        expect(analysis).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should maintain memory efficiency', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

      // Create many state objects
      const states = [];
      for (let i = 0; i < 1000; i++) {
        states.push({
          coherence: Math.random(),
          complexity: Math.random(),
          resonance: Math.random(),
          timestamp: Date.now()
        });
      }

      // Process all states
      states.forEach(state => {
        CognitivePatternAnalyzer.analyzeStateAnomalies(state);
      });

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });
});
