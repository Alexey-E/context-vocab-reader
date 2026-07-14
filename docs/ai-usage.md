# AI-Assisted Development

AI tools may be used to accelerate implementation, review, and documentation, but they are not treated as authorities for architecture, security, or correctness.

## Intended uses

AI tools may assist with:

- project scaffolding;
- generating small implementation drafts;
- suggesting refactors;
- writing or expanding tests;
- reviewing pull requests;
- identifying edge cases;
- improving documentation;
- explaining unfamiliar APIs or concepts.

## Human-owned decisions

The following decisions must be made and verified manually:

- product scope;
- data model;
- authentication flow;
- server/client boundaries;
- Row Level Security policies;
- secret management;
- translation cost-control strategy;
- external API error handling;
- accessibility behavior;
- deployment and migration strategy.

## Review requirements

Generated code must not be committed without review.

Before accepting AI-generated changes:

1. Understand what the code does.
2. Check that it follows the documented architecture.
3. Verify that secrets cannot reach client code.
4. Check authorization and RLS assumptions.
5. Remove unnecessary abstractions and speculative features.
6. Run lint, typecheck, tests, and production build.
7. Manually verify the affected user flow.

## Commit policy

Commits should describe the product or engineering change rather than the tool used to produce it.

Good:

```text
feat: add translation provider abstraction
test: cover sentence tokenization edge cases
fix: prevent cross-user document access
```

Avoid:

```text
add AI-generated files
update code from Codex
Claude changes
```

## Pull request review prompts

Suggested general review prompt:

```text
Review this pull request as a senior full-stack engineer.
Focus on:
- security issues
- server/client boundary mistakes
- unnecessary complexity
- Supabase RLS risks
- error handling
- translation API cost risks
- missing tests

Do not rewrite the whole application.
Give concrete comments with file references.
```

Suggested portfolio-quality prompt:

```text
Review this diff as a portfolio project for a senior frontend/full-stack role.
Point out anything that looks junior, overengineered, insecure, untested, or copied without understanding.
Explain why each issue matters and suggest the smallest useful correction.
```

## Documentation policy

Architecture documentation must reflect the implemented system, not an aspirational system.

When implementation changes a documented decision, update the relevant document in the same pull request:

- `product-scope.md` for scope changes;
- `architecture.md` for boundaries and data flow;
- `database.md` for schema and RLS changes;
- `trade-offs.md` for decision changes;
- `implementation-plan.md` for progress and sequencing.

## Transparency statement

Recommended README wording:

> AI tools were used for scaffolding, refactoring suggestions, test generation, and code review. All generated code was manually reviewed, adjusted, and tested before being committed. Product scope, data modeling, API boundaries, RLS policies, and cost-control decisions were manually designed and verified.

## Principle

AI can reduce typing and broaden review coverage. It does not replace ownership of the design, implementation, and operational consequences.
