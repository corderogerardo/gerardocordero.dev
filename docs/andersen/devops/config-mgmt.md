# DevOps — configuration management (Ansible)

### Ansible Playbooks, Inventory And Idempotency
**They ask:** "Walk me through how Ansible actually applies a playbook — inventory, modules, and how it stays idempotent."

Ansible's core promise is *convergence without an agent*: it SSHes into hosts listed in an inventory, pushes small Python modules, runs them, and pulls the results back — no daemon to install or maintain on the target, which is why it's the easiest CM tool to adopt incrementally on an existing fleet.

Idempotency isn't something you hand-code — it's a property each *module* guarantees. `apt: name=nginx state=present` checks whether nginx is already installed before acting; running the playbook ten times produces the same end state and reports "ok" (unchanged) on runs nine through ten instead of re-installing. That's the fundamental difference from a raw shell script, which just replays commands blindly.

```yaml
# inventory.ini
[web]
web1.example.com
web2.example.com ansible_user=deploy

# playbook.yml
- hosts: web
  become: true
  tasks:
    - name: ensure nginx installed
      apt: { name: nginx, state: present }
    - name: deploy config
      template: { src: nginx.conf.j2, dest: /etc/nginx/nginx.conf }
      notify: reload nginx
  handlers:
    - name: reload nginx
      service: { name: nginx, state: reloaded }
```

Roles package tasks/templates/handlers/vars into a reusable, shareable unit for a given responsibility ("webserver", "postgres") instead of one flat playbook. **Handlers** only fire when a task reports a change — so a config template that didn't change won't trigger an unnecessary service reload.

**Say it:** "Ansible's idempotency comes from the modules themselves checking current state before acting, not from careful scripting — that's what makes 'run this playbook again' always safe, and handlers only reload a service when something actually changed."
**Red flag:** Reaching for the `shell`/`command` module for everything. Those *aren't* idempotent by default — they run every time regardless of state — so overusing them defeats the reason you picked Ansible over a bash script in the first place.

### Configuration Management Tools Compared — Push Vs Pull
**They ask:** "Ansible, Puppet, Chef, Salt — what actually differs, and how would you choose for a 5,000-node fleet versus a 20-server startup?"

The split that matters is push versus pull, and it's an architectural trade-off, not just a preference. Ansible is **push**: a control node SSHes out and applies state on-demand — no agent to install, easy to adopt on day one, but it doesn't self-heal drift between runs unless something explicitly re-triggers it. Puppet and Chef are **pull**: an agent runs on every managed node and periodically checks in with a central server to reconcile itself against the desired state — drift gets corrected automatically on the next run cycle (typically every 30 minutes), which is exactly what "continuously enforced" means at fleet scale, at the cost of running and securing an agent + server everywhere.

Salt sits in between: it has an agent (minion) like Puppet/Chef, but communicates over a fast pub-sub message bus instead of periodic polling, so it can push commands to thousands of nodes in near-real-time rather than waiting for the next check-in.

```
Push (Ansible):   control-node --SSH--> N hosts, on-demand
Pull (Puppet/Chef): N agents --poll--> central server, every ~30min
Bus (Salt):        control-node --pub/sub--> N minions, near-instant
```

For a 20-server startup, Ansible's zero-agent onboarding wins — you're applying state a handful of times a day, not fighting drift every minute. For a 5,000-node fleet where drift correction matters more than any single apply, Puppet/Chef's continuous reconciliation (or Salt if you need near-real-time fleet-wide commands) earns its heavier operational cost.

**Say it:** "Ansible pushes state on-demand with zero agents — great for fast adoption; Puppet and Chef pull and continuously reconcile drift via an agent, which is what you actually want once fleet size makes drift the real problem, and Salt trades polling for a pub-sub bus when you need near-real-time control."
**Red flag:** Picking a CM tool by "which one I've used before" without naming the push/pull trade-off. At 5,000 nodes, "no agent needed" stops being Ansible's selling point and starts being the reason drift goes uncorrected between runs.
