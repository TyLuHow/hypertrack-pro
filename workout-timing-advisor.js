// HyperTrack Pro - Workout Timing Advisor
// Real-time rest recommendations and optimal workout timing

class WorkoutTimingAdvisor {
    constructor() {
        this.lastWorkouts = new Map(); // muscle group -> last workout date
        this.optimalRestPeriods = new Map(); // muscle group -> optimal hours
        this.updateInterval = null;
    }

    // Initialize with workout history and optimal rest data
    initialize(workoutHistory, optimalRestData) {
        console.log('⏰ Initializing Workout Timing Advisor...');
        
        // Extract last workout for each muscle group
        this.extractLastWorkouts(workoutHistory);
        
        // Store optimal rest periods from analysis
        if (optimalRestData) {
            optimalRestData.muscleGroupAnalysis.forEach((analysis, muscleGroup) => {
                if (analysis.status === 'analyzed' && analysis.optimalRest) {
                    this.optimalRestPeriods.set(muscleGroup, analysis.optimalRest.hours);
                }
            });
        }
        
        console.log(`⏰ Tracking ${this.lastWorkouts.size} muscle groups`);
        
        // Start real-time updates
        this.startRealtimeUpdates();
    }

    // Extract last workout date for each muscle group
    extractLastWorkouts(workoutHistory) {
        this.lastWorkouts.clear();
        
        // Sort workouts by date (newest first)
        const sortedWorkouts = workoutHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedWorkouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            workout.exercises?.forEach(exercise => {
                const muscleGroup = exercise.muscle_group;
                if (muscleGroup && !this.lastWorkouts.has(muscleGroup)) {
                    this.lastWorkouts.set(muscleGroup, workoutDate);
                }
            });
        });
    }

    // Calculate rest status for a muscle group
    calculateRestStatus(muscleGroup) {
        const lastWorkout = this.lastWorkouts.get(muscleGroup);
        const optimalRestHours = this.optimalRestPeriods.get(muscleGroup) || this.getDefaultRestHours(muscleGroup);
        
        if (!lastWorkout) {
            return {
                muscleGroup: muscleGroup,
                status: 'no_data',
                message: 'No previous workout found',
                hoursRested: 0,
                optimalRestHours: optimalRestHours,
                readiness: 'unknown'
            };
        }

        const now = new Date();
        const hoursRested = (now - lastWorkout) / (1000 * 60 * 60);
        const percentageRested = (hoursRested / optimalRestHours) * 100;
        
        let status, readiness, message, color;
        
        if (hoursRested < optimalRestHours * 0.5) {
            status = 'too_early';
            readiness = 'not_ready';
            message = 'Too early - high fatigue risk';
            color = '#ef4444'; // red
        } else if (hoursRested < optimalRestHours * 0.8) {
            status = 'early';
            readiness = 'moderate';
            message = 'Could train but not optimal';
            color = '#f59e0b'; // amber
        } else if (hoursRested < optimalRestHours * 1.2) {
            status = 'optimal';
            readiness = 'ready';
            message = 'Optimal training window';
            color = '#22c55e'; // green
        } else if (hoursRested < optimalRestHours * 2) {
            status = 'extended';
            readiness = 'ready';
            message = 'Well rested - good to go';
            color = '#3b82f6'; // blue
        } else {
            status = 'very_extended';
            readiness = 'detraining_risk';
            message = 'Extended rest - consider training';
            color = '#8b5cf6'; // purple
        }

        const timeUntilOptimal = Math.max(0, optimalRestHours - hoursRested);
        
        return {
            muscleGroup: muscleGroup,
            status: status,
            readiness: readiness,
            message: message,
            color: color,
            hoursRested: Math.round(hoursRested * 10) / 10,
            optimalRestHours: optimalRestHours,
            percentageRested: Math.round(percentageRested),
            timeUntilOptimal: timeUntilOptimal,
            lastWorkoutDate: lastWorkout,
            formattedTimeUntilOptimal: this.formatTimeRemaining(timeUntilOptimal)
        };
    }

    // Get default rest hours for muscle groups without analysis data
    getDefaultRestHours(muscleGroup) {
        const defaultRest = {
            'Horizontal Push': 48,
            'Vertical Push': 48,
            'Horizontal Pull': 48,
            'Vertical Pull': 48,
            'Side Delts': 36,
            'Rear Delts': 36,
            'Biceps': 36,
            'Triceps': 36,
            'Legs': 60,
            'Quads': 60,
            'Hamstrings': 60,
            'Glutes': 60,
            'Calves': 24,
            'Abs': 24,
            'Traps': 36
        };
        
        return defaultRest[muscleGroup] || 48;
    }

    // Format time remaining in human readable format
    formatTimeRemaining(hours) {
        if (hours <= 0) return 'Ready now';
        
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.round((hours % 1) * 60);
        
        if (days > 0) {
            if (remainingHours > 0) {
                return `${days}d ${remainingHours}h`;
            } else {
                return `${days} day${days > 1 ? 's' : ''}`;
            }
        } else if (remainingHours > 0) {
            if (minutes > 0) {
                return `${remainingHours}h ${minutes}m`;
            } else {
                return `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
            }
        } else {
            return `${minutes} min`;
        }
    }

    // Get next recommended workout prioritizing deficiencies + least recently trained
    getNextRecommendedWorkout() {
        const muscleStatuses = Array.from(this.lastWorkouts.keys())
            .map(muscleGroup => this.calculateRestStatus(muscleGroup))
            .filter(status => status.status !== 'no_data');
        
        if (muscleStatuses.length === 0) {
            return {
                recommendation: 'no_data',
                message: 'Complete some workouts to get recommendations'
            };
        }

        // Get volume deficiencies from weekly analysis
        const volumeDeficiencies = this.getVolumeDeficiencies();
        
        // Enhance muscle statuses with volume deficiency and priority scoring
        const enhancedStatuses = muscleStatuses.map(status => {
            const volumeDeficit = volumeDeficiencies[status.muscleGroup] || 0;
            const hasDeficiency = volumeDeficit > 0;
            
            // Calculate priority score (higher = more priority)
            let priorityScore = 0;
            
            // 1. Volume deficiency priority (highest weight)
            if (hasDeficiency) {
                priorityScore += volumeDeficit * 10; // Major priority for deficiencies
            }
            
            // 2. Time since last workout (longer = higher priority)
            priorityScore += status.hoursRested * 0.1;
            
            // 3. Recovery readiness bonus
            if (status.readiness === 'ready' || status.status === 'optimal') {
                priorityScore += 50; // Bonus for being ready to train
            }
            
            // 4. Penalty for very recent training (< 24 hours)
            if (status.hoursRested < 24) {
                priorityScore -= 100; // Heavy penalty for recent training
            }
            
            return {
                ...status,
                volumeDeficit,
                hasDeficiency,
                priorityScore,
                daysSinceWorkout: Math.round(status.hoursRested / 24 * 10) / 10
            };
        });

        // Sort by priority score (highest priority first)
        enhancedStatuses.sort((a, b) => b.priorityScore - a.priorityScore);
        
        // Find the best recommendations
        const topRecommendations = enhancedStatuses.slice(0, 3);
        const primaryRecommendation = topRecommendations[0];

        if (primaryRecommendation.priorityScore > 0) {
            let message;
            if (primaryRecommendation.hasDeficiency) {
                message = `${primaryRecommendation.muscleGroup} needs volume (${primaryRecommendation.daysSinceWorkout} days since last)`;
            } else {
                message = `${primaryRecommendation.muscleGroup} ready (${primaryRecommendation.daysSinceWorkout} days rested)`;
            }
            
            return {
                recommendation: 'ready',
                muscleGroup: primaryRecommendation.muscleGroup,
                message: message,
                status: primaryRecommendation,
                reasoning: this.generateRecommendationReasoning(primaryRecommendation),
                alternatives: topRecommendations.slice(1).map(alt => ({
                    muscleGroup: alt.muscleGroup,
                    daysSince: alt.daysSinceWorkout,
                    hasDeficiency: alt.hasDeficiency
                }))
            };
        }

        // If no good recommendations, find muscle that will be ready soonest
        const sortedByTimeRemaining = enhancedStatuses
            .filter(status => status.timeUntilOptimal > 0)
            .sort((a, b) => a.timeUntilOptimal - b.timeUntilOptimal);

        if (sortedByTimeRemaining.length > 0) {
            const nextReady = sortedByTimeRemaining[0];
            return {
                recommendation: 'wait',
                muscleGroup: nextReady.muscleGroup,
                message: `Next ready: ${nextReady.muscleGroup} in ${nextReady.formattedTimeUntilOptimal}`,
                status: nextReady,
                timeRemaining: nextReady.formattedTimeUntilOptimal
            };
        }

        return {
            recommendation: 'all_ready',
            message: 'All muscle groups appear to be well rested'
        };
    }
    
    // Get volume deficiencies from weekly analysis - integrated with actual analytics
    getVolumeDeficiencies() {
        const deficiencies = {};
        
        // Try to get actual volume data from HyperTrack analytics
        if (window.HyperTrack && window.HyperTrack.state.workouts) {
            try {
                // Use the same logic as the analytics display
                const weeklyVolume = this.calculateCurrentWeeklyVolume(window.HyperTrack.state.workouts);
                const muscleGroupVolumes = this.getWeeklyVolumeWithTargets(weeklyVolume);
                
                Object.entries(muscleGroupVolumes).forEach(([muscleGroup, data]) => {
                    if (data.recommendation.status === 'low' || data.current === 0) {
                        const deficit = data.deficit || (data.mev - data.current);
                        if (deficit > 0) {
                            deficiencies[muscleGroup] = deficit;
                        }
                    }
                });
                
                console.log('📊 Volume deficiencies calculated:', deficiencies);
            } catch (error) {
                console.warn('⚠️ Could not calculate volume deficiencies, using fallback');
                return this.getFallbackDeficiencies();
            }
        }
        
        return deficiencies;
    }
    
    // Get weekly volume with targets (copied from analytics logic)
    getWeeklyVolumeWithTargets(weeklyVolume) {
        const muscleGroupVolumes = {};
        
        // Define MEV (Minimum Effective Volume) and targets for each muscle group
        const muscleGroupMEV = {
            'Horizontal Push': 10, 'Vertical Push': 8, 'Horizontal Pull': 10, 'Vertical Pull': 10,
            'Side Delts': 8, 'Rear Delts': 6, 'Biceps': 8, 'Triceps': 8,
            'Quads': 10, 'Hamstrings': 8, 'Glutes': 8, 'Calves': 6, 'Abs': 8, 'Traps': 6
        };
        
        Object.entries(muscleGroupMEV).forEach(([muscleGroup, mev]) => {
            const current = weeklyVolume[muscleGroup] || 0;
            const deficit = Math.max(0, mev - current);
            
            let status, color;
            if (current === 0) {
                status = 'untrained';
                color = '#be185d';
            } else if (current < mev) {
                status = 'low';
                color = '#f59e0b';
            } else if (current <= mev + 6) {
                status = 'optimal';
                color = '#22c55e';
            } else {
                status = 'high';
                color = '#f59e0b';
            }
            
            muscleGroupVolumes[muscleGroup] = {
                current: current,
                mev: mev,
                deficit: deficit,
                recommendation: {
                    status: status,
                    color: color,
                    message: `${current} sets this week`
                }
            };
        });
        
        return muscleGroupVolumes;
    }
    
    // Fallback deficiencies if analytics calculation fails
    getFallbackDeficiencies() {
        return {
            'Vertical Pull': 5,
            'Horizontal Pull': 4,
            'Side Delts': 3,
            'Quads': 6,
            'Hamstrings': 4
        };
    }
    
    // Calculate current weekly volume
    calculateCurrentWeeklyVolume(workouts) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyVolume = {};
        
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            if (workoutDate >= oneWeekAgo) {
                workout.exercises?.forEach(exercise => {
                    const muscleGroup = exercise.muscle_group;
                    if (muscleGroup) {
                        const sets = exercise.sets?.length || 0;
                        weeklyVolume[muscleGroup] = (weeklyVolume[muscleGroup] || 0) + sets;
                    }
                });
            }
        });
        
        return weeklyVolume;
    }
    
    // Get muscle group minimum targets
    getMuscleGroupTargets() {
        return {
            'Horizontal Push': 10,
            'Vertical Push': 8,
            'Horizontal Pull': 10,
            'Vertical Pull': 10,
            'Side Delts': 8,
            'Rear Delts': 6,
            'Biceps': 8,
            'Triceps': 8,
            'Quads': 10,
            'Hamstrings': 8,
            'Glutes': 8,
            'Calves': 6,
            'Abs': 8,
            'Traps': 6
        };
    }
    
    // Generate reasoning for recommendation
    generateRecommendationReasoning(recommendation) {
        const reasons = [];
        
        if (recommendation.hasDeficiency) {
            reasons.push(`Volume deficit: needs ${recommendation.volumeDeficit} more sets this week`);
        }
        
        if (recommendation.daysSinceWorkout >= 3) {
            reasons.push(`Well rested: ${recommendation.daysSinceWorkout} days since last workout`);
        } else if (recommendation.daysSinceWorkout >= 2) {
            reasons.push(`Adequate rest: ${recommendation.daysSinceWorkout} days recovery`);
        }
        
        if (recommendation.readiness === 'ready') {
            reasons.push('Optimal recovery window');
        }
        
        return reasons.join(' • ');
    }

    // Start real-time updates
    startRealtimeUpdates() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update every minute
        this.updateInterval = setInterval(() => {
            this.updateUI();
        }, 60000); // 60 seconds

        // Initial update
        this.updateUI();
    }

    // Update UI with current timing recommendations
    updateUI() {
        // Update global rest pattern section
        this.updateGlobalRestPattern();
        
        // Update muscle group specific timing
        this.updateMuscleGroupTiming();
        
        // Update next workout recommendation
        this.updateNextWorkoutRecommendation();
    }

    // Update global rest pattern with real-time countdown
    updateGlobalRestPattern() {
        const globalPattern = document.querySelector('.global-rest-pattern');
        if (!globalPattern) return;

        const nextWorkout = this.getNextRecommendedWorkout();
        
        // Add real-time timing info
        let timingHTML = '';
        
        if (nextWorkout.recommendation === 'ready') {
            timingHTML = `
                <div class="timing-recommendation ready" style="margin-top: 12px; padding: 12px; background: #22c55e20; border-radius: 6px; border-left: 3px solid #22c55e;">
                    <div style="font-weight: 600; color: #22c55e; margin-bottom: 4px;">✅ Ready to Train</div>
                    <div style="color: #e2e8f0; font-size: 14px;">${nextWorkout.message}</div>
                    ${nextWorkout.alternatives?.length > 0 ? `
                        <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">
                            Also ready: ${nextWorkout.alternatives.map(alt => alt.muscleGroup).join(', ')}
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (nextWorkout.recommendation === 'wait') {
            timingHTML = `
                <div class="timing-recommendation waiting" style="margin-top: 12px; padding: 12px; background: #f59e0b20; border-radius: 6px; border-left: 3px solid #f59e0b;">
                    <div style="font-weight: 600; color: #f59e0b; margin-bottom: 4px;">⏱️ Rest Period</div>
                    <div style="color: #e2e8f0; font-size: 14px;">${nextWorkout.message}</div>
                    <div class="countdown-timer" style="color: #fbbf24; font-size: 13px; margin-top: 6px; font-family: monospace;">
                        Time remaining: ${nextWorkout.timeRemaining}
                    </div>
                </div>
            `;
        } else if (nextWorkout.recommendation === 'all_ready') {
            timingHTML = `
                <div class="timing-recommendation all-ready" style="margin-top: 12px; padding: 12px; background: #3b82f620; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <div style="font-weight: 600; color: #3b82f6; margin-bottom: 4px;">🎯 All Systems Go</div>
                    <div style="color: #e2e8f0; font-size: 14px;">${nextWorkout.message}</div>
                </div>
            `;
        }

        // Add or update timing section
        const existingTiming = globalPattern.querySelector('.timing-recommendation');
        if (existingTiming) {
            existingTiming.outerHTML = timingHTML;
        } else {
            globalPattern.insertAdjacentHTML('beforeend', timingHTML);
        }
    }

    // Update muscle group specific timing
    updateMuscleGroupTiming() {
        const muscleGroupSection = document.getElementById('muscleGroupFrequencies');
        if (!muscleGroupSection) return;

        const muscleGroupCards = muscleGroupSection.querySelectorAll('.muscle-group-frequency');
        
        muscleGroupCards.forEach(card => {
            const muscleGroupName = card.querySelector('h4')?.textContent;
            if (!muscleGroupName) return;

            const status = this.calculateRestStatus(muscleGroupName);
            if (status.status === 'no_data') return;

            // Add or update timing info
            let existingTiming = card.querySelector('.muscle-timing');
            if (!existingTiming) {
                existingTiming = document.createElement('div');
                existingTiming.className = 'muscle-timing';
                card.querySelector('.mg-details').appendChild(existingTiming);
            }

            existingTiming.innerHTML = `
                <div class="timing-status" style="margin-top: 8px; padding: 8px; background: #0f172a; border-radius: 4px; border-left: 2px solid ${status.color};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="color: ${status.color}; font-weight: 600; font-size: 12px;">${status.message}</span>
                        <span style="color: #94a3b8; font-size: 11px;">${status.percentageRested}% rested</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 11px;">
                        ${status.timeUntilOptimal > 0 ? 
                            `Optimal in: ${status.formattedTimeUntilOptimal}` : 
                            `Rested: ${Math.round(status.hoursRested)}h / ${status.optimalRestHours}h`
                        }
                    </div>
                    ${status.lastWorkoutDate ? `
                        <div style="color: #6b7280; font-size: 10px; margin-top: 2px;">
                            Last: ${this.formatLastWorkoutDate(status.lastWorkoutDate)}
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }

    // Update next workout recommendation in a dedicated section
    updateNextWorkoutRecommendation() {
        // Find or create next workout recommendation section
        let nextWorkoutSection = document.getElementById('nextWorkoutRecommendation');
        
        if (!nextWorkoutSection) {
            // Create section in the AI tab
            const aiContainer = document.querySelector('.intelligence-container');
            if (!aiContainer) return;

            const sectionHTML = `
                <div class="settings-section">
                    <h3>⏰ Next Workout Recommendation</h3>
                    <div id="nextWorkoutRecommendation" class="next-workout-recommendation">
                        <!-- Content will be populated by updateNextWorkoutRecommendation -->
                    </div>
                </div>
            `;

            // Insert before the first settings section
            const firstSection = aiContainer.querySelector('.settings-section');
            if (firstSection) {
                firstSection.insertAdjacentHTML('beforebegin', sectionHTML);
                nextWorkoutSection = document.getElementById('nextWorkoutRecommendation');
            }
        }

        if (!nextWorkoutSection) return;

        const nextWorkout = this.getNextRecommendedWorkout();
        
        nextWorkoutSection.innerHTML = this.renderNextWorkoutRecommendation(nextWorkout);
    }

    // Render next workout recommendation
    renderNextWorkoutRecommendation(nextWorkout) {
        const now = new Date();
        const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
        
        let html = '<div class="next-workout-content">';

        if (nextWorkout.recommendation === 'ready') {
            html += `
                <div class="workout-ready" style="background: #22c55e20; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e;">
                    <div class="recommendation-header" style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="background: #22c55e; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                        </div>
                        <div>
                            <div style="color: #22c55e; font-weight: 600;">Ready to Train</div>
                            <div style="color: #94a3b8; font-size: 12px;">Good ${timeOfDay} for a workout!</div>
                        </div>
                    </div>
                    <div class="primary-recommendation" style="background: #0f172a; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                        <div style="color: #e2e8f0; font-weight: 600; margin-bottom: 4px;">${nextWorkout.muscleGroup}</div>
                        <div style="color: #94a3b8; font-size: 13px;">${nextWorkout.message}</div>
                        <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">
                            ${Math.round(nextWorkout.status.hoursRested)}h rested / ${nextWorkout.status.optimalRestHours}h optimal
                        </div>
                    </div>
                    ${nextWorkout.alternatives?.length > 0 ? `
                        <div class="alternative-recommendations">
                            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px;">Also ready:</div>
                            ${nextWorkout.alternatives.map(alt => `
                                <div style="display: inline-block; background: #374151; color: #d1d5db; padding: 4px 8px; border-radius: 4px; margin: 2px 4px 2px 0; font-size: 11px;">
                                    ${alt.muscleGroup}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (nextWorkout.recommendation === 'wait') {
            html += `
                <div class="workout-wait" style="background: #f59e0b20; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
                    <div class="recommendation-header" style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="background: #f59e0b; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <span style="color: white; font-size: 14px;">⏱</span>
                        </div>
                        <div>
                            <div style="color: #f59e0b; font-weight: 600;">Rest Period</div>
                            <div style="color: #94a3b8; font-size: 12px;">Optimal recovery in progress</div>
                        </div>
                    </div>
                    <div class="next-ready" style="background: #0f172a; border-radius: 6px; padding: 12px;">
                        <div style="color: #e2e8f0; font-weight: 600; margin-bottom: 4px;">Next: ${nextWorkout.muscleGroup}</div>
                        <div style="color: #fbbf24; font-size: 16px; font-family: monospace; margin-bottom: 4px;">${nextWorkout.timeRemaining}</div>
                        <div style="color: #6b7280; font-size: 11px;">
                            ${Math.round(nextWorkout.status.hoursRested)}h / ${nextWorkout.status.optimalRestHours}h optimal rest
                        </div>
                    </div>
                </div>
            `;
        } else if (nextWorkout.recommendation === 'all_ready') {
            html += `
                <div class="workout-all-ready" style="background: #3b82f620; border-radius: 8px; padding: 16px; border-left: 4px solid #3b82f6;">
                    <div class="recommendation-header" style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="background: #3b82f6; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <span style="color: white; font-size: 14px;">🎯</span>
                        </div>
                        <div>
                            <div style="color: #3b82f6; font-weight: 600;">All Systems Go</div>
                            <div style="color: #94a3b8; font-size: 12px;">${nextWorkout.message}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="workout-no-data" style="background: #374151; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="color: #9ca3af; margin-bottom: 8px;">📊</div>
                    <div style="color: #d1d5db;">Complete more workouts to get timing recommendations</div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // Format last workout date
    formatLastWorkoutDate(date) {
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Stop real-time updates
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Get detailed analysis of frequency vs rest conflict
    analyzeFrequencyRestConflict() {
        const conflicts = [];
        
        this.lastWorkouts.forEach((lastWorkout, muscleGroup) => {
            const optimalRestHours = this.optimalRestPeriods.get(muscleGroup) || this.getDefaultRestHours(muscleGroup);
            
            // Calculate frequency based on optimal rest
            const optimalFrequencyFromRest = (7 * 24) / optimalRestHours;
            
            // Get research-based frequency recommendation
            const researchFrequency = this.getResearchFrequency(muscleGroup);
            
            const conflict = Math.abs(optimalFrequencyFromRest - researchFrequency);
            
            if (conflict > 0.5) { // Significant conflict
                conflicts.push({
                    muscleGroup: muscleGroup,
                    optimalRestHours: optimalRestHours,
                    optimalFrequencyFromRest: Math.round(optimalFrequencyFromRest * 10) / 10,
                    researchFrequency: researchFrequency,
                    conflict: Math.round(conflict * 10) / 10,
                    recommendation: this.resolveFrequencyRestConflict(optimalFrequencyFromRest, researchFrequency, muscleGroup)
                });
            }
        });
        
        return conflicts;
    }

    // Get research-based frequency for muscle group
    getResearchFrequency(muscleGroup) {
        const frequencies = {
            'Horizontal Push': 2.5,
            'Vertical Push': 2,
            'Horizontal Pull': 2.5,
            'Vertical Pull': 2.5,
            'Side Delts': 3,
            'Rear Delts': 3,
            'Biceps': 2.5,
            'Triceps': 2.5,
            'Legs': 2.5,
            'Abs': 4
        };
        
        return frequencies[muscleGroup] || 2.5;
    }

    // Resolve frequency vs rest conflict
    resolveFrequencyRestConflict(optimalFrequency, researchFrequency, muscleGroup) {
        if (optimalFrequency < researchFrequency) {
            return `Your performance data suggests you need more rest than research recommendations. Consider ${Math.round(optimalFrequency * 10) / 10}x/week instead of ${researchFrequency}x/week for better results.`;
        } else {
            return `You recover faster than average. You could potentially train ${Math.round(optimalFrequency * 10) / 10}x/week vs the standard ${researchFrequency}x/week recommendation.`;
        }
    }
}

// Export for use in main app
window.WorkoutTimingAdvisor = WorkoutTimingAdvisor;
console.log('✅ Workout Timing Advisor loaded');