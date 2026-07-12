# DevOps — observability & monitoring

### Monitoring Solutions And The Four Golden Signals
**They ask:** "How do you decide what to actually monitor, and how do cloud-native monitoring solutions differ from static ones?"

The trap in monitoring is collecting everything and alerting on nothing useful. Google's SRE framing of the **four golden signals** cuts through that: **latency** (how long requests take — and split successful from failed requests, since a fast error is a very different problem than a slow success), **traffic** (demand on the system — requests/sec, not just "is it up"), **errors** (rate of failed requests), and **saturation** (how full the system is — CPU/memory/queue depth, the leading indicator of a problem *before* it becomes an outage). Alert on these four before anything more exotic — they cover the vast majority of "is the user having a bad time" questions.

The architectural split that matters for how you *collect* those signals: static/agent-based monitoring (Nagios, Zabbix) assumes a fixed, known set of hosts you configure once — it breaks the moment infrastructure is ephemeral, because autoscaled instances come and go faster than a human can update a config file. Cloud-native monitoring (Prometheus with service discovery, Datadog, CloudWatch) solves this with **discovery**: it queries the cloud API or a service registry to find what's currently running and starts scraping it automatically, so the monitoring target list tracks the fleet instead of lagging behind it.

```
Static: nagios.cfg lists hosts by hand → breaks under autoscaling
Cloud-native: Prometheus + K8s service discovery → auto-tracks live pod/node set
```

**Say it:** "I start with the four golden signals — latency, traffic, errors, saturation — because they cover most real incidents, and I need discovery-based monitoring, not a static host list, the moment infrastructure autoscales, because a config file can't keep up with pods that live for minutes."
**Red flag:** Proposing a static Nagios-style host list for a Kubernetes or autoscaled environment. It silently stops monitoring new instances the moment the fleet changes shape — the gap is invisible until an unmonitored node is the one that fails.

### Centralized Logging And Audit Trails
**They ask:** "Why centralize logs instead of just SSHing into a box to `tail -f`, and what's the difference between logging and an audit trail?"

`tail -f` on one box stops working the moment you have more than one box, or the box that failed is the one that's gone. Centralized logging (the ELK/EFK stack, Loki, CloudWatch Logs, Datadog) ships every host's and container's logs to one searchable store, so "what happened across the fleet in the 30 seconds before the incident" is one query instead of N SSH sessions racing a log rotation. It's also the only way logging survives the failure mode that matters most — the node that crashed is exactly the node whose local logs you can no longer reach.

The distinction worth naming explicitly: application/operational logging is for *debugging* — verbose, mutable in the sense that log levels change, and often sampled or dropped under load. An **audit trail** is for *accountability* — who did what, when, immutable and retained on a compliance-driven schedule (who deleted this record, who changed this IAM policy). Conflating them is a real mistake: sampling or truncating logs to save cost is fine for debug logs, but doing that to an audit trail can mean you literally cannot answer "who did this" during a security review.

**Say it:** "Centralized logging exists because the node that crashes is the node whose logs you can't SSH into anymore — and I keep audit trails separate from debug logs, because one is disposable and sampled for cost, the other is immutable and has to answer 'who did this' months later."
**Red flag:** Applying the same retention/sampling policy to security audit events as to debug-level app logs. Dropping 90% of debug logs under load is a reasonable cost trade-off; dropping 90% of audit events means a compliance question has no answer.
