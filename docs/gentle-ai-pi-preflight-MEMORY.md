# Gentle AI Pi preflight fix

The `prepare:check-dependencies` failure was caused by GUI/non-login processes not inheriting the nvm PATH. Pi was installed globally, and stable wrappers now expose Pi, Node, and npm through `/opt/homebrew/bin`:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Wrappers: `/opt/homebrew/bin/pi`, `/opt/homebrew/bin/node`, `/opt/homebrew/bin/npm`.

Then verify and rerun the Gentle AI setup:

```bash
command -v pi
pi --version
gentle-ai install --agent pi
gentle-ai install --agent pi --dry-run
```

Verified on 2026-08-11 with a restricted PATH containing only `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`: Pi `0.84.1`, Node `v24.13.0`, and npm `11.9.0` were all discoverable; the real `gentle-ai install --agent pi` completed successfully. Missing Go is optional. No project source files were changed.

Follow-up: installed Codex `0.147.0`, Hermes `0.20.0`, Engram `1.20.0`, and GGA `2.10.1`; trusted only the two formulas named by the installer from the official Gentleman-Programming tap. The full-preset dry run now reports all eight agents with `Unsupported agents: none`.
