# Research Standards - HyperTrack Pro

## Evidence Requirements
- All fitness recommendations must cite peer-reviewed research
- Use citation format: "Author et al. (Year)"
- Maintain traceability from algorithm logic to research source

## Safety Constraints
- Validate physiological limits for volume, intensity, and frequency
- Flag outputs exceeding safe ranges for review
- Provide guardrails for unvalidated inputs

## Review Protocol
- Run .cursor/tools/research-validator.js before merging algorithm changes
- Include citation diff in PR description for algorithm edits
- Resolve conflicts between sources by preferring systematic reviews/meta-analyses

## Domains Covered
- Hypertrophy, strength, recovery, periodization, progressive overload, volume landmarks
