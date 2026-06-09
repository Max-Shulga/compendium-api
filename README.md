# compendium-api

## Setup

```bash
cp .env.example .env
npm install
```

## Development

```bash
npm run start:dev
```

## Database migrations

```bash
npm run migration:generate -- src/migrations/<name>
npm run migration:run
npm run migration:revert
```

## Build

```bash
npm run build
npm run start:prod
```
