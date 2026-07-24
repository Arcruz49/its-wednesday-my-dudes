# It's Wednesday My Dudes

## Objetivo

<!-- TODO: descrever o objetivo do projeto -->

## Visão geral

API que gerencia uma lista de inscritos (subscribers) e envia, uma vez por semana,
uma imagem aleatória por e-mail para todos os inscritos ativos. O envio ocorre
automaticamente toda quarta-feira e também pode ser disparado manualmente.

## Stack técnica

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Runtime       | Node.js 22                                  |
| Linguagem     | TypeScript 5.7                              |
| Framework     | NestJS 11                                   |
| Banco de dados| MongoDB 7 (via Mongoose 9)                  |
| Agendamento   | `@nestjs/schedule` (cron)                   |
| E-mail        | Nodemailer (Gmail via App Password)         |
| Configuração  | `@nestjs/config` (variáveis de ambiente)    |
| Validação     | `class-validator` / `class-transformer`     |
| Testes        | Jest + Supertest                            |
| Container     | Docker / Docker Compose                     |

## Arquitetura

O projeto segue uma organização por módulos, cada um dividido em camadas
(domain / application / infrastructure / presentation), inspirada em Clean
Architecture:

```
src/
├── app.module.ts                 # módulo raiz (config, mongoose, schedule)
├── main.ts                       # bootstrap (porta via env PORT)
├── shared/                       # entidade base e contratos compartilhados
└── modules/
    ├── subscribers/              # cadastro/gestão de inscritos
    │   ├── domain/               # entidade Subscriber, contrato do repositório
    │   ├── application/          # use cases (subscribe / unsubscribe / list) + DTOs
    │   ├── infrastructure/       # schema e repositório Mongoose
    │   └── presentation/         # controller e módulo
    └── image-mailer/             # seleção de imagem e envio de e-mail
        ├── domain/               # entidade SendLog, ports (IImagePicker, IMailer, ...)
        ├── application/          # use case SendWeeklyImage
        ├── infrastructure/       # picker de pasta local, mailer Gmail, repo de logs
        └── presentation/         # controller, módulo e scheduler (cron semanal)
```

Pontos de destaque:

- **Injeção por interface**: dependências como `IMailer`, `IImagePicker` e os
  repositórios são resolvidas por tokens (`Symbol`), desacoplando use cases das
  implementações concretas.
- **Anti-repetição**: o `SendWeeklyImage` consulta os `send_logs` das últimas
  8 semanas e evita reenviar imagens recentes até esgotar a pool.
- **Registro de envios**: cada disparo grava um `SendLog` com total de inscritos,
  sucessos e e-mails que falharam.

## Variáveis de ambiente

Definidas em `.env` (execução local) e no `docker-compose.yml` (containers):

| Variável             | Descrição                                              | Exemplo                                             |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `PORT`               | Porta HTTP da API                                      | `6969`                                              |
| `MONGODB_URI`        | String de conexão do MongoDB                           | `mongodb://mongo:27017/its-wednesday-my-dudes`      |
| `GMAIL_USER`         | Conta Gmail remetente                                  | `voce@gmail.com`                                    |
| `GMAIL_APP_PASSWORD` | App Password do Gmail (não a senha normal)             | `xxxx xxxx xxxx xxxx`                               |
| `IMAGES_FOLDER_PATH` | Pasta com as imagens (relativa à raiz ou absoluta)     | `./images`                                          |

> `IMAGES_FOLDER_PATH` aceita caminho relativo — é resolvido a partir do diretório
> de execução. No Docker, o valor efetivo é `/app/images`, alimentado por um volume.

## Executando com Docker (recomendado)

Sobe banco e API juntos:

```bash
docker compose up -d --build
```

- API disponível em `http://localhost:6969`
- MongoDB exposto em `localhost:27017` (dados persistidos no volume `mongo-data`)
- A pasta local `./images` é montada em `/app/images` (somente leitura)

`GMAIL_USER` e `GMAIL_APP_PASSWORD` são lidos do `.env` do projeto via interpolação
do Compose.

Comandos úteis:

```bash
docker compose logs -f api     # acompanhar logs da API
docker compose down            # parar tudo (mantém os dados)
docker compose down -v         # parar e apagar os dados do Mongo
```

## Executando localmente (sem Docker)

Requer um MongoDB acessível pela `MONGODB_URI` do `.env`.

```bash
npm install

# desenvolvimento (watch)
npm run start:dev

# produção
npm run build
npm run start:prod
```

## Endpoints

### Subscribers

| Método   | Rota           | Descrição                     | Corpo                        |
| -------- | -------------- | ----------------------------- | ---------------------------- |
| `POST`   | `/subscribers` | Inscreve um e-mail            | `{ "email": "a@b.com" }`     |
| `GET`    | `/subscribers` | Lista os inscritos ativos     | —                            |
| `DELETE` | `/subscribers` | Cancela a inscrição (204)     | `{ "email": "a@b.com" }`     |

### Image Mailer

| Método | Rota                 | Descrição                                          |
| ------ | -------------------- | -------------------------------------------------- |
| `POST` | `/image-mailer/send` | Dispara manualmente o envio da imagem semanal      |

Exemplos:

```bash
# inscrever
curl -X POST http://localhost:6969/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email":"voce@exemplo.com"}'

# listar
curl http://localhost:6969/subscribers

# disparar envio manualmente
curl -X POST http://localhost:6969/image-mailer/send
```

## Agendamento

O envio automático é feito por um cron (`WeeklyImageScheduler`):

- **Expressão:** `0 9 * * 3` (toda quarta-feira às 09:00)
- **Fuso:** `America/Sao_Paulo`
- Configurável em `src/modules/image-mailer/presentation/weekly-image.scheduler.ts`

O agendador só dispara enquanto o container/processo da API estiver em execução.
No Compose, `restart: unless-stopped` garante que a API volte após reinícios.

## Testes

```bash
npm run test        # unitários
npm run test:e2e    # end-to-end
npm run test:cov    # cobertura
```

## Observações

- O endpoint `POST /image-mailer/send` é público — este projeto roda em rede
  privada. Para exposição pública, convém protegê-lo (token/secret).
- O envio usa Gmail com App Password; a conta precisa ter verificação em duas
  etapas habilitada para gerar a senha de aplicativo.
