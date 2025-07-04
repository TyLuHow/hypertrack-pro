// HyperTrack Pro - Intelligent Training Algorithms
// Research-based personalized progression and adaptation

class IntelligentTraining {
    constructor() {
        this.userProfile = {
            trainingAge: 0, // months of consistent training
            responseRate: 'medium', // slow, medium, fast
            recoveryRate: 'medium', // poor, medium, excellent
            plateauHistory: [],
            volumeTolerance: 'medium',
            intensityTolerance: 'medium'
        };
        
        this.adaptationData = {
            volumeResponse: [], // track volume vs performance
            intensityResponse: [], // track intensity vs performance  
            frequencyResponse: [], // track frequency vs performance
            recoveryMarkers: [], // subjective and objective markers
            plateauRisk: 0 // 0-100 risk score
        };
        
        this.periodizationState = {
            currentPhase: 'accumulation', // accumulation, intensification, realization, deload
            phaseWeek: 1,
            totalCycleWeeks: 4,
            autoAdjust: true
        };
    }

    // 1. PERSONALIZED PROGRESSION ALGORITHMS
    calculateOptimalProgression(exercise, recentPerformance, userResponse) {
        const baseProgression = this.getBaseProgression(exercise.category);
        const personalizedRate = this.adjustForIndividualResponse(baseProgression, userResponse);
        const plateauAdjustment = this.adjustForPlateauRisk(personalizedRate);
        const recoveryAdjustment = this.adjustForRecovery(plateauAdjustment);
        
        return {
            weightIncrease: Math.round(recoveryAdjustment.weight * 100) / 100,
            repIncrease: recoveryAdjustment.reps,
            volumeIncrease: recoveryAdjustment.volume,
            confidence: this.calculateProgressionConfidence(recentPerformance),
            reasoning: this.generateProgressionReasoning(exercise, personalizedRate)
        };
    }
    
    getBaseProgression(category) {
        // Research-based progression rates (Schoenfeld et al., Helms et al.)
        const progressionRates = {
            'Compound': {
                novice: { weight: 0.05, reps: 0.5, volume: 0.10 }, // 5% weight, 0.5 rep, 10% volume weekly
                intermediate: { weight: 0.025, reps: 0.25, volume: 0.05 }, // 2.5% weight progression
                advanced: { weight: 0.0125, reps: 0.125, volume: 0.025 } // 1.25% weight progression
            },
            'Isolation': {
                novice: { weight: 0.075, reps: 0.75, volume: 0.125 },
                intermediate: { weight: 0.0375, reps: 0.375, volume: 0.0625 },
                advanced: { weight: 0.01875, reps: 0.1875, volume: 0.03125 }
            }
        };
        
        const level = this.determineTrainingLevel();
        return progressionRates[category][level];
    }
    
    adjustForIndividualResponse(baseProgression, userResponse) {
        // Adjust based on individual response patterns (Mangine et al. research)
        const responseMultipliers = {
            'fast': { weight: 1.5, reps: 1.3, volume: 1.4 },
            'medium': { weight: 1.0, reps: 1.0, volume: 1.0 },
            'slow': { weight: 0.7, reps: 0.8, volume: 0.75 }
        };
        
        const multiplier = responseMultipliers[userResponse.rate] || responseMultipliers['medium'];
        
        return {
            weight: baseProgression.weight * multiplier.weight,
            reps: baseProgression.reps * multiplier.reps,
            volume: baseProgression.volume * multiplier.volume
        };
    }

    // 2. PLATEAU PREDICTION AND PREVENTION
    analyzePlateauRisk(exerciseHistory, timeframe = 21) {
        const recentData = this.getRecentPerformanceData(exerciseHistory, timeframe);
        
        const riskFactors = {
            progressionStagnation: this.calculateProgressionStagnation(recentData),
            volumeAccumulation: this.calculateVolumeAccumulation(recentData),
            intensityOverreach: this.calculateIntensityOverreach(recentData),
            recoveryDebt: this.calculateRecoveryDebt(recentData),
            adaptationSaturation: this.calculateAdaptationSaturation(recentData)
        };
        
        const plateauRisk = this.calculatePlateauRisk(riskFactors);
        
        return {
            riskLevel: this.categorizePlateauRisk(plateauRisk),
            riskScore: plateauRisk,
            primaryFactors: this.identifyPrimaryRiskFactors(riskFactors),
            preventionStrategies: this.generatePreventionStrategies(riskFactors),
            timeToPlateauEstimate: this.estimateTimeToPlateauPrediction(plateauRisk)
        };
    }
    
    calculateProgressionStagnation(recentData) {
        if (recentData.length < 6) return 0;
        
        const recentSessions = recentData.slice(-6);
        const improvements = recentSessions.map((session, index) => {
            if (index === 0) return 0;
            return this.calculateSessionImprovement(recentSessions[index-1], session);
        });
        
        const stagnantSessions = improvements.filter(improvement => improvement <= 0.01).length;
        return (stagnantSessions / improvements.length) * 100; // % of stagnant sessions
    }
    
    calculateVolumeAccumulation(recentData) {
        const volumeTrend = this.calculateTrend(recentData.map(session => session.totalVolume));
        const currentVolume = recentData[recentData.length - 1]?.totalVolume || 0;
        const optimalVolume = this.calculateOptimalVolume();
        
        return Math.max(0, (currentVolume - optimalVolume) / optimalVolume * 100);
    }
    
    generatePreventionStrategies(riskFactors) {
        const strategies = [];
        
        if (riskFactors.progressionStagnation > 60) {
            strategies.push({
                type: 'Exercise Variation',
                description: 'Rotate to similar exercises with different movement patterns',
                implementation: 'Switch to exercise variations this week',
                research: 'Fonseca et al. 2014 - Exercise variation prevents neural adaptation plateaus'
            });
        }
        
        if (riskFactors.volumeAccumulation > 50) {
            strategies.push({
                type: 'Volume Deload',
                description: 'Reduce volume by 40-50% for 1 week',
                implementation: 'Implement deload week immediately',
                research: 'Rhea et al. 2002 - Strategic deloads enhance long-term progression'
            });
        }
        
        if (riskFactors.intensityOverreach > 70) {
            strategies.push({
                type: 'Intensity Regulation',
                description: 'Focus on volume over intensity for 2-3 weeks',
                implementation: 'Keep loads at 70-80% of recent max for higher volume',
                research: 'Helms et al. 2018 - Intensity cycling optimizes neuromuscular adaptations'
            });
        }
        
        return strategies;
    }

    // 3. AUTOMATIC PROGRAM PERIODIZATION
    implementAutoPeriodization(userGoals, trainingHistory, currentPhase) {
        const periodizationModel = this.selectOptimalPeriodizationModel(userGoals, trainingHistory);
        const currentPhaseAnalysis = this.analyzeCurrentPhase(currentPhase, trainingHistory);
        const nextPhaseRecommendation = this.determineNextPhase(currentPhaseAnalysis);
        
        return {
            model: periodizationModel,
            currentPhase: currentPhaseAnalysis,
            nextPhase: nextPhaseRecommendation,
            phaseTransition: this.planPhaseTransition(currentPhase, nextPhaseRecommendation),
            adaptations: this.generatePhaseAdaptations(nextPhaseRecommendation)
        };
    }
    
    selectOptimalPeriodizationModel(userGoals, trainingHistory) {
        // Research-based model selection (Kiely 2012, Turner 2011)
        const models = {
            linear: {
                bestFor: ['strength', 'powerlifting'],
                description: 'Progressive intensity increase with volume decrease',
                phases: ['accumulation', 'intensification', 'realization'],
                research: 'Effective for strength gains in intermediate+ lifters'
            },
            undulating: {
                bestFor: ['hypertrophy', 'general'],
                description: 'Variable intensity and volume within weekly cycles',
                phases: ['high_volume', 'moderate', 'high_intensity'],
                research: 'Superior for muscle growth and avoiding plateaus'
            },
            block: {
                bestFor: ['athletic_performance', 'advanced'],
                description: 'Focused training blocks with specific adaptations',
                phases: ['accumulation', 'intensification', 'realization', 'restoration'],
                research: 'Optimal for advanced athletes with specific competition goals'
            },
            conjugate: {
                bestFor: ['powerlifting', 'strength_power'],
                description: 'Simultaneous development of multiple qualities',
                phases: ['max_effort', 'dynamic_effort', 'repetition_effort'],
                research: 'Effective for concurrent strength and power development'
            }
        };
        
        // Auto-select based on goals and training level
        const primaryGoal = userGoals.primary || 'hypertrophy';
        const trainingLevel = this.determineTrainingLevel();
        
        if (primaryGoal === 'hypertrophy' || trainingLevel === 'novice') {
            return models.undulating;
        } else if (primaryGoal === 'strength' && trainingLevel === 'advanced') {
            return models.block;
        } else if (primaryGoal === 'strength') {
            return models.linear;
        } else {
            return models.undulating; // Safe default
        }
    }
    
    determineNextPhase(currentPhaseAnalysis) {
        const { phase, duration, effectiveness, fatigue } = currentPhaseAnalysis;
        
        // Research-based phase transition logic
        if (fatigue > 0.7 || effectiveness < 0.3) {
            return this.recommendDeload();
        }
        
        if (duration >= 4 && effectiveness > 0.6) {
            return this.progressToNextPhase(phase);
        }
        
        if (effectiveness > 0.7) {
            return this.extendCurrentPhase(phase);
        }
        
        return this.modifyCurrentPhase(phase, currentPhaseAnalysis);
    }

    // 4. RECOVERY-BASED LOAD MANAGEMENT
    implementRecoveryBasedLoadManagement(recoveryData, plannedWorkout) {
        const recoveryScore = this.calculateRecoveryScore(recoveryData);
        const readinessLevel = this.determineReadinessLevel(recoveryScore);
        const loadAdjustments = this.calculateLoadAdjustments(readinessLevel, plannedWorkout);
        
        return {
            recoveryScore: recoveryScore,
            readinessLevel: readinessLevel,
            originalWorkout: plannedWorkout,
            adjustedWorkout: this.applyLoadAdjustments(plannedWorkout, loadAdjustments),
            adjustmentReasons: this.generateAdjustmentReasons(recoveryScore, loadAdjustments),
            recoveryRecommendations: this.generateRecoveryRecommendations(recoveryScore)
        };
    }
    
    calculateRecoveryScore(recoveryData) {
        // Composite recovery score based on multiple markers
        const weights = {
            subjectiveWellness: 0.3, // self-reported readiness
            sleepQuality: 0.25,      // sleep duration and quality
            hrvData: 0.2,            // heart rate variability (if available)
            muscleReadiness: 0.15,   // subjective muscle readiness
            stressLevel: 0.1         // life stress levels
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        
        Object.keys(weights).forEach(marker => {
            if (recoveryData[marker] !== undefined) {
                totalScore += recoveryData[marker] * weights[marker];
                totalWeight += weights[marker];
            }
        });
        
        return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 75; // Default to 75% if no data
    }
    
    determineReadinessLevel(recoveryScore) {
        if (recoveryScore >= 85) return 'excellent';
        if (recoveryScore >= 70) return 'good';
        if (recoveryScore >= 55) return 'moderate';
        if (recoveryScore >= 40) return 'poor';
        return 'very_poor';
    }
    
    calculateLoadAdjustments(readinessLevel, plannedWorkout) {
        // Research-based load adjustments (Halson & Jeukendrup 2004)
        const adjustmentFactors = {
            excellent: { volume: 1.1, intensity: 1.05, density: 1.0 },
            good: { volume: 1.0, intensity: 1.0, density: 1.0 },
            moderate: { volume: 0.9, intensity: 0.95, density: 0.9 },
            poor: { volume: 0.7, intensity: 0.85, density: 0.8 },
            very_poor: { volume: 0.5, intensity: 0.7, density: 0.6 }
        };
        
        return adjustmentFactors[readinessLevel] || adjustmentFactors.good;
    }
    
    generateRecoveryRecommendations(recoveryScore) {
        const recommendations = [];
        
        if (recoveryScore < 60) {
            recommendations.push({
                priority: 'high',
                category: 'sleep',
                recommendation: 'Aim for 8+ hours of quality sleep tonight',
                research: 'Mah et al. 2011 - Sleep extension improves athletic performance'
            });
            
            recommendations.push({
                priority: 'high',
                category: 'nutrition',
                recommendation: 'Focus on anti-inflammatory foods and adequate protein',
                research: 'Peake et al. 2017 - Anti-inflammatory nutrition enhances recovery'
            });
        }
        
        if (recoveryScore < 40) {
            recommendations.push({
                priority: 'critical',
                category: 'rest',
                recommendation: 'Consider taking a complete rest day',
                research: 'Kellmann et al. 2018 - Strategic rest prevents overreaching'
            });
        }
        
        return recommendations;
    }

    // INTEGRATION METHODS
    integrateWithWorkout(plannedExercises, userHistory, recoveryData) {
        const results = {
            personalizedProgressions: [],
            plateauAlerts: [],
            periodizationAdjustments: null,
            recoveryAdjustments: null,
            overallRecommendations: []
        };
        
        // Analyze each planned exercise
        plannedExercises.forEach(exercise => {
            const exerciseHistory = this.getExerciseHistory(exercise.name, userHistory);
            
            // 1. Calculate personalized progression
            const progression = this.calculateOptimalProgression(
                exercise, 
                exerciseHistory, 
                this.userProfile
            );
            results.personalizedProgressions.push({
                exercise: exercise.name,
                progression: progression
            });
            
            // 2. Check plateau risk
            const plateauAnalysis = this.analyzePlateauRisk(exerciseHistory);
            if (plateauAnalysis.riskScore > 60) {
                results.plateauAlerts.push({
                    exercise: exercise.name,
                    analysis: plateauAnalysis
                });
            }
        });
        
        // 3. Apply periodization
        results.periodizationAdjustments = this.implementAutoPeriodization(
            { primary: 'hypertrophy' },
            userHistory,
            this.periodizationState.currentPhase
        );
        
        // 4. Apply recovery-based adjustments
        results.recoveryAdjustments = this.implementRecoveryBasedLoadManagement(
            recoveryData,
            plannedExercises
        );
        
        return results;
    }
    
    // UTILITY METHODS
    determineTrainingLevel() {
        if (this.userProfile.trainingAge < 6) return 'novice';
        if (this.userProfile.trainingAge < 24) return 'intermediate';
        return 'advanced';
    }
    
    getExerciseHistory(exerciseName, userHistory) {
        return userHistory.filter(workout => 
            workout.exercises.some(ex => ex.name === exerciseName)
        ).map(workout => {
            const exercise = workout.exercises.find(ex => ex.name === exerciseName);
            return {
                date: workout.date,
                sets: exercise.sets,
                volume: exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0),
                maxWeight: Math.max(...exercise.sets.map(set => set.weight)),
                avgReps: exercise.sets.reduce((sum, set) => sum + set.reps, 0) / exercise.sets.length
            };
        }).slice(-10); // Last 10 sessions
    }
    
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = data.reduce((sum, val) => sum + val, 0);
        const sumXY = data.reduce((sum, val, index) => sum + val * (index + 1), 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }
    
    calculateSessionImprovement(prevSession, currentSession) {
        const prevVolume = prevSession.volume || 0;
        const currentVolume = currentSession.volume || 0;
        
        if (prevVolume === 0) return 0;
        return (currentVolume - prevVolume) / prevVolume;
    }
}

// Export for use in main app
window.IntelligentTraining = IntelligentTraining;