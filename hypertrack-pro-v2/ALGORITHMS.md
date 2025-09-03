## Evidence-Based Algorithms (Preserved Exactly)

- APRE/RPE Gate:
  - Compounds: progress only if achievedReps ≥ 10
  - Isolations: progress only if achievedReps ≥ 12

- Percentage Bands (weekly):
  - Compounds: 0.35% (0.0035)
  - Isolations: 0.5% (0.005)

- Days-since-session adjustment:
  - sessionsFactor = max(daysSinceLastSession / 7, 0.5)

- Microloading:
  - Round up to 2.5 lb increments: ceil(weight / 2.5) * 2.5

- Progression formula:
  - If gate passed: proposed = baseWeight × (1 + weeklyRate × sessionsFactor)
  - Else: proposed = baseWeight
  - recommendedWeight = ceil(proposed / 2.5) × 2.5

- Plateau detection (window ≤ 6 sessions):
  - Compute best-set weight per session
  - Linear trend slope < 0.005 AND variance < 2.5 AND n ≥ 3 ⇒ plateau

- Deload recommendations:
  - Volume reduction: -50%
  - Load reduction: -10% to -15%

- Best-set selection:
  - Choose set with max (weight × reps)

These formulas are implemented in `src/lib/algorithms/progression.ts` and `src/lib/algorithms/plateau.ts` with unit tests in `src/lib/algorithms/__tests__` ensuring exact preservation.



