export const RESEARCH_VOLUME_TARGETS: Record<string, { min: number; optimal: number; max: number; citation: string }> = {
  chest: { min: 10, optimal: 16, max: 22, citation: 'Schoenfeld et al. (2017)' },
  back: { min: 10, optimal: 16, max: 24, citation: 'Baz-Valle et al. (2022)' },
  legs: { min: 12, optimal: 18, max: 26, citation: 'Schoenfeld et al. (2017)' },
  shoulders: { min: 8, optimal: 14, max: 20, citation: 'Baz-Valle et al. (2022)' },
  arms: { min: 6, optimal: 12, max: 18, citation: 'Schoenfeld et al. (2017)' },
  core: { min: 6, optimal: 10, max: 16, citation: 'Schoenfeld et al. (2017)' }
};

export const RESEARCH_CITATIONS = {
  schoenfeld_2017: {
    authors: ['Schoenfeld, B.J.', 'Ogborn, D.', 'Krieger, J.W.'],
    title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass',
    journal: 'Journal of Sports Sciences',
    year: 2017,
    doi: '10.1080/02640414.2016.1210197'
  },
  baz_valle_2022: {
    authors: ['Baz-Valle, E.', 'Fontes-Villalba, M.', 'Santos-Concejero, J.'],
    title: 'The effects of training volume on muscle hypertrophy',
    journal: 'Sports Medicine',
    year: 2022,
    doi: '10.1007/s40279-021-01615-8'
  }
} as const;


