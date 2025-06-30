// /api/workouts.js - Vercel Serverless Function  
// Handles workout CRUD operations

// In-memory storage for development
// In production, this would connect to Supabase PostgreSQL
let workouts = [];

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
      const { userId } = req.query;
      
      // Filter by user if provided
      let filteredWorkouts = workouts;
      if (userId) {
        filteredWorkouts = workouts.filter(w => w.userId === userId);
      }
      
      // Sort by date (newest first)
      filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.status(200).json({ 
        workouts: filteredWorkouts,
        metadata: {
          total: filteredWorkouts.length,
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        }
      });
    } catch (error) {
      console.error('Workout fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch workouts',
        details: error.message 
      });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const workoutData = req.body;
      
      // Validate required fields
      if (!workoutData.date || !workoutData.exercises) {
        return res.status(400).json({
          error: 'Missing required fields: date, exercises'
        });
      }
      
      if (!Array.isArray(workoutData.exercises)) {
        return res.status(400).json({
          error: 'Exercises must be an array'
        });
      }
      
      // Process workout data
      const processedWorkout = {
        id: workoutData.id || Date.now(),
        userId: workoutData.userId || 'default-user',
        date: workoutData.date,
        startTime: workoutData.startTime || new Date().toISOString(),
        endTime: workoutData.endTime || new Date().toISOString(),
        exercises: workoutData.exercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Calculate derived metrics
      processedWorkout.totalSets = workoutData.exercises.reduce((total, ex) => {
        return total + (ex.sets ? ex.sets.length : 0);
      }, 0);
      
      processedWorkout.totalVolume = workoutData.exercises.reduce((total, ex) => {
        if (!ex.sets) return total;
        return total + ex.sets.reduce((setTotal, set) => {
          return setTotal + ((set.weight || 0) * (set.reps || 0));
        }, 0);
      }, 0);
      
      processedWorkout.duration = processedWorkout.endTime && processedWorkout.startTime ? 
        new Date(processedWorkout.endTime) - new Date(processedWorkout.startTime) : 0;
      
      // Add to storage
      workouts.push(processedWorkout);
      
      res.status(201).json({ 
        success: true, 
        workout: processedWorkout,
        message: 'Workout saved successfully'
      });
      
      console.log(`✅ Workout saved: ${processedWorkout.exercises.length} exercises, ${processedWorkout.totalSets} sets`);
      
    } catch (error) {
      console.error('Workout save error:', error);
      res.status(500).json({
        error: 'Failed to save workout',
        details: error.message
      });
    }
  }
  
  else if (req.method === 'PUT') {
    try {
      const workoutData = req.body;
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Workout ID required for update'
        });
      }
      
      const index = workouts.findIndex(w => w.id === parseInt(id));
      
      if (index === -1) {
        return res.status(404).json({
          error: 'Workout not found'
        });
      }
      
      // Update workout
      workouts[index] = {
        ...workouts[index],
        ...workoutData,
        id: parseInt(id),
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({ 
        success: true,
        workout: workouts[index],
        message: 'Workout updated successfully'
      });
      
    } catch (error) {
      console.error('Workout update error:', error);
      res.status(500).json({
        error: 'Failed to update workout',
        details: error.message
      });
    }
  }
  
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Workout ID required for deletion'
        });
      }
      
      const index = workouts.findIndex(w => w.id === parseInt(id));
      
      if (index === -1) {
        return res.status(404).json({
          error: 'Workout not found'
        });
      }
      
      // Remove workout
      const deletedWorkout = workouts.splice(index, 1)[0];
      
      res.status(200).json({ 
        success: true,
        workout: deletedWorkout,
        message: 'Workout deleted successfully'
      });
      
    } catch (error) {
      console.error('Workout delete error:', error);
      res.status(500).json({
        error: 'Failed to delete workout',
        details: error.message
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}