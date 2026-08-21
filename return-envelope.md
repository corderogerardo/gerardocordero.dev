status: complete
executive_summary: |-
  Four delta specs written for learn-design-v4-polish: RN palette unification (hsl→var(), duplicate token blocks removed), home stats hairline grid (divide-y/x, single accent, no card boxes), header nav fix (href /#courses, seven nav.* i18n keys added to en/es.json, anchor never active), and i18n key parallelism verification. Engram saved.
artifacts:
  - /Users/gerardocordero/noofficelocation/gerardocordero.dev/openspec/changes/learn-design-v4-polish/specs/rn-palette.md
  - /Users/gerardocordero/noofficelocation/gerardocordero.dev/openspec/changes/learn-design-v4-polish/specs/home-stats.md
  - /Users/gerardocordero/noofficelocation/gerardocordero.dev/openspec/changes/learn-design-v4-polish/specs/header-nav.md
  - /Users/gerardocordero/noofficelocation/gerardocordero.dev/openspec/changes/learn-design-v4-polish/specs/i18n-keys.md
  - topic_key: sdd/learn-design-v4-polish/spec
next_recommended: design
risks: |-
  - Reflow of hsl tokens in practice components could leave raw hsl(var(--…)) references; mitigated by repo-wide grep sweep before build.
  - i18n key parity between en.json and es.json enforced by tools/i18n-check.mjs; failure would miss a key.
  - /#courses anchor requires id="courses" + scroll-mt on HomePageClient; missing either breaks navigation.
skill_resolution: paths-injected