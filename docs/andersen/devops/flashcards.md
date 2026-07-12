# Flashcards — DevOps (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## CI/CD IaC

### CI/CD IaC

- Walk me through the SDLC stages, and where does DevOps actually change the traditional model? — [answer](cicd-iac.md#sdlc-stages)
- Walk me through your daily git workflow — and what's actually happening when you `git add` before `git commit`? — [answer](cicd-iac.md#core-git-workflow)
- When do you rebase instead of merge, and what's actually happening to the commit history in each? — [answer](cicd-iac.md#advanced-git-rebase-vs-merge)
- Compare git flow, GitHub flow, and trunk-based development — which would you pick for a team shipping multiple times a day? — [answer](cicd-iac.md#git-strategies-and-vcs-comparison)
- Sketch a CI/CD pipeline for a typical service — what stages, and in what order? — [answer](cicd-iac.md#building-a-ci-cd-pipeline)
- CI and CD get used almost interchangeably — what does each actually guarantee, and where's the line between continuous delivery and continuous deployment? — [answer](cicd-iac.md#ci-vs-cd-deep-dive)
- Compare all-at-once, rolling, blue-green, and canary deployments — how do you pick? — [answer](cicd-iac.md#deployment-strategies-rolling-blue-green-canary)
- How do you keep a CI/CD pipeline maintainable across 20+ services instead of copy-pasted YAML everywhere? — [answer](cicd-iac.md#ci-cd-best-practices-templates-and-hooks)
- What's the actual difference between a shell script and a CM manifest, and when does a team need to graduate from one to the other? — [answer](cicd-iac.md#configuration-management-from-scripts-to-tools)
- Why IaC over a runbook of manual console clicks, and what does GitOps add on top of plain IaC? — [answer](cicd-iac.md#infrastructure-as-code-and-gitops)
- What quality gates do you wire into a pipeline before code reaches production, and how do you decide what's a hard gate versus a warning? — [answer](cicd-iac.md#qa-testing-frameworks-and-quality-gates)
- Jenkins, GitLab CI, GitHub Actions, CircleCI — what actually differs, and how would you choose for a new project? — [answer](cicd-iac.md#cicd-tool-comparison--jenkins-gitlab-ci-github-actions) {S1, S2}

## Clouds

### Clouds

- Give me the mental model for EC2, S3, and VPC — how do they relate to each other? — [answer](clouds.md#ec2-s3-vpc-and-core-aws-services)
- Explain IAM roles versus users, and why does 'least privilege' matter more for a service than for a person? — [answer](clouds.md#iam-roles-and-policies)
- What does Lambda actually buy you over EC2, and what's the real trade-off — not just 'no servers'? — [answer](clouds.md#aws-lambda-and-serverless)
- ECS vs EKS vs Fargate — what's actually different, and how do you choose? — [answer](clouds.md#ecs-and-container-orchestration-on-aws)
- Explain how AWS auto scaling actually decides to add or remove capacity, and what does 'elastic architecture' mean beyond just EC2 count? — [answer](clouds.md#auto-scaling-and-elastic-architecture)
- ALB, NLB, and the classic ELB — when do you pick each? — [answer](clouds.md#aws-load-balancer-types)
- Walk me through setting up routing/versioning in API Gateway, how it handles auth, and how you'd protect it from a DDoS attack. — [answer](clouds.md#api-gateway-routing-auth-and-ddos-protection)
- What does Multi-AZ actually do in RDS, and is it the same thing as a read replica? — [answer](clouds.md#rds-and-multi-az-deployment)
- Where does CloudFormation fit versus Elastic Beanstalk, and would you use either over Terraform? — [answer](clouds.md#cloudformation-and-elastic-beanstalk)
- How do Azure and GCP's core services map to AWS equivalents, and how do you actually reason about cloud cost efficiency across any of them? — [answer](clouds.md#azure-and-gcp-fundamentals-and-cost-efficiency)

## Containers K8s

### Containers K8s

- Write a Dockerfile for a Node app and explain what `docker run` actually does. — [answer](containers-k8s.md#building-and-running-docker-containers)
- Write a compose file for an app with a Postgres dependency, and explain how `depends_on` differs from actually waiting for the DB to be ready. — [answer](containers-k8s.md#writing-docker-compose-files)
- What is a Docker image, really — walk me through layers and the manifest. — [answer](containers-k8s.md#docker-image-layers-and-manifests)
- Write a multi-stage Dockerfile that compiles a Go binary and ships a minimal runtime image, and explain ARG vs ENV and CMD vs ENTRYPOINT. — [answer](containers-k8s.md#multi-stage-builds-arg-vs-env-and-entrypoint)
- A container isn't a VM — explain what namespaces and cgroups actually give it, and how two containers on the same host talk to each other. — [answer](containers-k8s.md#container-internals-namespaces-cgroups-and-virtual-networking)
- Docker, containerd, CRI-O, podman — what's actually different, and why does Kubernetes not run 'Docker' anymore? — [answer](containers-k8s.md#container-runtimes-compared)
- Compare bridge, host, macvlan, and none network modes — when do you reach for each? — [answer](containers-k8s.md#docker-network-modes)
- What are the major Docker security mistakes, and how do you defend against a container breakout? — [answer](containers-k8s.md#docker-security-pitfalls-and-defense)
- Explain Pods, Deployments, and Services, and why does a Pod exist as a separate concept from a container? — [answer](containers-k8s.md#kubernetes-core-concepts)
- Beyond scheduling containers, what does 'orchestration' actually give you at scale — and where does a service mesh fit? — [answer](containers-k8s.md#orchestration-load-balancing-circuit-breaking-and-service-mesh)

## Linux

### Linux

- How do apt and yum differ under the hood, and walk me through the Unix permission model. — [answer](linux.md#package-managers-and-file-permissions)
- Explain stdin/stdout/stderr, and write a script that greps a log for errors and reports a count. — [answer](linux.md#standard-streams-redirection-and-bash-basics)
- Write a systemd unit for a service that restarts on failure, and compare a systemd timer to cron. — [answer](linux.md#systemd-services-and-scheduled-jobs)
- Show me a script that renders a config template from environment variables and parses the result with jq. — [answer](linux.md#advanced-bash-scripting)
- How would you set up interface teaming, VLANs, and a bridge on a Linux host, and why would you need to? — [answer](linux.md#advanced-linux-networking-setup)
- Walk me through the Linux boot sequence, and why would you choose LVM over a plain partition? — [answer](linux.md#lvm-boot-process-and-kernel-modules)
- How do ext4, XFS, and a distributed filesystem like Ceph or GlusterFS differ, and when do you actually need distributed storage? — [answer](linux.md#filesystems-and-distributed-filesystems)
- Standard Unix permissions feel too coarse for a shared directory — how do ACLs and SELinux/AppArmor help? — [answer](linux.md#linux-security-hardening-acl-and-selinux)

## Networking

### Networking

- Walk me through the OSI model and where a couple of real protocols actually sit. — [answer](networking.md#osi-model-and-protocol-layers)
- Given `10.0.0.0/16`, how many usable hosts, and how would you carve it into subnets for three availability zones? — [answer](networking.md#cidr-blocks-and-subnetting)
- What is NAT, and why do full-cone, restricted, and symmetric NAT matter for something like WebRTC or VoIP? — [answer](networking.md#nat-and-nat-types)
- Walk me through what happens between typing a URL and the browser getting an IP address. — [answer](networking.md#dns-resolution)
- When would you use static routes versus a dynamic routing protocol like BGP or OSPF? — [answer](networking.md#static-vs-dynamic-routing)
- How does a site-to-site VPN differ from an SDN overlay network, and why would you reach for the latter? — [answer](networking.md#vpns-and-sdn-overlay-networks)
- Explain the TLS handshake, and what a certificate chain is actually verifying. — [answer](networking.md#http-methods-and-https-tls)
- Why does CORS exist, and what actually stops a malicious site from reading your API's response? — [answer](networking.md#cors-and-cross-origin-defense)
- Compare basic auth, API keys, OAuth2, and mTLS — when do you actually reach for each? — [answer](networking.md#authentication-mechanisms)
- Explain the difference between L4 and L7 load balancing, and how does health checking actually detect a bad node? — [answer](networking.md#load-balancing-concepts)
- Name the web vulnerabilities you actively defend against, and explain why long-lived connections like WebSockets or gRPC streams complicate that. — [answer](networking.md#web-vulnerabilities-websockets-and-grpc)

## HA & Resilience

### High Availability Concepts & FailOver

- Walk me through HA, fault tolerance, and disaster recovery — how do they actually differ, and how do RTO/RPO fit in? — [answer](resilience.md#high-availability-fault-tolerance-and-disaster-recovery) {M1, M2, M3, S1, S2}
- What is split-brain in an HA cluster, and how does STONITH prevent it? — [answer](resilience.md#split-brain-and-stonith) {S1, S2}

## Configuration Management

### Configuration Management

- Walk me through how Ansible actually applies a playbook — inventory, modules, and how it stays idempotent. — [answer](config-mgmt.md#ansible-playbooks-inventory-and-idempotency) {M2, M3, S1, S2}
- Ansible, Puppet, Chef, Salt — what actually differs, and how would you choose for a 5,000-node fleet versus a 20-server startup? — [answer](config-mgmt.md#configuration-management-tools-compared--push-vs-pull) {S1, S2}

## Message brokers

### Message Brokers

- What's a message broker for, and what delivery guarantees does it actually give you? — [answer](message-brokers.md#message-broker-fundamentals-and-delivery-guarantees) {M1, M2, M3}
- How do you cluster a broker for HA, and how would you load-test it before trusting it in production? — [answer](message-brokers.md#message-broker-ha-clustering-and-performance-testing) {M2, M3, S1, S2}

## DBMS

### Relational & Non-relational DBs

- When do you actually reach for NoSQL over a relational DB, and what does CAP theorem have to do with that choice? — [answer](databases.md#relational-vs-nosql-and-the-cap-theorem) {M3, S1, S2}
- How does a database stay available through a node failure, and what's the failure mode you have to design against? — [answer](databases.md#database-clustering-replication-and-split-brain) {M3, S1, S2}
- A query is slow in production — walk me through how you'd diagnose it, and how do indexes actually help? — [answer](databases.md#database-indexes-permissions-and-query-tracing) {M1, M2}

## Operations & IaaC

### Monitoring & Audit

- How do you decide what to actually monitor, and how do cloud-native monitoring solutions differ from static ones? — [answer](observability.md#monitoring-solutions-and-the-four-golden-signals) {M3, S1, S2}

### Logging

- Why centralize logs instead of just SSHing into a box to `tail -f`, and what's the difference between logging and an audit trail? — [answer](observability.md#centralized-logging-and-audit-trails) {M3, S1, S2}
