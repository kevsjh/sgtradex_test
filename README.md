# sgtradex_test

- by kevin

# Turborepo

This repo uses monorepo structure with turborepo.

## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app
- `api`: an [Express](https://expressjs.com/) server
- `@repo/shared`: Shared constants and utils
- `@repo/eslint-config`: ESLint presets
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo

### API Server

- refer to the api folder for implementation
- leverage expressjs and socket.io for websocket
- /api/track - track vessels (prints the tracked vessel imo list to stdout)
- /api/updated-vessel-information - simulate vessel update (sends a websocket message to the web app)

### Web App

- refer to /src/app/\_components/vessel-table.tsx for implementation
- leverage client side component
- leverage socket.io-client for websocket on component mount
- vessel table that display vessel info, vessel tracking status, simulate vessel update button and pending update status
- document was not cleared on when to invoke /api/updated-vessel-information, so this is implemented as a simulate update button for each vessel row
- when track btn is clicked, a timer starts/resets with timerRef based on pendingTimerMS
- when timer reaches 2min(repeatable), sends track request to backend with list of tracked vessels imo, a timeout is chained inside sendTrackRequest.
- if no update is received within timeoutTimerMS, the vessel status is marked to nopending
- vessel update button is enabled when tracking is enabled
- vessel info is updated based on websocket connection and status is updated accordingly

# Getting Started

### Install turborepo

- npm install turbo --global

refer to [turborepo](https://turbo.build/repo/docs/getting-started/installation)

### on the project root

- npm install

# Option 1: npm

- npm install
- npm run dev (start in dev mode)

# Option 2: Docker (ensure you have docker engine installed locally)

### Create a network, which allows containers to communicate

### with each other, by using their container name as a hostname

docker network create app_network

### Build prod using new BuildKit engine

COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build

### Start prod in detached mode

docker-compose -f docker-compose.yml up -d

Open http://localhost:3000.
To shutdown all running containers:

### Stop all running containers

```
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
```
