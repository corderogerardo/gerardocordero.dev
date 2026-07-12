# DevOps — Clouds

### EC2 S3 VPC And Core AWS Services
**They ask:** "Give me the mental model for EC2, S3, and VPC — how do they relate to each other?"

These three cover the base layer almost every AWS architecture builds on, and the useful framing is compute vs. storage vs. network. EC2 is virtual machines — you rent compute, choose an instance type sized for CPU/memory/network needs, and you're responsible for the OS up. S3 is object storage — not a filesystem, a flat key-value store for objects (files, backups, static assets) accessed over HTTP, durable and effectively infinitely scalable without provisioning capacity up front.

VPC is the network layer that ties them together: your own isolated slice of the AWS network, with subnets, route tables, and security groups controlling what can reach your EC2 instances and how they reach the internet or other AWS services. Nothing in EC2 or S3 has meaningful network isolation without VPC underneath it.

**Say it:** "EC2 is compute, S3 is object storage, VPC is the network boundary that isolates and controls how they're reachable — everything else in AWS's compute/storage story sits on top of that base layer."
**Red flag:** Describing S3 as "cloud file storage" without the object-store distinction — no POSIX filesystem semantics, no partial in-place edits, which matters the moment someone tries to `mount` it and expects filesystem behavior.

### IAM Roles And Policies
**They ask:** "Explain IAM roles versus users, and why does 'least privilege' matter more for a service than for a person?"

IAM users are for long-lived human or application identities with permanent credentials; IAM *roles* are meant to be assumed temporarily — an EC2 instance, a Lambda function, or a federated user assumes a role and gets short-lived credentials, no long-lived secret to leak. That's the senior distinction: attaching a role to an EC2 instance means the application never has an access key sitting in an env var or config file at all.

Least privilege matters more for services because a compromised service with an overly broad role is a much larger blast radius than a compromised human account — an attacker who pops a web server with an `AdministratorAccess` role owns the whole account, not just that server.

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-app-assets/*"
}
```

**Say it:** "I attach roles, not long-lived access keys, to anything that runs in AWS — and I scope the policy to exactly the actions and resources that workload needs, because a compromised over-privileged role is the actual blast radius in most cloud incidents."
**Red flag:** Hardcoding an IAM access key/secret into application config or an env var instead of using an instance/execution role — that's a long-lived credential sitting somewhere it can leak, when the platform offers short-lived, role-based credentials for free.

### AWS Lambda And Serverless
**They ask:** "What does Lambda actually buy you over EC2, and what's the real trade-off — not just 'no servers'?"

Lambda's value isn't "no servers exist" — AWS still runs servers, you just don't manage them. The real trade-off is billing and scaling granularity: Lambda scales to zero and bills per invocation/duration, which is a huge win for spiky or infrequent workloads where an always-on EC2 instance would sit mostly idle. For sustained high-throughput traffic, a right-sized EC2 fleet is often cheaper per unit of work.

The cost that's easy to underestimate: cold starts (a fresh execution environment has real init latency, worse for large deployment packages or VPC-attached functions) and a 15-minute max execution time, which rules Lambda out for long-running jobs.

**Say it:** "Lambda's real win is billing granularity for spiky workloads, not the absence of servers — for sustained high throughput, a right-sized always-on fleet is often the cheaper option once you account for cold starts."
**Red flag:** Proposing Lambda as a default for every workload "because serverless is better" — a steady, high-volume workload can be more expensive on a per-invocation model than on reserved EC2/Fargate capacity.

### ECS And Container Orchestration On AWS
**They ask:** "ECS vs EKS vs Fargate — what's actually different, and how do you choose?"

ECS is AWS's own container orchestrator — simpler than Kubernetes, tightly integrated with the rest of AWS (IAM roles per task, ALB integration), the right call when you don't need Kubernetes's portability or ecosystem and want less operational surface. EKS is managed Kubernetes — same K8s API, portable to any cloud or on-prem, worth the extra complexity when you need that portability or your team already has Kubernetes expertise.

Fargate is orthogonal to both — it's the *compute mode*: instead of provisioning and managing EC2 instances as the cluster's worker nodes, Fargate runs your containers on AWS-managed infrastructure you never see, for both ECS and EKS. The trade-off is the same shape as Lambda vs EC2: less operational burden, less control over the underlying instance, generally higher per-unit cost than self-managed EC2 capacity.

**Say it:** "ECS is the simpler AWS-native choice when I don't need Kubernetes portability; EKS is for when I do. Fargate is a separate axis — managed compute for either — trading control and cost for zero instance management."
**Red flag:** Reaching for EKS "because Kubernetes is the standard" on a single-cloud, AWS-only workload with no portability requirement — that's importing K8s's operational complexity for a benefit (portability) the project doesn't need.

### Auto Scaling And Elastic Architecture
**They ask:** "Explain how AWS auto scaling actually decides to add or remove capacity, and what does 'elastic architecture' mean beyond just EC2 count?"

An Auto Scaling Group is defined by min/max/desired capacity and scaling policies — target tracking (hold a metric like CPU at 60%), step scaling, or scheduled scaling for predictable load patterns. The mechanism matters: target tracking reacts to CloudWatch metrics with a cooldown period, so it's not instantaneous — there's real lag between a traffic spike and new capacity actually serving requests, which is why capacity planning still matters even with auto scaling on.

"Elastic architecture" is bigger than instance count: it means every layer scales independently and statelessly — the app tier scales horizontally because sessions aren't pinned to a specific instance (externalized to something like ElastiCache/DynamoDB), the database scales via read replicas or a serverless option, and the load balancer/DNS layer absorbs the changing backend set transparently.

**Say it:** "Auto scaling reacts to metrics with real lag, so I still design for that lag — stateless app instances so any new capacity can serve traffic immediately, not just 'more EC2 instances exist eventually.'"
**Red flag:** Relying on auto scaling alone to handle a known traffic spike (a product launch) without pre-warming or scheduled scaling — reactive scaling has lag that a predictable spike doesn't have to eat.

## AWS Networking, Data & IaC

### AWS Load Balancer Types
**They ask:** "ALB, NLB, and the classic ELB — when do you pick each?"

ALB (Application Load Balancer) operates at L7 — it can route by URL path or host header, terminate TLS, and integrate with target groups for microservices behind one balancer, which is why it's the default for HTTP/HTTPS workloads. NLB (Network Load Balancer) operates at L4 — it preserves the client's source IP, handles millions of requests per second with ultra-low latency, and supports static IPs, which makes it the right call for non-HTTP TCP/UDP traffic or extreme-throughput/low-latency requirements.

The classic ELB is the legacy option, largely superseded by ALB/NLB — a "why does this exist" answer, not a "what would I choose" answer, unless maintaining an old stack that already uses it.

**Say it:** "ALB for content-aware HTTP routing, NLB when I need L4 performance, static IPs, or non-HTTP protocols — the classic ELB is legacy at this point, not a new-build choice."
**Red flag:** Reaching for NLB by default because it's "faster" — most workloads need ALB's L7 routing (path-based routing, host-based routing to microservices) far more than they need NLB's raw throughput ceiling.

### API Gateway Routing Auth And DDoS Protection
**They ask:** "Walk me through setting up routing/versioning in API Gateway, how it handles auth, and how you'd protect it from a DDoS attack."

API Gateway sits in front of backend compute (Lambda, EC2, any HTTP endpoint) and handles the cross-cutting concerns so individual services don't reimplement them — routing by resource path and HTTP method, with versioning typically done via a path prefix (`/v1/`, `/v2/`) or a separate deployment stage per version, so old and new API versions can run side by side during a migration.

Auth is pluggable at the gateway layer: IAM auth for AWS-internal callers, Cognito user pools for end-user auth, or a Lambda authorizer for fully custom token validation — the point is the backend never sees an unauthenticated request, the gateway rejects it before invocation.

For DDoS: AWS Shield Standard is automatic and free at the account level; Shield Advanced adds larger-scale volumetric protection and cost protection; and a WAF (Web Application Firewall) attached to the gateway adds rate-based rules and request filtering — rate limiting at the gateway (usage plans + API keys, or WAF rate rules) is the first practical layer most teams actually configure.

**Say it:** "I push auth and rate limiting to the gateway layer so every backend inherits the same protection without reimplementing it — and for DDoS, a WAF rate-based rule in front of the gateway is the practical first layer beyond Shield Standard's baseline protection."
**Red flag:** Implementing auth checks independently inside every Lambda behind the gateway instead of at the gateway — that's N places to get it right instead of one, and N places an unauthenticated request can slip through.

### RDS And Multi AZ Deployment
**They ask:** "What does Multi-AZ actually do in RDS, and is it the same thing as a read replica?"

Multi-AZ is a *high-availability* feature, not a scaling feature: RDS provisions a synchronously-replicated standby in a different Availability Zone, and if the primary fails, RDS automatically fails over to the standby — the endpoint stays the same, so the application doesn't need to change connection strings. It's not readable — you can't query the standby for extra read capacity.

A read replica is the opposite: an *asynchronously* replicated copy you can point read traffic at to scale reads horizontally — it doesn't provide automatic failover on its own (though a read replica can be manually promoted), and because replication is async there's replication lag, so reads from a replica can be slightly stale. Production systems commonly run both: Multi-AZ for availability, read replicas for read scaling — they solve different problems and aren't substitutes for each other.

**Say it:** "Multi-AZ is for availability — synchronous standby, automatic failover, same endpoint. Read replicas are for read scaling — asynchronous, queryable, but with replication lag. I use both together because they solve different problems."
**Red flag:** Treating a read replica as a disaster-recovery solution — async replication lag means a failover to a stale replica can lose recent writes, which Multi-AZ's synchronous replication is specifically designed to avoid.

### CloudFormation And Elastic Beanstalk
**They ask:** "Where does CloudFormation fit versus Elastic Beanstalk, and would you use either over Terraform?"

CloudFormation is AWS's native IaC service — you declare resources in a JSON/YAML template, and CloudFormation manages the full lifecycle (create, update, rollback on failure) as a "stack," including dependency ordering between resources. It's AWS-only, but that native integration means new AWS features often land in CloudFormation support before third-party tools catch up.

Elastic Beanstalk is a layer above that: a PaaS that provisions and wires up the underlying resources (EC2, load balancer, auto scaling, RDS) for a standard web-app shape from just your application code and a few settings — trading control for a much faster path to a working, scalable deployment. Terraform's advantage over CloudFormation is being multi-cloud and having a larger community module ecosystem — the actual trade-off is AWS-native integration and no extra state-file management (CloudFormation) versus portability and provider breadth (Terraform).

**Say it:** "Elastic Beanstalk trades control for speed on a standard web-app shape; CloudFormation is the AWS-native IaC primitive underneath a lot of that automation; I'd reach for Terraform specifically when the infrastructure needs to span more than AWS."
**Red flag:** Recommending Elastic Beanstalk for a workload with non-standard infrastructure needs — it's optimized for a specific app shape, and fighting its assumptions usually costs more than writing the CloudFormation/Terraform directly.

### Azure And GCP Fundamentals And Cost Efficiency
**They ask:** "How do Azure and GCP's core services map to AWS equivalents, and how do you actually reason about cloud cost efficiency across any of them?"

The core building blocks translate directly once you know the mapping: Azure VMs / GCP Compute Engine ↔ EC2, Azure Blob Storage / GCS ↔ S3, Azure VNet / GCP VPC ↔ AWS VPC, Azure Load Balancer / GCP Cloud Load Balancing ↔ ELB family. GCP's global load balancer and network are notably more unified across regions than AWS's region-scoped VPCs, which is a real architectural difference, not just naming.

Cost efficiency across any of them comes down to the same few levers: right-sizing (don't provision for peak when average is a fraction of it), reserved/committed-use discounts for predictable steady-state load, spot/preemptible instances for fault-tolerant batch work, and lifecycle policies that move cold data to cheaper storage tiers automatically instead of leaving everything on hot storage indefinitely.

**Say it:** "The service names differ but the shape is the same across AWS, Azure, and GCP — and cost efficiency is the same four levers everywhere: right-size, commit for steady-state discounts, spot capacity for fault-tolerant work, and tier storage by access frequency."
**Red flag:** Treating "the cloud is expensive" as inherent rather than a right-sizing and reservation problem — an idle on-demand fleet running 24/7 with no commitment discount is a cost-modeling failure, not a platform limitation.
