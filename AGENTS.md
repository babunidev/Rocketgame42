# Instructions for AI development collaborators

## Ownership and attribution

Babuni owns creative direction and decides what enters the game's canon/design. Clearly distinguish Babuni's instructions, AI suggestions, agreed decisions, implemented code, and test results. Never treat an AI suggestion as accepted by default.

## Before coding

1. Inspect actual repository content, current branch, and relevant documentation.
2. Identify the smallest reviewable change.
3. Do not invent gameplay rules or technical requirements. Record unresolved decisions.
4. Prefer simple, maintainable implementations; explain meaningful tradeoffs.

## With every substantial change

- Update README.md when project setup or status changes.
- Update CONCEPT.md / docs/GAME_DESIGN.md when Babuni establishes game direction.
- Update docs/ARCHITECTURE.md / docs/DESIGN.md / docs/CONTENT.md when relevant.
- Update ROADMAP.md and CHANGELOG.md to reflect actual status.
- Append a narrative entry to docs/DEVLOG.md and material decisions to docs/DECISIONS.md.
- Record what was tested and any remaining uncertainty.

## Quality

Use accessible inputs and readable feedback; respect responsive behavior and performance. Do not claim tests were run unless they were run. Never commit secrets, credentials, private chats, or unapproved personal information.

## Collaboration history

Maintain Babuni's reasoning, meaningful alternatives, disagreements, rejected ideas, and corrections in publication-safe summaries. Link related paths, commits, or issues when available.

## Author attribution

Credit **Babuni** as the original human creative. Do not use “creator” as a title for Babuni.dev; identify separately any AI work, later reconstructions and third-party components.

## Repository-local documentation standard

Follow [the documentation standard](docs/DOCUMENTATION.md) for first-person author voice throughout project documentation, factual changelogs, and naming the AI tool and verified model for each contribution. These rules travel with this repository and do not depend on the babuni.dev ChatGPT Project. Preserve all project-specific technical, creative, canon, safety, licensing, and historical rules in this file; follow the linked standard for public first-person narrative, human–AI attribution, concise development journals, decision records, and evidence-based verification. **Babuni** is the human creative; **babuni.dev** is the website/portfolio, not the person. Preserve third-party credits and historical legal notices. References above to a dated “documentation-only audit” describe that past task, not a permanent ban on later authorized implementation.
