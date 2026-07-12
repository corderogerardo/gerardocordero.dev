# DevOps — Linux

### Package Managers And File Permissions
**They ask:** "How do apt and yum differ under the hood, and walk me through the Unix permission model."

Package managers exist to solve dependency resolution and reproducible installs — `apt` (Debian/Ubuntu, `.deb`) and `yum`/`dnf` (RHEL/CentOS/Fedora, `.rpm`) do the same job with different package formats and metadata, which is why a `Dockerfile` or provisioning script has to branch on distro family rather than assuming one tool works everywhere.

Permissions are the other daily fundamental: `rwx` for owner/group/other, represented as octal (`755` = owner rwx, group/other rx). The bit most people forget: execute permission on a *directory* means "can traverse into it," not "can execute it" — that's why a directory can be `700` and still let you `cd` in but a file inside needs its own read/execute bits.

```bash
chmod 750 deploy.sh          # owner rwx, group r-x, other none
chown appuser:deploy deploy.sh
```

**Say it:** "Package managers differ by distro family and package format, but the operational skill that transfers is reading the permission bits correctly — especially that directory execute means traversal, not execution."
**Red flag:** Reaching for `chmod 777` to "fix" a permission error instead of figuring out which specific bit (owner, group, or world) was actually missing.

### Standard Streams Redirection And Bash Basics
**They ask:** "Explain stdin/stdout/stderr, and write a script that greps a log for errors and reports a count."

The three POSIX streams exist so a program's *data* output and *diagnostic* output can be handled independently — stdout (fd 1) is the result, stderr (fd 2) is for humans/logs, stdin (fd 0) is input. That separation is what lets you redirect a program's real output to a file while errors still show on the terminal, or pipe stdout into the next command without swallowing warnings.

```bash
#!/usr/bin/env bash
set -euo pipefail

count=$(awk '/ERROR/{c++} END{print c+0}' /var/log/app.log)
if [ "$count" -gt 0 ]; then
  echo "Found $count errors" >&2
  exit 1
fi
echo "Clean"
```

**Say it:** "I keep stdout and stderr separate on purpose — piping a script's real output into another tool while errors still surface on the terminal is the whole reason the streams exist."
**Red flag:** Writing a script without `set -euo pipefail` — it silently continues past a failed command, which is how a bad deploy script reports success after actually failing halfway through.

### systemd Services And Scheduled Jobs
**They ask:** "Write a systemd unit for a service that restarts on failure, and compare a systemd timer to cron."

systemd services matter because they give you what a raw background process (`nohup ... &`) doesn't: automatic restart on crash, structured logs via `journalctl`, and dependency ordering (start after the network is up). A unit file declares the intent; systemd enforces it.

```ini
[Unit]
Description=app worker
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/app/worker.js
Restart=on-failure
RestartSec=5
User=appuser

[Install]
WantedBy=multi-user.target
```

cron is simpler for pure scheduling but has no dependency awareness and weak failure visibility — a cron job that silently fails just... doesn't run, with no restart and no structured log unless you build that yourself. A systemd timer paired with a service unit gets you the same schedule plus `journalctl` output and `Restart=` semantics if the job crashes mid-run.

**Say it:** "I reach for a systemd timer over cron once a job needs restart-on-failure or dependency ordering — cron schedules, systemd also supervises."
**Red flag:** Putting a critical scheduled job on plain cron with no monitoring — a silent cron failure at 3am is invisible until someone notices the downstream effect days later.

### Advanced Bash Scripting
**They ask:** "Show me a script that renders a config template from environment variables and parses the result with jq."

Advanced bash is what turns ad-hoc scripts into reliable automation glue: `envsubst` renders templates without a templating engine dependency, `jq` is the standard tool for parsing JSON in a pipeline instead of fragile regex, and proper argument/signal handling is what makes a script safe to run unattended in CI.

```bash
#!/usr/bin/env bash
set -euo pipefail
trap 'echo "interrupted" >&2; exit 130' INT TERM

: "${DB_HOST:?DB_HOST is required}"
envsubst < config.tmpl.yaml > config.yaml

response=$(curl -sf "https://api.example.com/status")
status=$(echo "$response" | jq -r '.status')
[ "$status" = "ok" ] || { echo "unhealthy: $status" >&2; exit 1; }
```

`${VAR:?message}` fails fast with a clear error if a required variable is unset — the alternative is a script that runs with an empty string and fails somewhere confusing three steps later.

**Say it:** "I fail fast on missing inputs with `${VAR:?}` and parse JSON with `jq` instead of regex — both are about making a script's failure mode obvious instead of silent."
**Red flag:** Parsing JSON output with `grep`/`sed` in a script that runs in CI — it breaks the moment field order or whitespace changes upstream.

## Linux Internals & Security

### Advanced Linux Networking Setup
**They ask:** "How would you set up interface teaming, VLANs, and a bridge on a Linux host, and why would you need to?"

This comes up when a host needs to look like more than a single flat NIC to the rest of the network — a hypervisor host bridging traffic to VMs, a bonded pair of NICs for redundancy/throughput, or VLAN tagging so one physical NIC serves multiple isolated broadcast domains.

Interface teaming (bonding) combines NICs for failover or aggregate throughput. A bridge acts like a virtual switch — this is exactly what Docker's default network driver builds under the hood to connect containers. VLANs tag frames (802.1Q) so a single physical link carries multiple logically-separated networks. These are three independent building blocks, not steps in one pipeline — a real topology only chains them when the requirement actually calls for it (e.g., bond two NICs for redundancy, *then* bridge the bonded interface for VM traffic).

```bash
# Bonding: two physical NICs presented as one resilient link
ip link add bond0 type bond mode active-backup
ip link set eth0 master bond0
ip link set eth1 master bond0

# VLAN: tag a physical link so it carries multiple isolated networks
ip link add link eth0 name eth0.100 type vlan id 100

# Bridge: a virtual switch — connect a NIC (or bond) to VM/container ports
ip link add br0 type bridge
ip link set bond0 master br0
```

**Say it:** "Bonding is for NIC-level redundancy, bridging is a virtual switch — it's literally what Docker builds for container networking — and VLANs are how one physical link carries multiple isolated networks. They compose based on the requirement, not in one fixed order."
**Red flag:** Not recognizing that Docker's default bridge network *is* this same Linux bridging mechanism — it's not magic, it's `ip link add br0 type bridge` with extra automation.

### LVM Boot Process And Kernel Modules
**They ask:** "Walk me through the Linux boot sequence, and why would you choose LVM over a plain partition?"

Boot order matters when you're debugging a system that won't come up: firmware (BIOS/UEFI) → bootloader (GRUB) reads its config and loads the kernel + initramfs → the kernel mounts the real root filesystem → init/systemd takes over and starts services. Knowing which stage you're stuck at (no GRUB menu vs. kernel panic vs. a specific service failing) tells you exactly where to look.

LVM (Logical Volume Manager) adds an abstraction layer between physical disks and filesystems — logical volumes can be resized, snapshotted, or spread across multiple physical disks without unmounting, which a raw partition can't do without downtime. Kernel modules (`lsmod`, `modprobe`) are how the kernel loads driver/feature code on demand instead of compiling everything in statically.

**Say it:** "LVM buys me online resize and snapshots that a raw partition can't do — worth the extra abstraction on anything that might need to grow without downtime."
**Red flag:** Provisioning production storage on raw partitions "for simplicity" and then needing a maintenance window just to grow a disk.

### Filesystems And Distributed Filesystems
**They ask:** "How do ext4, XFS, and a distributed filesystem like Ceph or GlusterFS differ, and when do you actually need distributed storage?"

ext4 and XFS are both local, journaled filesystems — the real trade-off is workload shape: ext4 is the safe general default, XFS scales better for very large files and high-throughput parallel I/O (common in database and media workloads). Neither one solves the problem of a single disk being a single point of failure.

A distributed filesystem replicates data across multiple nodes so no single disk failure loses data, and multiple hosts can read/write the same volume — the trade-off is added latency and operational complexity versus a local disk. The senior call: reach for it when you need shared, fault-tolerant storage across a cluster (stateful Kubernetes workloads, shared media storage), not as a default for a single service's local data.

**Say it:** "I pick the local filesystem for workload shape — XFS for large sequential/parallel I/O, ext4 as the safe default — and only reach for a distributed filesystem when multiple nodes genuinely need to share the same fault-tolerant volume."
**Red flag:** Reaching for a distributed filesystem by default "for durability" when a local disk plus replication at the application/database layer would be simpler and faster.

### Linux Security Hardening ACL And SELinux
**They ask:** "Standard Unix permissions feel too coarse for a shared directory — how do ACLs and SELinux/AppArmor help?"

Standard `rwx` permissions only express one owner and one group — the moment two different teams need different access to the same file, that model runs out. POSIX ACLs (`setfacl`) let you grant fine-grained permissions to specific additional users or groups on top of the base permission bits.

SELinux and AppArmor solve a different problem: mandatory access control that constrains what a process can do even if its Unix permissions would allow it — a compromised web server process labeled to only touch its own web-root can't read `/etc/shadow` even running as a user that technically has read access, because the *policy* denies it regardless of DAC permissions. That's the layer that limits blast radius when an application gets exploited.

```bash
setfacl -m u:deploy:rwx /var/www/app
```

**Say it:** "ACLs extend discretionary permissions to more than one owner/group; SELinux/AppArmor is mandatory access control that limits what a process can do even past a user's own permissions — that second layer is what contains a compromised process."
**Red flag:** Disabling SELinux ("`setenforce 0`") to make a permission error go away instead of writing a policy exception — that's removing the exact containment layer meant to limit damage from an exploited service.
