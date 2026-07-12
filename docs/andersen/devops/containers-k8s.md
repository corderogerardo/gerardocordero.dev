# DevOps — Containers & Orchestration

### Building And Running Docker Containers
**They ask:** "Write a Dockerfile for a Node app and explain what `docker run` actually does."

A Dockerfile is a recipe for a layered filesystem image; `docker run` takes that image and starts an isolated process from it. The senior habit that separates this from "I copied a Dockerfile from a tutorial" is layer ordering: Docker caches each instruction as a layer, so putting things that change rarely (dependency install) *before* things that change often (source code) means most builds only re-run the fast final layers.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]
```

```bash
docker run -d -p 3000:3000 --name app myimage:latest
```

**Say it:** "I order Dockerfile instructions by change frequency — dependencies before source — so the cache actually saves build time instead of invalidating on every commit."
**Red flag:** Copying the entire source tree before running `npm install` — every code change busts the dependency-install cache layer and turns a 3-second build into a 3-minute one.

### Writing Docker Compose Files
**They ask:** "Write a compose file for an app with a Postgres dependency, and explain how `depends_on` differs from actually waiting for the DB to be ready."

Compose exists to describe a multi-container application declaratively instead of a shell script of `docker run` commands — networking between services, volumes, and env config all live in one file.

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      retries: 5
```

The trap: plain `depends_on` only waits for the container to *start*, not for Postgres to actually accept connections — that gap is exactly why the app crashes on `db connection refused` in the first few seconds even though "depends_on was set." `condition: service_healthy` plus a real healthcheck is what closes it.

**Say it:** "`depends_on` alone controls start order, not readiness — I pair it with a healthcheck and `condition: service_healthy` so the app doesn't race the database's actual startup time."
**Red flag:** Relying on `depends_on` alone for a database dependency and being surprised by intermittent connection-refused errors on cold start.

### Docker Image Layers And Manifests
**They ask:** "What is a Docker image, really — walk me through layers and the manifest."

An image is a stack of read-only layers, each one the filesystem diff produced by a Dockerfile instruction, plus a manifest (JSON) that lists those layers by content-addressed digest and describes the image config (entrypoint, env, exposed ports). When you run a container, Docker adds one thin writable layer on top via a union filesystem (overlay2) — the image layers underneath stay immutable and shared across every container built from that image.

That sharing is the reason `docker pull` is often fast for a new tag: if the base-image layers already exist locally, only the layers that actually changed get pulled — content-addressing means identical layers across different images are stored once.

**Say it:** "Layers are immutable, content-addressed filesystem diffs; the manifest is the index that stitches them together — that's why identical base layers are shared across images instead of duplicated on disk."
**Red flag:** Describing an image as "a snapshot" without mentioning it's a *layered, shared* filesystem — that's the detail that explains registry storage and pull efficiency.

### Multi Stage Builds ARG Vs ENV And Entrypoint
**They ask:** "Write a multi-stage Dockerfile that compiles a Go binary and ships a minimal runtime image, and explain ARG vs ENV and CMD vs ENTRYPOINT."

Multi-stage builds solve image bloat: a build stage can have the full compiler toolchain, and only the compiled artifact gets copied into a minimal final stage — the toolchain never ships to production.

```dockerfile
FROM golang:1.22 AS build
ARG VERSION=dev
WORKDIR /src
COPY . .
RUN go build -ldflags "-X main.version=${VERSION}" -o app .

FROM gcr.io/distroless/static
COPY --from=build /src/app /app
ENTRYPOINT ["/app"]
```

`ARG` is build-time only — gone once the image is built, useful for things like a version tag. `ENV` persists into the running container and is visible to the process. For `CMD` vs `ENTRYPOINT`: `ENTRYPOINT` is the fixed executable, `CMD` supplies default *arguments* to it that a `docker run` override replaces — that split is what lets `docker run myimage --help` work without redefining the whole entrypoint.

**Say it:** "Multi-stage builds keep the compiler out of the shipped image, `ARG` is build-time only while `ENV` persists into the container, and `ENTRYPOINT`+`CMD` split lets callers override just the arguments."
**Red flag:** Shipping the full SDK/toolchain image to production because a single-stage Dockerfile was "good enough" — that's a much larger attack surface and a slower deploy for no runtime benefit.

## Docker Internals & Security

### Container Internals Namespaces Cgroups And Virtual Networking
**They ask:** "A container isn't a VM — explain what namespaces and cgroups actually give it, and how two containers on the same host talk to each other."

Namespaces and cgroups are the two Linux kernel primitives containers are built from, and knowing which does what explains most "why does this behave like that" container questions. Namespaces provide *isolation* — PID namespace makes a container see its own process tree starting at PID 1, network namespace gives it its own interfaces/routes, mount namespace gives it its own filesystem view. Cgroups provide *resource limits* — CPU shares, memory caps, I/O throttling — independent of isolation.

Networking between containers on the default bridge network works through a veth (virtual ethernet) pair: one end lives in the container's network namespace, the other attaches to the host's `docker0` bridge, and the bridge forwards frames between containers like a virtual switch.

```bash
docker run -d --memory=512m --cpus=1 myimage
```

**Say it:** "Namespaces isolate what a process can see, cgroups limit what it can consume — a container is the combination of both, not a separate kernel like a VM has."
**Red flag:** Calling a container "a lightweight VM." It shares the host kernel — that shared kernel is exactly why container escapes are a real threat model that VMs don't have in the same way.

### Container Runtimes Compared
**They ask:** "Docker, containerd, CRI-O, podman — what's actually different, and why does Kubernetes not run 'Docker' anymore?"

The runtime landscape split into layers: a *high-level* runtime (containerd, CRI-O) handles image pulling, storage, and the container lifecycle; a *low-level* runtime (runc, crun) does the actual namespace/cgroup setup to spawn the process, per the OCI runtime spec. Docker itself is a full toolchain (CLI, build, daemon) that historically wrapped containerd.

Kubernetes talks to runtimes through the CRI (Container Runtime Interface), and Docker's daemon never implemented CRI directly — `dockershim` used to translate, and Kubernetes dropped it in 1.24, so clusters now run containerd or CRI-O directly, cutting out a translation layer. `podman` is a different design entirely: daemonless, rootless by default, which closes off a whole class of privilege-escalation risk that a root daemon carries.

**Say it:** "Kubernetes dropped Docker support because it never spoke CRI natively — containerd and CRI-O do, which is why clusters run those directly now instead of through a shim."
**Red flag:** Saying "Kubernetes doesn't support Docker anymore" as if Docker-built images stopped working — OCI images are runtime-agnostic; it's the *daemon*, not the image format, that changed.

### Docker Network Modes
**They ask:** "Compare bridge, host, macvlan, and none network modes — when do you reach for each?"

Bridge is the default and the right choice almost always: each container gets its own network namespace and IP on a private virtual network, isolated from the host, with published ports for external access. Host mode drops that isolation — the container shares the host's network namespace directly, which removes NAT overhead (useful for latency-sensitive workloads) at the cost of port collisions and losing network isolation entirely.

Macvlan/ipvlan give a container its own MAC/IP directly on the physical network, as if it were a separate physical host — useful for legacy apps that expect to own a real network identity, or network appliances that need to be addressable directly. `none` disables networking entirely, for a container that only needs the filesystem/compute, not connectivity.

**Say it:** "Bridge is the default for isolation and portability; I only reach for host mode when NAT overhead genuinely matters, and macvlan when something needs to look like a real host on the physical LAN."
**Red flag:** Defaulting to host networking "for performance" across the board — it's rarely the actual bottleneck and it silently removes the network isolation bridge mode was giving you for free.

### Docker Security Pitfalls And Defense
**They ask:** "What are the major Docker security mistakes, and how do you defend against a container breakout?"

The biggest recurring mistake is running as root inside the container — if an attacker gets code execution, root inside the container plus a kernel vulnerability is a path to root on the *host*, since containers share the kernel. The fix is a non-root `USER` in the Dockerfile and, where the orchestrator supports it, `runAsNonRoot` enforcement.

The second common gap is the Docker socket: mounting `/var/run/docker.sock` into a container for "convenience" (DinD-style tooling) effectively hands that container root on the host, because anyone who can talk to the daemon can launch privileged containers. For CI image builds that need isolation without a privileged daemon, Kaniko builds images in userspace without Docker-in-Docker at all.

```dockerfile
RUN adduser -D appuser
USER appuser
```

**Say it:** "I run containers as a non-root user by default and never mount the Docker socket into an untrusted container — that socket is functionally root on the host, not a convenience shortcut."
**Red flag:** Mounting the Docker socket into a CI build container to let it build images "the easy way" — that's handing host-root to whatever runs in that pipeline step.

## Kubernetes

### Kubernetes Core Concepts
**They ask:** "Explain Pods, Deployments, and Services, and why does a Pod exist as a separate concept from a container?"

A Pod is the smallest deployable unit in Kubernetes, not a container — because sometimes you need multiple tightly-coupled containers (app + sidecar) that must share network namespace and storage, scheduled together as one unit. A Deployment doesn't manage Pods directly; it manages a ReplicaSet, which is what actually keeps N Pod replicas running and drives rolling updates when the Pod template changes.

A Service solves the problem that Pods are ephemeral and get new IPs on every restart — it's a stable virtual IP/DNS name that load-balances across whatever Pods currently match its label selector, so nothing downstream needs to track individual Pod IPs.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: web
          image: myapp:1.4.0
```

**Say it:** "A Pod exists because some containers genuinely need to share network and storage as one scheduling unit; a Service exists because Pod IPs are ephemeral — the label selector is what keeps routing correct across restarts."
**Red flag:** Hardcoding a Pod IP anywhere in application config — Pods are disposable by design, and that IP is guaranteed to change on the next reschedule.

### Orchestration Load Balancing Circuit Breaking And Service Mesh
**They ask:** "Beyond scheduling containers, what does 'orchestration' actually give you at scale — and where does a service mesh fit?"

Orchestration is scheduling plus everything that keeps a distributed system resilient: load balancing across replicas, health-based routing, and self-healing (restarting or rescheduling failed instances) so the platform absorbs failure instead of paging a human for every crashed Pod.

Circuit breaking is the pattern that stops a failing downstream service from cascading — after enough failures, the caller stops sending requests to it for a cooldown period instead of piling up timeouts. A service mesh (Istio, Linkerd) implements that pattern, plus mTLS between services and fine-grained traffic splitting, via a sidecar proxy next to every Pod — moving that resilience logic out of application code and into infrastructure.

**Say it:** "Orchestration keeps the system self-healing at the scheduling level; a service mesh adds circuit breaking, mTLS, and traffic control at the network level, via sidecars — so resilience isn't reimplemented in every service's code."
**Red flag:** Reaching for a full service mesh on a five-service system "because Netflix does it" — the sidecar overhead and operational complexity aren't free, and at that scale the resilience patterns can live in a shared library instead.
