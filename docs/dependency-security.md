# Dependency supply-chain security

This project treats `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and
GitHub Actions references as reviewed executable input. Dependency changes must
arrive through a pull request and pass the same checks as application code.

## Installation policy

- `packageManager` pins the pnpm release used locally and in CI.
- Direct dependencies use exact versions. `saveExact` keeps future additions exact.
- `pnpm-lock.yaml` is committed, and CI installs with `--frozen-lockfile`.
- Registry packages must match the integrity values in the lockfile. Do not use
  `--update-checksums` during a routine install or dependency update.
- New direct and transitive releases wait seven days before installation.
- A lower-trust release is rejected, and a committed lockfile is still checked
  against the active release-age and trust policies.
- Transitive Git and direct-tarball sources are blocked.
- Dependency lifecycle scripts are denied unless the package is explicitly reviewed
  and added to `allowBuilds`.

## Reviewing an update

1. Read the package changelog and release notes, including breaking and security
   changes.
2. Check the publisher, registry provenance, and the dependency path with
   `pnpm why <package>`.
3. Review every manifest and lockfile change. Unexpected packages, source URLs,
   missing integrity values, lifecycle scripts, or policy exceptions block the
   update.
4. Run `pnpm install --frozen-lockfile`, `pnpm ignored-builds`, the complete quality
   suite, and the production build.
5. Merge only through a pull request after CI passes. Do not auto-merge dependency
   updates solely because they were opened by Dependabot.

Dependabot opens one weekly npm/pnpm update pull request and one GitHub Actions
update pull request. A pull request may remain blocked until every selected release
has passed the seven-day quarantine; this is expected and is not a reason to weaken
the policy.

## Exceptions

Every exception must select an exact package version, explain why it is needed, and
have a removal condition. Broad package-name or scope exceptions are not allowed.

The initial release-age exceptions cover versions already reviewed and committed
before the policy was enabled. Remove the complete `minimumReleaseAgeExclude` list
after `2026-08-17T13:10:00Z`, then repeat a clean frozen install.

The current trust-policy exceptions are existing transitive dependencies:

| Package                                    | Dependency path                          | Removal condition                                                                                 |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `eslint-import-resolver-typescript@3.10.1` | `eslint-config-next`                     | Remove when the parent graph no longer resolves this version or the release satisfies the policy. |
| `semver@6.3.1`                             | Babel and ESLint tooling used by Next.js | Remove when all parent packages resolve a policy-compliant version.                               |
| `undici-types@6.21.0`                      | `@types/node@20.19.43`                   | Remove when the Node type dependency resolves a policy-compliant version.                         |

Review these entries whenever a parent dependency changes. A new trust downgrade is
not added automatically: investigate it as a possible publisher or package takeover.

## Vulnerability response

- A high or critical advisory affecting the project blocks merge and release. Open
  a dedicated update pull request immediately rather than waiting for the weekly
  Dependabot batch.
- If the patched release is younger than seven days, an exact temporary
  `minimumReleaseAgeExclude` entry is allowed only after reviewing the advisory,
  changelog, publisher, provenance, and lockfile diff. Record a removal date.
- Moderate and low advisories follow the normal Dependabot workflow unless their
  exploitability or application exposure requires escalation.
- GitHub Dependency graph, Dependabot alerts, and Dependabot security updates must
  remain enabled for the repository.

## Vercel

Set `ENABLE_EXPERIMENTAL_COREPACK=1` for Production and Preview. Vercel must use the
pnpm version from `packageManager`; verify `pnpm 11.21.0` and an immutable lockfile
install in deployment logs. Do not add a generic `pnpm install` override because it
can bypass package-manager version selection.
