# Docker & Containerization

## The Problem Docker Solves

You finish building your app. It runs perfectly on your machine. You send it to a teammate — it crashes. They're on a different OS, a different Node version, missing a library you forgot to mention. This is the classic **"works on my machine"** problem.

Docker solves it by packaging your app *together with everything it needs to run* — the runtime, the dependencies, the config — into a single portable unit.

---

## Virtual Machines vs. Containers

Before Docker, the solution was **Virtual Machines (VMs)**.

A VM emulates an entire computer inside your computer. It has its own operating system, its own kernel, its own drivers — everything. You can run a Linux VM on a Mac, or a Windows VM on Linux.

The tradeoff: VMs are heavy. Each one carries a full OS that might be 1–20 GB and takes minutes to boot.

**Containers** take a different approach. Instead of emulating hardware and running a separate OS, containers share the host machine's OS kernel and isolate only the application layer. Each container gets its own filesystem, processes, and network — but no duplicate OS.

Think of a container as a pocket-sized VM — it behaves like its own machine, but it's lightweight, fast to start, and shares the kernel with the host.

| | Virtual Machine | Container |
|---|---|---|
| Includes full OS | ✅ | ❌ |
| Startup time | Minutes | Seconds |
| Size | GBs | MBs |
| Isolation | Strong (hardware-level) | Strong (process-level) |
| Portability | Limited | High |

---

## What Is Docker?

Docker is the most widely used platform for building and running containers. It gives you:

- A standard format for packaging applications (images)
- A runtime for launching and managing containers
- A registry for sharing images (Docker Hub)
- A CLI for controlling everything

Installing **Docker Desktop** gives you all of this in one go — the engine, the CLI, and a GUI. One install, everything works.

---

## Images vs. Containers

These two terms come up constantly and are easy to confuse.

**An image** is a blueprint. It's a read-only snapshot that describes an environment — the OS, the runtime, the dependencies. Images are built once and stored. They don't run; they describe.

**A container** is a running instance of an image. When you launch an image, Docker creates a container from it — an isolated, live process on your machine. You can run multiple containers from the same image simultaneously.

The relationship is similar to a class and an object in programming: the image is the class definition, the container is the instance.

```
Image (blueprint)  →  docker run  →  Container (running process)
```

---

## Image Layers

Images are built in layers, stacked on top of each other. Docker Hub hosts thousands of pre-built images — you don't have to start from scratch.

Here's how the layers typically look:

```
node:alpine
└── Alpine Linux (tiny base OS)
    └── Node.js installed on top

node:20
└── Ubuntu (full base OS)
    └── Node.js installed on top

python
└── Ubuntu
    └── Python installed on top

ubuntu
└── Just Ubuntu — nothing else
```

When you write `FROM node:20-alpine` in a Dockerfile, you're starting from a pre-built image that already has Node installed on Alpine Linux. You then add your own app on top as the final layer.

This is why you pull different images for different purposes:

| Image | What's inside |
|---|---|
| `ubuntu` | Bare Ubuntu — nothing extra |
| `python` | Ubuntu + Python |
| `node` | Ubuntu + Node.js |
| `node:alpine` | Alpine Linux + Node.js (much smaller) |

---

## Hands-On: Your First Container

Start by pulling the Ubuntu image from Docker Hub:

```bash
docker pull ubuntu
```

You'll see Docker downloading layers one by one — each layer is a piece of the image.

Now run it and shell straight in:

```bash
docker run -it --name my-ubuntu ubuntu bash
```

The `-i` flag keeps stdin open so you can type commands. The `-t` flag allocates a terminal so it behaves like a real shell. Together they drop you straight inside the container.

You're now inside a live Linux machine. Try poking around:

```bash
ls
pwd
echo "hello from inside a container"
```

When you type `exit`, the container stops. It behaved exactly like a Linux machine — because it is one, just containerized.

---

## Hands-On: Networking Between Two Containers

Now spin up two Ubuntu containers on the same network and get them talking to each other.

```bash
# Create a network
docker network create my-network

# Run two containers on it (detached so both run simultaneously)
docker run -it -d --name container-a --network my-network ubuntu bash
docker run -it -d --name container-b --network my-network ubuntu bash
```

Shell into `container-a`:

```bash
docker exec -it container-a bash
```

Ubuntu's minimal image doesn't include ping — install it:

```bash
apt-get update && apt-get install -y iputils-ping
```

Now ping `container-b` by name:

```bash
ping container-b
```

Docker resolves the name automatically — no IP addresses needed. The containers are talking to each other over a private network.

---

## The Blank Slate Problem

While you're inside `container-a`, try running Node:

```bash
node
```

Command not found. This is a bare Ubuntu container — nothing is installed except the OS itself. You have two options:

**Option 1 — Install it manually:**
```bash
apt-get install -y nodejs
```

**Option 2 — Use a pre-built image that already has Node:**
```bash
docker run -it node:alpine sh
```

You're dropped straight into a container where Node is already there and ready. This is the point of Docker Hub — someone already did the work of building and testing that environment. You just pull it.

---

## The Dockerfile

Once you want to ship your own app, you describe your image in a **Dockerfile** — a sequence of instructions Docker executes layer by layer.

```dockerfile
# Start from an existing base image (Node.js 20 on Alpine Linux)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first (enables layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app listens on
EXPOSE 3000

# The command that runs when the container starts
CMD ["node", "server.js"]
```

Each instruction creates a layer. Docker caches layers — if nothing changes in a layer, Docker reuses the cached version on the next build. This is why `COPY package*.json` comes before `COPY . .`: dependencies change less often than source code, so the install step stays cached most of the time.

---

## Core Docker CLI Commands

```bash
# Pull an image from Docker Hub
docker pull ubuntu

# Run a container interactively
docker run -it --name my-container ubuntu bash

# Run a container in the background (detached)
docker run -it -d --name my-container ubuntu bash

# List running containers
docker ps

# Shell into a running container
docker exec -it <container-name> bash

# Stop a running container
docker stop <container-name>

# Remove a container
docker rm <container-name>

# List all local images
docker images

# Remove an image
docker rmi <image-name>

# Build an image from a Dockerfile
docker build -t my-app .
```

---

## Docker Networking

### The Problem: Containers Are Isolated

A container is designed to be isolated. But that creates an immediate problem for real applications: your React frontend can't reach your Express backend if they're in separate containers — unless you connect them.

Docker networking solves this.

---

### Bridge Network

When you create a user-defined bridge network, containers on it can reach each other by name — Docker handles the DNS automatically.

```bash
# Create a network
docker network create my-network

# Run containers on the same network
docker run --network my-network --name backend my-backend-image
docker run --network my-network --name frontend my-frontend-image
```

Now `frontend` can make requests to `http://backend:3000`. No hardcoded IPs.

---

### Port Mapping

Containers on a network can talk to each other — but your browser is not inside that network. To reach a container from your machine, you map a port:

```bash
docker run -p 3000:3000 my-app
#           ↑host  ↑container
```

The left side is the port on your machine. The right side is the port the app listens on inside the container. They don't have to match:

```bash
docker run -p 8080:3000 my-app
# Access at localhost:8080, app inside sees port 3000
```

---

## Where Docker Networking Actually Matters

A common misconception: you might think the frontend container needs to call the backend container by name. It doesn't — and it can't.

React code runs in the **browser**, not in the container. The browser has no idea what a container name is — it's not on the Docker network. So even if your frontend container is on the network, the actual fetch call happens outside Docker entirely.

```
❌ Browser → http://backend-container:3000   (browser can't resolve this)
✅ Browser → http://localhost:3000           (port mapping handles this)
```

The real use case for Docker networking is **backend-to-database**:

```
Browser → localhost:3000 → [Express container] → mongodb://mongo:27017 → [MongoDB container]
```

The browser never touches MongoDB. Express does — server-side, inside Docker, where container names work perfectly. That's the pattern worth learning.

---

## Environment Variables in Docker

Never bundle your `.env` file into a Docker image. Secrets baked into an image can be inspected by anyone who has access to it.

Instead, pass environment variables at runtime:

```bash
# Pass a whole .env file
docker run -p 3000:3000 --env-file .env my-app

# Or pass individual variables
docker run -p 3000:3000 -e MONGO_URI=mongodb://mongo:27017/mydb my-app
```

Keep `.env` out of the image entirely using a `.dockerignore` file — same idea as `.gitignore`:

```
.env
node_modules
```

In your code, use environment variables instead of hardcoded values:

```js
const API_URL = import.meta.env.VITE_API_URL;  // React (Vite)
const MONGO_URI = process.env.MONGO_URI;        // Express
```

In production, environment variables are set directly in your hosting platform — Render, Railway, AWS etc. all have a UI for this. The `.env` file never leaves your machine.

One important Vite-specific detail: `VITE_` variables are baked into the bundle at **build time**, not runtime. The variable needs to be set on the platform before you build, not just before you run.

---

## Docker vs. PaaS (Render, Railway, Vercel)

Platforms like Render, Railway, and Vercel are **Platform as a Service (PaaS)** — they abstract all the infrastructure away. You push code, they handle the rest. For simple apps, Docker is optional.

Docker becomes essential when you move to **Infrastructure as a Service (IaaS)** — like AWS EC2, GCP Compute Engine, or a bare VPS. These give you a raw server and nothing else. No Node, no runtime, no setup. You ship a container image and the server just runs it.

Docker is also valuable even with PaaS when:

- You have a **complex multi-service app** — multiple databases, workers, and services that need to run together locally
- You want **local dev parity** — your local environment matches production exactly
- Your team is large and can't afford "works on my machine" problems

---

## Why This Matters for Deployment

When you deploy an application to the cloud, you're shipping a container image to a server. The server doesn't need to know your tech stack, your Node version, or your OS. It just runs the image.

This is what makes containers valuable across the full development lifecycle:

- **Development** — every developer runs the same environment
- **Testing** — CI pipelines spin up fresh containers for every test run
- **Production** — the exact same image you tested is what gets deployed

No more environment drift. No more "it worked in staging."

---

## Practice

### 1. Containerize Your React UI

Repeat everything you did for the Express backend but for your React frontend:

- Write a `Dockerfile` for your React app
- Create a `.dockerignore` file
- Build the image
- Run the container with port mapping
- Verify it loads in your browser

### 2. Push to Docker Hub and Share With a Friend

Images on Docker Hub are namespaced by your username — so everyone's image is unique even if the app name is the same:

```
your-username/my-app:latest
```

**Tag and push your image:**

```bash
# Tag your image with your Docker Hub username
docker build -t your-username/my-app .

# Login to Docker Hub
docker login

# Push it
docker push your-username/my-app
```

**Pull a friend's image and run it:**

```bash
docker pull their-username/my-app
docker run -p 3000:3000 their-username/my-app
```

You can also do all of this from the **Docker Desktop UI** — find your image in the Images tab, hit Push to Hub, and share the image name with your friends.

Ask a friend to pull your image and run it on their machine — no code, no setup, just one command. That's the whole point of Docker.
