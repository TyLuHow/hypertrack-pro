// Complete Workout Management API with analytics and recommendations
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query, body } = req;
  const { user_id, date_from, date_to, split, limit = 50, analytics = false } = query;

  try {
    switch (method) {
      case 'GET':
        if (analytics === 'true') {
          return handleGetWorkoutAnalytics(res, { user_id, date_from, date_to });
        }
        return handleGetWorkouts(res, { user_id, date_from, date_to, split, limit });
      case 'POST':
        return handleCreateWorkout(res, body);
      case 'PUT':
        return handleUpdateWorkout(res, query.id, body);
      case 'DELETE':
        return handleDeleteWorkout(res, query.id);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetWorkouts(res, filters) {
  try {
    let query = supabase.from('workouts').select('*');

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }
    if (filters.split) {
      query = query.eq('split', filters.split);
    }

    query = query.order('date', { ascending: false }).limit(parseInt(filters.limit));
    
    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calculate basic metrics for each workout
    const workoutsWithMetrics = data.map(workout => ({
      ...workout,
      metrics: calculateWorkoutMetrics(workout)
    }));

    return res.status(200).json({
      workouts: workoutsWithMetrics,
      count: data.length,
      filters: filters
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetWorkoutAnalytics(res, filters) {
  try {
    let query = supabase.from('workouts').select('*');

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const analytics = generateWorkoutAnalytics(data);

    return res.status(200).json({
      analytics,
      workoutCount: data.length,
      dateRange: {
        from: filters.date_from,
        to: filters.date_to
      }
    });
  } catch (error) {
    throw error;
  }
}

async function handleCreateWorkout(res, workoutData) {
  try {
    // Validate and format workout data
    // Map client payload into actual DB columns
    const formattedWorkout = {
      user_id: workoutData.user_id || null,
      workout_date: workoutData.date,
      start_time: workoutData.start_time || workoutData.startTime,
      end_time: workoutData.end_time || workoutData.endTime || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('workouts')
      .insert([formattedWorkout])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate recommendations for next workout
    const recommendations = await generateNextWorkoutRecommendations({ ...formattedWorkout, user_id: formattedWorkout.user_id });

    return res.status(201).json({ 
      workout: data[0],
      recommendations
    });
  } catch (error) {
    throw error;
  }
}

async function handleUpdateWorkout(res, id, updates) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    return res.status(200).json({ workout: data[0] });
  } catch (error) {
    throw error;
  }
}

async function handleDeleteWorkout(res, id) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    return res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    throw error;
  }
}

function calculateWorkoutMetrics(workout) {
  if (!workout.exercises || workout.exercises.length === 0) {
    return {
      totalVolume: 0,
      totalSets: 0,
      avgWeight: 0,
      duration: 0,
      exerciseCount: 0
    };
  }

  let totalVolume = 0;
  let totalSets = 0;
  let totalWeight = 0;
  let weightCount = 0;

  workout.exercises.forEach(exercise => {
    if (exercise.sets && Array.isArray(exercise.sets)) {
      exercise.sets.forEach(set => {
        totalSets++;
        if (set.weight && set.reps) {
          const setVolume = set.weight * set.reps;
          totalVolume += setVolume;
          totalWeight += set.weight;
          weightCount++;
        }
      });
    }
  });

  const startTime = workout.start_time ? new Date(workout.start_time) : null;
  const endTime = workout.end_time ? new Date(workout.end_time) : null;
  const duration = startTime && endTime ? (endTime - startTime) / (1000 * 60) : 0; // minutes

  return {
    totalVolume: Math.round(totalVolume),
    totalSets,
    avgWeight: weightCount > 0 ? Math.round(totalWeight / weightCount * 10) / 10 : 0,
    duration: Math.round(duration),
    exerciseCount: workout.exercises.length
  };
}

function generateWorkoutAnalytics(workouts) {
  if (workouts.length === 0) {
    return {
      summary: {
        totalWorkouts: 0,
        totalVolume: 0,
        avgWorkoutDuration: 0,
        avgWeeklyFrequency: 0
      },
      trends: {},
      muscleGroupDistribution: {},
      recommendations: []
    };
  }

  // Calculate summary metrics
  const totalWorkouts = workouts.length;
  let totalVolume = 0;
  let totalDuration = 0;
  const muscleGroups = {};
  const splitDistribution = {};
  const weeklyVolumes = {};

  workouts.forEach(workout => {
    const metrics = calculateWorkoutMetrics(workout);
    totalVolume += metrics.totalVolume;
    totalDuration += metrics.duration;

    // Split distribution
    splitDistribution[workout.split] = (splitDistribution[workout.split] || 0) + 1;

    // Weekly volume tracking
    const weekKey = getWeekKey(workout.date);
    weeklyVolumes[weekKey] = (weeklyVolumes[weekKey] || 0) + metrics.totalVolume;

    // Muscle group distribution
    if (workout.exercises) {
      workout.exercises.forEach(exercise => {
        if (exercise.muscle_group) {
          muscleGroups[exercise.muscle_group] = (muscleGroups[exercise.muscle_group] || 0) + 1;
        }
      });
    }
  });

  // Calculate trends
  const volumeTrend = calculateVolumeTrend(weeklyVolumes);
  const frequencyTrend = calculateFrequencyTrend(workouts);

  return {
    summary: {
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      avgWorkoutDuration: Math.round(totalDuration / totalWorkouts),
      avgWeeklyFrequency: calculateAvgWeeklyFrequency(workouts)
    },
    trends: {
      volume: volumeTrend,
      frequency: frequencyTrend
    },
    muscleGroupDistribution: muscleGroups,
    splitDistribution,
    recommendations: generateTrainingRecommendations(workouts)
  };
}

async function generateNextWorkoutRecommendations(currentWorkout) {
  try {
    // Get user's recent workouts to analyze patterns
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', currentWorkout.user_id)
      .order('date', { ascending: false })
      .limit(10);

    if (!recentWorkouts || recentWorkouts.length < 2) {
      return getDefaultRecommendations();
    }

    return analyzeAndRecommend(recentWorkouts, currentWorkout);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getDefaultRecommendations();
  }
}

function getDefaultRecommendations() {
  return {
    nextSplit: 'Push',
    restDays: 1,
    focusAreas: ['Progressive overload', 'Form consistency'],
    exercises: []
  };
}

function analyzeAndRecommend(workouts, currentWorkout) {
  // Analyze workout patterns and generate intelligent recommendations
  const splitPattern = analyzeSplitPattern(workouts);
  const volumeProgression = analyzeVolumeProgression(workouts);
  
  return {
    nextSplit: predictNextSplit(splitPattern, currentWorkout.split),
    restDays: recommendRestDays(workouts),
    focusAreas: identifyFocusAreas(volumeProgression),
    exercises: recommendExercises(currentWorkout),
    progressionNotes: generateProgressionNotes(volumeProgression)
  };
}

function generateWorkoutId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getWeekKey(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

function calculateVolumeTrend(weeklyVolumes) {
  const weeks = Object.keys(weeklyVolumes).sort();
  if (weeks.length < 2) return 'insufficient_data';
  
  const recent = weeklyVolumes[weeks[weeks.length - 1]];
  const previous = weeklyVolumes[weeks[weeks.length - 2]];
  
  if (recent > previous * 1.1) return 'increasing';
  if (recent < previous * 0.9) return 'decreasing';
  return 'stable';
}

function calculateFrequencyTrend(workouts) {
  if (workouts.length < 4) return 'insufficient_data';
  
  const recent = workouts.slice(0, Math.floor(workouts.length / 2));
  const older = workouts.slice(Math.floor(workouts.length / 2));
  
  const recentFreq = recent.length;
  const olderFreq = older.length;
  
  if (recentFreq > olderFreq) return 'increasing';
  if (recentFreq < olderFreq) return 'decreasing';
  return 'stable';
}

function calculateAvgWeeklyFrequency(workouts) {
  if (workouts.length === 0) return 0;
  
  const oldestDate = new Date(workouts[workouts.length - 1].date);
  const newestDate = new Date(workouts[0].date);
  const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
  const weeks = daysDiff / 7;
  
  return Math.round((workouts.length / Math.max(weeks, 1)) * 10) / 10;
}

function generateTrainingRecommendations(workouts) {
  const recommendations = [];
  
  // Add specific recommendations based on analysis
  const analytics = generateWorkoutAnalytics(workouts);
  
  if (analytics.trends.volume === 'decreasing') {
    recommendations.push('Consider increasing training volume gradually');
  }
  
  if (analytics.summary.avgWeeklyFrequency < 3) {
    recommendations.push('Aim for 3-4 training sessions per week for optimal results');
  }
  
  return recommendations;
}

function analyzeSplitPattern(workouts) {
  return workouts.map(w => w.split);
}

function predictNextSplit(pattern, currentSplit) {
  const commonRotations = {
    'Push': 'Pull',
    'Pull': 'Legs',
    'Legs': 'Push'
  };
  
  return commonRotations[currentSplit] || 'Push';
}

function recommendRestDays(workouts) {
  return 1; // Default recommendation
}

function identifyFocusAreas(progression) {
  return ['Progressive overload', 'Form consistency'];
}

function recommendExercises(workout) {
  return []; // Placeholder for exercise recommendations
}

function generateProgressionNotes(progression) {
  return 'Continue with current progression pattern';
}