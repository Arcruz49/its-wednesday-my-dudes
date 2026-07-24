# It's Wednesday My Dudes

## Objective

so... i was bored and i made this email sender about wednesday and frogs...

## Overview

An API that manages a list of subscribers and, once a week, emails a random image
to every active subscriber. The send runs automatically every Wednesday and can
also be triggered manually.

## Tech stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| Runtime      | Node.js 22                                |
| Language     | TypeScript 5.7                            |
| Framework    | NestJS 11                                 |
| Database     | MongoDB 7 (via Mongoose 9)                |
| Scheduling   | `@nestjs/schedule` (cron)                 |
| Email        | Nodemailer (Gmail via App Password)       |
| Config       | `@nestjs/config` (environment variables)  |
| Validation   | `class-validator` / `class-transformer`   |
| Testing      | Jest + Supertest                          |
| Container    | Docker / Docker Compose                   |

## Architecture

The project is organized by modules, each split into layers
(domain / application / infrastructure / presentation), inspired by Clean
Architecture:

```
src/
├── app.module.ts                 # root module (config, mongoose, schedule)
├── main.ts                       # bootstrap (port from env PORT)
├── shared/                       # base entity and shared contracts
└── modules/
    ├── subscribers/              # subscriber management
    │   ├── domain/               # Subscriber entity, repository contract
    │   ├── application/          # use cases (subscribe / unsubscribe / list) + DTOs
    │   ├── infrastructure/       # Mongoose schema and repository
    │   └── presentation/         # controller and module
    └── image-mailer/             # image selection and email delivery
        ├── domain/               # SendLog entity, ports (IImagePicker, IMailer, ...)
        ├── application/          # SendWeeklyImage use case
        ├── infrastructure/       # local folder picker, Gmail mailer, send-log repo
        └── presentation/         # controller, module and scheduler (weekly cron)
```

Highlights:

- **Interface-based injection**: dependencies such as `IMailer`, `IImagePicker`
  and the repositories are resolved via tokens (`Symbol`), decoupling use cases
  from concrete implementations.
- **Anti-repeat**: `SendWeeklyImage` reads the `send_logs` from the last 8 weeks
  and avoids resending recent images until the pool is exhausted.
- **Send logging**: each dispatch stores a `SendLog` with total subscribers,
  successes, and failed emails.

## Environment variables

Defined in `.env` (local runs) and in `docker-compose.yml` (containers):

| Variable             | Description                                          | Example                                             |
| -------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `PORT`               | HTTP port for the API                                | `6969`                                              |
| `MONGODB_URI`        | MongoDB connection string                            | `mongodb://mongo:27017/its-wednesday-my-dudes`      |
| `GMAIL_USER`         | Sender Gmail account                                 | `you@gmail.com`                                     |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your regular password)       | `xxxx xxxx xxxx xxxx`                               |
| `IMAGES_FOLDER_PATH` | Folder with the images (relative or absolute path)   | `./images`                                          |

> `IMAGES_FOLDER_PATH` accepts a relative path — it is resolved from the working
> directory. In Docker, the effective value is `/app/images`, backed by a volume.

## Running with Docker (recommended)

Brings up database and API together:

```bash
docker compose up -d --build
```

- API available at `http://localhost:6969`
- MongoDB exposed at `localhost:27017` (data persisted in the `mongo-data` volume)
- The local `./images` folder is mounted at `/app/images` (read-only)

`GMAIL_USER` and `GMAIL_APP_PASSWORD` are read from the project's `.env` via
Compose interpolation.

Useful commands:

```bash
docker compose logs -f api     # follow API logs
docker compose down            # stop everything (keeps data)
docker compose down -v         # stop and wipe MongoDB data
```

## Running locally (without Docker)

Requires a MongoDB reachable through the `.env` `MONGODB_URI`.

```bash
npm install

# development (watch)
npm run start:dev

# production
npm run build
npm run start:prod
```

## Endpoints

### Subscribers

| Method   | Route          | Description                    | Body                         |
| -------- | -------------- | ----------------------------- | ---------------------------- |
| `POST`   | `/subscribers` | Subscribe an email            | `{ "email": "a@b.com" }`     |
| `GET`    | `/subscribers` | List active subscribers       | —                            |
| `DELETE` | `/subscribers` | Unsubscribe (204)             | `{ "email": "a@b.com" }`     |

### Image Mailer

| Method | Route                | Description                                     |
| ------ | -------------------- | ----------------------------------------------- |
| `POST` | `/image-mailer/send` | Manually trigger the weekly image send          |

Examples:

```bash
# subscribe
curl -X POST http://localhost:6969/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'

# list
curl http://localhost:6969/subscribers

# trigger send manually
curl -X POST http://localhost:6969/image-mailer/send
```

## Scheduling

The automatic send is handled by a cron job (`WeeklyImageScheduler`):

- **Expression:** `0 9 * * 3` (every Wednesday at 09:00)
- **Timezone:** `America/Sao_Paulo`
- Configurable in `src/modules/image-mailer/presentation/weekly-image.scheduler.ts`

The scheduler only fires while the API container/process is running. In Compose,
`restart: unless-stopped` ensures the API comes back after restarts.

## Testing

```bash
npm run test        # unit
npm run test:e2e    # end-to-end
npm run test:cov    # coverage
```

## Notes

- The `POST /image-mailer/send` endpoint is public — this project runs on a
  private network. For public exposure, consider protecting it (token/secret).
- Email delivery uses Gmail with an App Password; the account must have two-step
  verification enabled to generate the app password.
