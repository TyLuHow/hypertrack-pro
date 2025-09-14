export const RESEARCH_INDEX = {
  progressive_overload: {
    primary: 'Schoenfeld et al. (2016)',
    supporting: ['Rhea et al. (2003)', 'Peterson et al. (2004)'],
    safety_limits: { minProgression: 0.025, maxProgression: 0.10 },
    algorithm_files: ['progressive-overload/calculator.ts']
  },
  volume_calculation: {
    primary: 'Helms et al. (2018)',
    supporting: ['Baz-Valle et al. (2022)', 'Schoenfeld et al. (2017)'],
    safety_limits: { min_sets: 10, max_sets: 32 },
    algorithm_files: ['volume-calculation/weekly-volume.ts']
  }
};


