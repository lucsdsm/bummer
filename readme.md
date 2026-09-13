# Bummer

## Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Backend:** Django + Django REST Framework
- **Banco de dados:** PostgreSQL
- **Containerização:** Docker + Docker Compose
- **Administração de conteúdo:** Django Admin

## Estrutura do projeto

```text
bummer/
├── docker-compose.yml
├── .env
├── drf/
│   ├── Dockerfile
│   ├── manage.py
│   ├── config/
│   └── items/
└── react/
    ├── Dockerfile
    ├── package.json
    ├── public/
    └── src/
```

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)


## Início rápido

### 1. Clone o repositório

```bash
git clone https://github.com/lucsdsm/bummer.git
cd bummer
```

### 2. Crie o arquivo de ambiente

Crie o arquivo `.env` na raiz do projeto com o conteúdo abaixo (preencha as variáveis como quiser):

```env
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

DJANGO_DEBUG=True
DJANGO_SECRET_KEY=

VITE_API_URL=http://localhost:8000/api
```

### 3. Suba os containers

```bash
docker compose up --build
```

O comando cria/inicia os serviços abaixo:

| Serviço | Função | Endereço local |
|---|---|---|
| `react` | Frontend React/Vite | `http://localhost:5173` |
| `drf` | API Django REST Framework | `http://localhost:8000` |
| `db` | Banco PostgreSQL | `localhost:5432` |

Para executar em segundo plano:

```bash
docker compose up --build -d
```

Para acompanhar os logs:

```bash
docker compose logs -f
```

Ou apenas os logs de um serviço:

```bash
docker compose logs -f drf
docker compose logs -f react
docker compose logs -f db
```

## Banco e Django Admin

### Aplicar migrations

O serviço Django executa migrations ao iniciar. Caso seja necessário executá-las manualmente:

```bash
docker compose exec drf python manage.py migrate
```

### Criar um superusuário

Crie a conta para acessar o Django Admin:

```bash
docker compose exec drf python manage.py createsuperuser
```

Informe usuário, e-mail e senha no terminal.

Acesse o painel em:

```text
http://localhost:8000/admin/
```

### Cadastrar conteúdo

No Django Admin, cadastre os dados nesta ordem:

1. **Jogos** — por exemplo, `Grand Theft Auto: San Andreas`.
2. **Categorias** — por exemplo, `Veículos`, `Armas`, `Skins`, `Mapas` e `Scripts`.
3. **Itens** — o mod/item em si, associado a um jogo e uma categoria.

Cada item possui:

- Nome
- Slug
- Descrição opcional
- Jogo
- Categoria
- Link externo de download
- Link externo da imagem de exemplo
- Estado de publicação

Itens desmarcados como `publicado` não aparecem na API pública nem na listagem React.

## Endpoints locais

Com os serviços rodando, os endpoints principais são:

| Endpoint | Descrição |
|---|---|
| `GET /api/items/` | Lista itens publicados |
| `GET /api/items/?search=<termo>` | Pesquisa por nome, descrição, jogo ou categoria |
| `GET /api/items/<slug>/` | Exibe os detalhes de um item |
| `GET /api/games/` | Lista jogos cadastrados |
| `GET /api/categories/` | Lista categorias cadastradas |
| `/admin/` | Painel administrativo do Django |

Exemplos:

```text
http://localhost:8000/api/items/
http://localhost:8000/api/items/?search=veiculo
http://localhost:8000/api/games/
http://localhost:8000/api/categories/
```

## Comandos úteis

### Iniciar serviços

```bash
docker compose up
```

### Reconstruir imagens e iniciar serviços

Use quando alterar `Dockerfile`, dependências Python ou `package.json`:

```bash
docker compose up --build
```

### Parar containers mantendo dados do PostgreSQL

```bash
docker compose down
```

### Ver containers e estado dos serviços

```bash
docker compose ps
```

### Executar comandos Django

```bash
docker compose exec drf python manage.py <comando>
```

Exemplos:

```bash
docker compose exec drf python manage.py makemigrations
docker compose exec drf python manage.py makemigrations items
docker compose exec drf python manage.py migrate
docker compose exec drf python manage.py showmigrations
docker compose exec drf python manage.py createsuperuser
```

### Abrir o shell do Django

```bash
docker compose exec drf python manage.py shell
```

### Abrir um shell no PostgreSQL

```bash
docker compose exec db psql -U bummer_user -d bummer
```

### Instalar uma dependência React

```bash
docker compose exec react npm install <nome-do-pacote>
```

Depois de instalar, faça commit do `react/package.json` e do `react/package-lock.json`.

### Instalar uma dependência Python

Adicione a dependência ao arquivo de requisitos do backend e reconstrua a imagem:

```bash
docker compose up --build
```

## Resetar o ambiente local

> **Atenção:** este comando remove os volumes do Docker, incluindo todos os dados armazenados no PostgreSQL local.

```bash
docker compose down -v
```

Depois, suba tudo novamente:

```bash
docker compose up --build
```

Aplique migrations e recrie o superusuário:

```bash
docker compose exec drf python manage.py migrate
docker compose exec drf python manage.py createsuperuser
```

## Desenvolvimento

Os diretórios `drf/` e `react/` são montados como volumes nos containers. Portanto:

- Alterações em arquivos Python do Django normalmente reiniciam o servidor de desenvolvimento automaticamente.
- Alterações em componentes React, TypeScript e CSS são atualizadas pelo Vite com Hot Module Replacement (HMR).
- Alterações no `Dockerfile`, em dependências Python ou no `package.json` exigem reconstrução com `docker compose up --build`.
