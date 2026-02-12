import { supabase } from '@/integrations/supabase/client';
import { NeuroFractalSecurity, CognitivePatternAnalyzer } from './neuroFractalSecurity';

export interface TrainingData {
  userId: string;
  sessionId: string;
  messageContent: string;
  userState: any;
  aiResponse: string;
  aiState: any;
  userFeedback?: number; // 1-5 rating
  interactionQuality: number; // 0-1 score
  timestamp: Date;
  contextFeatures: Record<string, any>;
}

export interface TrainingBatch {
  id: string;
  data: TrainingData[];
  batchSize: number;
  qualityThreshold: number;
  createdAt: Date;
  processedAt?: Date;
  modelVersion: string;
}

export interface ModelMetrics extends Record<string, number> {
  accuracy: number;
  coherence: number;
  adaptability: number;
  userSatisfaction: number;
  trainingLoss: number;
  validationScore: number;
}

export class NeuroFractalTrainingPipeline {
  private static readonly MIN_BATCH_SIZE = 100;
  private static readonly QUALITY_THRESHOLD = 0.7;
  private static readonly TRAINING_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  static async collectTrainingData(
    userId: string,
    sessionId: string,
    messageContent: string,
    userState: Record<string, any>,
    aiResponse: string,
    aiState: Record<string, any>,
    contextFeatures: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Analyze interaction quality
      const interactionQuality = this.analyzeInteractionQuality(userState, aiState, contextFeatures);

      const trainingData: TrainingData = {
        userId,
        sessionId,
        messageContent: NeuroFractalSecurity.encryptNeuralState({ content: messageContent }),
        userState: NeuroFractalSecurity.encryptNeuralState(userState),
        aiResponse: NeuroFractalSecurity.encryptNeuralState({ response: aiResponse }),
        aiState: NeuroFractalSecurity.encryptNeuralState(aiState),
        interactionQuality,
        timestamp: new Date(),
        contextFeatures
      };

      // Store training data
      const { error } = await supabase
        .from('neuro_fractal_training_data')
        .insert({
          user_id: userId,
          session_id: sessionId,
          encrypted_data: NeuroFractalSecurity.encryptNeuralState(trainingData),
          quality_score: interactionQuality,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Check if we should trigger training
      await this.checkTrainingTrigger();

    } catch (error) {
      console.error('Failed to collect training data:', error);
    }
  }

  private static analyzeInteractionQuality(
    userState: Record<string, any>,
    aiState: Record<string, any>,
    contextFeatures: Record<string, any>
  ): number {
    let quality = 0.5; // Base quality

    // Coherence alignment
    const coherenceDiff = Math.abs((userState.coherence || 0.5) - (aiState.coherence || 0.5));
    quality += (1 - coherenceDiff) * 0.2;

    // Complexity matching
    const complexityDiff = Math.abs((userState.complexity || 0.5) - (aiState.complexity || 0.5));
    quality += (1 - complexityDiff) * 0.15;

    // Resonance quality
    if (aiState.resonance > 0.8) quality += 0.1;
    else if (aiState.resonance < 0.4) quality -= 0.1;

    // Adaptation effectiveness
    if (aiState.adaptationLevel > 0.7) quality += 0.1;

    // Context relevance
    if (contextFeatures.messageLength && contextFeatures.messageLength > 10) quality += 0.05;
    if (contextFeatures.hasQuestions) quality += 0.05;

    // Emotional stability
    if (userState.emotionalStability && userState.emotionalStability > 0.6) quality += 0.1;

    return Math.max(0, Math.min(1, quality));
  }

  private static async checkTrainingTrigger(): Promise<void> {
    try {
      // Check if we have enough high-quality data for training
      const { data: recentData, error } = await supabase
        .from('neuro_fractal_training_data')
        .select('quality_score, created_at')
        .gte('created_at', new Date(Date.now() - this.TRAINING_INTERVAL).toISOString())
        .gte('quality_score', this.QUALITY_THRESHOLD);

      if (error) throw error;

      if (recentData && recentData.length >= this.MIN_BATCH_SIZE) {
        await this.triggerTraining(recentData.length);
      }
    } catch (error) {
      console.error('Failed to check training trigger:', error);
    }
  }

  static async triggerTraining(dataCount: number): Promise<void> {
    try {
      console.log(`Triggering NeuroFractal training with ${dataCount} data points`);

      // Create training batch
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: batchError } = await supabase
        .from('neuro_fractal_training_batches')
        .insert({
          id: batchId,
          batch_size: dataCount,
          quality_threshold: this.QUALITY_THRESHOLD,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (batchError) throw batchError;

      // Start training process (this would typically be handled by a background job)
      await this.startTrainingProcess(batchId);

    } catch (error) {
      console.error('Failed to trigger training:', error);
    }
  }

  private static async startTrainingProcess(batchId: string): Promise<void> {
    try {
      // Collect training data
      const trainingData = await this.collectBatchData(batchId);

      if (!trainingData || trainingData.length === 0) {
        console.warn('No training data available for batch:', batchId);
        return;
      }

      // Preprocess data
      const processedData = this.preprocessTrainingData(trainingData);

      // Train model
      const modelMetrics = await this.trainModel(processedData);

      // Evaluate and deploy
      const evaluationResult = await this.evaluateModel(modelMetrics);

      if (evaluationResult.shouldDeploy) {
        await this.deployModel(batchId, modelMetrics, evaluationResult);
      }

      // Update batch status
      await supabase
        .from('neuro_fractal_training_batches')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          model_metrics: modelMetrics,
          evaluation_result: evaluationResult
        })
        .eq('id', batchId);

    } catch (error) {
      console.error('Training process failed:', error);

      // Update batch status to failed
      await supabase
        .from('neuro_fractal_training_batches')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', batchId);
    }
  }

  private static async collectBatchData(batchId: string): Promise<TrainingData[]> {
    try {
      const { data, error } = await supabase
        .from('neuro_fractal_training_data')
        .select('encrypted_data, quality_score')
        .gte('quality_score', this.QUALITY_THRESHOLD)
        .order('created_at', { ascending: false })
        .limit(this.MIN_BATCH_SIZE * 2); // Get extra data for quality filtering

      if (error) throw error;

      const trainingData: TrainingData[] = [];

      for (const item of data || []) {
        try {
          if (typeof item.encrypted_data === 'string') {
            const decrypted = NeuroFractalSecurity.decryptNeuralState(item.encrypted_data) as TrainingData;
            trainingData.push(decrypted);
          } else {
            console.warn('Encrypted data is not a string, skipping');
          }
        } catch (decryptError) {
          console.warn('Failed to decrypt training data:', decryptError);
        }
      }

      return trainingData;
    } catch (error) {
      console.error('Failed to collect batch data:', error);
      return [];
    }
  }

  private static preprocessTrainingData(data: TrainingData[]): any[] {
    return data.map(item => {
      // Extract features for training
      const userState = NeuroFractalSecurity.decryptNeuralState(item.userState) as Record<string, any>;
      const aiState = NeuroFractalSecurity.decryptNeuralState(item.aiState) as Record<string, any>;
      const message = NeuroFractalSecurity.decryptNeuralState(item.messageContent) as { content: string };
      const response = NeuroFractalSecurity.decryptNeuralState(item.aiResponse) as { response: string };

      return {
        // Input features
        userCoherence: userState.coherence || 0.5,
        userComplexity: userState.complexity || 0.5,
        userResonance: userState.resonance || 0.5,
        userEmotionalStability: userState.emotionalStability || 0.5,
        messageLength: message.content?.length || 0,
        contextFeatures: item.contextFeatures,

        // Target outputs
        targetCoherence: aiState.coherence || 0.5,
        targetComplexity: aiState.complexity || 0.5,
        targetResonance: aiState.resonance || 0.5,
        targetAdaptation: aiState.adaptationLevel || 0.5,

        // Quality metrics
        quality: item.interactionQuality,
        feedback: item.userFeedback
      };
    });
  }

  private static async trainModel(processedData: any[]): Promise<ModelMetrics> {
    // This is a simplified training simulation
    // In a real implementation, this would interface with a machine learning framework

    console.log(`Training model on ${processedData.length} samples`);

    // Simulate training process
    const trainingMetrics: ModelMetrics = {
      accuracy: 0.85 + Math.random() * 0.1,
      coherence: 0.8 + Math.random() * 0.15,
      adaptability: 0.75 + Math.random() * 0.2,
      userSatisfaction: 0.82 + Math.random() * 0.12,
      trainingLoss: 0.15 - Math.random() * 0.1,
      validationScore: 0.88 + Math.random() * 0.08
    };

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return trainingMetrics;
  }

  private static async evaluateModel(metrics: ModelMetrics): Promise<{
    shouldDeploy: boolean;
    confidence: number;
    recommendations: string[];
  }> {
    const evaluation = {
      shouldDeploy: true,
      confidence: 0.8,
      recommendations: [] as string[]
    };

    // Deployment criteria
    if (metrics.accuracy < 0.8) {
      evaluation.shouldDeploy = false;
      evaluation.recommendations.push('Model accuracy too low for deployment');
    }

    if (metrics.coherence < 0.7) {
      evaluation.shouldDeploy = false;
      evaluation.recommendations.push('Model coherence below acceptable threshold');
    }

    if (metrics.trainingLoss > 0.2) {
      evaluation.recommendations.push('Consider additional training to reduce loss');
    }

    if (metrics.userSatisfaction < 0.8) {
      evaluation.recommendations.push('User satisfaction metrics need improvement');
    }

    evaluation.confidence = metrics.validationScore;

    return evaluation;
  }

  private static async deployModel(
    batchId: string,
    metrics: ModelMetrics,
    evaluation: any
  ): Promise<void> {
    try {
      const modelVersion = `v${Date.now()}`;

      // Create model version record
      const { error } = await supabase
        .from('neuro_fractal_models')
        .insert({
          version: modelVersion,
          batch_id: batchId,
          metrics: metrics,
          evaluation: evaluation,
          deployed_at: new Date().toISOString(),
          status: 'active'
        });

      if (error) throw error;

      // Update previous models to inactive
      await supabase
        .from('neuro_fractal_models')
        .update({ status: 'inactive' })
        .neq('version', modelVersion);

      console.log(`Deployed new NeuroFractal model: ${modelVersion}`);

    } catch (error) {
      console.error('Failed to deploy model:', error);
    }
  }

  static async getLatestModel(): Promise<any> {
    try {
      const { data: model, error } = await supabase
        .from('neuro_fractal_models')
        .select('*')
        .eq('status', 'active')
        .order('deployed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return model;
    } catch (error) {
      console.error('Failed to get latest model:', error);
      return null;
    }
  }

  static async recordUserFeedback(
    sessionId: string,
    userId: string,
    feedback: number,
    comments?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('neuro_fractal_feedback')
        .insert({
          session_id: sessionId,
          user_id: userId,
          rating: feedback,
          comments: comments,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update training data with feedback
      await this.updateTrainingDataWithFeedback(sessionId, feedback);

    } catch (error) {
      console.error('Failed to record user feedback:', error);
    }
  }

  private static async updateTrainingDataWithFeedback(sessionId: string, feedback: number): Promise<void> {
    try {
      // Find recent training data for this session and update with feedback
      const { error } = await supabase
        .from('neuro_fractal_training_data')
        .update({
          user_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update training data with feedback:', error);
    }
  }

  static async getTrainingStatistics(): Promise<{
    totalDataPoints: number;
    averageQuality: number;
    trainingBatches: number;
    activeModelVersion: string;
    lastTrainingDate: string;
  }> {
    try {
      const [
        { count: dataPoints },
        { data: qualityData },
        { count: batches },
        { data: activeModel }
      ] = await Promise.all([
        supabase.from('neuro_fractal_training_data').select('*', { count: 'exact', head: true }),
        supabase.from('neuro_fractal_training_data').select('quality_score'),
        supabase.from('neuro_fractal_training_batches').select('*', { count: 'exact', head: true }),
        supabase.from('neuro_fractal_models').select('version, deployed_at').eq('status', 'active').maybeSingle()
      ]);

      const averageQuality = qualityData?.reduce((sum, item) => sum + item.quality_score, 0) / (qualityData?.length || 1) || 0;

      return {
        totalDataPoints: dataPoints || 0,
        averageQuality,
        trainingBatches: batches || 0,
        activeModelVersion: activeModel?.version || 'none',
        lastTrainingDate: activeModel?.deployed_at || 'never'
      };
    } catch (error) {
      console.error('Failed to get training statistics:', error);
      return {
        totalDataPoints: 0,
        averageQuality: 0,
        trainingBatches: 0,
        activeModelVersion: 'none',
        lastTrainingDate: 'never'
      };
    }
  }
}

// Continuous Learning Coordinator
export class ContinuousLearningCoordinator {
  private trainingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  startContinuousLearning(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Starting continuous learning coordinator');

    // Check for training opportunities every hour
    this.trainingInterval = setInterval(async () => {
      try {
        await this.performMaintenanceLearning();
      } catch (error) {
        console.error('Continuous learning error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Start initial maintenance learning
    this.performMaintenanceLearning();
  }

  stopContinuousLearning(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    this.isRunning = false;
    console.log('Stopped continuous learning coordinator');
  }

  private async performMaintenanceLearning(): Promise<void> {
    try {
      // Clean up old training data (older than 90 days)
      await this.cleanupOldData();

      // Analyze model performance
      const performanceAnalysis = await this.analyzeModelPerformance();

      // Trigger retraining if needed
      if (performanceAnalysis.needsRetraining) {
        console.log('Model performance degradation detected, triggering retraining');
        await NeuroFractalTrainingPipeline.triggerTraining(performanceAnalysis.dataCount);
      }

      // Update learning patterns
      await this.updateLearningPatterns(performanceAnalysis);

    } catch (error) {
      console.error('Maintenance learning failed:', error);
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('neuro_fractal_training_data')
        .delete()
        .lt('created_at', ninetyDaysAgo);

      if (error) throw error;

      console.log('Cleaned up old training data');
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  private async analyzeModelPerformance(): Promise<{
    needsRetraining: boolean;
    dataCount: number;
    performanceScore: number;
    reasons: string[];
  }> {
    try {
      // Get recent performance metrics
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: metrics, error } = await supabase
        .from('neuro_fractal_metrics')
        .select('metric_value, metric_metadata')
        .gte('created_at', sevenDaysAgo);

      if (error) throw error;

      let totalScore = 0;
      let count = 0;
      const reasons: string[] = [];

      metrics?.forEach(metric => {
        const metadata = metric.metric_metadata as Record<string, any>;
        if (metadata?.performanceScore) {
          totalScore += metadata.performanceScore;
          count++;
        }
      });

      const averageScore = count > 0 ? totalScore / count : 0.8; // Default good score

      // Check retraining criteria
      const needsRetraining = averageScore < 0.75 || count < 100;

      if (averageScore < 0.75) {
        reasons.push('Performance score below threshold');
      }

      if (count < 100) {
        reasons.push('Insufficient recent data for reliable assessment');
      }

      return {
        needsRetraining,
        dataCount: count,
        performanceScore: averageScore,
        reasons
      };
    } catch (error) {
      console.error('Failed to analyze model performance:', error);
      return {
        needsRetraining: false,
        dataCount: 0,
        performanceScore: 0.8,
        reasons: ['Analysis failed, using conservative defaults']
      };
    }
  }

  private async updateLearningPatterns(analysis: any): Promise<void> {
    try {
      // Update learning patterns based on performance analysis
      const { error } = await supabase
        .from('neuro_fractal_learning_patterns')
        .insert({
          pattern_type: 'performance_analysis',
          pattern_data: {
            analysis,
            timestamp: new Date().toISOString(),
            recommendations: this.generateLearningRecommendations(analysis)
          },
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update learning patterns:', error);
    }
  }

  private generateLearningRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.performanceScore < 0.8) {
      recommendations.push('Increase training data quality filtering');
      recommendations.push('Consider adjusting model architecture');
    }

    if (analysis.dataCount < 500) {
      recommendations.push('Collect more diverse training data');
    }

    recommendations.push('Monitor user feedback patterns');
    recommendations.push('Analyze context feature importance');

    return recommendations;
  }
}
