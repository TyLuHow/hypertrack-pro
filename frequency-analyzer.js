// HyperTrack Pro - Workout Frequency Analyzer
// Analyzes workout timing patterns and provides evidence-based frequency recommendations

class FrequencyAnalyzer {
    constructor() {
        this.workoutHistory = [];
        this.muscleGroupFrequency = new Map();
        this.performanceData = new Map();
        this.recoveryPatterns = new Map();
    }

    // Load workout history for analysis
    loadWorkoutHistory(workouts) {
        this.workoutHistory = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.analyzeFrequencyPatterns();
        console.log(`📊 Loaded ${workouts.length} workouts for frequency analysis`);
    }

    // Analyze current frequency patterns
    analyzeFrequencyPatterns() {
        this.muscleGroupFrequency.clear();
        this.performanceData.clear();
        
        // Group workouts by muscle group
        const muscleGroupWorkouts = new Map();
        
        this.workoutHistory.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            // Extract muscle groups from exercises
            const muscleGroups = new Set();
            workout.exercises?.forEach(exercise => {
                if (exercise.muscle_group) {
                    muscleGroups.add(exercise.muscle_group);
                }
            });
            
            // Record workout for each muscle group
            muscleGroups.forEach(muscleGroup => {
                if (!muscleGroupWorkouts.has(muscleGroup)) {
                    muscleGroupWorkouts.set(muscleGroup, []);
                }
                muscleGroupWorkouts.get(muscleGroup).push({
                    date: workoutDate,
                    workout: workout,
                    totalVolume: this.calculateWorkoutVolume(workout, muscleGroup)
                });
            });
        });
        
        // Calculate frequency metrics for each muscle group
        muscleGroupWorkouts.forEach((workouts, muscleGroup) => {
            const analysis = this.analyzeMuscleGroupFrequency(workouts, muscleGroup);
            this.muscleGroupFrequency.set(muscleGroup, analysis);
        });
    }

    // Analyze frequency patterns for a specific muscle group
    analyzeMuscleGroupFrequency(workouts, muscleGroup) {
        if (workouts.length < 2) {
            return {
                muscleGroup: muscleGroup,
                totalWorkouts: workouts.length,
                averageDaysBetween: null,
                frequency: 'insufficient_data',
                recommendation: 'Need more workout data'
            };
        }

        // Sort by date (newest first)
        workouts.sort((a, b) => b.date - a.date);
        
        // Calculate days between workouts
        const daysBetweenWorkouts = [];
        for (let i = 0; i < workouts.length - 1; i++) {
            const daysDiff = Math.floor((workouts[i].date - workouts[i + 1].date) / (1000 * 60 * 60 * 24));
            daysBetweenWorkouts.push(daysDiff);
        }
        
        const averageDaysBetween = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
        const frequencyPerWeek = 7 / averageDaysBetween;
        
        // Analyze performance trends vs rest days
        const performanceAnalysis = this.analyzePerformanceVsRestDays(workouts);
        
        return {
            muscleGroup: muscleGroup,
            totalWorkouts: workouts.length,
            daysBetweenWorkouts: daysBetweenWorkouts,
            averageDaysBetween: Math.round(averageDaysBetween * 10) / 10,
            currentFrequencyPerWeek: Math.round(frequencyPerWeek * 10) / 10,
            performanceAnalysis: performanceAnalysis,
            timespan: this.calculateTimespan(workouts),
            consistency: this.calculateConsistency(daysBetweenWorkouts)
        };
    }

    // Analyze performance vs rest days
    analyzePerformanceVsRestDays(workouts) {
        if (workouts.length < 3) return null;
        
        const performanceByRestDays = new Map();
        
        for (let i = 0; i < workouts.length - 1; i++) {
            const currentWorkout = workouts[i];
            const previousWorkout = workouts[i + 1];
            
            const restDays = Math.floor((currentWorkout.date - previousWorkout.date) / (1000 * 60 * 60 * 24));
            const performance = this.calculateWorkoutPerformance(currentWorkout);
            
            if (!performanceByRestDays.has(restDays)) {
                performanceByRestDays.set(restDays, []);
            }
            performanceByRestDays.get(restDays).push(performance);
        }
        
        // Calculate average performance for each rest day interval
        const performanceByRestDaysAvg = new Map();
        performanceByRestDays.forEach((performances, restDays) => {
            const avgPerformance = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
            performanceByRestDaysAvg.set(restDays, {
                averagePerformance: Math.round(avgPerformance * 100) / 100,
                sampleSize: performances.length
            });
        });
        
        // Find optimal rest period
        const optimalRestDays = this.findOptimalRestPeriod(performanceByRestDaysAvg);
        
        return {
            performanceByRestDays: Array.from(performanceByRestDaysAvg.entries()),
            optimalRestDays: optimalRestDays,
            recommendation: this.generateRestDayRecommendation(optimalRestDays)
        };
    }

    // Calculate workout performance score
    calculateWorkoutPerformance(workout) {
        if (!workout.exercises || workout.exercises.length === 0) return 0;
        
        let totalVolume = 0;
        let totalSets = 0;
        
        workout.exercises.forEach(exercise => {
            if (exercise.sets) {
                exercise.sets.forEach(set => {
                    totalVolume += (set.weight || 0) * (set.reps || 0);
                    totalSets++;
                });
            }
        });
        
        // Normalize performance score (volume per set)
        return totalSets > 0 ? totalVolume / totalSets : 0;
    }

    // Calculate total volume for a muscle group in a workout
    calculateWorkoutVolume(workout, muscleGroup) {
        if (!workout.exercises) return 0;
        
        let volume = 0;
        workout.exercises.forEach(exercise => {
            if (exercise.muscle_group === muscleGroup && exercise.sets) {
                exercise.sets.forEach(set => {
                    volume += (set.weight || 0) * (set.reps || 0);
                });
            }
        });
        
        return volume;
    }

    // Find optimal rest period based on performance data
    findOptimalRestPeriod(performanceByRestDays) {
        if (performanceByRestDays.size === 0) return null;
        
        let bestRestDays = null;
        let bestPerformance = 0;
        
        performanceByRestDays.forEach((data, restDays) => {
            // Weight by sample size and performance
            const weightedScore = data.averagePerformance * Math.min(data.sampleSize / 3, 1);
            
            if (weightedScore > bestPerformance) {
                bestPerformance = weightedScore;
                bestRestDays = restDays;
            }
        });
        
        return bestRestDays;
    }

    // Generate rest day recommendation
    generateRestDayRecommendation(optimalRestDays) {
        if (!optimalRestDays) return "Insufficient data for rest day optimization";
        
        if (optimalRestDays <= 1) {
            return "Consider daily training with lighter loads";
        } else if (optimalRestDays <= 2) {
            return "Every other day training appears optimal";
        } else if (optimalRestDays <= 3) {
            return "2-3 days rest between sessions recommended";
        } else {
            return "Extended rest periods may be beneficial";
        }
    }

    // Calculate timespan of workout data
    calculateTimespan(workouts) {
        if (workouts.length < 2) return 0;
        
        const oldest = workouts[workouts.length - 1].date;
        const newest = workouts[0].date;
        return Math.floor((newest - oldest) / (1000 * 60 * 60 * 24));
    }

    // Calculate consistency score (lower variance = higher consistency)
    calculateConsistency(daysBetweenWorkouts) {
        if (daysBetweenWorkouts.length < 2) return null;
        
        const mean = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
        const variance = daysBetweenWorkouts.reduce((sum, days) => sum + Math.pow(days - mean, 2), 0) / daysBetweenWorkouts.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Consistency score: lower std dev = higher consistency (0-100 scale)
        const consistencyScore = Math.max(0, 100 - (standardDeviation * 10));
        
        return {
            standardDeviation: Math.round(standardDeviation * 10) / 10,
            consistencyScore: Math.round(consistencyScore),
            interpretation: this.interpretConsistency(consistencyScore)
        };
    }

    // Interpret consistency score
    interpretConsistency(score) {
        if (score >= 80) return "Very consistent training schedule";
        if (score >= 60) return "Moderately consistent training";
        if (score >= 40) return "Inconsistent training pattern";
        return "Highly irregular training schedule";
    }

    // Get evidence-based frequency recommendations
    getFrequencyRecommendations(muscleGroup, userLevel = 'intermediate') {
        const analysis = this.muscleGroupFrequency.get(muscleGroup);
        
        // Research-based frequency recommendations
        const researchRecommendations = {
            'beginner': {
                'Horizontal Push': { frequency: 2, minRest: 48, maxRest: 72 },
                'Vertical Push': { frequency: 2, minRest: 48, maxRest: 72 },
                'Horizontal Pull': { frequency: 2, minRest: 48, maxRest: 72 },
                'Vertical Pull': { frequency: 2, minRest: 48, maxRest: 72 },
                'Legs': { frequency: 2, minRest: 72, maxRest: 96 },
                'Side Delts': { frequency: 3, minRest: 24, maxRest: 48 },
                'Rear Delts': { frequency: 3, minRest: 24, maxRest: 48 },
                'Biceps': { frequency: 2, minRest: 48, maxRest: 72 },
                'Triceps': { frequency: 2, minRest: 48, maxRest: 72 },
                'Abs': { frequency: 3, minRest: 24, maxRest: 48 }
            },
            'intermediate': {
                'Horizontal Push': { frequency: 2.5, minRest: 48, maxRest: 72 },
                'Vertical Push': { frequency: 2, minRest: 48, maxRest: 72 },
                'Horizontal Pull': { frequency: 2.5, minRest: 48, maxRest: 72 },
                'Vertical Pull': { frequency: 2.5, minRest: 48, maxRest: 72 },
                'Legs': { frequency: 2.5, minRest: 48, maxRest: 72 },
                'Side Delts': { frequency: 3, minRest: 24, maxRest: 48 },
                'Rear Delts': { frequency: 3, minRest: 24, maxRest: 48 },
                'Biceps': { frequency: 2.5, minRest: 36, maxRest: 60 },
                'Triceps': { frequency: 2.5, minRest: 36, maxRest: 60 },
                'Abs': { frequency: 4, minRest: 24, maxRest: 48 }
            },
            'advanced': {
                'Horizontal Push': { frequency: 3, minRest: 36, maxRest: 60 },
                'Vertical Push': { frequency: 2.5, minRest: 48, maxRest: 72 },
                'Horizontal Pull': { frequency: 3, minRest: 36, maxRest: 60 },
                'Vertical Pull': { frequency: 3, minRest: 36, maxRest: 60 },
                'Legs': { frequency: 3, minRest: 48, maxRest: 72 },
                'Side Delts': { frequency: 4, minRest: 24, maxRest: 48 },
                'Rear Delts': { frequency: 4, minRest: 24, maxRest: 48 },
                'Biceps': { frequency: 3, minRest: 24, maxRest: 48 },
                'Triceps': { frequency: 3, minRest: 24, maxRest: 48 },
                'Abs': { frequency: 5, minRest: 24, maxRest: 48 }
            }
        };

        const recommendation = researchRecommendations[userLevel]?.[muscleGroup] || 
                             researchRecommendations['intermediate']['Horizontal Push'];

        return {
            muscleGroup: muscleGroup,
            currentFrequency: analysis?.currentFrequencyPerWeek || 0,
            recommendedFrequency: recommendation.frequency,
            recommendedRestHours: `${recommendation.minRest}-${recommendation.maxRest}`,
            analysis: analysis,
            adjustmentNeeded: this.calculateFrequencyAdjustment(analysis, recommendation),
            research: this.getFrequencyResearch(muscleGroup),
            personalized: this.getPersonalizedRecommendation(analysis, recommendation)
        };
    }

    // Calculate frequency adjustment needed
    calculateFrequencyAdjustment(analysis, recommendation) {
        if (!analysis || !analysis.currentFrequencyPerWeek) {
            return { type: 'insufficient_data', message: 'Need more workout data' };
        }

        const current = analysis.currentFrequencyPerWeek;
        const recommended = recommendation.frequency;
        const difference = recommended - current;

        if (Math.abs(difference) < 0.3) {
            return { type: 'optimal', message: 'Current frequency is optimal' };
        } else if (difference > 0.3) {
            return { 
                type: 'increase', 
                message: `Increase frequency by ${Math.round(difference * 10) / 10}x per week`,
                suggestion: this.getIncreaseFrequencySuggestion(difference)
            };
        } else {
            return { 
                type: 'decrease', 
                message: `Consider reducing frequency by ${Math.round(Math.abs(difference) * 10) / 10}x per week`,
                suggestion: this.getDecreaseFrequencySuggestion(Math.abs(difference))
            };
        }
    }

    // Get suggestions for increasing frequency
    getIncreaseFrequencySuggestion(difference) {
        if (difference >= 1) {
            return "Add a full additional workout day for this muscle group";
        } else if (difference >= 0.5) {
            return "Add this muscle group to an existing workout day";
        } else {
            return "Consider adding 1-2 sets to existing workouts";
        }
    }

    // Get suggestions for decreasing frequency
    getDecreaseFrequencySuggestion(difference) {
        if (difference >= 1) {
            return "Remove one workout day and focus on quality over quantity";
        } else if (difference >= 0.5) {
            return "Reduce volume in one of the weekly sessions";
        } else {
            return "Consider slightly longer rest periods between sessions";
        }
    }

    // Get research citations for frequency recommendations
    getFrequencyResearch(muscleGroup) {
        const researchMap = {
            'Horizontal Push': "Schoenfeld et al. 2019 - Higher frequency training optimizes hypertrophy",
            'Vertical Pull': "Grgic et al. 2018 - Training frequency and muscle growth meta-analysis", 
            'Side Delts': "Baz-Valle et al. 2022 - Small muscle groups benefit from higher frequency",
            'Biceps': "Schoenfeld et al. 2015 - Muscle protein synthesis elevated 48-72h post-exercise",
            'Triceps': "Dankel et al. 2017 - Training frequency recommendations for muscle growth"
        };

        return researchMap[muscleGroup] || "Schoenfeld et al. 2016 - Training frequency meta-analysis";
    }

    // Get personalized recommendation based on individual response
    getPersonalizedRecommendation(analysis, recommendation) {
        if (!analysis || !analysis.performanceAnalysis) {
            return "Complete more workouts to generate personalized recommendations";
        }

        const performanceData = analysis.performanceAnalysis;
        const optimalRest = performanceData.optimalRestDays;

        if (optimalRest) {
            const personalizedFrequency = 7 / optimalRest;
            const standardFrequency = recommendation.frequency;
            
            if (personalizedFrequency > standardFrequency * 1.2) {
                return `Your performance data suggests you recover faster than average. Consider training this muscle group ${Math.round(personalizedFrequency * 10) / 10}x per week.`;
            } else if (personalizedFrequency < standardFrequency * 0.8) {
                return `Your performance data suggests you need more recovery time. Consider training this muscle group ${Math.round(personalizedFrequency * 10) / 10}x per week.`;
            } else {
                return `Your recovery patterns align well with research recommendations of ${standardFrequency}x per week.`;
            }
        }

        return "Continue current pattern while gathering more performance data";
    }

    // Get comprehensive frequency analysis report
    getComprehensiveReport() {
        const report = {
            overview: {
                totalMuscleGroups: this.muscleGroupFrequency.size,
                totalWorkouts: this.workoutHistory.length,
                timespan: this.workoutHistory.length > 0 ? this.calculateTimespan([
                    { date: new Date(this.workoutHistory[0].date) },
                    { date: new Date(this.workoutHistory[this.workoutHistory.length - 1].date) }
                ]) : 0
            },
            muscleGroupAnalysis: [],
            recommendations: [],
            insights: []
        };

        // Analyze each muscle group
        this.muscleGroupFrequency.forEach((analysis, muscleGroup) => {
            const recommendations = this.getFrequencyRecommendations(muscleGroup);
            
            report.muscleGroupAnalysis.push({
                muscleGroup: muscleGroup,
                analysis: analysis,
                recommendations: recommendations
            });

            if (recommendations.adjustmentNeeded.type !== 'optimal') {
                report.recommendations.push({
                    muscleGroup: muscleGroup,
                    priority: this.getRecommendationPriority(recommendations.adjustmentNeeded),
                    action: recommendations.adjustmentNeeded.message,
                    suggestion: recommendations.adjustmentNeeded.suggestion
                });
            }
        });

        // Generate insights
        report.insights = this.generateInsights(report.muscleGroupAnalysis);

        return report;
    }

    // Get recommendation priority
    getRecommendationPriority(adjustment) {
        if (adjustment.type === 'insufficient_data') return 'low';
        if (adjustment.type === 'optimal') return 'none';
        
        const changeNeeded = adjustment.message.match(/(\d+\.?\d*)/);
        const magnitude = changeNeeded ? parseFloat(changeNeeded[1]) : 0;
        
        if (magnitude >= 1) return 'high';
        if (magnitude >= 0.5) return 'medium';
        return 'low';
    }

    // Generate training insights
    generateInsights(muscleGroupAnalysis) {
        const insights = [];
        
        // Overall frequency pattern
        const frequencies = muscleGroupAnalysis
            .filter(mg => mg.analysis.currentFrequencyPerWeek)
            .map(mg => mg.analysis.currentFrequencyPerWeek);
        
        if (frequencies.length > 0) {
            const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
            insights.push({
                type: 'frequency_pattern',
                insight: `Average training frequency: ${Math.round(avgFrequency * 10) / 10}x per week`,
                interpretation: avgFrequency >= 2.5 ? 'High frequency approach' : 
                              avgFrequency >= 1.5 ? 'Moderate frequency approach' : 'Low frequency approach'
            });
        }

        // Consistency analysis
        const consistencyScores = muscleGroupAnalysis
            .filter(mg => mg.analysis.consistency?.consistencyScore)
            .map(mg => mg.analysis.consistency.consistencyScore);
        
        if (consistencyScores.length > 0) {
            const avgConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
            insights.push({
                type: 'consistency',
                insight: `Training consistency score: ${Math.round(avgConsistency)}/100`,
                interpretation: this.interpretConsistency(avgConsistency),
                recommendation: avgConsistency < 60 ? 'Focus on establishing a more regular training schedule' : 'Maintain current consistency level'
            });
        }

        return insights;
    }

    // Get muscle groups that need frequency adjustments
    getMuscleGroupsNeedingAttention() {
        const needingAttention = [];
        
        this.muscleGroupFrequency.forEach((analysis, muscleGroup) => {
            const recommendations = this.getFrequencyRecommendations(muscleGroup);
            
            if (recommendations.adjustmentNeeded.type !== 'optimal' && 
                recommendations.adjustmentNeeded.type !== 'insufficient_data') {
                needingAttention.push({
                    muscleGroup: muscleGroup,
                    issue: recommendations.adjustmentNeeded.type,
                    priority: this.getRecommendationPriority(recommendations.adjustmentNeeded),
                    currentFrequency: analysis.currentFrequencyPerWeek,
                    recommendedFrequency: recommendations.recommendedFrequency
                });
            }
        });
        
        // Sort by priority
        return needingAttention.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
}

// Export for use in main app
window.FrequencyAnalyzer = FrequencyAnalyzer;
console.log('✅ Frequency Analyzer loaded');