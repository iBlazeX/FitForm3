/**
 * Workout Routes
 * Handles workout creation, history, and statistics
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const auth = require('../middleware/auth');

const router = express.Router();

// All workout routes require authentication
router.use(auth);

/**
 * Calculate calories burned based on exercise, reps, duration, and user profile
 * Uses MET (Metabolic Equivalent of Task) values adjusted for body weight
 */
function calculateCalories(exerciseType, reps, duration, profile) {
  // Base calories per rep (for 70kg person)
  const baseCaloriesPerRep = {
    pushup: 0.35,
    squat: 0.32,
    situp: 0.25
  };

  // MET values for exercises (moderate intensity)
  const metValues = {
    pushup: 8.0,  // Vigorous calisthenics
    squat: 5.5,   // Moderate calisthenics
    situp: 4.0    // Light calisthenics
  };

  let calories = reps * baseCaloriesPerRep[exerciseType];

  // Adjust for user's weight if available (base is 70kg)
  if (profile?.weight) {
    const weightFactor = profile.weight / 70;
    calories *= weightFactor;
  }

  // Adjust for gender (males typically burn ~5-10% more)
  if (profile?.gender === 'male') {
    calories *= 1.05;
  } else if (profile?.gender === 'female') {
    calories *= 0.95;
  }

  // Adjust for age (metabolism slows with age)
  if (profile?.age) {
    if (profile.age < 30) {
      calories *= 1.05;
    } else if (profile.age > 50) {
      calories *= 0.90;
    } else if (profile.age > 40) {
      calories *= 0.95;
    }
  }

  // Add duration-based calories if workout was long
  if (duration && duration > 60) {
    const met = metValues[exerciseType];
    const weight = profile?.weight || 70;
    const durationMinutes = duration / 60;
    // MET formula: calories = MET × weight(kg) × duration(hours)
    const durationCalories = (met * weight * (durationMinutes / 60)) * 0.3; // 30% additional
    calories += durationCalories;
  }

  return Math.max(calories, 0);
}

/**
 * POST /api/workouts
 * Save a new workout
 */
router.post('/', [
  body('exerciseType').isIn(['pushup', 'squat', 'situp']).withMessage('Invalid exercise type'),
  body('reps').isInt({ min: 0 }).withMessage('Reps must be a positive integer'),
  body('caloriesBurned').isFloat({ min: 0 }).optional(),
  body('duration').isInt({ min: 0 }).optional(),
  body('formFeedback').isArray().optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getFirestore();
    const { exerciseType, reps, caloriesBurned, duration, formFeedback } = req.body;

    // Get user profile for personalized calorie calculation
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userProfile = userDoc.exists ? userDoc.data().profile : null;

    // Calculate calories using user metrics if available
    const calculatedCalories = calculateCalories(exerciseType, reps, duration, userProfile);
    const finalCalories = caloriesBurned || calculatedCalories;

    const workout = {
      userId: req.user.uid,
      exerciseType,
      reps,
      caloriesBurned: Math.round(finalCalories * 100) / 100,
      duration: duration || 0,
      formFeedback: formFeedback || [],
      date: new Date().toISOString()
    };

    const docRef = await db.collection('workouts').add(workout);

    res.status(201).json({
      message: 'Workout saved successfully',
      id: docRef.id,
      workout: { id: docRef.id, ...workout }
    });
  } catch (error) {
    console.error('Save workout error:', error);
    res.status(500).json({ error: 'Failed to save workout' });
  }
});

/**
 * GET /api/workouts/history
 * Get workout history for the authenticated user
 */
router.get('/history', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('exerciseType').optional().isIn(['pushup', 'squat', 'situp'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getFirestore();
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const exerciseType = req.query.exerciseType;

    // Build query - note: composite indexes may be needed in Firestore
    let queryRef = db.collection('workouts')
      .where('userId', '==', req.user.uid);

    if (exerciseType) {
      queryRef = queryRef.where('exerciseType', '==', exerciseType);
    }

    // Get all matching docs first, then sort in memory to avoid index issues
    const snapshot = await queryRef.get();

    let workouts = [];
    snapshot.forEach(doc => {
      workouts.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date descending in memory
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get total before pagination
    const total = workouts.length;

    // Apply pagination
    workouts = workouts.slice(offset, offset + limit);

    res.json({
      workouts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + workouts.length < total
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get workout history' });
  }
});

/**
 * GET /api/workouts/stats
 * Get workout statistics for the authenticated user
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getFirestore();

    // Get user profile for goals
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userProfile = userDoc.exists ? userDoc.data().profile : null;

    const snapshot = await db.collection('workouts')
      .where('userId', '==', req.user.uid)
      .get();

    if (snapshot.empty) {
      return res.json({
        totalWorkouts: 0,
        totalReps: 0,
        totalCalories: 0,
        byExercise: {},
        recentWorkouts: [],
        goals: userProfile ? {
          dailyCalorieGoal: userProfile.dailyCalorieGoal || null,
          dailyRepsGoal: userProfile.dailyRepsGoal || null,
          weeklyWorkoutGoal: userProfile.weeklyWorkoutGoal || null
        } : null,
        todayProgress: { calories: 0, reps: 0, workouts: 0 },
        weekProgress: { workouts: 0 }
      });
    }

    const stats = {
      totalWorkouts: 0,
      totalReps: 0,
      totalCalories: 0,
      totalDuration: 0,
      byExercise: {
        pushup: { count: 0, reps: 0, calories: 0 },
        squat: { count: 0, reps: 0, calories: 0 },
        situp: { count: 0, reps: 0, calories: 0 }
      }
    };

    // Calculate today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate this week's date range (Monday to Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let todayCalories = 0;
    let todayReps = 0;
    let todayWorkouts = 0;
    let weekWorkouts = 0;

    const workouts = [];
    snapshot.forEach(doc => {
      const workout = doc.data();
      workouts.push({ id: doc.id, ...workout });

      const workoutDate = new Date(workout.date);

      stats.totalWorkouts++;
      stats.totalReps += workout.reps || 0;
      stats.totalCalories += workout.caloriesBurned || 0;
      stats.totalDuration += workout.duration || 0;

      if (stats.byExercise[workout.exerciseType]) {
        stats.byExercise[workout.exerciseType].count++;
        stats.byExercise[workout.exerciseType].reps += workout.reps || 0;
        stats.byExercise[workout.exerciseType].calories += workout.caloriesBurned || 0;
      }

      // Check if workout is from today
      if (workoutDate >= today && workoutDate < tomorrow) {
        todayCalories += workout.caloriesBurned || 0;
        todayReps += workout.reps || 0;
        todayWorkouts++;
      }

      // Check if workout is from this week
      if (workoutDate >= weekStart && workoutDate < weekEnd) {
        weekWorkouts++;
      }
    });

    // Round calories
    stats.totalCalories = Math.round(stats.totalCalories * 100) / 100;
    Object.keys(stats.byExercise).forEach(key => {
      stats.byExercise[key].calories = Math.round(stats.byExercise[key].calories * 100) / 100;
    });

    // Get 5 most recent workouts
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    stats.recentWorkouts = workouts.slice(0, 5);

    // Add goals and progress
    stats.goals = userProfile ? {
      dailyCalorieGoal: userProfile.dailyCalorieGoal || null,
      dailyRepsGoal: userProfile.dailyRepsGoal || null,
      weeklyWorkoutGoal: userProfile.weeklyWorkoutGoal || null
    } : null;

    stats.todayProgress = {
      calories: Math.round(todayCalories * 100) / 100,
      reps: todayReps,
      workouts: todayWorkouts
    };

    stats.weekProgress = {
      workouts: weekWorkouts
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * DELETE /api/workouts/:id
 * Delete a workout
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const workoutId = req.params.id;

    // Verify ownership
    const workoutDoc = await db.collection('workouts').doc(workoutId).get();

    if (!workoutDoc.exists) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workoutDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this workout' });
    }

    await db.collection('workouts').doc(workoutId).delete();

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router;
