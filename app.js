// HyperTrack Pro - Enhanced with Rest Timer and Weight Recommendations
// Evidence-Based Workout Tracking Application

// ==========================================
// SIMPLIFIED AUTH FOR SINGLE USER
// ==========================================
class SimpleAuth {
    constructor() {
        this.isAuthenticated = true; // Always authenticated for single user
        this.user = {
            id: 'tyler-main-user',
            email: 'tyler@hypertrack.local',
            name: 'Tyler'
        };
        this.session = {
            access_token: 'single-user-session',
            user: this.user
        };
    }
    
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.access_token}`
        };
    }
    
    async authenticatedFetch(url, options = {}) {
        return fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        });
    }
}

// Initialize simplified auth
const authManager = new SimpleAuth();

// ==========================================
// GLOBAL APPLICATION STATE
// ==========================================
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
        exercises: [],
        settings: {
            showResearchFacts: true,
            darkMode: true,
            compoundRest: 150,  // Updated to 2.5 minutes based on research
            isolationRest: 90,
            progressionRate: 3.5,  // Updated to 3.5% based on research
            autoStartRestTimer: true
        },
        user: {
            name: 'Tyler',
            preferences: {}
        },
        restTimer: {
            active: false,
            interval: null,
            remaining: 0,
            exerciseJustCompleted: null
        },
        recommendations: {
            cache: new Map(),
            lastUpdated: null
        },
        progressionGoals: new Map(),
        plateauAlerts: new Map()
    },
    
    // Research facts to display
    researchFacts: [
        "Research shows 2-3 minutes rest between compound exercises maximizes performance",
        "Dr. Eric Helms' research recommends 3.5% weekly progression for trained individuals",
        "Longer rest periods (2-3+ min) allow greater recovery and heavier subsequent lifts",
        "Studies show 10-20 sets per muscle per week optimizes hypertrophy",
        "Training each muscle 2x per week maximizes protein synthesis response",
        "Both heavy (4-6) and moderate (8-12) rep ranges build muscle effectively",
        "Eccentric (lowering) phase should be controlled for 2-3 seconds",
        "Isolation exercises need only 1-2 minutes rest between sets",
        "Sleep quality directly impacts recovery and muscle protein synthesis",
        "Consistency beats perfection - regular training trumps perfect sessions"
    ],
    
    // Load Tyler's complete workout history
    loadHistoricalData() {
        if (typeof tylerCompleteWorkouts !== 'undefined' && tylerCompleteWorkouts.length > 0) {
            const existingIds = this.state.workouts.map(w => w.id);
            const newWorkouts = tylerCompleteWorkouts.filter(w => !existingIds.includes(w.id));
            this.state.workouts = [...this.state.workouts, ...newWorkouts];
            console.log(`✅ Loaded ${newWorkouts.length} historical workouts (${tylerCompleteWorkouts.length} total from CSV)`);
        }
    },
    
    // Advanced rest timer learning system
    restTimerLearning: {
        // Store performance data correlated with rest periods
        performanceData: new Map(),
        
        // Calculate optimal rest time based on historical performance
        calculateOptimalRestTime(exerciseName, category) {
            const key = `${exerciseName}_${category}`;
            const data = this.performanceData.get(key) || [];
            
            // If no data, use research-based defaults
            if (data.length < 3) {
                return category === 'Compound' ? 150 : 90;
            }
            
            // Calculate success rate for different rest periods
            const restPeriods = {};
            data.forEach(entry => {
                const restTime = Math.floor(entry.restTime / 30) * 30; // Group by 30s intervals
                if (!restPeriods[restTime]) {
                    restPeriods[restTime] = { successful: 0, total: 0 };
                }
                restPeriods[restTime].total++;
                if (entry.successful) {
                    restPeriods[restTime].successful++;
                }
            });
            
            // Find optimal rest time (highest success rate with enough data)
            let bestRestTime = category === 'Compound' ? 150 : 90;
            let bestSuccessRate = 0;
            
            for (const [restTime, stats] of Object.entries(restPeriods)) {
                if (stats.total >= 2) { // Need at least 2 data points
                    const successRate = stats.successful / stats.total;
                    if (successRate > bestSuccessRate) {
                        bestSuccessRate = successRate;
                        bestRestTime = parseInt(restTime);
                    }
                }
            }
            
            return bestRestTime;
        },
        
        // Record performance outcome after rest period
        recordPerformanceOutcome(exerciseName, category, restTime, targetWeight, targetReps, actualReps, rpe = null) {
            const key = `${exerciseName}_${category}`;
            if (!this.performanceData.has(key)) {
                this.performanceData.set(key, []);
            }
            
            const data = this.performanceData.get(key);
            const successful = actualReps >= targetReps;
            
            const entry = {
                timestamp: new Date().toISOString(),
                restTime: restTime,
                targetWeight: targetWeight,
                targetReps: targetReps,
                actualReps: actualReps,
                successful: successful,
                rpe: rpe,
                successRate: successful ? 1 : 0
            };
            
            data.push(entry);
            
            // Keep only last 50 entries per exercise
            if (data.length > 50) {
                data.shift();
            }
            
            this.performanceData.set(key, data);
            console.log(`📊 Recorded performance: ${exerciseName} - ${successful ? 'Success' : 'Failure'} after ${restTime}s rest`);
        },
        
        // Get rest time recommendation with reasoning
        getRestRecommendation(exerciseName, category) {
            const optimalRest = this.calculateOptimalRestTime(exerciseName, category);
            const defaultRest = category === 'Compound' ? 150 : 90;
            
            let reasoning = '';
            if (optimalRest !== defaultRest) {
                const key = `${exerciseName}_${category}`;
                const data = this.performanceData.get(key) || [];
                const recentSuccessRate = data.slice(-5).filter(d => d.successful).length / Math.min(data.length, 5);
                
                if (optimalRest > defaultRest) {
                    reasoning = `Extended to ${optimalRest}s based on ${data.length} sessions (${Math.round(recentSuccessRate * 100)}% recent success rate)`;
                } else {
                    reasoning = `Reduced to ${optimalRest}s - you consistently perform well with shorter rest`;
                }
            } else {
                reasoning = `Research-based ${category.toLowerCase()} rest period`;
            }
            
            return { restTime: optimalRest, reasoning };
        }
    },
    
    // Progressive overload system with real-world constraints
    progressionSystem: {
        // Available weight increments in most gyms
        weightIncrements: {
            barbell: [2.5, 5, 10, 25, 45], // Standard plates
            dumbbell: [2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50], // Common dumbbell weights
            machine: [5, 10, 15, 20, 25] // Machine weight stacks
        },
        
        // Calculate next workout recommendation
        calculateProgression(exerciseName, currentWeight, currentReps, currentSets, targetReps = null, equipment = 'barbell') {
            const weeklyProgressionRate = HyperTrack.state.settings.progressionRate / 100; // 3.5% default
            const increments = this.weightIncrements[equipment] || this.weightIncrements.barbell;
            
            // Find closest available weight increment
            const targetWeightIncrease = currentWeight * weeklyProgressionRate;
            const closestIncrement = increments.reduce((prev, curr) => 
                Math.abs(curr - targetWeightIncrease) < Math.abs(prev - targetWeightIncrease) ? curr : prev
            );
            
            // Calculate progression options
            const recommendations = [];
            
            // Option 1: Increase weight (if increment is reasonable)
            if (closestIncrement <= currentWeight * 0.15) { // Max 15% increase
                recommendations.push({
                    type: 'weight',
                    weight: currentWeight + closestIncrement,
                    reps: currentReps,
                    sets: currentSets,
                    reasoning: `Add ${closestIncrement}lbs - standard progression`,
                    difficulty: 'moderate'
                });
            }
            
            // Option 2: Increase reps (if current reps < 12)
            if (currentReps < 12) {
                recommendations.push({
                    type: 'reps',
                    weight: currentWeight,
                    reps: currentReps + 1,
                    sets: currentSets,
                    reasoning: `Add 1 rep - volume progression`,
                    difficulty: 'easy'
                });
            }
            
            // Option 3: Add set (if current sets < 4)
            if (currentSets < 4) {
                recommendations.push({
                    type: 'sets',
                    weight: currentWeight,
                    reps: currentReps,
                    sets: currentSets + 1,
                    reasoning: `Add 1 set - volume increase`,
                    difficulty: 'moderate'
                });
            }
            
            // Option 4: Micro-progression (smaller weight increase)
            const microIncrement = increments.find(inc => inc < targetWeightIncrease) || increments[0];
            if (microIncrement && microIncrement !== closestIncrement) {
                recommendations.push({
                    type: 'micro',
                    weight: currentWeight + microIncrement,
                    reps: currentReps,
                    sets: currentSets,
                    reasoning: `Conservative ${microIncrement}lbs increase`,
                    difficulty: 'easy'
                });
            }
            
            return recommendations.sort((a, b) => {
                const difficultyOrder = { 'easy': 1, 'moderate': 2, 'hard': 3 };
                return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            });
        },
        
        // Detect plateau and suggest interventions
        detectPlateau(exerciseHistory, exerciseName) {
            if (exerciseHistory.length < 6) return null;
            
            const recent = exerciseHistory.slice(-6);
            const weights = recent.map(h => h.weight);
            const reps = recent.map(h => h.totalReps);
            
            // Check if weight hasn't increased in 3+ sessions
            const weightStagnant = weights.slice(-3).every(w => w === weights[0]);
            
            // Check if total reps are declining
            const repsDecline = reps.slice(-2).every((r, i) => r <= reps[reps.length - 3 + i]);
            
            if (weightStagnant && repsDecline) {
                return {
                    type: 'plateau',
                    severity: 'moderate',
                    recommendation: this.getPlateauBreakingStrategy(exerciseName, weights[0]),
                    reasoning: `No weight progression in 3 sessions with declining reps`
                };
            }
            
            return null;
        },
        
        // Plateau breaking strategies
        getPlateauBreakingStrategy(exerciseName, currentWeight) {
            const strategies = [
                {
                    type: 'deload',
                    weight: Math.round(currentWeight * 0.85),
                    strategy: 'Reduce weight by 15% and focus on perfect form',
                    duration: '1-2 weeks'
                },
                {
                    type: 'tempo',
                    weight: Math.round(currentWeight * 0.9),
                    strategy: 'Slower eccentric (3-second negative)',
                    duration: '2-3 weeks'
                },
                {
                    type: 'volume',
                    weight: Math.round(currentWeight * 0.8),
                    strategy: 'Increase sets by 1-2 with reduced weight',
                    duration: '2-3 weeks'
                },
                {
                    type: 'substitution',
                    exercises: this.getExerciseSubstitutions(exerciseName),
                    strategy: 'Try exercise variations to break adaptation',
                    duration: '3-4 weeks'
                }
            ];
            
            return strategies[Math.floor(Math.random() * strategies.length)];
        },
        
        // Exercise substitution recommendations
        getExerciseSubstitutions(exerciseName) {
            const substitutions = {
                'Barbell Bench Press': ['Incline Dumbbell Press', 'Dumbbell Flyes', 'Push-ups'],
                'Squats': ['Bulgarian Split Squats', 'Goblet Squats', 'Leg Press'],
                'Deadlifts': ['Romanian Deadlifts', 'Trap Bar Deadlifts', 'Sumo Deadlifts'],
                'Pull-ups': ['Lat Pulldowns', 'Assisted Pull-ups', 'Negative Pull-ups'],
                'Barbell Rows': ['Dumbbell Rows', 'Cable Rows', 'T-Bar Rows']
            };
            
            return substitutions[exerciseName] || [`${exerciseName} variations`, 'Similar movement patterns'];
        }
    },
    
    // Machine Learning Baseline System for Future AI Development
    mlBaseline: {
        // Data collection for future ML model training
        performanceDataPoints: [],
        contextualFactors: new Map(),
        
        // Collect comprehensive data points for ML training
        collectDataPoint(exerciseName, performance, context = {}) {
            const dataPoint = {
                timestamp: new Date().toISOString(),
                exercise: exerciseName,
                performance: {
                    weight: performance.weight,
                    reps: performance.reps,
                    sets: performance.sets,
                    rpe: performance.rpe || null,
                    restTime: performance.restTime || null,
                    targetAchieved: performance.targetAchieved || false
                },
                context: {
                    timeOfDay: new Date().getHours(),
                    dayOfWeek: new Date().getDay(),
                    workoutDuration: context.workoutDuration || null,
                    previousRestQuality: context.sleepQuality || null,
                    nutritionStatus: context.nutritionStatus || null,
                    stressLevel: context.stressLevel || null,
                    energyLevel: context.energyLevel || null,
                    muscleGroupFatigue: context.muscleGroupFatigue || null,
                    consecutiveWorkoutDays: context.consecutiveWorkoutDays || 0
                },
                outcomes: {
                    nextSessionPerformance: null, // To be filled in next session
                    plateauRisk: this.calculateCurrentPlateauRisk(exerciseName),
                    progressionSuccess: null // To be determined over time
                }
            };
            
            this.performanceDataPoints.push(dataPoint);
            
            // Keep only last 1000 data points to manage memory
            if (this.performanceDataPoints.length > 1000) {
                this.performanceDataPoints.shift();
            }
            
            console.log(`🤖 ML Data Point Collected: ${exerciseName} - ${performance.weight}x${performance.reps}`);
        },
        
        // Calculate current plateau risk using basic pattern recognition
        calculateCurrentPlateauRisk(exerciseName) {
            const history = getExerciseHistory(exerciseName);
            if (history.length < 3) return 0;
            
            const recent = history.slice(-3);
            const weightProgression = recent[recent.length - 1].weight - recent[0].weight;
            const volumeProgression = recent[recent.length - 1].totalReps - recent[0].totalReps;
            
            // Simple risk scoring (0-1)
            let risk = 0;
            if (weightProgression <= 0) risk += 0.4;
            if (volumeProgression < 0) risk += 0.3;
            if (recent.every(r => r.weight === recent[0].weight)) risk += 0.3;
            
            return Math.min(risk, 1.0);
        },
        
        // Basic pattern recognition for plateau prediction
        predictPlateauRisk(exerciseName, lookaheadWeeks = 2) {
            const history = getExerciseHistory(exerciseName);
            if (history.length < 6) return { risk: 0, confidence: 0, recommendation: 'Need more data' };
            
            // Analyze velocity of progression
            const recent = history.slice(-6);
            const progressionVelocity = this.calculateProgressionVelocity(recent);
            const fatigueIndicators = this.detectFatiguePatterns(recent);
            const volumeOverreach = this.assessVolumeOverreach(exerciseName);
            
            // Combine indicators for risk assessment
            let risk = 0;
            let confidence = 0.3; // Base confidence
            
            // Velocity indicators
            if (progressionVelocity.weightVelocity < 0.5) {
                risk += 0.3;
                confidence += 0.2;
            }
            
            // Fatigue patterns
            if (fatigueIndicators.repsDecline > 0.1) {
                risk += 0.25;
                confidence += 0.15;
            }
            
            // Volume overreach
            if (volumeOverreach > 1.5) {
                risk += 0.2;
                confidence += 0.1;
            }
            
            // Historical plateau patterns
            const plateauHistory = this.detectHistoricalPlateaus(exerciseName);
            if (plateauHistory.frequency > 0.2) {
                risk += 0.25;
                confidence += 0.2;
            }
            
            risk = Math.min(risk, 1.0);
            confidence = Math.min(confidence, 1.0);
            
            let recommendation = 'Continue current programming';
            if (risk > 0.7) recommendation = 'Consider deload or exercise variation';
            else if (risk > 0.4) recommendation = 'Monitor closely, prepare deload';
            
            return { 
                risk: Math.round(risk * 100) / 100, 
                confidence: Math.round(confidence * 100) / 100,
                recommendation,
                lookaheadWeeks
            };
        },
        
        // Calculate progression velocity
        calculateProgressionVelocity(exerciseHistory) {
            if (exerciseHistory.length < 3) return { weightVelocity: 0, volumeVelocity: 0 };
            
            const weights = exerciseHistory.map(h => h.weight);
            const volumes = exerciseHistory.map(h => h.totalReps * h.weight);
            
            const weightChanges = [];
            const volumeChanges = [];
            
            for (let i = 1; i < weights.length; i++) {
                weightChanges.push((weights[i] - weights[i-1]) / weights[i-1]);
                volumeChanges.push((volumes[i] - volumes[i-1]) / volumes[i-1]);
            }
            
            const avgWeightVelocity = weightChanges.reduce((sum, change) => sum + change, 0) / weightChanges.length;
            const avgVolumeVelocity = volumeChanges.reduce((sum, change) => sum + change, 0) / volumeChanges.length;
            
            return {
                weightVelocity: avgWeightVelocity,
                volumeVelocity: avgVolumeVelocity
            };
        },
        
        // Detect fatigue patterns
        detectFatiguePatterns(exerciseHistory) {
            if (exerciseHistory.length < 4) return { repsDecline: 0, volumeDecline: 0 };
            
            const firstHalf = exerciseHistory.slice(0, Math.floor(exerciseHistory.length / 2));
            const secondHalf = exerciseHistory.slice(Math.floor(exerciseHistory.length / 2));
            
            const firstHalfAvgReps = firstHalf.reduce((sum, h) => sum + h.totalReps, 0) / firstHalf.length;
            const secondHalfAvgReps = secondHalf.reduce((sum, h) => sum + h.totalReps, 0) / secondHalf.length;
            
            const repsDecline = (firstHalfAvgReps - secondHalfAvgReps) / firstHalfAvgReps;
            
            return {
                repsDecline: Math.max(0, repsDecline),
                volumeDecline: 0 // Placeholder for future implementation
            };
        },
        
        // Assess volume overreach
        assessVolumeOverreach(exerciseName) {
            const muscleGroupHistory = this.getMuscleGroupVolumeHistory(exerciseName);
            if (muscleGroupHistory.length < 4) return 0;
            
            const recentAvg = muscleGroupHistory.slice(-2).reduce((sum, v) => sum + v, 0) / 2;
            const historicalAvg = muscleGroupHistory.slice(0, -2).reduce((sum, v) => sum + v, 0) / (muscleGroupHistory.length - 2);
            
            return historicalAvg > 0 ? recentAvg / historicalAvg : 0;
        },
        
        // Get muscle group volume history
        getMuscleGroupVolumeHistory(exerciseName) {
            // Simplified implementation - would be enhanced with more sophisticated tracking
            const history = getExerciseHistory(exerciseName);
            return history.map(h => h.totalReps * h.weight);
        },
        
        // Detect historical plateau patterns
        detectHistoricalPlateaus(exerciseName) {
            const history = getExerciseHistory(exerciseName);
            if (history.length < 8) return { frequency: 0, averageDuration: 0 };
            
            let plateauCount = 0;
            let currentPlateauLength = 0;
            let plateauLengths = [];
            
            for (let i = 1; i < history.length; i++) {
                if (history[i].weight === history[i-1].weight) {
                    currentPlateauLength++;
                } else {
                    if (currentPlateauLength >= 2) {
                        plateauCount++;
                        plateauLengths.push(currentPlateauLength);
                    }
                    currentPlateauLength = 0;
                }
            }
            
            const frequency = plateauCount / (history.length / 3); // Plateaus per 3-session window
            const averageDuration = plateauLengths.length > 0 ? 
                plateauLengths.reduce((sum, len) => sum + len, 0) / plateauLengths.length : 0;
            
            return { frequency, averageDuration };
        },
        
        // Generate intelligent recommendations based on collected data
        generateIntelligentRecommendations(exerciseName) {
            const plateauPrediction = this.predictPlateauRisk(exerciseName);
            const dataPoints = this.performanceDataPoints.filter(dp => dp.exercise === exerciseName);
            
            if (dataPoints.length < 5) {
                return {
                    type: 'insufficient_data',
                    message: 'Continue tracking to enable AI recommendations',
                    confidence: 0
                };
            }
            
            // Analyze patterns in successful vs unsuccessful sessions
            const successfulSessions = dataPoints.filter(dp => dp.performance.targetAchieved);
            const unsuccessfulSessions = dataPoints.filter(dp => !dp.performance.targetAchieved);
            
            const recommendations = [];
            
            // Time of day optimization
            if (successfulSessions.length >= 3) {
                const bestTimes = this.findOptimalTimeOfDay(successfulSessions);
                if (bestTimes.confidence > 0.6) {
                    recommendations.push({
                        type: 'timing',
                        message: `You perform best training ${exerciseName} ${bestTimes.period}`,
                        confidence: bestTimes.confidence
                    });
                }
            }
            
            // Rest time optimization
            const optimalRest = this.findOptimalRestTime(successfulSessions);
            if (optimalRest.confidence > 0.5) {
                recommendations.push({
                    type: 'rest',
                    message: `Optimal rest time for ${exerciseName}: ${optimalRest.time}s`,
                    confidence: optimalRest.confidence
                });
            }
            
            // Volume recommendations
            if (plateauPrediction.risk > 0.6) {
                recommendations.push({
                    type: 'volume',
                    message: `Consider reducing volume for ${exerciseName} - plateau risk ${Math.round(plateauPrediction.risk * 100)}%`,
                    confidence: plateauPrediction.confidence
                });
            }
            
            return {
                type: 'recommendations',
                predictions: plateauPrediction,
                recommendations: recommendations.sort((a, b) => b.confidence - a.confidence)
            };
        },
        
        // Find optimal time of day
        findOptimalTimeOfDay(successfulSessions) {
            const timeGroups = {
                'morning': successfulSessions.filter(s => s.context.timeOfDay >= 6 && s.context.timeOfDay < 12).length,
                'afternoon': successfulSessions.filter(s => s.context.timeOfDay >= 12 && s.context.timeOfDay < 18).length,
                'evening': successfulSessions.filter(s => s.context.timeOfDay >= 18 && s.context.timeOfDay < 24).length
            };
            
            const bestPeriod = Object.entries(timeGroups).reduce((best, [period, count]) => 
                count > best.count ? { period, count } : best
            , { period: 'morning', count: 0 });
            
            const confidence = bestPeriod.count / successfulSessions.length;
            
            return { period: bestPeriod.period, confidence };
        },
        
        // Find optimal rest time
        findOptimalRestTime(successfulSessions) {
            const restTimes = successfulSessions
                .filter(s => s.performance.restTime)
                .map(s => s.performance.restTime);
            
            if (restTimes.length < 3) return { time: 120, confidence: 0 };
            
            const average = restTimes.reduce((sum, time) => sum + time, 0) / restTimes.length;
            const variance = restTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / restTimes.length;
            const confidence = 1 / (1 + variance / 100); // Lower variance = higher confidence
            
            return { time: Math.round(average), confidence };
        }
    },
    
    // Exercise database with research-backed data (fallback)
    exerciseDatabase: [
        // Chest exercises
        { 
            id: 1, name: "Barbell Bench Press", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 95, equipment: ["barbell", "bench"],
            description: "The gold standard for chest development with highest pectoralis major activation."
        },
        { 
            id: 2, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["dumbbells", "incline_bench"],
            description: "Superior upper chest activation compared to flat pressing movements."
        },
        { 
            id: 3, name: "Dips", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 85, equipment: ["dip_station"],
            description: "Excellent compound movement for chest, triceps, and anterior deltoids."
        },
        
        // Back exercises
        { 
            id: 5, name: "Pull-ups", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 117, equipment: ["pull_up_bar"],
            description: "Highest latissimus dorsi activation among all pulling exercises."
        },
        { 
            id: 6, name: "Barbell Rows", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 93, equipment: ["barbell"],
            description: "Excellent for building back thickness and overall pulling strength."
        },
        { 
            id: 7, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["lat_pulldown_machine"],
            description: "Machine alternative to pull-ups with adjustable resistance."
        },
        { 
            id: 8, name: "Cable Rows", muscle_group: "Back", category: "Compound", 
            tier: 2, mvc_percentage: 85, equipment: ["cable_machine"],
            description: "Excellent for mid-trap and rhomboid development."
        },
        
        // Leg exercises
        { 
            id: 10, name: "Squats", muscle_group: "Legs", category: "Compound", 
            tier: 1, mvc_percentage: 100, equipment: ["barbell", "squat_rack"],
            description: "The king of all exercises for overall lower body development."
        },
        { 
            id: 11, name: "Deadlifts", muscle_group: "Legs", category: "Compound", 
            tier: 1, mvc_percentage: 110, equipment: ["barbell"],
            description: "Supreme posterior chain exercise for hamstrings, glutes, and lower back."
        },
        { 
            id: 12, name: "Romanian Deadlifts", muscle_group: "Legs", category: "Compound", 
            tier: 1, mvc_percentage: 95, equipment: ["barbell"],
            description: "Superior hamstring and glute development with hip hinge pattern."
        },
        { 
            id: 13, name: "Bulgarian Split Squats", muscle_group: "Legs", category: "Compound", 
            tier: 2, mvc_percentage: 88, equipment: ["dumbbells", "bench"],
            description: "Unilateral leg exercise for balance and single-leg strength."
        },
        { 
            id: 14, name: "Walking Lunges", muscle_group: "Legs", category: "Compound", 
            tier: 2, mvc_percentage: 82, equipment: ["dumbbells"],
            description: "Dynamic movement for functional leg strength and stability."
        },
        { 
            id: 15, name: "Leg Press", muscle_group: "Legs", category: "Compound", 
            tier: 2, mvc_percentage: 90, equipment: ["leg_press_machine"],
            description: "Machine-based quad development with heavy loading potential."
        },
        
        // Shoulder exercises
        { 
            id: 20, name: "Overhead Press", muscle_group: "Shoulders", category: "Compound", 
            tier: 1, mvc_percentage: 92, equipment: ["barbell"],
            description: "Primary shoulder development with core stability requirements."
        },
        { 
            id: 21, name: "Dumbbell Shoulder Press", muscle_group: "Shoulders", category: "Compound", 
            tier: 1, mvc_percentage: 88, equipment: ["dumbbells"],
            description: "Unilateral shoulder development with stabilizer activation."
        },
        { 
            id: 22, name: "Lateral Raises", muscle_group: "Shoulders", category: "Isolation", 
            tier: 1, mvc_percentage: 95, equipment: ["dumbbells"],
            description: "Highest medial deltoid activation for shoulder width."
        },
        { 
            id: 23, name: "Rear Delt Flyes", muscle_group: "Shoulders", category: "Isolation", 
            tier: 1, mvc_percentage: 88, equipment: ["dumbbells"],
            description: "Essential for posterior deltoid development and shoulder health."
        },
        { 
            id: 24, name: "Face Pulls", muscle_group: "Shoulders", category: "Isolation", 
            tier: 1, mvc_percentage: 85, equipment: ["cable_machine"],
            description: "Superior rear deltoid and external rotator activation."
        },
        
        // Arm exercises
        { 
            id: 30, name: "Barbell Curls", muscle_group: "Arms", category: "Isolation", 
            tier: 1, mvc_percentage: 90, equipment: ["barbell"],
            description: "Classic bicep development with maximum loading potential."
        },
        { 
            id: 31, name: "Hammer Curls", muscle_group: "Arms", category: "Isolation", 
            tier: 1, mvc_percentage: 85, equipment: ["dumbbells"],
            description: "Targets brachialis for arm thickness and forearm development."
        },
        { 
            id: 32, name: "Tricep Dips", muscle_group: "Arms", category: "Compound", 
            tier: 1, mvc_percentage: 88, equipment: ["dip_station"],
            description: "Bodyweight tricep exercise with progressive overload options."
        },
        { 
            id: 33, name: "Close-Grip Bench Press", muscle_group: "Arms", category: "Compound", 
            tier: 1, mvc_percentage: 92, equipment: ["barbell", "bench"],
            description: "Heavy tricep development with compound movement benefits."
        },
        { 
            id: 34, name: "Overhead Tricep Extension", muscle_group: "Arms", category: "Isolation", 
            tier: 2, mvc_percentage: 78, equipment: ["dumbbells"],
            description: "Long head tricep focus for overall arm mass."
        },
        { 
            id: 35, name: "Preacher Curls", muscle_group: "Arms", category: "Isolation", 
            tier: 2, mvc_percentage: 82, equipment: ["preacher_bench", "barbell"],
            description: "Isolated bicep development with controlled range of motion."
        },
        
        // Additional compound movements
        { 
            id: 40, name: "Pull-ups (Weighted)", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 125, equipment: ["pull_up_bar", "weight_belt"],
            description: "Advanced pull-up variation for maximum lat development."
        },
        { 
            id: 41, name: "Push-ups", muscle_group: "Chest", category: "Compound", 
            tier: 2, mvc_percentage: 75, equipment: ["bodyweight"],
            description: "Bodyweight chest exercise with numerous progression options."
        },
        { 
            id: 42, name: "Farmer's Walk", muscle_group: "Full Body", category: "Compound", 
            tier: 2, mvc_percentage: 80, equipment: ["dumbbells"],
            description: "Full-body strength and conditioning with grip emphasis."
        }
    ]
};

// ==========================================
// REST TIMER FUNCTIONS
// ==========================================
function startRestTimer(exerciseCategory, exerciseName) {
    // Get intelligent rest recommendation based on performance history
    const recommendation = HyperTrack.restTimerLearning.getRestRecommendation(exerciseName, exerciseCategory);
    const duration = recommendation.restTime;
    
    // Clear any existing timer
    if (HyperTrack.state.restTimer.interval) {
        clearInterval(HyperTrack.state.restTimer.interval);
    }
    
    // Create full-screen rest timer overlay
    const timerOverlay = document.createElement('div');
    timerOverlay.id = 'restTimerOverlay';
    timerOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    timerOverlay.innerHTML = `
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; text-align: center; max-width: 400px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--primary);">
            <h2 style="color: var(--primary-light); margin-bottom: 8px; font-size: 28px;">Rest Period</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 18px;">${exerciseName} - Set Complete!</p>
            <div id="restTimerDisplay" style="font-size: 72px; font-weight: 800; color: var(--text-primary); margin-bottom: 24px; font-family: 'JetBrains Mono', monospace;">
                ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}
            </div>
            <div style="margin-bottom: 32px;">
                <p style="color: var(--text-muted); font-size: 14px; line-height: 1.5;">
                    🧠 ${recommendation.reasoning}
                </p>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="skipRest()" style="padding: 12px 24px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius); font-weight: 600; cursor: pointer;">Skip Rest</button>
                <button onclick="addRestTime(30)" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer;">+30s</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(timerOverlay);
    
    // Start countdown
    HyperTrack.state.restTimer.remaining = duration;
    HyperTrack.state.restTimer.active = true;
    HyperTrack.state.restTimer.exerciseJustCompleted = exerciseName;
    HyperTrack.state.restTimer.startTime = Date.now();
    
    HyperTrack.state.restTimer.interval = setInterval(() => {
        HyperTrack.state.restTimer.remaining--;
        updateRestTimerDisplay();
        
        if (HyperTrack.state.restTimer.remaining <= 0) {
            completeRestTimer();
        }
    }, 1000);
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function updateRestTimerDisplay() {
    const display = document.getElementById('restTimerDisplay');
    if (display) {
        const minutes = Math.floor(HyperTrack.state.restTimer.remaining / 60);
        const seconds = HyperTrack.state.restTimer.remaining % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function completeRestTimer() {
    const exerciseName = HyperTrack.state.restTimer.exerciseJustCompleted;
    const restDuration = HyperTrack.state.restTimer.startTime ? 
        Date.now() - HyperTrack.state.restTimer.startTime : null;
    
    // Record rest timer performance for learning
    if (exerciseName && restDuration) {
        HyperTrack.restTimerLearning.recordPerformanceOutcome(
            exerciseName,
            'Compound', // Will be enhanced to get actual category
            restDuration / 1000, // Convert to seconds
            0, // targetWeight - to be filled when we have context
            0, // targetReps - to be filled when we have context
            0  // actualReps - to be filled after next set
        );
    }
    
    clearInterval(HyperTrack.state.restTimer.interval);
    HyperTrack.state.restTimer.active = false;
    HyperTrack.state.restTimer.startTime = null;
    
    // Remove overlay
    const overlay = document.getElementById('restTimerOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Send notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest Complete!', {
            body: 'Time for your next set',
            icon: '/icon-192.png',
            vibrate: [200, 100, 200]
        });
    }
    
    // Play sound if available
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77OefTRAMUKfj8LZjHAY4kdfyy3gsBSR3x/DdkEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N+QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaiTcJGWm97eacTBAMUajj8LZiGwY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChReuuPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8sp4LAUkd8fw3pBAChRetOPrqVUUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97emcTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bCAFKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4ktfyy3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGn4/C1YhwGOJLX8st4LAUkd8fw3pBAChRetOPrqVQUCkaf4PK+bB8FKoDN8tqKNwkZab3t5pxMEAxRqOPwtWIcBjiS1/LLeCwFJHfH8N6QQAoUXrTj66lUFApGn+DyvmwgBSqAzfLaizcJGWm97eacTBAMUajj8LViHAY4kdfyz3gsBSR3x/DekEAKFF604+upVBQKRp/g8r5sIAUqgM3y2oo3CRlpve3mnEwQDFGo4/C1YhwGOJLX8st4LAUkd8fw3g==');
        audio.play();
    } catch (e) {
        console.log('Audio notification not available');
    }
    
    showNotification('Rest period complete! Ready for your next set.', 'success');
}

function skipRest() {
    completeRestTimer();
}

function addRestTime(seconds) {
    HyperTrack.state.restTimer.remaining += seconds;
    updateRestTimerDisplay();
}

// ==========================================
// WEIGHT RECOMMENDATION FUNCTIONS
// ==========================================
async function getIntelligentWeightRecommendation(exerciseName) {
    try {
        // Check cache first
        const cached = HyperTrack.state.recommendations.cache.get(exerciseName);
        if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 minute cache
            return cached.data;
        }
        
        // Fetch recommendation from API
        const response = await authManager.authenticatedFetch(`/api/recommendations?exerciseName=${encodeURIComponent(exerciseName)}&userId=${authManager.user.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recommendation');
        }
        
        const data = await response.json();
        
        // Cache the recommendation
        HyperTrack.state.recommendations.cache.set(exerciseName, {
            data: data.recommendation,
            timestamp: Date.now()
        });
        
        return data.recommendation;
        
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        return getFallbackRecommendation(exerciseName);
    }
}

function getFallbackRecommendation(exerciseName) {
    // Get exercise history from local data
    const exerciseHistory = getLocalExerciseHistory(exerciseName);
    
    if (exerciseHistory.length === 0) {
        return getDefaultRecommendation(exerciseName);
    }
    
    // Calculate recommendation based on last performance
    const lastWorkout = exerciseHistory[0];
    const bestSet = getBestSet(lastWorkout.sets);
    
    // Apply 3.5% weekly progression
    const daysSinceLastWorkout = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
    const weeklyProgressionRate = HyperTrack.state.settings.progressionRate / 100;
    const sessionIncrease = Math.pow(1 + weeklyProgressionRate, daysSinceLastWorkout / 7);
    
    // Round to practical increments (2.5 lbs)
    const targetWeight = Math.ceil(bestSet.weight * sessionIncrease / 2.5) * 2.5;
    
    return {
        weight: targetWeight,
        reps: bestSet.reps,
        sets: 3,
        restTime: lastWorkout.category === 'Compound' ? 150 : 90,
        progression: `${((targetWeight / bestSet.weight - 1) * 100).toFixed(1)}% increase`,
        rationale: `Based on ${weeklyProgressionRate * 100}% weekly progression`
    };
}

function getLocalExerciseHistory(exerciseName) {
    const history = [];
    
    HyperTrack.state.workouts.forEach(workout => {
        const exercises = workout.exercises || workout.workout_exercises || [];
        exercises.forEach(exercise => {
            if (exercise.name === exerciseName) {
                history.push({
                    date: workout.date || workout.workout_date,
                    sets: exercise.sets,
                    category: exercise.category
                });
            }
        });
    });
    
    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return history;
}

function getBestSet(sets) {
    return sets.reduce((best, set) => {
        const volume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return volume > bestVolume ? set : best;
    }, sets[0]);
}

function getDefaultRecommendation(exerciseName) {
    const defaults = {
        // Compound exercises - heavier weights, fewer reps
        'Barbell Bench Press': { weight: 135, reps: 8, sets: 4, restTime: 150 },
        'Squats': { weight: 185, reps: 8, sets: 4, restTime: 180 },
        'Deadlifts': { weight: 225, reps: 5, sets: 3, restTime: 180 },
        'Pull-ups': { weight: 0, reps: 8, sets: 3, restTime: 150 },
        'Barbell Rows': { weight: 115, reps: 10, sets: 4, restTime: 150 },
        'Overhead Press': { weight: 85, reps: 8, sets: 3, restTime: 150 },
        'Dips': { weight: 0, reps: 10, sets: 3, restTime: 150 },
        
        // Isolation exercises - lighter weights, higher reps
        'Barbell Curls': { weight: 65, reps: 12, sets: 3, restTime: 90 },
        'Lateral Raises': { weight: 20, reps: 15, sets: 3, restTime: 60 },
        'Leg Curls': { weight: 90, reps: 12, sets: 3, restTime: 90 },
        'Cable Flyes': { weight: 40, reps: 12, sets: 3, restTime: 90 }
    };
    
    return defaults[exerciseName] || { weight: 45, reps: 10, sets: 3, restTime: 90 };
}

// Display recommendation in exercise modal
async function displayWeightRecommendation(exerciseName) {
    const recommendation = await getIntelligentWeightRecommendation(exerciseName);
    
    const recommendationDiv = document.createElement('div');
    recommendationDiv.id = 'weightRecommendation';
    recommendationDiv.style.cssText = `
        background: linear-gradient(135deg, var(--primary-dark), var(--primary));
        color: white;
        padding: 16px;
        border-radius: var(--radius);
        margin-bottom: 20px;
        text-align: center;
    `;
    
    recommendationDiv.innerHTML = `
        <h4 style="margin-bottom: 8px; font-size: 16px;">Recommended Weight</h4>
        <div style="font-size: 32px; font-weight: 800; margin-bottom: 8px;">${recommendation.weight} lbs</div>
        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${recommendation.reps} reps × ${recommendation.sets} sets</p>
        <p style="font-size: 12px; opacity: 0.8;">${recommendation.rationale || 'Based on your training history'}</p>
    `;
    
    const modalBody = document.querySelector('.modal-body');
    if (modalBody && !document.getElementById('weightRecommendation')) {
        modalBody.insertBefore(recommendationDiv, modalBody.firstChild);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================
// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    
    // Load Tyler's historical data first
    HyperTrack.loadHistoricalData();
    
    loadAppData();
    updateUI();
    startResearchFactRotation();
    setupEventListeners();
    
    // Load workouts from both API and localStorage
    loadWorkoutsFromAPI();
    loadWorkoutsFromLocalStorage();
    
    console.log('✅ Single-user mode active - ready to track workouts');
});

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================
function loadAppData() {
    try {
        const savedData = localStorage.getItem('hypertrackData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            HyperTrack.state.workouts = parsed.workouts || [];
            HyperTrack.state.settings = { ...HyperTrack.state.settings, ...parsed.settings };
            HyperTrack.state.user = { ...HyperTrack.state.user, ...parsed.user };
        }
        
        loadExercisesFromAPI();
        
        console.log('✅ App data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading app data:', error);
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

async function loadExercisesFromAPI() {
    try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
            const data = await response.json();
            HyperTrack.state.exercises = data.exercises || HyperTrack.exerciseDatabase;
            console.log(`✅ Loaded ${data.exercises?.length || 0} exercises from API`);
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load exercises from API, using local database:', error.message);
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

async function loadWorkoutsFromAPI() {
    try {
        const response = await authManager.authenticatedFetch('/api/workouts');
        if (response.ok) {
            const data = await response.json();
            // Merge API workouts with historical data
            const apiWorkouts = data.workouts || [];
            const existingIds = HyperTrack.state.workouts.map(w => w.id);
            const newApiWorkouts = apiWorkouts.filter(w => !existingIds.includes(w.id));
            HyperTrack.state.workouts = [...HyperTrack.state.workouts, ...newApiWorkouts];
            
            console.log(`✅ Loaded ${newApiWorkouts.length} workouts from API`);
            updateHistoryTab();
            updateAnalyticsTab();
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load workouts from API:', error.message);
        console.log('📱 Loading from localStorage as fallback...');
        loadWorkoutsFromLocalStorage();
    }
}

function loadWorkoutsFromLocalStorage() {
    try {
        const localWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        if (localWorkouts.length > 0) {
            const existingIds = HyperTrack.state.workouts.map(w => w.id);
            const newLocalWorkouts = localWorkouts.filter(w => !existingIds.includes(w.id));
            HyperTrack.state.workouts = [...HyperTrack.state.workouts, ...newLocalWorkouts];
            
            console.log(`✅ Loaded ${newLocalWorkouts.length} workouts from localStorage`);
            updateHistoryTab();
            updateAnalyticsTab();
            
            if (newLocalWorkouts.length > 0) {
                showNotification(`Loaded ${newLocalWorkouts.length} locally saved workouts`, 'info');
            }
        }
    } catch (error) {
        console.error('❌ Failed to load from localStorage:', error);
    }
}

function saveAppData() {
    try {
        const dataToSave = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            version: '2.0.0',
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hypertrackData', JSON.stringify(dataToSave));
        console.log('💾 App data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving app data:', error);
    }
}

async function saveWorkoutToAPI(workout) {
    try {
        const formattedWorkout = {
            workout_date: workout.date,
            start_time: workout.startTime || new Date().toISOString(),
            end_time: workout.endTime || new Date().toISOString(),
            notes: workout.notes || null,
            exercises: workout.exercises.map((exercise) => ({
                id: exercise.id,
                name: exercise.name,
                muscle_group: exercise.muscle_group || exercise.muscleGroup,
                category: exercise.category,
                sets: exercise.sets.map((set) => ({
                    weight: parseFloat(set.weight),
                    reps: parseInt(set.reps),
                    rpe: set.rpe ? parseInt(set.rpe) : null,
                    tempo: set.tempo || null,
                    rest_time_actual: set.restTime ? parseInt(set.restTime) : null,
                    notes: set.notes || null
                }))
            }))
        };
        
        console.log('💾 Attempting to save workout to API...', {
            date: formattedWorkout.workout_date,
            exercises: formattedWorkout.exercises.length,
            auth: !!authManager.session.access_token
        });
        
        const response = await authManager.authenticatedFetch('/api/workouts', {
            method: 'POST',
            body: JSON.stringify(formattedWorkout)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Workout saved to API:', data.message);
            showNotification('Workout saved to database!', 'success');
            return data.workout;
        } else {
            const errorData = await response.text();
            console.error('❌ API Error Response:', response.status, errorData);
            throw new Error(`API returned ${response.status}: ${errorData}`);
        }
    } catch (error) {
        console.error('❌ Failed to save workout to API:', error.message);
        console.log('📱 Falling back to localStorage...');
        
        // Enhanced localStorage fallback
        try {
            const localWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
            const workoutWithId = {
                ...workout,
                id: workout.id || `local-${Date.now()}`,
                saved_locally: true,
                created_at: new Date().toISOString()
            };
            localWorkouts.push(workoutWithId);
            localStorage.setItem('hypertrack_workouts', JSON.stringify(localWorkouts));
            
            console.log('✅ Workout saved to localStorage as fallback');
            showNotification('Workout saved locally (database offline)', 'warning');
            return workoutWithId;
        } catch (localError) {
            console.error('❌ Failed to save to localStorage:', localError);
            showNotification('Failed to save workout data', 'error');
            throw new Error('Both API and localStorage save failed');
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================
function updateUI() {
    updateWorkoutTab();
    updateHistoryTab();
    updateAnalyticsTab();
    updateSettingsTab();
    updateResearchBanner();
}

function updateWorkoutTab() {
    if (HyperTrack.state.currentWorkout) {
        showCurrentWorkout();
    } else {
        showStartWorkout();
    }
}

function showStartWorkout() {
    document.getElementById('startWorkout').style.display = 'block';
    document.getElementById('currentWorkout').style.display = 'none';
    document.getElementById('exerciseSelection').style.display = 'none';
    document.getElementById('fabIcon').textContent = '+';
}

function showCurrentWorkout() {
    document.getElementById('startWorkout').style.display = 'none';
    document.getElementById('currentWorkout').style.display = 'block';
    document.getElementById('exerciseSelection').style.display = 'block';
    document.getElementById('fabIcon').textContent = '✓';
    
    updateCurrentWorkoutDisplay();
    updateExerciseList();
}

function updateCurrentWorkoutDisplay() {
    const currentExercises = document.getElementById('currentExercises');
    const workout = HyperTrack.state.currentWorkout;
    
    if (!currentExercises) return;
    
    if (workout.exercises.length === 0) {
        currentExercises.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No exercises added yet. Select an exercise below to begin.</p>';
        return;
    }
    
    let html = '';
    workout.exercises.forEach((exercise, index) => {
        html += `
            <div class="current-exercise">
                <div class="current-exercise-name">${exercise.name}</div>
                <div class="current-sets">
                    ${exercise.sets.map((set, setIndex) => 
                        `<span class="set-indicator">${set.weight}lbs × ${set.reps}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    currentExercises.innerHTML = html;
    
    if (workout.startTime) {
        updateWorkoutTimer();
    }
}

function updateWorkoutTimer() {
    const timerElement = document.getElementById('workoutTime');
    if (!timerElement) return;
    
    const startTime = new Date(HyperTrack.state.currentWorkout.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    const searchInput = document.getElementById('exerciseSearch');
    const activeMuscleBtn = document.querySelector('.muscle-btn.active');
    
    if (!exerciseList || !searchInput || !activeMuscleBtn) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const activeMuscle = activeMuscleBtn.textContent;
    
    let filteredExercises = HyperTrack.state.exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) ||
                             (exercise.muscle_group || exercise.muscleGroup || '').toLowerCase().includes(searchTerm);
        
        let matchesMuscle = false;
        const muscleGroup = exercise.muscle_group || exercise.muscleGroup;
        
        if (activeMuscle === 'All') {
            matchesMuscle = true;
        } else if (activeMuscle === 'Arms') {
            matchesMuscle = muscleGroup === 'Biceps' || muscleGroup === 'Triceps';
        } else {
            matchesMuscle = muscleGroup === activeMuscle;
        }
        
        return matchesSearch && matchesMuscle;
    });
    
    // Sort by tier then by MVC
    filteredExercises.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return (b.mvc_percentage || b.mvc || 0) - (a.mvc_percentage || a.mvc || 0);
    });
    
    let html = '';
    filteredExercises.forEach(exercise => {
        const muscleGroup = exercise.muscle_group || exercise.muscleGroup || 'Unknown';
        const mvc = exercise.mvc_percentage || exercise.mvc || 0;
        
        html += `
            <div class="exercise-item" onclick="selectExercise(${exercise.id})">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-meta">
                    <span class="exercise-muscle">${muscleGroup}</span>
                    <span class="exercise-category">${exercise.category}</span>
                    <span class="exercise-tier">Tier ${exercise.tier}</span>
                    <span class="exercise-mvc">${mvc}% MVC</span>
                </div>
            </div>
        `;
    });
    
    exerciseList.innerHTML = html || '<p style="color: var(--text-muted); text-align: center;">No exercises found</p>';
}

function updateHistoryTab() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (HyperTrack.state.workouts.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No Workouts Yet</h3>
                <p>Complete your first workout to see your training history and progress over time.</p>
            </div>
        `;
        return;
    }
    
    const sortedWorkouts = [...HyperTrack.state.workouts].sort((a, b) => 
        new Date(b.workout_date || b.date) - new Date(a.workout_date || a.date)
    );
    
    let html = '';
    sortedWorkouts.forEach(workout => {
        const workoutExercises = workout.workout_exercises || workout.exercises || [];
        const duration = workout.duration ? Math.floor(workout.duration / 1000 / 60) : 90;
        const totalSets = workoutExercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
        const totalVolume = workoutExercises.reduce((sum, ex) => 
            sum + (ex.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0
        );
        
        html += `
            <div class="history-item">
                <div class="history-date">${formatDate(workout.workout_date || workout.date)}</div>
                <div class="history-meta">
                    <span>${workoutExercises.length} exercises</span>
                    <span>${totalSets} sets</span>
                    <span>${duration} minutes</span>
                    <span>${totalVolume.toLocaleString()} lbs volume</span>
                </div>
                <div class="history-exercises">
                    ${workoutExercises.map(ex => ex.name || (ex.exercises?.name)).join(', ')}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function updateAnalyticsTab() {
    const analytics = calculateAdvancedAnalytics();
    
    // Update basic stats
    const elements = {
        totalWorkouts: document.getElementById('totalWorkouts'),
        totalSets: document.getElementById('totalSets'),
        totalVolume: document.getElementById('totalVolume'),
        avgDuration: document.getElementById('avgDuration')
    };
    
    if (elements.totalWorkouts) elements.totalWorkouts.textContent = analytics.basic.totalWorkouts;
    if (elements.totalSets) elements.totalSets.textContent = analytics.basic.totalSets;
    if (elements.totalVolume) elements.totalVolume.textContent = analytics.basic.totalVolume.toLocaleString();
    if (elements.avgDuration) elements.avgDuration.textContent = analytics.basic.avgDuration;
    
    // Create advanced analytics display
    createAdvancedAnalyticsDisplay(analytics);
}

function calculateAdvancedAnalytics() {
    const workouts = HyperTrack.state.workouts;
    
    // Basic metrics
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, w) => {
        const exercises = w.workout_exercises || w.exercises || [];
        return sum + exercises.reduce((s, e) => s + (e.sets?.length || 0), 0);
    }, 0);
    const totalVolume = workouts.reduce((sum, w) => {
        const exercises = w.workout_exercises || w.exercises || [];
        return sum + exercises.reduce((s, e) => 
            s + (e.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0
        );
    }, 0);
    const avgDuration = totalWorkouts > 0 ? 
        Math.floor(workouts.reduce((sum, w) => 
            sum + (w.duration ? w.duration / 1000 / 60 : 90), 0
        ) / totalWorkouts) : 0;
    
    // Advanced metrics
    const muscleGroupStats = calculateMuscleGroupStats(workouts);
    const exerciseProgression = calculateExerciseProgression(workouts);
    const volumeTrends = calculateVolumeTrends(workouts);
    const frequencyAnalysis = calculateFrequencyAnalysis(workouts);
    const strengthStandards = calculateStrengthStandards(workouts);
    const plateauRisk = calculatePlateauRisk(workouts);
    
    return {
        basic: { totalWorkouts, totalSets, totalVolume, avgDuration },
        muscleGroups: muscleGroupStats,
        progression: exerciseProgression,
        trends: volumeTrends,
        frequency: frequencyAnalysis,
        strength: strengthStandards,
        plateaus: plateauRisk
    };
}

function calculateMuscleGroupStats(workouts) {
    const stats = {};
    
    workouts.forEach(workout => {
        const exercises = workout.workout_exercises || workout.exercises || [];
        exercises.forEach(exercise => {
            const muscleGroup = exercise.muscle_group || 'Other';
            if (!stats[muscleGroup]) {
                stats[muscleGroup] = { 
                    sets: 0, 
                    volume: 0, 
                    frequency: 0,
                    lastTrained: null,
                    weeklyVolume: 0
                };
            }
            
            stats[muscleGroup].sets += exercise.sets?.length || 0;
            stats[muscleGroup].volume += exercise.sets?.reduce((sum, set) => 
                sum + (set.weight * set.reps), 0) || 0;
            
            // Track frequency (unique workout dates)
            const workoutDate = workout.date || workout.workout_date;
            if (workoutDate) {
                if (!stats[muscleGroup].lastTrained || new Date(workoutDate) > new Date(stats[muscleGroup].lastTrained)) {
                    stats[muscleGroup].lastTrained = workoutDate;
                }
            }
        });
    });
    
    // Calculate weekly volumes (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    workouts.filter(w => new Date(w.date || w.workout_date) >= oneWeekAgo).forEach(workout => {
        const exercises = workout.workout_exercises || workout.exercises || [];
        exercises.forEach(exercise => {
            const muscleGroup = exercise.muscle_group || 'Other';
            if (stats[muscleGroup]) {
                stats[muscleGroup].weeklyVolume += exercise.sets?.length || 0;
            }
        });
    });
    
    return stats;
}

function calculateExerciseProgression(workouts) {
    const exerciseData = {};
    
    workouts.forEach(workout => {
        const exercises = workout.workout_exercises || workout.exercises || [];
        exercises.forEach(exercise => {
            const name = exercise.name;
            if (!exerciseData[name]) {
                exerciseData[name] = [];
            }
            
            const maxWeight = exercise.sets?.reduce((max, set) => 
                Math.max(max, set.weight), 0) || 0;
            const totalReps = exercise.sets?.reduce((sum, set) => sum + set.reps, 0) || 0;
            const oneRM = maxWeight * (1 + totalReps / 30); // Brzycki formula approximation
            
            exerciseData[name].push({
                date: workout.date || workout.workout_date,
                maxWeight,
                totalReps,
                estimatedOneRM: oneRM,
                volume: exercise.sets?.reduce((sum, set) => sum + (set.weight * set.reps), 0) || 0
            });
        });
    });
    
    // Calculate progression rates
    const progressionRates = {};
    Object.entries(exerciseData).forEach(([exercise, data]) => {
        if (data.length >= 3) {
            const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
            const weeksDiff = daysDiff / 7;
            
            const weightProgression = weeksDiff > 0 ? 
                ((last.maxWeight - first.maxWeight) / first.maxWeight / weeksDiff * 100) : 0;
            const volumeProgression = weeksDiff > 0 ? 
                ((last.volume - first.volume) / first.volume / weeksDiff * 100) : 0;
            
            progressionRates[exercise] = {
                weightProgressionPerWeek: Math.round(weightProgression * 100) / 100,
                volumeProgressionPerWeek: Math.round(volumeProgression * 100) / 100,
                currentOneRM: Math.round(last.estimatedOneRM),
                trend: weightProgression > 2 ? 'improving' : weightProgression < -1 ? 'declining' : 'stable'
            };
        }
    });
    
    return progressionRates;
}

function calculateVolumeTrends(workouts) {
    const weeklyVolumes = {};
    
    workouts.forEach(workout => {
        const date = new Date(workout.date || workout.workout_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyVolumes[weekKey]) {
            weeklyVolumes[weekKey] = 0;
        }
        
        const exercises = workout.workout_exercises || workout.exercises || [];
        const workoutVolume = exercises.reduce((sum, exercise) => 
            sum + (exercise.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0
        );
        
        weeklyVolumes[weekKey] += workoutVolume;
    });
    
    return weeklyVolumes;
}

function calculateFrequencyAnalysis(workouts) {
    const exerciseFrequency = {};
    const muscleGroupFrequency = {};
    
    // Calculate sessions per exercise/muscle group per week
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentWorkouts = workouts.filter(w => 
        new Date(w.date || w.workout_date) >= fourWeeksAgo
    );
    
    recentWorkouts.forEach(workout => {
        const exercises = workout.workout_exercises || workout.exercises || [];
        const exercisesThisWorkout = new Set();
        const muscleGroupsThisWorkout = new Set();
        
        exercises.forEach(exercise => {
            const name = exercise.name;
            const muscleGroup = exercise.muscle_group || 'Other';
            
            if (!exercisesThisWorkout.has(name)) {
                exerciseFrequency[name] = (exerciseFrequency[name] || 0) + 1;
                exercisesThisWorkout.add(name);
            }
            
            if (!muscleGroupsThisWorkout.has(muscleGroup)) {
                muscleGroupFrequency[muscleGroup] = (muscleGroupFrequency[muscleGroup] || 0) + 1;
                muscleGroupsThisWorkout.add(muscleGroup);
            }
        });
    });
    
    // Convert to per-week frequencies
    const weeksAnalyzed = Math.max(1, recentWorkouts.length / 7);
    Object.keys(exerciseFrequency).forEach(exercise => {
        exerciseFrequency[exercise] = Math.round((exerciseFrequency[exercise] / weeksAnalyzed) * 10) / 10;
    });
    Object.keys(muscleGroupFrequency).forEach(muscle => {
        muscleGroupFrequency[muscle] = Math.round((muscleGroupFrequency[muscle] / weeksAnalyzed) * 10) / 10;
    });
    
    return { exercises: exerciseFrequency, muscleGroups: muscleGroupFrequency };
}

function calculateStrengthStandards(workouts) {
    // Simplified strength standards (novice/intermediate/advanced)
    const standards = {
        'Barbell Bench Press': { novice: 135, intermediate: 185, advanced: 245 },
        'Squats': { novice: 155, intermediate: 225, advanced: 315 },
        'Deadlifts': { novice: 185, intermediate: 275, advanced: 365 },
        'Pull-ups': { novice: 8, intermediate: 15, advanced: 25 } // reps
    };
    
    const userStandards = {};
    
    Object.keys(standards).forEach(exercise => {
        const exerciseHistory = getExerciseHistory(exercise);
        if (exerciseHistory.length > 0) {
            const bestPerformance = exerciseHistory.reduce((best, current) => 
                current.weight > best.weight ? current : best
            );
            
            const standard = standards[exercise];
            let level = 'Beginner';
            
            if (exercise === 'Pull-ups') {
                // Handle bodyweight exercises differently
                if (bestPerformance.totalReps >= standard.advanced) level = 'Advanced';
                else if (bestPerformance.totalReps >= standard.intermediate) level = 'Intermediate';
                else if (bestPerformance.totalReps >= standard.novice) level = 'Novice';
            } else {
                if (bestPerformance.weight >= standard.advanced) level = 'Advanced';
                else if (bestPerformance.weight >= standard.intermediate) level = 'Intermediate';
                else if (bestPerformance.weight >= standard.novice) level = 'Novice';
            }
            
            userStandards[exercise] = {
                current: bestPerformance.weight,
                level: level,
                nextTarget: getNextTarget(bestPerformance.weight, standard, level)
            };
        }
    });
    
    return userStandards;
}

function getNextTarget(current, standards, currentLevel) {
    switch(currentLevel) {
        case 'Beginner': return standards.novice;
        case 'Novice': return standards.intermediate;
        case 'Intermediate': return standards.advanced;
        case 'Advanced': return Math.round(current * 1.1); // 10% increase
        default: return standards.novice;
    }
}

function calculatePlateauRisk(workouts) {
    const risks = {};
    
    // Get unique exercises
    const exercises = new Set();
    workouts.forEach(workout => {
        const workoutExercises = workout.workout_exercises || workout.exercises || [];
        workoutExercises.forEach(ex => exercises.add(ex.name));
    });
    
    exercises.forEach(exerciseName => {
        const history = getExerciseHistory(exerciseName);
        if (history.length >= 4) {
            const recent = history.slice(-4);
            const weights = recent.map(h => h.weight);
            
            // Check for stagnation
            const noProgression = weights.slice(-3).every(w => w === weights[0]);
            const volumeDecline = recent[recent.length - 1].totalReps < recent[0].totalReps;
            
            let risk = 'Low';
            if (noProgression && volumeDecline) risk = 'High';
            else if (noProgression || volumeDecline) risk = 'Medium';
            
            risks[exerciseName] = {
                level: risk,
                recommendation: getPlateauRecommendation(risk, exerciseName)
            };
        }
    });
    
    return risks;
}

function getPlateauRecommendation(riskLevel, exerciseName) {
    switch(riskLevel) {
        case 'High': return `Consider deload or exercise variation for ${exerciseName}`;
        case 'Medium': return `Monitor progression closely for ${exerciseName}`;
        case 'Low': return `Continue current progression for ${exerciseName}`;
        default: return 'Keep training consistently';
    }
}

function createAdvancedAnalyticsDisplay(analytics) {
    const analyticsContainer = document.getElementById('analyticsTab');
    if (!analyticsContainer) return;
    
    // Create advanced analytics section
    let advancedSection = document.getElementById('advancedAnalytics');
    if (!advancedSection) {
        advancedSection = document.createElement('div');
        advancedSection.id = 'advancedAnalytics';
        advancedSection.style.cssText = 'margin-top: 32px; padding: 24px; background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border);';
        analyticsContainer.appendChild(advancedSection);
    }
    
    // Muscle group analysis
    const muscleGroupHtml = Object.entries(analytics.muscleGroups).map(([muscle, stats]) => `
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius); margin-bottom: 12px;">
            <h4 style="margin: 0 0 8px 0; color: var(--primary);">${muscle}</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; font-size: 14px;">
                <div><strong>Sets/week:</strong> ${stats.weeklyVolume}</div>
                <div><strong>Total volume:</strong> ${stats.volume.toLocaleString()}</div>
                <div><strong>Status:</strong> ${stats.weeklyVolume >= 10 && stats.weeklyVolume <= 20 ? '✅ Optimal' : stats.weeklyVolume < 10 ? '⚠️ Low' : '🔥 High'}</div>
            </div>
        </div>
    `).join('');
    
    // Exercise progression
    const progressionHtml = Object.entries(analytics.progression).slice(0, 5).map(([exercise, data]) => `
        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius); margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${exercise}</span>
                <span style="color: var(--${data.trend === 'improving' ? 'success' : data.trend === 'declining' ? 'danger' : 'warning'});">
                    ${data.trend === 'improving' ? '📈' : data.trend === 'declining' ? '📉' : '➡️'} ${data.weightProgressionPerWeek}%/week
                </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                Est. 1RM: ${data.currentOneRM}lbs
            </div>
        </div>
    `).join('');
    
    // Plateau risks
    const plateauHtml = Object.entries(analytics.plateaus).filter(([_, data]) => data.level !== 'Low').map(([exercise, data]) => `
        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius); margin-bottom: 8px; border-left: 4px solid var(--${data.level === 'High' ? 'danger' : 'warning'});">
            <div style="font-weight: 600; color: var(--${data.level === 'High' ? 'danger' : 'warning'});">
                ${data.level === 'High' ? '🚨' : '⚠️'} ${exercise} - ${data.level} Risk
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                ${data.recommendation}
            </div>
        </div>
    `).join('');
    
    advancedSection.innerHTML = `
        <h3 style="margin: 0 0 24px 0; color: var(--text-primary);">📊 Advanced Analytics</h3>
        
        <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; color: var(--text-secondary);">💪 Muscle Group Analysis</h4>
            ${muscleGroupHtml || '<p style="color: var(--text-muted);">No data available</p>'}
        </div>
        
        <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; color: var(--text-secondary);">📈 Exercise Progression</h4>
            ${progressionHtml || '<p style="color: var(--text-muted);">Complete more workouts to see progression data</p>'}
        </div>
        
        ${plateauHtml ? `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: var(--text-secondary);">⚠️ Plateau Alerts</h4>
                ${plateauHtml}
            </div>
        ` : ''}
        
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius); border: 1px solid var(--primary);">
            <h4 style="margin: 0 0 12px 0; color: var(--primary);">🎯 Training Insights</h4>
            <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                <li>Total training volume: ${analytics.basic.totalVolume.toLocaleString()} lbs</li>
                <li>Average workout: ${analytics.basic.avgDuration} minutes</li>
                <li>Most trained: ${Object.entries(analytics.muscleGroups).sort((a, b) => b[1].sets - a[1].sets)[0]?.[0] || 'No data'}</li>
                <li>Recommended focus: ${Object.entries(analytics.muscleGroups).filter(([_, stats]) => stats.weeklyVolume < 10).map(([muscle]) => muscle).join(', ') || 'Maintain current balance'}</li>
            </ul>
        </div>
    `;
}

function updateSettingsTab() {
    const elements = {
        showResearchFacts: document.getElementById('showResearchFacts'),
        darkMode: document.getElementById('darkMode'),
        autoStartRestTimer: document.getElementById('autoStartRestTimer'),
        compoundRest: document.getElementById('compoundRest'),
        isolationRest: document.getElementById('isolationRest'),
        progressionRate: document.getElementById('progressionRate')
    };
    
    if (elements.showResearchFacts) elements.showResearchFacts.checked = HyperTrack.state.settings.showResearchFacts;
    if (elements.darkMode) elements.darkMode.checked = HyperTrack.state.settings.darkMode;
    if (elements.autoStartRestTimer) elements.autoStartRestTimer.checked = HyperTrack.state.settings.autoStartRestTimer;
    if (elements.compoundRest) elements.compoundRest.value = HyperTrack.state.settings.compoundRest;
    if (elements.isolationRest) elements.isolationRest.value = HyperTrack.state.settings.isolationRest;
    if (elements.progressionRate) elements.progressionRate.value = HyperTrack.state.settings.progressionRate;
}

function updateResearchBanner() {
    const banner = document.getElementById('researchBanner');
    if (banner) {
        banner.style.display = HyperTrack.state.settings.showResearchFacts ? 'block' : 'none';
    }
}

// ==========================================
// WORKOUT MANAGEMENT FUNCTIONS  
// ==========================================
function startWorkout() {
    HyperTrack.state.currentWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: []
    };
    
    showCurrentWorkout();
    
    if (HyperTrack.state.currentWorkout.timerInterval) {
        clearInterval(HyperTrack.state.currentWorkout.timerInterval);
    }
    HyperTrack.state.currentWorkout.timerInterval = setInterval(updateWorkoutTimer, 1000);
    
    console.log('💪 Workout started');
}

async function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    if (HyperTrack.state.currentWorkout.exercises.length === 0) {
        if (!confirm('You haven\'t added any exercises. Are you sure you want to finish this workout?')) {
            return;
        }
    }
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    workout.duration = new Date(workout.endTime) - new Date(workout.startTime);
    
    if (workout.timerInterval) {
        clearInterval(workout.timerInterval);
    }
    
    try {
        const savedWorkout = await saveWorkoutToAPI(workout);
        HyperTrack.state.workouts.push(savedWorkout);
        
        HyperTrack.state.currentWorkout = null;
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        showNotification(`🎉 Workout saved to database! ${workout.exercises.length} exercises • ${duration} minutes`, 'success');
        
        console.log('✅ Workout finished and saved to database');
        
    } catch (error) {
        HyperTrack.state.workouts.push(workout);
        HyperTrack.state.currentWorkout = null;
        
        saveAppData();
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        showNotification(`🎉 Workout completed! ${workout.exercises.length} exercises • ${duration} minutes (Saved locally)`, 'success');
        
        console.log('✅ Workout finished and saved locally');
    }
}


function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addSet() {
    const setInputs = document.getElementById('setInputs');
    if (!setInputs) {
        console.error('❌ setInputs element not found');
        return;
    }
    
    const setNumber = setInputs.children.length + 1;
    
    // Get recommendation for auto-fill
    const exerciseName = document.getElementById('exerciseModal').dataset.exerciseName;
    const recommendation = HyperTrack.state.recommendations.cache.get(exerciseName);
    const suggestedWeight = recommendation?.data?.weight || '';
    
    const setRow = document.createElement('div');
    setRow.className = 'set-input-row';
    setRow.style.display = 'flex';
    setRow.style.alignItems = 'center';
    setRow.style.gap = '10px';
    setRow.style.marginBottom = '10px';
    setRow.innerHTML = `
        <span class="set-number" style="min-width: 50px; font-weight: 500;">Set ${setNumber}</span>
        <input type="number" class="set-input weight-input" placeholder="Weight" min="0" step="2.5" 
               value="${suggestedWeight}"
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <input type="number" class="set-input reps-input" placeholder="Reps" min="1" step="1"
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <button class="remove-set-btn" onclick="removeSet(this)" title="Remove set"
                style="padding: 8px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
    `;
    
    setInputs.appendChild(setRow);
    
    // Auto-populate from previous set if not first set
    if (setNumber > 1 && !suggestedWeight) {
        const previousRow = setInputs.children[setNumber - 2];
        const previousWeight = previousRow.querySelector('.weight-input').value;
        if (previousWeight) {
            setRow.querySelector('.weight-input').value = previousWeight;
        }
    }
    
    // Add event listeners for auto rest timer
    const weightInput = setRow.querySelector('.weight-input');
    const repsInput = setRow.querySelector('.reps-input');
    
    let setCompleted = false;
    
    const checkSetCompletion = () => {
        if (!setCompleted && weightInput.value && repsInput.value && 
            parseFloat(weightInput.value) > 0 && parseInt(repsInput.value) > 0) {
            setCompleted = true;
            
            // Check if this is not the last set input row (user might be adding multiple sets at once)
            const isLastRow = setRow === setInputs.lastElementChild;
            
            if (isLastRow && HyperTrack.state.settings.autoStartRestTimer) {
                // Auto-trigger rest timer when both weight and reps are entered
                setTimeout(() => {
                    const exerciseCategory = document.getElementById('exerciseModal').dataset.exerciseCategory;
                    const exerciseName = document.getElementById('exerciseModal').dataset.exerciseName;
                    
                    // Only start rest timer if modal is still open and this is still the last row
                    if (document.getElementById('exerciseModal').style.display === 'flex' && 
                        setRow === setInputs.lastElementChild) {
                        showNotification(`Set ${setNumber} logged - starting rest timer`, 'success');
                        startRestTimer(exerciseCategory, exerciseName + ` - Set ${setNumber}`);
                    }
                }, 500);
            }
        }
    };
    
    weightInput.addEventListener('input', checkSetCompletion);
    repsInput.addEventListener('input', checkSetCompletion);
    
    setTimeout(() => {
        const firstEmptyInput = setRow.querySelector('.weight-input').value ? 
            setRow.querySelector('.reps-input') : 
            setRow.querySelector('.weight-input');
        if (firstEmptyInput) {
            firstEmptyInput.focus();
        }
    }, 100);
    
    console.log(`✅ Added set ${setNumber} to exercise modal`);
}

function removeSet(button) {
    const setInputs = document.getElementById('setInputs');
    if (setInputs && setInputs.children.length > 1) {
        button.parentElement.remove();
        
        Array.from(setInputs.children).forEach((row, index) => {
            const setNumber = row.querySelector('.set-number');
            if (setNumber) {
                setNumber.textContent = `Set ${index + 1}`;
            }
        });
    }
}

function finishExercise() {
    const modal = document.getElementById('exerciseModal');
    const exerciseId = parseInt(modal.dataset.exerciseId);
    const exerciseName = modal.dataset.exerciseName;
    const exerciseCategory = modal.dataset.exerciseCategory;
    const muscleGroup = modal.dataset.muscleGroup;
    
    const exercise = HyperTrack.state.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    const setRows = document.querySelectorAll('.set-input-row');
    const sets = [];
    
    for (let row of setRows) {
        const inputs = row.querySelectorAll('.set-input');
        const weight = parseFloat(inputs[0].value);
        const reps = parseInt(inputs[1].value);
        
        if (weight > 0 && reps > 0) {
            sets.push({
                weight: weight,
                reps: reps,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    if (sets.length === 0) {
        showNotification('Please enter at least one valid set', 'warning');
        return;
    }
    
    const workoutExercise = {
        id: exerciseId,
        name: exerciseName,
        muscle_group: muscleGroup,
        category: exerciseCategory,
        sets: sets,
        addedAt: new Date().toISOString()
    };
    
    HyperTrack.state.currentWorkout.exercises.push(workoutExercise);
    
    closeExerciseModal();
    updateCurrentWorkoutDisplay();
    
    // Clear rest timer if active (user finished all sets)
    if (HyperTrack.state.restTimer.active) {
        completeRestTimer();
    }
    
    // Collect ML data for future AI training
    const bestSet = sets.reduce((best, current) => 
        (current.weight > best.weight || (current.weight === best.weight && current.reps > best.reps)) 
            ? current : best
    );
    
    HyperTrack.mlBaseline.collectDataPoint(exerciseName, {
        weight: bestSet.weight,
        reps: bestSet.reps,
        sets: sets.length,
        targetAchieved: true // Assume target achieved since exercise was completed
    }, {
        workoutDuration: HyperTrack.state.currentWorkout ? 
            (Date.now() - new Date(HyperTrack.state.currentWorkout.startTime)) / 1000 / 60 : null
    });
    
    console.log(`✅ Added ${exerciseName} with ${sets.length} sets`);
    showNotification(`${exerciseName} completed - ${sets.length} sets logged!`, 'success');
    
    // Show progression recommendations for next workout
    setTimeout(() => showProgressionRecommendations(exerciseName, sets, exerciseCategory), 2000);
}

// ==========================================
// PROGRESSION RECOMMENDATION FUNCTIONS
// ==========================================
function showProgressionRecommendations(exerciseName, sets, exerciseCategory) {
    // Get best set from current session
    const bestSet = sets.reduce((best, current) => 
        (current.weight > best.weight || (current.weight === best.weight && current.reps > best.reps)) 
            ? current : best
    );
    
    // Get historical data for this exercise
    const exerciseHistory = getExerciseHistory(exerciseName);
    
    // Check for plateau
    const plateauDetection = HyperTrack.progressionSystem.detectPlateau(exerciseHistory, exerciseName);
    
    if (plateauDetection) {
        showPlateauBreakingRecommendations(exerciseName, plateauDetection);
        return;
    }
    
    // Get progression recommendations
    const recommendations = HyperTrack.progressionSystem.calculateProgression(
        exerciseName, 
        bestSet.weight, 
        bestSet.reps, 
        sets.length,
        null, // target reps
        getEquipmentType(exerciseName)
    );
    
    if (recommendations.length === 0) return;
    
    // Create progression recommendation modal
    const modal = document.createElement('div');
    modal.id = 'progressionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const recommendationCards = recommendations.slice(0, 3).map((rec, index) => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; cursor: pointer;" 
             onclick="selectProgression('${exerciseName}', ${JSON.stringify(rec).replace(/"/g, '&quot;')})">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} Progression</span>
                <span style="background: var(--${rec.difficulty === 'easy' ? 'success' : rec.difficulty === 'moderate' ? 'warning' : 'danger'}); 
                             color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">
                    ${rec.difficulty}
                </span>
            </div>
            <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">
                ${rec.reasoning}
            </div>
            <div style="font-size: 18px; font-weight: 600; color: var(--primary);">
                Next: ${rec.weight}lbs × ${rec.reps} reps × ${rec.sets} sets
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; text-align: center; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--primary);">
            <h2 style="color: var(--primary-light); margin-bottom: 8px; font-size: 24px;">🎯 Next Workout Progression</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 16px;">
                Current best: ${bestSet.weight}lbs × ${bestSet.reps} reps
            </p>
            <div style="text-align: left; margin-bottom: 24px;">
                ${recommendationCards}
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="closeProgressionModal()" style="padding: 12px 24px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius); font-weight: 600; cursor: pointer;">
                    Maybe Later
                </button>
                <button onclick="saveProgressionGoal('${exerciseName}', ${JSON.stringify(recommendations[0]).replace(/"/g, '&quot;')})" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer;">
                    Set as Goal
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showPlateauBreakingRecommendations(exerciseName, plateauDetection) {
    const rec = plateauDetection.recommendation;
    
    const modal = document.createElement('div');
    modal.id = 'plateauModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    let content = '';
    if (rec.type === 'substitution') {
        content = `
            <div style="margin-bottom: 16px;">
                <h4 style="color: var(--warning); margin-bottom: 8px;">🔄 Try These Alternatives:</h4>
                ${rec.exercises.map(ex => `<span style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block;">${ex}</span>`).join('')}
            </div>
        `;
    } else {
        content = `
            <div style="margin-bottom: 16px;">
                <h4 style="color: var(--warning); margin-bottom: 8px;">💪 Recommended Strategy:</h4>
                <p style="color: var(--text-secondary);">${rec.strategy}</p>
                ${rec.weight ? `<p style="font-weight: 600; color: var(--primary);">New weight: ${rec.weight}lbs</p>` : ''}
                <p style="font-size: 14px; color: var(--text-muted);">Duration: ${rec.duration}</p>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; text-align: center; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--warning);">
            <h2 style="color: var(--warning); margin-bottom: 8px; font-size: 24px;">⚠️ Plateau Detected</h2>
            <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 16px;">
                ${plateauDetection.reasoning}
            </p>
            ${content}
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button onclick="closePlateauModal()" style="padding: 12px 24px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius); font-weight: 600; cursor: pointer;">
                    Dismiss
                </button>
                <button onclick="applyPlateauStrategy('${exerciseName}', ${JSON.stringify(rec).replace(/"/g, '&quot;')})" style="padding: 12px 24px; background: var(--warning); color: white; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer;">
                    Apply Strategy
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getExerciseHistory(exerciseName) {
    const history = [];
    HyperTrack.state.workouts.forEach(workout => {
        const exercise = workout.exercises?.find(ex => ex.name === exerciseName);
        if (exercise && exercise.sets) {
            const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
            const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
            history.push({
                date: workout.date,
                weight: maxWeight,
                totalReps: totalReps,
                sets: exercise.sets.length
            });
        }
    });
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getEquipmentType(exerciseName) {
    const equipmentMap = {
        'Barbell': 'barbell',
        'Dumbbell': 'dumbbell',
        'Machine': 'machine'
    };
    
    for (const [key, value] of Object.entries(equipmentMap)) {
        if (exerciseName.includes(key)) return value;
    }
    return 'barbell'; // default
}

function selectProgression(exerciseName, recommendation) {
    closeProgressionModal();
    saveProgressionGoal(exerciseName, recommendation);
}

function saveProgressionGoal(exerciseName, recommendation) {
    // Store the goal for next workout
    if (!HyperTrack.state.progressionGoals) {
        HyperTrack.state.progressionGoals = new Map();
    }
    
    HyperTrack.state.progressionGoals.set(exerciseName, {
        ...recommendation,
        setDate: new Date().toISOString()
    });
    
    saveAppData();
    showNotification(`Goal set for ${exerciseName}: ${recommendation.weight}lbs × ${recommendation.reps} reps`, 'success');
    closeProgressionModal();
}

function closeProgressionModal() {
    const modal = document.getElementById('progressionModal');
    if (modal) modal.remove();
}

function closePlateauModal() {
    const modal = document.getElementById('plateauModal');
    if (modal) modal.remove();
}

function applyPlateauStrategy(exerciseName, strategy) {
    closePlateauModal();
    showNotification(`Applied ${strategy.type} strategy for ${exerciseName}`, 'info');
    // Could store this as a special workout note or goal
}

// ==========================================
// CORE APPLICATION FUNCTIONS
// ==========================================
function updateUI() {
    // Update current workout display
    if (HyperTrack.state.currentWorkout) {
        showCurrentWorkout();
    } else {
        hideCurrentWorkout();
    }
    
    // Update tab content
    const activeTab = document.querySelector('.nav-btn.active')?.dataset.tab || 'workout';
    switchTab(activeTab);
    
    // Update research banner
    updateResearchBanner();
    
    // Update settings
    updateSettingsTab();
    
    console.log('🔄 UI updated');
}

function loadAppData() {
    try {
        const saved = localStorage.getItem('hypertrackData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Load workouts
            if (data.workouts) {
                HyperTrack.state.workouts = data.workouts;
            }
            
            // Load settings
            if (data.settings) {
                HyperTrack.state.settings = { ...HyperTrack.state.settings, ...data.settings };
            }
            
            // Load current workout
            if (data.currentWorkout) {
                HyperTrack.state.currentWorkout = data.currentWorkout;
            }
            
            // Load progression goals
            if (data.progressionGoals) {
                HyperTrack.state.progressionGoals = new Map(data.progressionGoals);
            }
            
            console.log('📂 App data loaded from localStorage');
        }
    } catch (error) {
        console.error('❌ Error loading app data:', error);
    }
}

function saveAppData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            currentWorkout: HyperTrack.state.currentWorkout,
            progressionGoals: HyperTrack.state.progressionGoals ? 
                Array.from(HyperTrack.state.progressionGoals.entries()) : []
        };
        
        localStorage.setItem('hypertrackData', JSON.stringify(data));
        console.log('💾 App data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving app data:', error);
    }
}

function showCurrentWorkout() {
    const currentWorkoutDiv = document.getElementById('currentWorkout');
    const startWorkoutDiv = document.getElementById('startWorkout');
    const exerciseSelectionDiv = document.getElementById('exerciseSelection');
    
    if (currentWorkoutDiv) currentWorkoutDiv.style.display = 'block';
    if (startWorkoutDiv) startWorkoutDiv.style.display = 'none';
    if (exerciseSelectionDiv) exerciseSelectionDiv.style.display = 'block';
    
    updateCurrentWorkoutDisplay();
}

function hideCurrentWorkout() {
    const currentWorkoutDiv = document.getElementById('currentWorkout');
    const startWorkoutDiv = document.getElementById('startWorkout');
    const exerciseSelectionDiv = document.getElementById('exerciseSelection');
    
    if (currentWorkoutDiv) currentWorkoutDiv.style.display = 'none';
    if (startWorkoutDiv) startWorkoutDiv.style.display = 'block';
    if (exerciseSelectionDiv) exerciseSelectionDiv.style.display = 'none';
}

function updateCurrentWorkoutDisplay() {
    if (!HyperTrack.state.currentWorkout) return;
    
    const exercisesContainer = document.getElementById('currentExercises');
    if (!exercisesContainer) return;
    
    const exercises = HyperTrack.state.currentWorkout.exercises || [];
    
    if (exercises.length === 0) {
        exercisesContainer.innerHTML = '<p class="no-exercises">No exercises added yet. Select an exercise to get started!</p>';
        return;
    }
    
    const html = exercises.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-header">
                <h3>${exercise.name}</h3>
                <span class="muscle-group">${exercise.muscle_group}</span>
            </div>
            <div class="sets-summary">
                ${exercise.sets.map((set, index) => `
                    <span class="set-badge">${set.weight}lbs × ${set.reps}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    exercisesContainer.innerHTML = html;
}

// ==========================================
// UTILITY FUNCTIONS
function openSettings() {
    switchTab('settings');
}

function filterExercises(searchTerm) {
    const exerciseList = document.getElementById('exerciseList');
    if (!exerciseList) return;
    
    const exercises = exerciseList.querySelectorAll('.exercise-card');
    const term = searchTerm.toLowerCase();
    
    exercises.forEach(exercise => {
        const name = exercise.querySelector('.exercise-name')?.textContent.toLowerCase() || '';
        const muscle = exercise.querySelector('.exercise-muscle')?.textContent.toLowerCase() || '';
        
        if (name.includes(term) || muscle.includes(term) || term === '') {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
}

function filterByMuscle(muscleGroup) {
    // Update active button
    document.querySelectorAll('.muscle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter exercises
    const exerciseList = document.getElementById('exerciseList');
    if (!exerciseList) return;
    
    const exercises = exerciseList.querySelectorAll('.exercise-card');
    
    exercises.forEach(exercise => {
        const muscle = exercise.querySelector('.exercise-muscle')?.textContent || '';
        
        if (muscleGroup === 'all' || muscle === muscleGroup) {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
}

function updateWorkoutTimer() {
    if (!HyperTrack.state.currentWorkout || !HyperTrack.state.currentWorkout.startTime) return;
    
    const startTime = new Date(HyperTrack.state.currentWorkout.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timerElement = document.getElementById('workoutTime');
    if (timerElement) {
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function populateExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    if (!exerciseList) return;
    
    const exercises = HyperTrack.exerciseDatabase;
    
    const html = exercises.map(exercise => `
        <div class="exercise-card" onclick="selectExercise('${exercise.name}', '${exercise.muscle_group}', '${exercise.category}')">
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-muscle">${exercise.muscle_group}</div>
                <div class="exercise-category">${exercise.category}</div>
            </div>
            <div class="exercise-meta">
                <span class="tier-badge tier-${exercise.tier}">Tier ${exercise.tier}</span>
                <span class="mvc-badge">${exercise.mvc_percentage}% MVC</span>
            </div>
        </div>
    `).join('');
    
    exerciseList.innerHTML = html;
    console.log(`📋 Populated ${exercises.length} exercises`);
}

function selectExercise(exerciseName, muscleGroup, category) {
    if (!HyperTrack.state.currentWorkout) {
        showNotification('Please start a workout first', 'warning');
        return;
    }
    
    // Store current exercise info
    HyperTrack.state.currentExercise = {
        name: exerciseName,
        muscle_group: muscleGroup,
        category: category
    };
    
    // Open exercise modal
    openExerciseModal(exerciseName);
}

function openExerciseModal(exerciseName) {
    const modal = document.getElementById('exerciseModal');
    const modalTitle = document.getElementById('modalExerciseName');
    const setInputsContainer = document.getElementById('setInputs');
    
    if (!modal || !modalTitle || !setInputsContainer) {
        console.error('Exercise modal elements not found');
        return;
    }
    
    modalTitle.textContent = exerciseName;
    setInputsContainer.innerHTML = ''; // Clear previous sets
    
    // Add initial set
    addSet();
    
    modal.style.display = 'flex';
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = setInputsContainer.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
    
    console.log(`📝 Opened modal for ${exerciseName}`);
}


function removeSet(button) {
    const setInputsContainer = document.getElementById('setInputs');
    const setRow = button.closest('.set-input-row');
    
    if (setRow && setInputsContainer.children.length > 1) {
        setRow.remove();
        
        // Renumber remaining sets
        Array.from(setInputsContainer.children).forEach((row, index) => {
            const setNumber = row.querySelector('.set-number');
            if (setNumber) {
                setNumber.textContent = `Set ${index + 1}`;
            }
        });
    }
}


// ==========================================
// SETTINGS FUNCTIONS
// ==========================================
function toggleResearchFacts(enabled) {
    HyperTrack.state.settings.showResearchFacts = enabled;
    updateResearchBanner();
    saveAppData();
}

function toggleDarkMode(enabled) {
    HyperTrack.state.settings.darkMode = enabled;
    document.body.classList.toggle('light-mode', !enabled);
    saveAppData();
}

function toggleAutoRestTimer(enabled) {
    HyperTrack.state.settings.autoStartRestTimer = enabled;
    saveAppData();
    console.log(`⏱️ Auto-start rest timer ${enabled ? 'enabled' : 'disabled'}`);
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to corresponding nav button
    const navButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (navButton) {
        navButton.classList.add('active');
    }
    
    // Update UI based on tab
    if (tabName === 'history') {
        updateHistoryDisplay();
    } else if (tabName === 'analytics') {
        updateAnalyticsDisplay();
    }
    
    console.log(`🧭 Switched to ${tabName} tab`);
}

function toggleWorkout() {
    if (HyperTrack.state.currentWorkout) {
        // If workout is active, show finish options
        if (confirm('Finish current workout?')) {
            finishWorkout();
        }
    } else {
        // Start new workout
        startWorkout();
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (HyperTrack.state.workouts.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No Workouts Yet</h3>
                <p>Complete your first workout to see your training history and progress over time.</p>
            </div>
        `;
        return;
    }
    
    const sortedWorkouts = [...HyperTrack.state.workouts].sort((a, b) => 
        new Date(b.date || b.workout_date) - new Date(a.date || a.workout_date)
    );
    
    historyList.innerHTML = sortedWorkouts.map(workout => `
        <div class="workout-history-item" onclick="viewWorkoutDetails('${workout.id}')">
            <div class="workout-date">${formatDate(workout.date || workout.workout_date)}</div>
            <div class="workout-summary">
                <span>📋 ${workout.exercises?.length || 0} exercises</span>
                <span>⏱️ ${Math.round((workout.duration || 0) / 60000)} min</span>
                <span>🏋️ ${workout.split || 'General'}</span>
            </div>
            ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
        </div>
    `).join('');
}

function updateAnalyticsDisplay() {
    const workouts = HyperTrack.state.workouts;
    
    // Update stats
    document.getElementById('totalWorkouts').textContent = workouts.length;
    
    const totalSets = workouts.reduce((sum, workout) => 
        sum + (workout.exercises?.reduce((exerciseSum, exercise) => 
            exerciseSum + (exercise.sets?.length || 0), 0) || 0), 0);
    document.getElementById('totalSets').textContent = totalSets;
    
    const totalVolume = workouts.reduce((sum, workout) => 
        sum + (workout.exercises?.reduce((exerciseSum, exercise) => 
            exerciseSum + (exercise.sets?.reduce((setSum, set) => 
                setSum + (set.weight * set.reps), 0) || 0), 0) || 0), 0);
    document.getElementById('totalVolume').textContent = Math.round(totalVolume);
    
    const avgDuration = workouts.length > 0 ? 
        workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length / 60000 : 0;
    document.getElementById('avgDuration').textContent = Math.round(avgDuration);
}

function viewWorkoutDetails(workoutId) {
    const workout = HyperTrack.state.workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    alert(`Workout Details:\n\nDate: ${workout.date || workout.workout_date}\nExercises: ${workout.exercises?.length || 0}\nDuration: ${Math.round((workout.duration || 0) / 60000)} minutes\nNotes: ${workout.notes || 'None'}`);
}

function openSettings() {
    switchTab('settings');
}

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================
function exportData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `hypertrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Data exported successfully');
    } catch (error) {
        console.error('❌ Export error:', error);
        showNotification('Error exporting data. Please try again.', 'error');
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (imported.workouts && imported.settings) {
                    HyperTrack.state.workouts = imported.workouts;
                    HyperTrack.state.settings = { ...HyperTrack.state.settings, ...imported.settings };
                    HyperTrack.state.user = { ...HyperTrack.state.user, ...imported.user };
                    
                    saveAppData();
                    updateUI();
                    
                    showNotification('Data imported successfully!', 'success');
                    console.log('📥 Data imported successfully');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('❌ Import error:', error);
                showNotification('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function clearAllData() {
    if (confirm('⚠️ This will permanently delete all your workout data. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            localStorage.removeItem('hypertrackData');
            HyperTrack.state.workouts = [];
            HyperTrack.state.currentWorkout = null;
            HyperTrack.state.settings = {
                showResearchFacts: true,
                darkMode: true,
                compoundRest: 150,
                isolationRest: 90,
                progressionRate: 3.5
            };
            
            updateUI();
            showNotification('All data has been cleared.', 'info');
            console.log('🗑️ All data cleared');
        }
    }
}

// ==========================================
// RESEARCH FACTS FUNCTIONS
// ==========================================
function startResearchFactRotation() {
    function showNextFact() {
        if (!HyperTrack.state.settings.showResearchFacts) return;
        
        const randomFact = HyperTrack.researchFacts[
            Math.floor(Math.random() * HyperTrack.researchFacts.length)
        ];
        
        const textElement = document.getElementById('researchText');
        if (textElement) {
            textElement.textContent = randomFact;
        }
    }
    
    showNextFact();
    setInterval(showNextFact, 15000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('exerciseModal');
            if (modal && modal.style.display === 'flex') {
                closeExerciseModal();
            }
            
            // Also close rest timer if active
            if (HyperTrack.state.restTimer.active) {
                completeRestTimer();
            }
        }
    });
    
    // Settings event listeners
    const compoundRest = document.getElementById('compoundRest');
    const isolationRest = document.getElementById('isolationRest');
    const progressionRate = document.getElementById('progressionRate');
    
    if (compoundRest) {
        compoundRest.addEventListener('change', function(e) {
            HyperTrack.state.settings.compoundRest = parseInt(e.target.value);
            saveAppData();
        });
    }
    
    if (isolationRest) {
        isolationRest.addEventListener('change', function(e) {
            HyperTrack.state.settings.isolationRest = parseInt(e.target.value);
            saveAppData();
        });
    }
    
    if (progressionRate) {
        progressionRate.addEventListener('change', function(e) {
            HyperTrack.state.settings.progressionRate = parseFloat(e.target.value);
            saveAppData();
        });
    }
    
    // Modal click handler
    const modal = document.getElementById('exerciseModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeExerciseModal();
            }
        });
    }
    
    console.log('🎛️ Event listeners setup complete');
}

// Initialize
console.log('🚀 HyperTrack Pro Enhanced Edition loaded');

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Initializing HyperTrack Pro...');
    
    // Load historical data
    HyperTrack.loadHistoricalData();
    
    // Initialize UI
    loadAppData();
    populateExerciseList();
    updateUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start research fact rotation
    startResearchFactRotation();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('✅ Service Worker registered'))
            .catch(error => console.log('❌ Service Worker registration failed'));
    }
    
    console.log('✅ HyperTrack Pro initialization complete');
    
    // Test basic functionality
    console.log('🧪 Running basic functionality tests...');
    console.log(`📊 Exercise database loaded: ${HyperTrack.exerciseDatabase.length} exercises`);
    console.log(`📈 Historical workouts: ${HyperTrack.state.workouts.length} workouts`);
    
    // Test function availability
    const requiredFunctions = ['startWorkout', 'switchTab', 'selectExercise', 'openExerciseModal', 'finishExercise'];
    requiredFunctions.forEach(func => {
        console.log(`🔧 ${func}: ${typeof window[func] === 'function' ? '✅ Available' : '❌ Missing'}`);
    });
    
    // Test DOM elements
    const requiredElements = ['workoutTab', 'exerciseList', 'exerciseModal'];
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        console.log(`🏗️ ${elementId}: ${element ? '✅ Found' : '❌ Missing'}`);
    });
});
