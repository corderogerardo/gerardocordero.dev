# DevOps — HA & resilience

### High Availability, Fault Tolerance And Disaster Recovery
**They ask:** "Walk me through HA, fault tolerance, and disaster recovery — how do they actually differ, and how do RTO/RPO fit in?"

They solve different failure scopes. High availability keeps a *single service* up through redundancy — multiple instances behind a load balancer so one node dying doesn't take the service down. Fault tolerance goes further: the system keeps operating *correctly* through a failure, not just "up" — think a replicated database that serves reads through a failover, not just restarts fast. Zero data loss isn't automatic even here — it only holds if the replication is synchronous (or quorum-acked) under the failure model you're actually defending against; async replication can still lose the last unshipped writes. Disaster recovery (DR) is the plan for when the whole site or region is gone — backups, a secondary region, and a documented runbook to bring the business back.

The two numbers that turn DR from a vague promise into a measurable SLA: **RTO** (recovery time objective) is how long you're allowed to be down; **RPO** (recovery point objective) is how much data you're allowed to lose, measured backward from the incident. A nightly backup with no replication gives you an RPO of up to 24 hours — if that's not acceptable for the business, the fix isn't "back up more often," it's continuous replication to a warm or hot standby.

```
RPO ←——— data loss window ———→ incident ←——— downtime ———→ RTO
     (backup frequency drives this)      (failover speed drives this)
```

**Say it:** "HA keeps one service up through redundancy, DR is the plan for losing a whole site — RTO caps how long we're down, RPO caps how much data we lose, and those two numbers are what actually drive the backup/replication architecture, not the other way around."
**Red flag:** Quoting "we do nightly backups" as the DR answer without naming an RPO. A backup schedule *is* an RPO commitment — stating it as a policy without the number means nobody's actually agreed on how much data loss is acceptable.

### Split-Brain And STONITH
**They ask:** "What is split-brain in an HA cluster, and how does STONITH prevent it?"

Split-brain happens when a network partition splits a cluster into two halves that each believe they're the *only* surviving half — and each independently promotes itself to primary. Now you have two nodes accepting writes to what should be one dataset, and reconciling that divergence afterward can mean silent data loss or corrupted state that no automatic merge can fix cleanly.

STONITH — "shoot the other node in the head" — is the blunt, effective fix: instead of trying to gracefully negotiate who's primary during a partition, a fencing agent forcibly powers off or isolates the node it can't confirm is healthy, before it can accept any writes. It's deliberately violent because *ambiguity* is the actual danger — a node that's merely unreachable, not dead, is exactly the case that causes split-brain, so the cluster can't wait for a polite handshake.

```
Node A ←—X—→ Node B   (network partition)
Both think they're primary → split-brain
Fencing agent kills B's power/network → only A can write → no split-brain
```

**Say it:** "Split-brain is two halves of a partitioned cluster both promoting themselves to primary — STONITH prevents it by forcibly fencing the node you can't confirm is healthy, because in a partition 'unreachable' and 'dead' look identical and you can't safely wait to find out which."
**Red flag:** Proposing "just have both nodes check with each other before writing" as the fix. That's exactly what fails during a partition — the whole reason fencing exists is that the nodes *can't* reliably talk to resolve the ambiguity themselves.
