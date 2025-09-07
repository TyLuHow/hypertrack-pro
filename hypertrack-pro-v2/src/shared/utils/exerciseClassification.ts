export function inferExerciseType(exerciseName: string): {
  type: 'compound' | 'isolation';
  primaryMuscle: string;
  secondaryMuscles: string[];
} {
  const name = (exerciseName || '').toLowerCase();
  const compoundKeywords = ['squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'chin-up', 'dip', 'lunge', 'clean', 'snatch'];
  const isolationKeywords = ['curl', 'extension', 'raise', 'fly', 'pullover', 'pushdown', 'kickback'];

  const type: 'compound' | 'isolation' = compoundKeywords.some(k => name.includes(k))
    ? 'compound'
    : isolationKeywords.some(k => name.includes(k))
    ? 'isolation'
    : 'compound';

  // naive primary muscle inference
  let primaryMuscle = 'Unknown';
  if (name.includes('bench') || name.includes('chest')) primaryMuscle = 'chest';
  else if (name.includes('row') || name.includes('pull') || name.includes('lat')) primaryMuscle = 'back';
  else if (name.includes('squat') || name.includes('quad') || name.includes('leg press')) primaryMuscle = 'legs';
  else if (name.includes('deadlift') || name.includes('rdl') || name.includes('hamstring') || name.includes('glute')) primaryMuscle = 'legs';
  else if (name.includes('shoulder') || name.includes('overhead') || name.includes('press') || name.includes('lateral')) primaryMuscle = 'shoulders';
  else if (name.includes('bicep') || name.includes('curl')) primaryMuscle = 'arms';
  else if (name.includes('tricep') || name.includes('pushdown') || name.includes('extension')) primaryMuscle = 'arms';
  else if (name.includes('ab') || name.includes('core') || name.includes('crunch') || name.includes('plank')) primaryMuscle = 'core';

  const secondaryMuscles: string[] = [];
  if (primaryMuscle === 'chest') secondaryMuscles.push('arms', 'shoulders');
  if (primaryMuscle === 'back') secondaryMuscles.push('arms', 'shoulders');
  if (primaryMuscle === 'legs') secondaryMuscles.push('glutes');
  if (primaryMuscle === 'shoulders') secondaryMuscles.push('arms');

  return { type, primaryMuscle, secondaryMuscles };
}


