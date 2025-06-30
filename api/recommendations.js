// /api/recommendations.js - Vercel Serverless Function
// Provides progressive overload and training recommendations

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { exercise, userId } = req.query;
      
      if (!exercise) {
        return res.status(400).json({
          error: 'Exercise name required'
        });
      }
      
      // Evidence-based default recommendations
      const exerciseDefaults = {
        // Compound exercises - heavier weights, lower reps
        'Barbell Bench Press': { weight: 135, reps: 8, sets: 3, restTime: 180 },
        'Back Squats': { weight: 155, reps: 8, sets: 3, restTime: 180 },
        'Conventional Deadlifts': { weight: 185, reps: 6, sets: 3, restTime: 240 },
        'Pull-ups': { weight: 0, reps: 8, sets: 3, restTime: 180 },
        'Overhead Press': { weight: 95, reps: 8, sets: 3, restTime: 180 },
        'Barbell Rows': { weight: 115, reps: 8, sets: 3, restTime: 180 },
        'Romanian Deadlifts': { weight: 135, reps: 10, sets: 3, restTime: 150 },
        'Close-Grip Bench Press': { weight: 115, reps: 10, sets: 3, restTime: 150 },
        'Front Squats': { weight: 115, reps: 10, sets: 3, restTime: 180 },
        'Incline Dumbbell Press': { weight: 60, reps: 10, sets: 3, restTime: 150 },
        'Dips': { weight: 0, reps: 10, sets: 3, restTime: 150 },
        'Leg Press': { weight: 270, reps: 12, sets: 3, restTime: 120 },
        'Lat Pulldowns': { weight: 120, reps: 10, sets: 3, restTime: 120 },
        'T-Bar Rows': { weight: 90, reps: 10, sets: 3, restTime: 150 },
        'Hip Thrusts': { weight: 155, reps: 12, sets: 3, restTime: 120 },
        'Walking Lunges': { weight: 40, reps: 12, sets: 3, restTime: 90 },
        'Bulgarian Split Squats': { weight: 30, reps: 12, sets: 3, restTime: 90 },
        'Seated Shoulder Press': { weight: 70, reps: 10, sets: 3, restTime: 120 },
        'Arnold Press': { weight: 35, reps: 12, sets: 3, restTime: 90 },
        'Tricep Dips': { weight: 0, reps: 12, sets: 3, restTime: 90 },
        'Preacher Curls': { weight: 60, reps: 10, sets: 3, restTime: 90 },
        
        // Isolation exercises - moderate weights, higher reps
        'Barbell Curls': { weight: 65, reps: 12, sets: 3, restTime: 90 },
        'Hammer Curls': { weight: 30, reps: 12, sets: 3, restTime: 90 },
        'Lateral Raises': { weight: 20, reps: 15, sets: 3, restTime: 60 },
        'Rear Delt Flyes': { weight: 15, reps: 15, sets: 3, restTime: 60 },
        'Leg Curls': { weight: 90, reps: 12, sets: 3, restTime: 90 },
        'Cable Flyes': { weight: 40, reps: 12, sets: 3, restTime: 90 },
        'Face Pulls': { weight: 50, reps: 15, sets: 3, restTime: 60 },
        'Cable Rows': { weight: 100, reps: 12, sets: 3, restTime: 90 },
        'Cable Tricep Pushdowns': { weight: 70, reps: 12, sets: 3, restTime: 90 },
        'Cable Curls': { weight: 60, reps: 12, sets: 3, restTime: 90 },
        'Overhead Tricep Extension': { weight: 40, reps: 12, sets: 3, restTime: 90 },
        'Planks': { weight: 0, reps: 45, sets: 3, restTime: 60 }, // seconds
        'Dead Bugs': { weight: 0, reps: 10, sets: 3, restTime: 45 },
        'Pallof Press': { weight: 30, reps: 12, sets: 3, restTime: 60 }
      };
      
      const defaultRec = exerciseDefaults[exercise] || { 
        weight: 45, 
        reps: 10, 
        sets: 3, 
        restTime: 90 
      };
      
      // In production, we'd query database for user's workout history
      // and apply progressive overload (3.5% weekly increase)
      
      // Build comprehensive recommendation
      const recommendation = {
        weight: defaultRec.weight,
        reps: defaultRec.reps,
        sets: defaultRec.sets,
        restTime: defaultRec.restTime,
        progression: {
          type: "progressive_overload",
          rate: 3.5, // 3.5% weekly increase
          metric: "weight",
          notes: "Increase weight by 3.5% when you can complete all sets with 1-2 reps in reserve"
        },
        volume: {
          setsPerWeek: getRecommendedWeeklyVolume(exercise),
          frequency: getRecommendedFrequency(exercise)
        },
        technique: {
          tempo: getTempo(exercise),
          rom: "Full range of motion",
          breathing: "Exhale on exertion, inhale on eccentric"
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Add exercise-specific notes
      const notes = getExerciseNotes(exercise);
      if (notes.length > 0) {
        recommendation.notes = notes;
      }
      
      res.status(200).json({ 
        recommendation,
        exerciseName: exercise,
        source: "Evidence-based recommendations from 2015-2025 research"
      });
      
    } catch (error) {
      console.error('Recommendations error:', error);
      res.status(500).json({
        error: 'Failed to generate recommendations',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// Helper functions for recommendations

function getRecommendedWeeklyVolume(exercise) {
  // Based on research: 6-20 sets per muscle per week
  const volumeMap = {
    'Chest': '10-16 sets per week',
    'Back': '12-20 sets per week', 
    'Legs': '14-20 sets per week',
    'Shoulders': '8-16 sets per week',
    'Biceps': '6-12 sets per week',
    'Triceps': '8-14 sets per week',
    'Core': '6-12 sets per week'
  };
  
  // Determine muscle group from exercise name
  if (exercise.includes('Bench') || exercise.includes('Flyes') || exercise.includes('Dips') && exercise.includes('Chest')) {
    return volumeMap['Chest'];
  } else if (exercise.includes('Pull') || exercise.includes('Row') || exercise.includes('Face')) {
    return volumeMap['Back'];
  } else if (exercise.includes('Squat') || exercise.includes('Deadlift') || exercise.includes('Leg') || exercise.includes('Lunge')) {
    return volumeMap['Legs'];
  } else if (exercise.includes('Press') && !exercise.includes('Bench') || exercise.includes('Raise') || exercise.includes('Delt')) {
    return volumeMap['Shoulders'];
  } else if (exercise.includes('Curl')) {
    return volumeMap['Biceps'];
  } else if (exercise.includes('Tricep') || exercise.includes('Pushdown') || exercise.includes('Extension')) {
    return volumeMap['Triceps'];
  } else if (exercise.includes('Plank') || exercise.includes('Dead Bug') || exercise.includes('Pallof')) {
    return volumeMap['Core'];
  }
  
  return '8-16 sets per week';
}

function getRecommendedFrequency(exercise) {
  // Research shows 2x per week optimal for most muscle groups
  return '2x per week minimum for optimal protein synthesis';
}

function getTempo(exercise) {
  // Evidence-based tempo recommendations
  const isCompound = exercise.includes('Squat') || exercise.includes('Deadlift') || 
                     exercise.includes('Bench') || exercise.includes('Press') || 
                     exercise.includes('Pull') || exercise.includes('Row');
  
  if (isCompound) {
    return '2-1-X-1 (2s eccentric, 1s pause, explosive concentric, 1s top)';
  } else {
    return '3-1-2-1 (3s eccentric, 1s pause, 2s concentric, 1s top)';
  }
}

function getExerciseNotes(exercise) {
  const notesMap = {
    'Pull-ups': [
      'Highest lat activation (117% MVC) among all back exercises',
      'Wide grip emphasizes lats, narrow grip includes rhomboids',
      'Progress: assisted → bodyweight → weighted'
    ],
    'Barbell Bench Press': [
      'Gold standard for chest development (95% MVC)',
      'Retract shoulder blades and maintain arch',
      'Touch chest lightly, don\'t bounce'
    ],
    'Back Squats': [
      'King of exercises - targets entire lower body',
      'High bar for quads, low bar for glutes/hamstrings',
      'Descend to hip crease below knee cap'
    ],
    'Romanian Deadlifts': [
      'Superior hamstring activation vs conventional deadlifts',
      'Focus on hip hinge pattern, not knee bend',
      'Feel stretch in hamstrings at bottom'
    ],
    'Lateral Raises': [
      'Essential for shoulder width development',
      'Control tempo, avoid swinging momentum',
      'Lead with pinkies to maximize medial delt activation'
    ],
    'Face Pulls': [
      'Critical for rear delt and posture health',
      'Pull to upper chest/face level',
      'Essential counter to pressing movements'
    ]
  };
  
  return notesMap[exercise] || [];
}