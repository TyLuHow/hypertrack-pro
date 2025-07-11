// Progressive Overload and Training Recommendations API
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query, body } = req;
  const { user_id, type, exercise_id, timeframe = '30' } = query;

  try {
    switch (method) {
      case 'GET':
        switch (type) {
          case 'workout':
            return handleGetWorkoutRecommendations(res, { user_id, timeframe });
          case 'exercise':
            return handleGetExerciseRecommendations(res, { user_id, exercise_id, timeframe });
          case 'progression':
            return handleGetProgressionRecommendations(res, { user_id, timeframe });
          case 'recovery':
            return handleGetRecoveryRecommendations(res, { user_id, timeframe });
          default:
            return handleGetAllRecommendations(res, { user_id, timeframe });
        }
      case 'POST':
        return handleCreateCustomRecommendation(res, body);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetWorkoutRecommendations(res, { user_id, timeframe }) {
  try {
    // Get recent workouts
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', getDateDaysAgo(parseInt(timeframe)))
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const recommendations = generateWorkoutRecommendations(workouts);

    return res.status(200).json({
      type: 'workout',
      recommendations,
      metadata: {
        user_id,
        timeframe: `${timeframe} days`,
        workoutCount: workouts.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetExerciseRecommendations(res, { user_id, exercise_id, timeframe }) {
  try {
    // Get workouts containing the specific exercise
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', getDateDaysAgo(parseInt(timeframe)))
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter workouts that contain the specified exercise
    const relevantWorkouts = workouts.filter(workout => 
      workout.exercises && workout.exercises.some(ex => ex.id == exercise_id || ex.name === exercise_id)
    );

    const recommendations = generateExerciseSpecificRecommendations(relevantWorkouts, exercise_id);

    return res.status(200).json({
      type: 'exercise',
      exercise_id,
      recommendations,
      metadata: {
        user_id,
        timeframe: `${timeframe} days`,
        relevantWorkouts: relevantWorkouts.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetProgressionRecommendations(res, { user_id, timeframe }) {
  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', getDateDaysAgo(parseInt(timeframe)))
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const recommendations = generateProgressionRecommendations(workouts);

    return res.status(200).json({
      type: 'progression',
      recommendations,
      metadata: {
        user_id,
        timeframe: `${timeframe} days`,
        workoutCount: workouts.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetRecoveryRecommendations(res, { user_id, timeframe }) {
  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', getDateDaysAgo(parseInt(timeframe)))
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const recommendations = generateRecoveryRecommendations(workouts);

    return res.status(200).json({
      type: 'recovery',
      recommendations,
      metadata: {
        user_id,
        timeframe: `${timeframe} days`,
        workoutCount: workouts.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetAllRecommendations(res, { user_id, timeframe }) {
  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', getDateDaysAgo(parseInt(timeframe)))
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const allRecommendations = {
      workout: generateWorkoutRecommendations(workouts),
      progression: generateProgressionRecommendations(workouts),
      recovery: generateRecoveryRecommendations(workouts),
      general: generateGeneralRecommendations(workouts)
    };

    return res.status(200).json({
      type: 'comprehensive',
      recommendations: allRecommendations,
      metadata: {
        user_id,
        timeframe: `${timeframe} days`,
        workoutCount: workouts.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleCreateCustomRecommendation(res, body) {
  try {
    const { user_id, type, content, priority = 'medium', expires_at } = body;

    if (!user_id || !type || !content) {
      return res.status(400).json({ error: 'user_id, type, and content are required' });
    }

    const recommendation = {
      id: generateRecommendationId(),
      user_id,
      type,
      content,
      priority,
      created_at: new Date().toISOString(),
      expires_at: expires_at || getDateDaysFromNow(7),
      custom: true
    };

    // Store in database (assuming we have a recommendations table)
    const { data, error } = await supabase
      .from('user_recommendations')
      .insert([recommendation])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      recommendation: data[0],
      message: 'Custom recommendation created successfully'
    });
  } catch (error) {
    throw error;
  }
}

function generateWorkoutRecommendations(workouts) {
  const recommendations = [];

  if (workouts.length === 0) {
    return [{
      priority: 'high',
      type: 'getting_started',
      title: 'Start Your Fitness Journey',
      description: 'Begin with 2-3 workouts per week focusing on compound movements',
      actionItems: [
        'Schedule your first workout session',
        'Learn proper form for basic exercises',
        'Set realistic weekly goals'
      ]
    }];
  }

  // Analyze workout frequency
  const daysWithWorkouts = new Set(workouts.map(w => w.date)).size;
  const avgWeeklyFrequency = (daysWithWorkouts / (workouts.length > 0 ? 4 : 1)) * 7; // Rough estimate

  if (avgWeeklyFrequency < 2) {
    recommendations.push({
      priority: 'high',
      type: 'frequency',
      title: 'Increase Workout Frequency',
      description: 'Aim for at least 3 workouts per week for optimal muscle growth',
      actionItems: [
        'Schedule additional workout sessions',
        'Consider shorter but more frequent sessions',
        'Set weekly workout reminders'
      ]
    });
  }

  // Analyze muscle group balance
  const muscleGroupCount = analyzeMuscleGroupDistribution(workouts);
  const imbalances = identifyMuscleGroupImbalances(muscleGroupCount);

  if (imbalances.length > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'balance',
      title: 'Address Muscle Group Imbalances',
      description: `Focus more on: ${imbalances.join(', ')}`,
      actionItems: imbalances.map(mg => `Add more ${mg} exercises to your routine`)
    });
  }

  // Analyze workout split effectiveness
  const splitAnalysis = analyzeSplitEffectiveness(workouts);
  if (splitAnalysis.recommendation) {
    recommendations.push(splitAnalysis.recommendation);
  }

  return recommendations;
}

function generateExerciseSpecificRecommendations(workouts, exercise_id) {
  const recommendations = [];
  
  if (workouts.length === 0) {
    return [{
      priority: 'medium',
      type: 'exercise_start',
      title: 'Begin Tracking This Exercise',
      description: 'Start with a weight that allows 8-12 clean repetitions',
      actionItems: [
        'Focus on proper form over heavy weight',
        'Record your starting weights and reps',
        'Plan progressive increases'
      ]
    }];
  }

  // Analyze progression for this specific exercise
  const exerciseHistory = extractExerciseHistory(workouts, exercise_id);
  const progressionAnalysis = analyzeExerciseProgression(exerciseHistory);

  if (progressionAnalysis.stagnant) {
    recommendations.push({
      priority: 'high',
      type: 'progression',
      title: 'Break Through Plateau',
      description: `Your ${exercise_id} progress has stalled. Try these strategies.`,
      actionItems: [
        'Reduce weight by 10% and focus on form',
        'Change rep ranges (try 6-8 or 12-15)',
        'Add pause reps or tempo variations',
        'Ensure adequate rest between sessions'
      ]
    });
  }

  if (progressionAnalysis.tooFast) {
    recommendations.push({
      priority: 'medium',
      type: 'safety',
      title: 'Slow Down Progression',
      description: 'Your weight increases may be too aggressive',
      actionItems: [
        'Increase weight by smaller increments',
        'Focus on movement quality',
        'Ensure you can complete all sets with good form'
      ]
    });
  }

  return recommendations;
}

function generateProgressionRecommendations(workouts) {
  const recommendations = [];

  // Analyze overall volume progression
  const volumeProgression = analyzeVolumeProgression(workouts);
  
  if (volumeProgression.trend === 'decreasing') {
    recommendations.push({
      priority: 'high',
      type: 'volume',
      title: 'Increase Training Volume',
      description: 'Your overall training volume has been decreasing',
      actionItems: [
        'Add an extra set to your main exercises',
        'Include more exercises per session',
        'Increase workout frequency if possible'
      ]
    });
  }

  // Analyze strength progression
  const strengthProgression = analyzeStrengthProgression(workouts);
  
  if (strengthProgression.needsDeload) {
    recommendations.push({
      priority: 'high',
      type: 'deload',
      title: 'Plan a Deload Week',
      description: 'Your body may benefit from reduced intensity',
      actionItems: [
        'Reduce weights by 40-50% for one week',
        'Focus on movement quality and recovery',
        'Maintain workout frequency but reduce volume'
      ]
    });
  }

  return recommendations;
}

function generateRecoveryRecommendations(workouts) {
  const recommendations = [];

  // Analyze workout frequency and rest days
  const recoveryAnalysis = analyzeRecoveryPatterns(workouts);

  if (recoveryAnalysis.insufficientRest) {
    recommendations.push({
      priority: 'high',
      type: 'recovery',
      title: 'Increase Rest Between Workouts',
      description: 'You may not be allowing adequate recovery time',
      actionItems: [
        'Ensure at least 48 hours between training same muscle groups',
        'Include 1-2 complete rest days per week',
        'Consider active recovery activities'
      ]
    });
  }

  if (recoveryAnalysis.excessiveRest) {
    recommendations.push({
      priority: 'medium',
      type: 'frequency',
      title: 'Reduce Rest Periods',
      description: 'Your rest periods may be longer than necessary',
      actionItems: [
        'Increase workout frequency gradually',
        'Consider adding light movement on rest days',
        'Monitor how you feel with increased activity'
      ]
    });
  }

  return recommendations;
}

function generateGeneralRecommendations(workouts) {
  const recommendations = [];

  // Always include some general guidance
  recommendations.push({
    priority: 'low',
    type: 'general',
    title: 'Consistency is Key',
    description: 'Focus on consistent training over perfect programming',
    actionItems: [
      'Stick to your workout schedule',
      'Track your progress regularly',
      'Celebrate small improvements'
    ]
  });

  if (workouts.length > 10) {
    recommendations.push({
      priority: 'low',
      type: 'analysis',
      title: 'Review Your Progress',
      description: 'Take time to analyze your training patterns',
      actionItems: [
        'Look for trends in your performance',
        'Identify what has worked well',
        'Consider adjusting exercises that haven\'t progressed'
      ]
    }
    );
  }

  return recommendations;
}

// Helper functions for analysis

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function getDateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function generateRecommendationId() {
  return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function analyzeMuscleGroupDistribution(workouts) {
  const muscleGroups = {};
  
  workouts.forEach(workout => {
    if (workout.exercises) {
      workout.exercises.forEach(exercise => {
        if (exercise.muscle_group) {
          muscleGroups[exercise.muscle_group] = (muscleGroups[exercise.muscle_group] || 0) + 1;
        }
      });
    }
  });

  return muscleGroups;
}

function identifyMuscleGroupImbalances(muscleGroupCount) {
  const total = Object.values(muscleGroupCount).reduce((sum, count) => sum + count, 0);
  const imbalances = [];

  // Define minimum percentages for major muscle groups
  const minPercentages = {
    'Legs': 0.20,
    'Back': 0.15,
    'Chest': 0.15,
    'Shoulders': 0.10
  };

  Object.entries(minPercentages).forEach(([muscleGroup, minPercent]) => {
    const actualPercent = (muscleGroupCount[muscleGroup] || 0) / total;
    if (actualPercent < minPercent) {
      imbalances.push(muscleGroup);
    }
  });

  return imbalances;
}

function analyzeSplitEffectiveness(workouts) {
  const splitCounts = {};
  workouts.forEach(workout => {
    splitCounts[workout.split] = (splitCounts[workout.split] || 0) + 1;
  });

  // Simple analysis - could be much more sophisticated
  const totalWorkouts = workouts.length;
  const splitVariety = Object.keys(splitCounts).length;

  if (splitVariety === 1 && totalWorkouts > 10) {
    return {
      recommendation: {
        priority: 'medium',
        type: 'variety',
        title: 'Add Training Variety',
        description: 'Consider incorporating different workout splits for better development',
        actionItems: [
          'Try alternating between different muscle groups',
          'Experiment with upper/lower or push/pull/legs splits',
          'Include some full-body workouts'
        ]
      }
    };
  }

  return { recommendation: null };
}

function extractExerciseHistory(workouts, exercise_id) {
  const history = [];
  
  workouts.forEach(workout => {
    if (workout.exercises) {
      const exercise = workout.exercises.find(ex => ex.id == exercise_id || ex.name === exercise_id);
      if (exercise) {
        history.push({
          date: workout.date,
          exercise: exercise
        });
      }
    }
  });

  return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function analyzeExerciseProgression(history) {
  if (history.length < 3) {
    return { stagnant: false, tooFast: false };
  }

  // Analyze weight progression
  const weights = history.map(h => {
    if (h.exercise.sets && h.exercise.sets.length > 0) {
      return Math.max(...h.exercise.sets.map(set => set.weight || 0));
    }
    return 0;
  });

  // Check for stagnation (no progress in last 3 sessions)
  const recent = weights.slice(-3);
  const stagnant = recent.every(weight => weight === recent[0]);

  // Check for too rapid progression (>20% increase between sessions)
  let tooFast = false;
  for (let i = 1; i < weights.length; i++) {
    if (weights[i] > weights[i-1] * 1.2) {
      tooFast = true;
      break;
    }
  }

  return { stagnant, tooFast };
}

function analyzeVolumeProgression(workouts) {
  // Calculate volume for each workout
  const volumes = workouts.map(workout => {
    let totalVolume = 0;
    if (workout.exercises) {
      workout.exercises.forEach(exercise => {
        if (exercise.sets) {
          exercise.sets.forEach(set => {
            if (set.weight && set.reps) {
              totalVolume += set.weight * set.reps;
            }
          });
        }
      });
    }
    return totalVolume;
  });

  // Analyze trend
  if (volumes.length < 3) return { trend: 'insufficient_data' };

  const recent = volumes.slice(0, Math.ceil(volumes.length / 2));
  const older = volumes.slice(Math.ceil(volumes.length / 2));

  const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
  const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;

  if (recentAvg > olderAvg * 1.1) return { trend: 'increasing' };
  if (recentAvg < olderAvg * 0.9) return { trend: 'decreasing' };
  return { trend: 'stable' };
}

function analyzeStrengthProgression(workouts) {
  // This is a simplified analysis
  // In reality, you'd want more sophisticated plateau detection
  
  const recentWorkouts = workouts.slice(0, 6);
  if (recentWorkouts.length < 6) return { needsDeload: false };

  // Simple heuristic: if volume has been high and consistent for 6+ weeks
  const volumes = recentWorkouts.map(w => calculateWorkoutVolume(w));
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const consistency = volumes.every(v => Math.abs(v - avgVolume) / avgVolume < 0.2);

  return { needsDeload: consistency && avgVolume > 10000 }; // Arbitrary threshold
}

function analyzeRecoveryPatterns(workouts) {
  if (workouts.length < 4) return { insufficientRest: false, excessiveRest: false };

  const workoutDates = workouts.map(w => new Date(w.date)).sort((a, b) => a - b);
  const daysBetween = [];

  for (let i = 1; i < workoutDates.length; i++) {
    const diff = (workoutDates[i] - workoutDates[i-1]) / (1000 * 60 * 60 * 24);
    daysBetween.push(diff);
  }

  const avgDaysBetween = daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length;

  return {
    insufficientRest: avgDaysBetween < 1,
    excessiveRest: avgDaysBetween > 4
  };
}

function calculateWorkoutVolume(workout) {
  let volume = 0;
  if (workout.exercises) {
    workout.exercises.forEach(exercise => {
      if (exercise.sets) {
        exercise.sets.forEach(set => {
          if (set.weight && set.reps) {
            volume += set.weight * set.reps;
          }
        });
      }
    });
  }
  return volume;
}