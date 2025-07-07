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
    
    analyzeCurrentPhase(currentPhase, trainingHistory) {
        // Analyze current training phase effectiveness
        const recentWorkouts = trainingHistory.slice(0, 8); // Last 8 workouts
        const effectiveness = this.calculatePhaseEffectiveness(recentWorkouts);
        const fatigue = this.calculateAccumulatedFatigue(recentWorkouts);
        const duration = Math.floor(recentWorkouts.length / 2); // Assuming 2 workouts per week
        
        return {
            phase: currentPhase,
            duration: duration,
            effectiveness: effectiveness,
            fatigue: fatigue,
            workoutsCompleted: recentWorkouts.length
        };
    }
    
    calculatePhaseEffectiveness(recentWorkouts) {
        if (recentWorkouts.length < 2) return 0.5;
        
        const volumeTrend = this.calculateTrend(recentWorkouts.map(w => w.totalVolume || 0));
        const consistencyScore = recentWorkouts.length / 8; // Expecting 8 workouts
        
        return Math.max(0, Math.min(1, (volumeTrend * 0.7 + consistencyScore * 0.3)));
    }
    
    calculateAccumulatedFatigue(recentWorkouts) {
        if (recentWorkouts.length === 0) return 0;
        
        const avgVolume = recentWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / recentWorkouts.length;
        const volumeIncrease = avgVolume > 0 ? Math.min(1, avgVolume / 10000) : 0; // Normalize volume
        
        return Math.max(0, Math.min(1, volumeIncrease));
    }
    
    recommendDeload() {
        return {
            phase: 'deload',
            duration: 1,
            volumeReduction: 0.5,
            intensityReduction: 0.8,
            recommendation: 'Implement deload week to manage fatigue'
        };
    }
    
    progressToNextPhase(currentPhase) {
        const phaseProgression = {
            'accumulation': 'intensification',
            'intensification': 'realization', 
            'realization': 'deload',
            'deload': 'accumulation'
        };
        
        return {
            phase: phaseProgression[currentPhase] || 'accumulation',
            duration: 4,
            recommendation: `Transition to ${phaseProgression[currentPhase]} phase`
        };
    }
    
    extendCurrentPhase(currentPhase) {
        return {
            phase: currentPhase,
            duration: 2,
            recommendation: `Extend current ${currentPhase} phase for 2 more weeks`
        };
    }
    
    modifyCurrentPhase(currentPhase, analysis) {
        return {
            phase: currentPhase,
            duration: analysis.duration + 1,
            volumeAdjustment: analysis.effectiveness < 0.5 ? 0.9 : 1.1,
            recommendation: `Modify current ${currentPhase} phase based on effectiveness`
        };
    }
    
    planPhaseTransition(currentPhase, nextPhaseRecommendation) {
        return {
            timeline: nextPhaseRecommendation.duration || 4,
            preparations: [`Complete current ${currentPhase} phase objectives`, `Prepare for ${nextPhaseRecommendation.phase} training`],
            adjustments: {
                volume: nextPhaseRecommendation.volumeAdjustment || 1.0,
                intensity: nextPhaseRecommendation.intensityAdjustment || 1.0
            }
        };
    }
    
    generatePhaseAdaptations(nextPhaseRecommendation) {
        const adaptations = {
            accumulation: ['Increased training volume', 'Higher frequency', 'Moderate intensity'],
            intensification: ['Reduced volume', 'Higher intensity', 'Longer rest periods'],
            realization: ['Peak performance', 'Competition preparation', 'Minimal volume'],
            deload: ['Active recovery', 'Reduced stress', 'Restoration focus']
        };
        
        return adaptations[nextPhaseRecommendation.phase] || ['Phase-specific adaptations'];
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

    // 5. FREQUENCY-BASED RECOVERY ANALYSIS
    analyzeRecoveryBasedFrequency(workoutHistory, muscleGroup) {
        if (!workoutHistory || workoutHistory.length < 3) {
            return {
                recommendation: 'insufficient_data',
                message: 'Need at least 3 workouts to analyze recovery patterns'
            };
        }

        // Filter workouts for specific muscle group
        const muscleGroupWorkouts = workoutHistory.filter(workout => 
            workout.exercises?.some(exercise => exercise.muscle_group === muscleGroup)
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (muscleGroupWorkouts.length < 3) {
            return {
                recommendation: 'insufficient_data',
                message: `Need more ${muscleGroup} workouts to analyze recovery`
            };
        }

        // Analyze performance vs recovery time
        const recoveryAnalysis = this.analyzePerformanceVsRecovery(muscleGroupWorkouts, muscleGroup);
        const frequencyRecommendation = this.generateFrequencyRecommendation(recoveryAnalysis, muscleGroup);

        return {
            muscleGroup: muscleGroup,
            analysis: recoveryAnalysis,
            recommendation: frequencyRecommendation,
            optimalRestHours: this.calculateOptimalRestHours(recoveryAnalysis),
            adaptationStatus: this.assessAdaptationStatus(recoveryAnalysis)
        };
    }

    analyzePerformanceVsRecovery(workouts, muscleGroup) {
        const recoveryData = [];
        
        for (let i = 0; i < workouts.length - 1; i++) {
            const currentWorkout = workouts[i];
            const previousWorkout = workouts[i + 1];
            
            const restHours = (new Date(currentWorkout.date) - new Date(previousWorkout.date)) / (1000 * 60 * 60);
            const currentPerformance = this.calculateMuscleGroupPerformance(currentWorkout, muscleGroup);
            const previousPerformance = this.calculateMuscleGroupPerformance(previousWorkout, muscleGroup);
            
            // Calculate performance change
            const performanceChange = previousPerformance > 0 ? 
                (currentPerformance - previousPerformance) / previousPerformance : 0;
            
            recoveryData.push({
                restHours: Math.round(restHours),
                performanceChange: performanceChange,
                currentPerformance: currentPerformance,
                previousPerformance: previousPerformance,
                workoutDate: currentWorkout.date
            });
        }
        
        // Group by rest time intervals
        const recoveryGroups = this.groupByRestTime(recoveryData);
        const optimalRecovery = this.findOptimalRecoveryTime(recoveryGroups);
        
        return {
            recoveryData: recoveryData,
            recoveryGroups: recoveryGroups,
            optimalRecoveryHours: optimalRecovery.hours,
            optimalPerformanceGain: optimalRecovery.performanceGain,
            recoveryTrend: this.calculateRecoveryTrend(recoveryGroups)
        };
    }

    calculateMuscleGroupPerformance(workout, muscleGroup) {
        if (!workout.exercises) return 0;
        
        let totalVolume = 0;
        let exerciseCount = 0;
        
        workout.exercises.forEach(exercise => {
            if (exercise.muscle_group === muscleGroup && exercise.sets) {
                let exerciseVolume = 0;
                exercise.sets.forEach(set => {
                    exerciseVolume += (set.weight || 0) * (set.reps || 0);
                });
                totalVolume += exerciseVolume;
                exerciseCount++;
            }
        });
        
        return exerciseCount > 0 ? totalVolume / exerciseCount : 0;
    }

    groupByRestTime(recoveryData) {
        const groups = new Map();
        
        recoveryData.forEach(data => {
            // Group by 12-hour intervals
            const interval = Math.floor(data.restHours / 12) * 12;
            const key = `${interval}-${interval + 12}h`;
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(data);
        });
        
        // Calculate averages for each group
        const groupedResults = new Map();
        groups.forEach((dataPoints, timeRange) => {
            const avgPerformanceChange = dataPoints.reduce((sum, d) => sum + d.performanceChange, 0) / dataPoints.length;
            const avgRestHours = dataPoints.reduce((sum, d) => sum + d.restHours, 0) / dataPoints.length;
            
            groupedResults.set(timeRange, {
                timeRange: timeRange,
                avgRestHours: Math.round(avgRestHours),
                avgPerformanceChange: Math.round(avgPerformanceChange * 1000) / 10, // Percentage
                sampleSize: dataPoints.length,
                dataPoints: dataPoints
            });
        });
        
        return groupedResults;
    }

    findOptimalRecoveryTime(recoveryGroups) {
        let bestHours = 48;
        let bestPerformanceGain = 0;
        
        recoveryGroups.forEach((group, timeRange) => {
            // Weight by sample size and performance gain
            const weightedScore = group.avgPerformanceChange * Math.min(group.sampleSize / 2, 1);
            
            if (weightedScore > bestPerformanceGain && group.sampleSize >= 2) {
                bestPerformanceGain = weightedScore;
                bestHours = group.avgRestHours;
            }
        });
        
        return {
            hours: bestHours,
            performanceGain: bestPerformanceGain
        };
    }

    calculateRecoveryTrend(recoveryGroups) {
        const sortedGroups = Array.from(recoveryGroups.values())
            .sort((a, b) => a.avgRestHours - b.avgRestHours);
        
        if (sortedGroups.length < 2) return 'insufficient_data';
        
        // Calculate if performance improves with more rest
        const correlationData = sortedGroups.map(group => ({
            x: group.avgRestHours,
            y: group.avgPerformanceChange
        }));
        
        const correlation = this.calculateCorrelation(correlationData);
        
        if (correlation > 0.3) return 'benefits_from_more_rest';
        if (correlation < -0.3) return 'performs_better_with_less_rest';
        return 'rest_time_neutral';
    }

    calculateCorrelation(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.x, 0);
        const sumY = data.reduce((sum, d) => sum + d.y, 0);
        const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
        const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator !== 0 ? numerator / denominator : 0;
    }

    generateFrequencyRecommendation(recoveryAnalysis, muscleGroup) {
        const optimalHours = recoveryAnalysis.optimalRecoveryHours;
        const trend = recoveryAnalysis.recoveryTrend;
        
        // Convert hours to frequency per week
        const optimalFrequency = (7 * 24) / optimalHours;
        
        let recommendation = {
            frequencyPerWeek: Math.round(optimalFrequency * 10) / 10,
            restHoursBetween: optimalHours,
            confidence: this.calculateConfidence(recoveryAnalysis)
        };
        
        // Adjust based on muscle group characteristics
        const muscleGroupAdjustments = {
            'Side Delts': { multiplier: 1.2, reason: 'Small muscle group recovers faster' },
            'Rear Delts': { multiplier: 1.2, reason: 'Small muscle group recovers faster' },
            'Biceps': { multiplier: 1.1, reason: 'Smaller muscle group' },
            'Triceps': { multiplier: 1.1, reason: 'Smaller muscle group' },
            'Abs': { multiplier: 1.5, reason: 'Postural muscles recover quickly' },
            'Calves': { multiplier: 1.3, reason: 'High endurance muscle fibers' },
            'Legs': { multiplier: 0.8, reason: 'Large muscle group needs more recovery' },
            'Horizontal Push': { multiplier: 0.9, reason: 'Compound movements are more demanding' }
        };
        
        const adjustment = muscleGroupAdjustments[muscleGroup];
        if (adjustment) {
            recommendation.frequencyPerWeek *= adjustment.multiplier;
            recommendation.frequencyPerWeek = Math.round(recommendation.frequencyPerWeek * 10) / 10;
            recommendation.adjustment = adjustment.reason;
        }
        
        // Add trend-based recommendations
        if (trend === 'benefits_from_more_rest') {
            recommendation.frequencyPerWeek *= 0.8;
            recommendation.note = 'Your data shows better performance with additional recovery time';
        } else if (trend === 'performs_better_with_less_rest') {
            recommendation.frequencyPerWeek *= 1.2;
            recommendation.note = 'Your data shows you recover faster than average';
        }
        
        recommendation.frequencyPerWeek = Math.round(recommendation.frequencyPerWeek * 10) / 10;
        
        return recommendation;
    }

    calculateOptimalRestHours(recoveryAnalysis) {
        return {
            minimum: Math.max(24, recoveryAnalysis.optimalRecoveryHours * 0.8),
            optimal: recoveryAnalysis.optimalRecoveryHours,
            maximum: recoveryAnalysis.optimalRecoveryHours * 1.3,
            recommendation: this.formatRestRecommendation(recoveryAnalysis.optimalRecoveryHours)
        };
    }

    formatRestRecommendation(hours) {
        if (hours < 36) return 'Daily training with lighter loads';
        if (hours < 60) return 'Every other day training';
        if (hours < 84) return '2-3 days rest between sessions';
        return 'Extended rest periods recommended';
    }

    assessAdaptationStatus(recoveryAnalysis) {
        const avgPerformanceChange = recoveryAnalysis.recoveryData
            .reduce((sum, d) => sum + d.performanceChange, 0) / recoveryAnalysis.recoveryData.length;
        
        if (avgPerformanceChange > 0.05) return 'adapting_well';
        if (avgPerformanceChange > -0.02) return 'maintaining';
        if (avgPerformanceChange > -0.05) return 'slight_decline';
        return 'significant_decline';
    }

    calculateConfidence(recoveryAnalysis) {
        const dataPoints = recoveryAnalysis.recoveryData.length;
        const variability = this.calculateVariability(recoveryAnalysis.recoveryData);
        
        // Confidence based on data points and consistency
        let confidence = Math.min(dataPoints / 10, 1) * 0.7; // 70% max from data volume
        confidence += (1 - variability) * 0.3; // 30% from consistency
        
        if (confidence > 0.8) return 'high';
        if (confidence > 0.6) return 'medium';
        return 'low';
    }

    calculateVariability(data) {
        if (data.length < 2) return 1;
        
        const performanceChanges = data.map(d => d.performanceChange);
        const mean = performanceChanges.reduce((sum, val) => sum + val, 0) / performanceChanges.length;
        const variance = performanceChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / performanceChanges.length;
        
        return Math.min(Math.sqrt(variance), 1); // Normalize to 0-1
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
    
    applyLoadAdjustments(plannedWorkout, loadAdjustments) {
        // Apply load adjustments to planned workout
        return plannedWorkout.map(exercise => ({
            ...exercise,
            adjustedSets: Math.round(exercise.sets * loadAdjustments.volume),
            adjustedIntensity: exercise.intensity * loadAdjustments.intensity,
            adjustedDensity: exercise.restPeriods * (1 / loadAdjustments.density)
        }));
    }
    
    generateAdjustmentReasons(recoveryScore, loadAdjustments) {
        const reasons = [];
        
        if (loadAdjustments.volume < 1.0) {
            reasons.push(`Volume reduced by ${Math.round((1 - loadAdjustments.volume) * 100)}% due to recovery status`);
        }
        
        if (loadAdjustments.intensity < 1.0) {
            reasons.push(`Intensity reduced by ${Math.round((1 - loadAdjustments.intensity) * 100)}% for better recovery`);
        }
        
        if (recoveryScore < 60) {
            reasons.push('Low recovery score indicates need for deload training');
        }
        
        return reasons;
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