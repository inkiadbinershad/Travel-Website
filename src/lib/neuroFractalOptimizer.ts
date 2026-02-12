import { supabase } from '@/integrations/supabase/client';
import { CognitivePatternAnalyzer, NeuroFractalAudit } from './neuroFractalSecurity';

export interface OptimizationParameters {
  coherence: number;
  complexity: number;
  resonance: number;
  adaptationLevel: number;
  learningRate: number;
  explorationFactor: number;
  stabilityThreshold: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  userSatisfaction: number;
  coherenceStability: number;
  adaptationEfficiency: number;
  errorRate: number;
  engagementScore: number;
}

export interface AdaptationRule {
  id: string;
  condition: (metrics: PerformanceMetrics, currentParams: OptimizationParameters) => boolean;
  action: (metrics: PerformanceMetrics, currentParams: OptimizationParameters) => Partial<OptimizationParameters>;
  priority: number;
  description: string;
}

export class NeuroFractalOptimizer {
  private static readonly DEFAULT_PARAMETERS: OptimizationParameters = {
    coherence: 0.8,
    complexity: 0.6,
    resonance: 0.7,
    adaptationLevel: 0.5,
    learningRate: 0.1,
    explorationFactor: 0.2,
    stabilityThreshold: 0.05
  };

  private static readonly ADAPTATION_RULES: AdaptationRule[] = [
    // High coherence stability - increase complexity exploration
    {
      id: 'high_stability_complexity_boost',
      condition: (metrics, params) =>
        metrics.coherenceStability > 0.8 && params.complexity < 0.8,
      action: (metrics, params) => ({
        complexity: Math.min(0.9, params.complexity + 0.05),
        explorationFactor: Math.min(0.4, params.explorationFactor + 0.02)
      }),
      priority: 1,
      description: 'Increase complexity when coherence is stable'
    },

    // Low user satisfaction - reduce complexity and increase adaptation
    {
      id: 'low_satisfaction_simplification',
      condition: (metrics, params) =>
        metrics.userSatisfaction < 0.6,
      action: (metrics, params) => ({
        complexity: Math.max(0.3, params.complexity - 0.1),
        adaptationLevel: Math.min(0.8, params.adaptationLevel + 0.1),
        learningRate: Math.min(0.2, params.learningRate + 0.02)
      }),
      priority: 2,
      description: 'Simplify when user satisfaction is low'
    },

    // High error rate - increase stability threshold and reduce exploration
    {
      id: 'high_error_conservative_mode',
      condition: (metrics, params) =>
        metrics.errorRate > 0.15,
      action: (metrics, params) => ({
        stabilityThreshold: Math.min(0.15, params.stabilityThreshold + 0.02),
        explorationFactor: Math.max(0.05, params.explorationFactor - 0.05),
        learningRate: Math.max(0.05, params.learningRate - 0.02)
      }),
      priority: 3,
      description: 'Become more conservative when errors are high'
    },

    // Good engagement - optimize for resonance
    {
      id: 'good_engagement_resonance_boost',
      condition: (metrics, params) =>
        metrics.engagementScore > 0.7 && params.resonance < 0.85,
      action: (metrics, params) => ({
        resonance: Math.min(0.95, params.resonance + 0.03),
        coherence: Math.min(0.9, params.coherence + 0.02)
      }),
      priority: 1,
      description: 'Boost resonance when engagement is good'
    },

    // Slow response time - optimize for efficiency
    {
      id: 'slow_response_optimization',
      condition: (metrics, params) =>
        metrics.responseTime > 3000, // 3 seconds
      action: (metrics, params) => ({
        complexity: Math.max(0.4, params.complexity - 0.05),
        learningRate: Math.max(0.08, params.learningRate - 0.01),
        adaptationLevel: Math.min(0.7, params.adaptationLevel + 0.05)
      }),
      priority: 2,
      description: 'Optimize for speed when responses are slow'
    },

    // Low adaptation efficiency - increase learning rate
    {
      id: 'low_adaptation_learning_boost',
      condition: (metrics, params) =>
        metrics.adaptationEfficiency < 0.6,
      action: (metrics, params) => ({
        learningRate: Math.min(0.25, params.learningRate + 0.03),
        adaptationLevel: Math.min(0.9, params.adaptationLevel + 0.05)
      }),
      priority: 1,
      description: 'Increase learning when adaptation is inefficient'
    }
  ];

  static async optimizeParameters(
    sessionId: string,
    userId: string,
    currentMetrics: PerformanceMetrics,
    currentParams: OptimizationParameters
  ): Promise<OptimizationParameters> {
    try {
      // Get historical performance data
      const historicalMetrics = await this.getHistoricalMetrics(sessionId, userId);

      // Analyze trends
      const trends = this.analyzePerformanceTrends(historicalMetrics);

      // Apply adaptation rules
      const adaptedParams = this.applyAdaptationRules(currentMetrics, currentParams, trends);

      // Validate parameter bounds
      const validatedParams = this.validateParameters(adaptedParams);

      // Log adaptation
      await this.logParameterAdaptation(sessionId, userId, currentParams, validatedParams, currentMetrics);

      return validatedParams;
    } catch (error) {
      console.error('Parameter optimization failed:', error);
      // Return current parameters if optimization fails
      return currentParams;
    }
  }

  private static async getHistoricalMetrics(sessionId: string, userId: string): Promise<PerformanceMetrics[]> {
    try {
      const { data: metrics, error } = await supabase
        .from('neuro_fractal_metrics')
        .select('metric_type, metric_value, metric_metadata, created_at')
        .eq('user_id', userId)
        .or(`session_id.eq.${sessionId},session_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return metrics?.map(m => ({
        responseTime: m.metric_metadata?.responseTime || 0,
        userSatisfaction: m.metric_metadata?.userSatisfaction || 0.5,
        coherenceStability: m.metric_metadata?.coherenceStability || 0.5,
        adaptationEfficiency: m.metric_metadata?.adaptationEfficiency || 0.5,
        errorRate: m.metric_metadata?.errorRate || 0,
        engagementScore: m.metric_metadata?.engagementScore || 0.5
      })) || [];
    } catch (error) {
      console.error('Failed to get historical metrics:', error);
      return [];
    }
  }

  private static analyzePerformanceTrends(metrics: PerformanceMetrics[]): {
    trendDirection: 'improving' | 'declining' | 'stable';
    volatility: number;
    averagePerformance: number;
  } {
    if (metrics.length < 5) {
      return { trendDirection: 'stable', volatility: 0, averagePerformance: 0.5 };
    }

    const recent = metrics.slice(0, 10);
    const older = metrics.slice(10, 20);

    const recentAvg = recent.reduce((sum, m) =>
      sum + (m.userSatisfaction + m.engagementScore + m.adaptationEfficiency) / 3, 0) / recent.length;

    const olderAvg = older.length > 0 ?
      older.reduce((sum, m) =>
        sum + (m.userSatisfaction + m.engagementScore + m.adaptationEfficiency) / 3, 0) / older.length :
      recentAvg;

    const trendDirection = recentAvg > olderAvg + 0.05 ? 'improving' :
                          recentAvg < olderAvg - 0.05 ? 'declining' : 'stable';

    const volatility = this.calculateVolatility(metrics);

    return {
      trendDirection,
      volatility,
      averagePerformance: recentAvg
    };
  }

  private static calculateVolatility(metrics: PerformanceMetrics[]): number {
    if (metrics.length < 2) return 0;

    const values = metrics.map(m => (m.userSatisfaction + m.engagementScore) / 2);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static applyAdaptationRules(
    currentMetrics: PerformanceMetrics,
    currentParams: OptimizationParameters,
    trends: { trendDirection: string; volatility: number; averagePerformance: number }
  ): OptimizationParameters {
    let adaptedParams = { ...currentParams };

    // Sort rules by priority
    const sortedRules = [...this.ADAPTATION_RULES].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (rule.condition(currentMetrics, adaptedParams)) {
        const adjustments = rule.action(currentMetrics, adaptedParams);

        // Apply adjustments with momentum based on trends
        const momentum = this.calculateMomentum(trends);
        const adjustedChanges = this.applyMomentum(adjustments, momentum);

        adaptedParams = { ...adaptedParams, ...adjustedChanges };

        console.log(`Applied adaptation rule: ${rule.description}`);
        break; // Apply only one rule at a time to avoid conflicts
      }
    }

    // Apply trend-based adjustments
    adaptedParams = this.applyTrendAdjustments(adaptedParams, trends);

    return adaptedParams;
  }

  private static calculateMomentum(trends: { trendDirection: string; volatility: number; averagePerformance: number }): number {
    const baseMomentum = 0.1;

    if (trends.trendDirection === 'improving') {
      return baseMomentum * 1.5;
    } else if (trends.trendDirection === 'declining') {
      return baseMomentum * 0.5;
    }

    return baseMomentum;
  }

  private static applyMomentum(adjustments: Partial<OptimizationParameters>, momentum: number): Partial<OptimizationParameters> {
    const momentumAdjusted: Partial<OptimizationParameters> = {};

    for (const [key, value] of Object.entries(adjustments)) {
      if (typeof value === 'number') {
        momentumAdjusted[key as keyof OptimizationParameters] = value * (1 + momentum);
      }
    }

    return momentumAdjusted;
  }

  private static applyTrendAdjustments(
    params: OptimizationParameters,
    trends: { trendDirection: string; volatility: number; averagePerformance: number }
  ): OptimizationParameters {
    const adjusted = { ...params };

    // Adjust based on volatility
    if (trends.volatility > 0.2) {
      // High volatility - be more conservative
      adjusted.stabilityThreshold = Math.min(0.15, adjusted.stabilityThreshold + 0.01);
      adjusted.explorationFactor = Math.max(0.05, adjusted.explorationFactor - 0.02);
    } else if (trends.volatility < 0.1) {
      // Low volatility - can be more exploratory
      adjusted.explorationFactor = Math.min(0.35, adjusted.explorationFactor + 0.01);
    }

    // Adjust learning rate based on performance
    if (trends.averagePerformance > 0.8) {
      adjusted.learningRate = Math.max(0.05, adjusted.learningRate - 0.005); // Fine-tune
    } else if (trends.averagePerformance < 0.6) {
      adjusted.learningRate = Math.min(0.2, adjusted.learningRate + 0.01); // Learn faster
    }

    return adjusted;
  }

  private static validateParameters(params: OptimizationParameters): OptimizationParameters {
    return {
      coherence: Math.max(0.1, Math.min(1.0, params.coherence)),
      complexity: Math.max(0.1, Math.min(1.0, params.complexity)),
      resonance: Math.max(0.1, Math.min(1.0, params.resonance)),
      adaptationLevel: Math.max(0.1, Math.min(1.0, params.adaptationLevel)),
      learningRate: Math.max(0.01, Math.min(0.3, params.learningRate)),
      explorationFactor: Math.max(0.01, Math.min(0.5, params.explorationFactor)),
      stabilityThreshold: Math.max(0.01, Math.min(0.2, params.stabilityThreshold))
    };
  }

  private static async logParameterAdaptation(
    sessionId: string,
    userId: string,
    oldParams: OptimizationParameters,
    newParams: OptimizationParameters,
    metrics: PerformanceMetrics
  ): Promise<void> {
    try {
      await supabase
        .from('neuro_fractal_adaptations')
        .insert({
          user_id: userId,
          adaptation_type: 'parameter_optimization',
          adaptation_data: {
            oldParameters: oldParams,
            newParameters: newParams,
            performanceMetrics: metrics,
            timestamp: new Date().toISOString()
          },
          effectiveness_score: null // Will be updated later based on results
        });
    } catch (error) {
      console.error('Failed to log parameter adaptation:', error);
    }
  }

  static async evaluateAdaptationEffectiveness(
    adaptationId: string,
    beforeMetrics: PerformanceMetrics,
    afterMetrics: PerformanceMetrics
  ): Promise<number> {
    try {
      const improvement = this.calculatePerformanceImprovement(beforeMetrics, afterMetrics);
      const stability = this.calculateStabilityScore(beforeMetrics, afterMetrics);

      const effectivenessScore = (improvement * 0.7) + (stability * 0.3);

      // Update the adaptation record
      await supabase
        .from('neuro_fractal_adaptations')
        .update({
          effectiveness_score: effectivenessScore,
          applied_at: new Date().toISOString()
        })
        .eq('id', adaptationId);

      return effectivenessScore;
    } catch (error) {
      console.error('Failed to evaluate adaptation effectiveness:', error);
      return 0.5; // Neutral score on error
    }
  }

  private static calculatePerformanceImprovement(before: PerformanceMetrics, after: PerformanceMetrics): number {
    const metrics = ['userSatisfaction', 'engagementScore', 'adaptationEfficiency', 'coherenceStability'] as const;

    let totalImprovement = 0;
    let count = 0;

    for (const metric of metrics) {
      const improvement = after[metric] - before[metric];
      totalImprovement += improvement;
      count++;
    }

    return Math.max(0, Math.min(1, (totalImprovement / count + 1) / 2)); // Normalize to 0-1
  }

  private static calculateStabilityScore(before: PerformanceMetrics, after: PerformanceMetrics): number {
    const errorRateChange = before.errorRate - after.errorRate;
    const responseTimeChange = before.responseTime - after.responseTime;

    const errorStability = Math.max(0, Math.min(1, errorRateChange + 0.5));
    const speedStability = Math.max(0, Math.min(1, (responseTimeChange / 1000 + 0.5))); // Normalize time change

    return (errorStability + speedStability) / 2;
  }

  static getDefaultParameters(): OptimizationParameters {
    return { ...this.DEFAULT_PARAMETERS };
  }

  static async getUserOptimizedParameters(userId: string): Promise<OptimizationParameters> {
    try {
      const { data: adaptations, error } = await supabase
        .from('neuro_fractal_adaptations')
        .select('adaptation_data, effectiveness_score')
        .eq('user_id', userId)
        .eq('adaptation_type', 'parameter_optimization')
        .not('effectiveness_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!adaptations || adaptations.length === 0) {
        return this.getDefaultParameters();
      }

      // Use weighted average of recent successful adaptations
      const weightedParams = { ...this.DEFAULT_PARAMETERS };
      let totalWeight = 0;

      for (const adaptation of adaptations) {
        const weight = adaptation.effectiveness_score || 0.5;
        const params = adaptation.adaptation_data?.newParameters;

        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (key in weightedParams && typeof value === 'number') {
              weightedParams[key as keyof OptimizationParameters] =
                (weightedParams[key as keyof OptimizationParameters] * totalWeight + value * weight) / (totalWeight + weight);
            }
          }
          totalWeight += weight;
        }
      }

      return this.validateParameters(weightedParams);
    } catch (error) {
      console.error('Failed to get user optimized parameters:', error);
      return this.getDefaultParameters();
    }
  }
}

// Real-time adaptation engine
export class RealTimeAdapter {
  private adaptationInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  startAdaptiveOptimization(
    sessionId: string,
    userId: string,
    onParameterUpdate: (params: OptimizationParameters) => void
  ): void {
    if (this.isRunning) return;

    this.isRunning = true;

    this.adaptationInterval = setInterval(async () => {
      try {
        // Collect current performance metrics
        const metrics = await this.collectCurrentMetrics(sessionId, userId);

        // Get current parameters
        const currentParams = await NeuroFractalOptimizer.getUserOptimizedParameters(userId);

        // Optimize parameters
        const optimizedParams = await NeuroFractalOptimizer.optimizeParameters(
          sessionId,
          userId,
          metrics,
          currentParams
        );

        // Notify of parameter updates
        onParameterUpdate(optimizedParams);

        // Log optimization event
        await NeuroFractalAudit.logAccess(
          userId,
          'parameter_optimization',
          'neuro_fractal_session',
          sessionId,
          { optimizedParams, metrics }
        );

      } catch (error) {
        console.error('Real-time adaptation error:', error);
      }
    }, 30000); // Adapt every 30 seconds
  }

  stopAdaptiveOptimization(): void {
    if (this.adaptationInterval) {
      clearInterval(this.adaptationInterval);
      this.adaptationInterval = null;
    }
    this.isRunning = false;
  }

  private async collectCurrentMetrics(sessionId: string, userId: string): Promise<PerformanceMetrics> {
    try {
      // Get recent metrics from the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: metrics, error } = await supabase
        .from('neuro_fractal_metrics')
        .select('metric_type, metric_value, metric_metadata')
        .eq('user_id', userId)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate metrics
      const aggregated = {
        responseTime: 0,
        userSatisfaction: 0,
        coherenceStability: 0,
        adaptationEfficiency: 0,
        errorRate: 0,
        engagementScore: 0
      };

      let count = 0;

      metrics?.forEach(m => {
        if (m.metric_metadata) {
          aggregated.responseTime += m.metric_metadata.responseTime || 0;
          aggregated.userSatisfaction += m.metric_metadata.userSatisfaction || 0.5;
          aggregated.coherenceStability += m.metric_metadata.coherenceStability || 0.5;
          aggregated.adaptationEfficiency += m.metric_metadata.adaptationEfficiency || 0.5;
          aggregated.errorRate += m.metric_metadata.errorRate || 0;
          aggregated.engagementScore += m.metric_metadata.engagementScore || 0.5;
          count++;
        }
      });

      if (count > 0) {
        for (const key in aggregated) {
          aggregated[key as keyof PerformanceMetrics] /= count;
        }
      }

      return aggregated;
    } catch (error) {
      console.error('Failed to collect current metrics:', error);
      return {
        responseTime: 2000,
        userSatisfaction: 0.5,
        coherenceStability: 0.5,
        adaptationEfficiency: 0.5,
        errorRate: 0.05,
        engagementScore: 0.5
      };
    }
  }
}
