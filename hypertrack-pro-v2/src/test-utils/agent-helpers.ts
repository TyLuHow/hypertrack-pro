/**
 * Agent Testing Utilities for HyperTrack Pro
 * Provides standardized testing helpers for AI agents
 */

export const AgentTestHelpers = {
  // Algorithm validation helpers
  validateAlgorithmOutput: (result: any, expectedRange: [number, number]) => {
    expect(result).toBeGreaterThanOrEqual(expectedRange[0]);
    expect(result).toBeLessThanOrEqual(expectedRange[1]);
  },

  // Research citation validation
  validateResearchCitation: (citation: string) => {
    const citationPattern = /^[A-Z][a-z]+(?:\s+et\s+al\.)?\s+\(\d{4}\)$/;
    expect(citation).toMatch(citationPattern);
  },

  // API response validation
  validateApiResponse: (response: any, expectedSchema: any) => {
    // Add schema validation logic
    expect(response).toBeDefined();
    expect(response.error).toBeUndefined();
  },

  // Performance benchmarking
  benchmarkFunction: async (fn: Function, maxExecutionTime: number) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    expect(end - start).toBeLessThan(maxExecutionTime);
  }
};

export const mockWorkoutData = {
  validWorkout: {
    date: '2025-01-07',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 7 }
        ]
      }
    ]
  },
  
  invalidWorkout: {
    date: 'invalid-date',
    exercises: []
  }
};