// HyperTrack Pro - Performance vs Rest Days Analysis
// Advanced algorithms to optimize training frequency based on individual performance patterns

class PerformanceRestAnalyzer {
    constructor() {
        this.performanceData = new Map();
        this.restPatterns = new Map();
        this.adaptationCurves = new Map();
    }

    // Main analysis function
    analyzePerformanceVsRest(workoutHistory, muscleGroup = null) {
        const analysis = {
            overview: this.generateOverview(workoutHistory),
            muscleGroupAnalysis: new Map(),
            globalPatterns: null,
            recommendations: [],
            insights: []
        };

        if (muscleGroup) {
            // Analyze specific muscle group
            analysis.muscleGroupAnalysis.set(muscleGroup, this.analyzeMuscleGroupRest(workoutHistory, muscleGroup));
        } else {
            // Analyze all muscle groups
            const muscleGroups = this.extractMuscleGroups(workoutHistory);
            muscleGroups.forEach(mg => {
                analysis.muscleGroupAnalysis.set(mg, this.analyzeMuscleGroupRest(workoutHistory, mg));
            });
            
            // Generate global patterns
            analysis.globalPatterns = this.analyzeGlobalRestPatterns(analysis.muscleGroupAnalysis);
        }

        // Generate recommendations and insights
        analysis.recommendations = this.generateRestRecommendations(analysis);
        analysis.insights = this.generatePerformanceInsights(analysis);

        return analysis;
    }

    // Generate overview statistics
    generateOverview(workoutHistory) {
        const totalWorkouts = workoutHistory.length;
        const timespan = this.calculateTimespan(workoutHistory);
        const avgWorkoutsPerWeek = totalWorkouts > 0 ? (totalWorkouts / timespan * 7) : 0;

        return {
            totalWorkouts: totalWorkouts,
            timespanDays: Math.round(timespan),
            avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
            analysisQuality: this.assessAnalysisQuality(totalWorkouts, timespan)
        };
    }

    // Extract unique muscle groups from workout history
    extractMuscleGroups(workoutHistory) {
        const muscleGroups = new Set();
        
        workoutHistory.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                if (exercise.muscle_group) {
                    muscleGroups.add(exercise.muscle_group);
                }
            });
        });
        
        return Array.from(muscleGroups);
    }

    // Analyze rest patterns for specific muscle group
    analyzeMuscleGroupRest(workoutHistory, muscleGroup) {
        // Filter workouts containing the muscle group
        const relevantWorkouts = workoutHistory.filter(workout =>
            workout.exercises?.some(exercise => exercise.muscle_group === muscleGroup)
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        if (relevantWorkouts.length < 3) {
            return {
                muscleGroup: muscleGroup,
                status: 'insufficient_data',
                message: `Need at least 3 ${muscleGroup} workouts for analysis`
            };
        }

        // Calculate rest periods and performance metrics
        const restPerformanceData = this.calculateRestPerformanceData(relevantWorkouts, muscleGroup);
        
        // Analyze patterns
        const patterns = this.identifyRestPatterns(restPerformanceData);
        const optimalRest = this.findOptimalRestPeriod(restPerformanceData);
        const adaptation = this.analyzeAdaptationPattern(restPerformanceData);
        const fatigue = this.analyzeFatiguePattern(restPerformanceData);

        return {
            muscleGroup: muscleGroup,
            status: 'analyzed',
            dataPoints: restPerformanceData.length,
            restPerformanceData: restPerformanceData,
            patterns: patterns,
            optimalRest: optimalRest,
            adaptation: adaptation,
            fatigue: fatigue,
            recommendations: this.generateMuscleGroupRecommendations(muscleGroup, patterns, optimalRest, adaptation)
        };
    }

    // Calculate rest periods and performance metrics between workouts
    calculateRestPerformanceData(workouts, muscleGroup) {
        const data = [];
        
        for (let i = 1; i < workouts.length; i++) {
            const currentWorkout = workouts[i];
            const previousWorkout = workouts[i - 1];
            
            const restHours = (new Date(currentWorkout.date) - new Date(previousWorkout.date)) / (1000 * 60 * 60);
            const currentPerformance = this.calculateWorkoutPerformance(currentWorkout, muscleGroup);
            const previousPerformance = this.calculateWorkoutPerformance(previousWorkout, muscleGroup);
            
            // Calculate multiple performance metrics
            const volumeChange = previousPerformance.volume > 0 ? 
                (currentPerformance.volume - previousPerformance.volume) / previousPerformance.volume : 0;
            
            const intensityChange = previousPerformance.avgIntensity > 0 ?
                (currentPerformance.avgIntensity - previousPerformance.avgIntensity) / previousPerformance.avgIntensity : 0;
            
            const densityChange = previousPerformance.density > 0 ?
                (currentPerformance.density - previousPerformance.density) / previousPerformance.density : 0;

            data.push({
                workoutIndex: i,
                date: currentWorkout.date,
                restHours: Math.round(restHours),
                restDays: Math.round(restHours / 24 * 10) / 10,
                currentPerformance: currentPerformance,
                previousPerformance: previousPerformance,
                volumeChange: Math.round(volumeChange * 1000) / 10, // Percentage
                intensityChange: Math.round(intensityChange * 1000) / 10,
                densityChange: Math.round(densityChange * 1000) / 10,
                overallPerformanceScore: this.calculateOverallPerformanceScore(volumeChange, intensityChange, densityChange)
            });
        }
        
        return data;
    }

    // Calculate comprehensive workout performance metrics
    calculateWorkoutPerformance(workout, muscleGroup) {
        const relevantExercises = workout.exercises?.filter(ex => ex.muscle_group === muscleGroup) || [];
        
        if (relevantExercises.length === 0) {
            return { volume: 0, avgIntensity: 0, density: 0, totalSets: 0 };
        }

        let totalVolume = 0;
        let totalSets = 0;
        let weightedIntensity = 0;
        let totalDuration = 0;

        relevantExercises.forEach(exercise => {
            if (exercise.sets) {
                exercise.sets.forEach(set => {
                    const setVolume = (set.weight || 0) * (set.reps || 0);
                    totalVolume += setVolume;
                    totalSets++;
                    weightedIntensity += (set.weight || 0) * (set.reps || 0);
                });
            }
        });

        // Calculate workout duration (simplified - could be enhanced with actual timestamps)
        const avgRestBetweenSets = 120; // 2 minutes average rest
        const avgSetDuration = 45; // 45 seconds average set duration
        totalDuration = (totalSets * avgSetDuration + (totalSets - 1) * avgRestBetweenSets) / 60; // Convert to minutes

        return {
            volume: totalVolume,
            avgIntensity: totalSets > 0 ? weightedIntensity / totalVolume : 0,
            density: totalDuration > 0 ? totalVolume / totalDuration : 0, // Volume per minute
            totalSets: totalSets
        };
    }

    // Calculate overall performance score combining multiple metrics
    calculateOverallPerformanceScore(volumeChange, intensityChange, densityChange) {
        // Weighted combination of performance changes
        const weights = {
            volume: 0.5,    // Volume is most important for hypertrophy
            intensity: 0.3, // Intensity matters for strength
            density: 0.2    // Density indicates work capacity
        };

        const score = (volumeChange * weights.volume + 
                      intensityChange * weights.intensity + 
                      densityChange * weights.density);

        return Math.round(score * 10) / 10;
    }

    // Identify patterns in rest vs performance data
    identifyRestPatterns(restPerformanceData) {
        if (restPerformanceData.length < 3) {
            return { status: 'insufficient_data' };
        }

        // Group data by rest period ranges
        const restGroups = this.groupByRestPeriods(restPerformanceData);
        
        // Analyze trends
        const volumeTrend = this.analyzeTrend(restPerformanceData, 'volumeChange', 'restHours');
        const intensityTrend = this.analyzeTrend(restPerformanceData, 'intensityChange', 'restHours');
        const overallTrend = this.analyzeTrend(restPerformanceData, 'overallPerformanceScore', 'restHours');

        // Identify patterns
        const patterns = {
            restGroups: restGroups,
            trends: {
                volume: volumeTrend,
                intensity: intensityTrend,
                overall: overallTrend
            },
            bestPerformance: this.findBestPerformanceRest(restPerformanceData),
            worstPerformance: this.findWorstPerformanceRest(restPerformanceData),
            consistency: this.analyzePerformanceConsistency(restPerformanceData)
        };

        return patterns;
    }

    // Group data by rest period ranges
    groupByRestPeriods(data) {
        const groups = {
            'short_rest': [], // < 36 hours
            'moderate_rest': [], // 36-60 hours
            'long_rest': [], // 60-84 hours
            'extended_rest': [] // > 84 hours
        };

        data.forEach(point => {
            if (point.restHours < 36) {
                groups.short_rest.push(point);
            } else if (point.restHours < 60) {
                groups.moderate_rest.push(point);
            } else if (point.restHours < 84) {
                groups.long_rest.push(point);
            } else {
                groups.extended_rest.push(point);
            }
        });

        // Calculate averages for each group
        Object.keys(groups).forEach(groupName => {
            const groupData = groups[groupName];
            if (groupData.length > 0) {
                groups[groupName] = {
                    dataPoints: groupData,
                    count: groupData.length,
                    avgRestHours: this.calculateAverage(groupData, 'restHours'),
                    avgVolumeChange: this.calculateAverage(groupData, 'volumeChange'),
                    avgIntensityChange: this.calculateAverage(groupData, 'intensityChange'),
                    avgOverallScore: this.calculateAverage(groupData, 'overallPerformanceScore'),
                    consistency: this.calculateGroupConsistency(groupData)
                };
            } else {
                groups[groupName] = {
                    dataPoints: [],
                    count: 0,
                    avgRestHours: 0,
                    avgVolumeChange: 0,
                    avgIntensityChange: 0,
                    avgOverallScore: 0,
                    consistency: 0
                };
            }
        });

        return groups;
    }

    // Analyze trend between rest time and performance
    analyzeTrend(data, performanceMetric, restMetric) {
        if (data.length < 3) return { correlation: 0, trend: 'insufficient_data' };

        const correlation = this.calculateCorrelation(
            data.map(d => d[restMetric]),
            data.map(d => d[performanceMetric])
        );

        let trend;
        if (correlation > 0.3) trend = 'improves_with_more_rest';
        else if (correlation < -0.3) trend = 'declines_with_more_rest';
        else trend = 'no_clear_trend';

        return {
            correlation: Math.round(correlation * 100) / 100,
            trend: trend,
            strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                     Math.abs(correlation) > 0.3 ? 'moderate' : 'weak'
        };
    }

    // Find optimal rest period based on performance data
    findOptimalRestPeriod(data) {
        if (data.length < 3) {
            return { hours: 48, confidence: 'low', reason: 'insufficient_data' };
        }

        // Find rest period with highest average performance
        const restPerformanceMap = new Map();
        
        data.forEach(point => {
            const restBucket = Math.floor(point.restHours / 12) * 12; // Group by 12-hour buckets
            if (!restPerformanceMap.has(restBucket)) {
                restPerformanceMap.set(restBucket, []);
            }
            restPerformanceMap.get(restBucket).push(point.overallPerformanceScore);
        });

        let bestRest = 48;
        let bestScore = -Infinity;
        let bestCount = 0;

        restPerformanceMap.forEach((scores, restHours) => {
            if (scores.length >= 2) { // Need at least 2 data points
                const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                const weightedScore = avgScore * Math.min(scores.length / 3, 1); // Weight by sample size
                
                if (weightedScore > bestScore) {
                    bestScore = weightedScore;
                    bestRest = restHours;
                    bestCount = scores.length;
                }
            }
        });

        const confidence = bestCount >= 4 ? 'high' : bestCount >= 2 ? 'medium' : 'low';

        return {
            hours: bestRest,
            score: Math.round(bestScore * 10) / 10,
            confidence: confidence,
            sampleSize: bestCount,
            reason: this.explainOptimalRest(bestRest, bestScore)
        };
    }

    // Analyze adaptation pattern over time
    analyzeAdaptationPattern(data) {
        if (data.length < 4) {
            return { status: 'insufficient_data' };
        }

        // Split data into early and late periods
        const midPoint = Math.floor(data.length / 2);
        const earlyData = data.slice(0, midPoint);
        const lateData = data.slice(midPoint);

        const earlyAvgPerformance = this.calculateAverage(earlyData, 'overallPerformanceScore');
        const lateAvgPerformance = this.calculateAverage(lateData, 'overallPerformanceScore');

        const adaptationRate = (lateAvgPerformance - earlyAvgPerformance) / earlyAvgPerformance;

        let adaptationStatus;
        if (adaptationRate > 0.1) adaptationStatus = 'improving';
        else if (adaptationRate > -0.05) adaptationStatus = 'stable';
        else if (adaptationRate > -0.15) adaptationStatus = 'declining';
        else adaptationStatus = 'significant_decline';

        return {
            status: adaptationStatus,
            adaptationRate: Math.round(adaptationRate * 1000) / 10, // Percentage
            earlyPerformance: Math.round(earlyAvgPerformance * 10) / 10,
            latePerformance: Math.round(lateAvgPerformance * 10) / 10,
            trend: this.calculatePerformanceTrend(data)
        };
    }

    // Analyze fatigue accumulation patterns
    analyzeFatiguePattern(data) {
        if (data.length < 3) {
            return { status: 'insufficient_data' };
        }

        // Look for declining performance with shorter rest periods
        const fatigueIndicators = {
            consecutiveDeclines: 0,
            avgDeclineAfterShortRest: 0,
            fatigueRisk: 'low'
        };

        let consecutiveDeclines = 0;
        let maxConsecutiveDeclines = 0;
        let shortRestDeclines = [];

        data.forEach((point, index) => {
            if (point.overallPerformanceScore < 0) {
                consecutiveDeclines++;
                
                if (point.restHours < 48) {
                    shortRestDeclines.push(point.overallPerformanceScore);
                }
            } else {
                maxConsecutiveDeclines = Math.max(maxConsecutiveDeclines, consecutiveDeclines);
                consecutiveDeclines = 0;
            }
        });

        fatigueIndicators.consecutiveDeclines = Math.max(maxConsecutiveDeclines, consecutiveDeclines);
        
        if (shortRestDeclines.length > 0) {
            fatigueIndicators.avgDeclineAfterShortRest = 
                shortRestDeclines.reduce((sum, val) => sum + val, 0) / shortRestDeclines.length;
        }

        // Assess fatigue risk
        if (fatigueIndicators.consecutiveDeclines >= 3 || fatigueIndicators.avgDeclineAfterShortRest < -5) {
            fatigueIndicators.fatigueRisk = 'high';
        } else if (fatigueIndicators.consecutiveDeclines >= 2 || fatigueIndicators.avgDeclineAfterShortRest < -2) {
            fatigueIndicators.fatigueRisk = 'medium';
        }

        return fatigueIndicators;
    }

    // Generate global patterns across all muscle groups
    analyzeGlobalRestPatterns(muscleGroupAnalyses) {
        const validAnalyses = Array.from(muscleGroupAnalyses.values())
            .filter(analysis => analysis.status === 'analyzed');

        if (validAnalyses.length === 0) {
            return { status: 'insufficient_data' };
        }

        // Aggregate optimal rest periods
        const optimalRests = validAnalyses
            .map(analysis => analysis.optimalRest.hours)
            .filter(hours => hours > 0);

        const avgOptimalRest = optimalRests.reduce((sum, hours) => sum + hours, 0) / optimalRests.length;

        // Analyze adaptation patterns
        const adaptationStatuses = validAnalyses
            .map(analysis => analysis.adaptation.status)
            .filter(status => status !== 'insufficient_data');

        const overallAdaptation = this.determineOverallAdaptation(adaptationStatuses);

        return {
            status: 'analyzed',
            avgOptimalRest: Math.round(avgOptimalRest),
            optimalRestRange: {
                min: Math.min(...optimalRests),
                max: Math.max(...optimalRests)
            },
            overallAdaptation: overallAdaptation,
            muscleGroupCount: validAnalyses.length
        };
    }

    // Generate rest-based recommendations
    generateRestRecommendations(analysis) {
        const recommendations = [];

        // Global recommendations
        if (analysis.globalPatterns?.status === 'analyzed') {
            const globalRest = analysis.globalPatterns.avgOptimalRest;
            recommendations.push({
                type: 'global',
                priority: 'high',
                recommendation: `Optimal rest period across muscle groups: ${globalRest} hours`,
                frequency: `Train each muscle group every ${Math.round(globalRest / 24 * 10) / 10} days`,
                reasoning: 'Based on performance analysis across all tracked muscle groups'
            });
        }

        // Muscle group specific recommendations
        analysis.muscleGroupAnalysis.forEach((mgAnalysis, muscleGroup) => {
            if (mgAnalysis.status === 'analyzed' && mgAnalysis.recommendations) {
                mgAnalysis.recommendations.forEach(rec => {
                    recommendations.push({
                        type: 'muscle_group',
                        muscleGroup: muscleGroup,
                        ...rec
                    });
                });
            }
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // Generate performance insights
    generatePerformanceInsights(analysis) {
        const insights = [];

        // Overall performance trends
        const validAnalyses = Array.from(analysis.muscleGroupAnalysis.values())
            .filter(a => a.status === 'analyzed');

        if (validAnalyses.length > 0) {
            const improvingCount = validAnalyses.filter(a => a.adaptation.status === 'improving').length;
            const decliningCount = validAnalyses.filter(a => a.adaptation.status === 'declining' || 
                                                            a.adaptation.status === 'significant_decline').length;

            insights.push({
                type: 'adaptation_overview',
                insight: `${improvingCount}/${validAnalyses.length} muscle groups showing improvement`,
                interpretation: improvingCount > validAnalyses.length / 2 ? 'Overall positive adaptation' :
                               decliningCount > validAnalyses.length / 2 ? 'Consider deload or recovery focus' :
                               'Mixed adaptation patterns - optimize rest periods',
                priority: decliningCount > validAnalyses.length / 2 ? 'high' : 'medium'
            });

            // Fatigue analysis
            const highFatigueCount = validAnalyses.filter(a => a.fatigue.fatigueRisk === 'high').length;
            if (highFatigueCount > 0) {
                insights.push({
                    type: 'fatigue_warning',
                    insight: `${highFatigueCount} muscle groups showing high fatigue risk`,
                    interpretation: 'Consider extending rest periods or implementing deload',
                    priority: 'high'
                });
            }
        }

        return insights;
    }

    // Helper methods
    calculateTimespan(workouts) {
        if (workouts.length < 2) return 0;
        const dates = workouts.map(w => new Date(w.date)).sort((a, b) => a - b);
        return (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
    }

    calculateAverage(data, field) {
        if (data.length === 0) return 0;
        return data.reduce((sum, item) => sum + item[field], 0) / data.length;
    }

    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length < 2) return 0;
        
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator !== 0 ? numerator / denominator : 0;
    }

    assessAnalysisQuality(workouts, timespan) {
        if (workouts < 5) return 'poor';
        if (workouts < 10 || timespan < 14) return 'fair';
        if (workouts < 20 || timespan < 30) return 'good';
        return 'excellent';
    }

    explainOptimalRest(hours, score) {
        if (score > 2) return 'Strong performance improvement with this rest period';
        if (score > 0) return 'Positive performance trend with this rest period';
        if (score > -2) return 'Neutral performance with this rest period';
        return 'Performance may decline with this rest period';
    }

    generateMuscleGroupRecommendations(muscleGroup, patterns, optimalRest, adaptation) {
        const recommendations = [];
        
        if (optimalRest.confidence === 'high') {
            recommendations.push({
                priority: 'high',
                recommendation: `Train ${muscleGroup} every ${Math.round(optimalRest.hours / 24 * 10) / 10} days`,
                reasoning: `${optimalRest.sampleSize} data points show best performance with ${optimalRest.hours}h rest`
            });
        }

        if (adaptation.status === 'declining') {
            recommendations.push({
                priority: 'high',
                recommendation: `Extend rest periods for ${muscleGroup}`,
                reasoning: `Performance declining by ${Math.abs(adaptation.adaptationRate)}% over time`
            });
        }

        return recommendations;
    }

    calculatePerformanceTrend(data) {
        if (data.length < 3) return 'insufficient_data';
        
        const performances = data.map(d => d.overallPerformanceScore);
        const timePoints = data.map((d, i) => i);
        
        const correlation = this.calculateCorrelation(timePoints, performances);
        
        if (correlation > 0.3) return 'improving_over_time';
        if (correlation < -0.3) return 'declining_over_time';
        return 'stable_over_time';
    }

    determineOverallAdaptation(adaptationStatuses) {
        const statusCounts = adaptationStatuses.reduce((counts, status) => {
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});

        const total = adaptationStatuses.length;
        const improving = statusCounts.improving || 0;
        const declining = (statusCounts.declining || 0) + (statusCounts.significant_decline || 0);

        if (improving > total * 0.6) return 'overall_improving';
        if (declining > total * 0.4) return 'overall_declining';
        return 'mixed_adaptation';
    }

    calculateGroupConsistency(groupData) {
        if (groupData.length < 2) return 0;
        
        const scores = groupData.map(d => d.overallPerformanceScore);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        
        // Convert to consistency score (lower variance = higher consistency)
        return Math.max(0, 100 - Math.sqrt(variance) * 10);
    }

    findBestPerformanceRest(data) {
        return data.reduce((best, current) => 
            current.overallPerformanceScore > best.overallPerformanceScore ? current : best
        );
    }

    findWorstPerformanceRest(data) {
        return data.reduce((worst, current) => 
            current.overallPerformanceScore < worst.overallPerformanceScore ? current : worst
        );
    }

    analyzePerformanceConsistency(data) {
        const scores = data.map(d => d.overallPerformanceScore);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        return {
            mean: Math.round(mean * 10) / 10,
            standardDeviation: Math.round(standardDeviation * 10) / 10,
            consistencyScore: Math.max(0, 100 - standardDeviation * 20),
            interpretation: standardDeviation < 2 ? 'Very consistent performance' :
                           standardDeviation < 4 ? 'Moderately consistent performance' :
                           'Highly variable performance'
        };
    }
}

// Export for use in main app
window.PerformanceRestAnalyzer = PerformanceRestAnalyzer;
console.log('✅ Performance vs Rest Analyzer loaded');