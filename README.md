# Sistema de Gestão de Itinerários e Voos - Tech Travel

API RESTful para gerenciamento de voos, itinerários e reservas corporativas, desenvolvida como solução para o desafio técnico da Tech Travel.

## 🛠️ Tecnologias e Justificativas

### Framework e Runtime

- **Node.js 22.13.0** com **TypeScript** - Escolhido pela robustez, ecosystem maduro e type safety
- **NestJS** - Framework principal escolhido por sua arquitetura modular inspirada no Angular, suporte nativo a DI/IoC, decorators que facilitam validações e documentação automática, e excelente integração com TypeScript

### Banco de Dados

- **PostgreSQL** - SGBD relacional robusto, ideal para dados estruturados com relacionamentos complexos
- **Prisma ORM** - Type safety completa, migrações versionadas e geração automática de cliente

### Arquitetura e Qualidade

- **Clean Architecture + DDD** - Separação clara entre domínio e infraestrutura
- **Jest** - Framework de testes completo (unitário, integração, E2E)
- **Docker** - Containerização para ambientes isolados e reproduzíveis

## 🏗️ Arquitetura de Software

O projeto implementa **Clean Architecture combinada com Domain-Driven Design (DDD)**, garantindo:

### Estrutura por Módulos DDD

```
src/modules/{bounded-context}/
├── domain/                    # Camada de Domínio (DDD)
│   ├── entities/             # Entidades com regras de negócio
│   ├── value-objects/        # Objetos de valor imutáveis
│   └── repositories/         # Contratos de persistência
├── application/              # Camada de Aplicação
│   ├── services/            # Casos de uso e orquestração
│   └── dtos/               # Data Transfer Objects
├── infrastructure/          # Camada de Infraestrutura
│   ├── repositories/       # Implementação concreta dos repositórios
│   └── prisma/            # Mapeamentos ORM
└── presentation/           # Camada de Apresentação
    ├── controllers/       # Endpoints HTTP
    └── docs/             # Documentação OpenAPI
```

### Bounded Contexts Identificados

- **Airlines** - Gestão de companhias aéreas
- **Airports** - Gestão de aeroportos
- **Flights** - Gestão de voos e frequências
- **Itineraries** - Composição e validação de itinerários
- **Bookings** - Reservas e seu ciclo de vida
- **Availability** - Busca inteligente de disponibilidade

### Benefícios da Arquitetura Escolhida

- **Independência de Framework**: Regras de negócio isoladas em entidades de domínio
- **Testabilidade**: Cada camada testável isoladamente
- **Manutenibilidade**: Mudanças tecnológicas impactam apenas a infraestrutura
- **Linguagem Ubíqua**: Código expressivo usando terminologia do domínio

## ⚙️ Como Configurar e Executar

### Opção 1: Docker (Recomendado)

**Pré-requisitos:**

- Docker e Docker Compose instalados

**Passos:**

1. **Clone o repositório:**

```bash
git clone [<URL_DO_REPOSITORIO>](https://github.com/georgelucasgp/tech-travel-gg-flights-api)
cd flights
```

2. **Configure as variáveis de ambiente:**

```bash
# Copie o arquivo de exemplo e edite conforme necessário
cp .env.example .env
# Edite o arquivo .env para ajustar a string de conexão do banco, se necessário
# Exemplo de DATABASE_URL para Docker:
# DATABASE_URL="postgresql://docker:docker@database:5432/flights-db?schema=public"
```

3. **Inicie os containers:**

```bash
docker-compose up -d --build
```

4. **Execute as migrações:**

```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

**✅ API disponível em: http://localhost:3000**

### Opção 2: Desenvolvimento Local

**Pré-requisitos:**

- Node.js 22.13.0+
- PostgreSQL rodando
- pnpm instalado

**Passos:**

1. **Instale as dependências do projeto:**

```bash
pnpm install
```

2. **Configure o banco:**

```bash
# .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/flights-db?schema=public"
```

3. **Execute migrações:**

```bash
npx prisma migrate dev
npx prisma generate
```

4. **Inicie o servidor:**

```bash
pnpm start:dev
```

## 🧪 Testes e Documentação Interativa

A API possui **documentação interativa completa via Swagger**:

- Acesse: [http://localhost:3000/docs](http://localhost:3000/docs)
- Explore todos os endpoints, schemas, exemplos e faça requisições diretamente pelo navegador.
- O Swagger é gerado automaticamente e reflete fielmente todos os contratos da API.

## 🌐 Exemplos de Requisições (cURL)

### ✈️ Airlines (Companhias Aéreas)

```bash
# Criar companhia aérea
curl -X POST http://localhost:3000/api/v1/airlines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LATAM Airlines",
    "iata_code": "LA"
  }'

# Listar companhias aéreas
curl http://localhost:3000/api/v1/airlines

# Buscar companhia aérea específica
curl http://localhost:3000/api/v1/airlines/{id}

# Atualizar companhia aérea
curl -X PUT http://localhost:3000/api/v1/airlines/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LATAM Airlines Updated"
  }'

# Deletar companhia aérea
curl -X DELETE http://localhost:3000/api/v1/airlines/{id}

# Recuperar companhia aérea deletada
curl -X POST http://localhost:3000/api/v1/airlines/{id}/recovery
```

### 🛬 Airports (Aeroportos)

```bash
# Criar aeroporto
curl -X POST http://localhost:3000/api/v1/airports \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aeroporto de Brasília",
    "iata_code": "BSB",
    "city": "Brasília",
    "country": "Brazil"
  }'

# Listar aeroportos
curl http://localhost:3000/api/v1/airports

# Buscar aeroporto específico
curl http://localhost:3000/api/v1/airports/{id}

# Atualizar aeroporto
curl -X PUT http://localhost:3000/api/v1/airports/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aeroporto de Brasília Internacional"
  }'

# Deletar aeroporto
curl -X DELETE http://localhost:3000/api/v1/airports/{id}

# Recuperar aeroporto deletado
curl -X POST http://localhost:3000/api/v1/airports/{id}/recovery
```

### ✈️ Flights (Voos)

```bash
# Criar voo
curl -X POST http://localhost:3000/api/v1/flights \
  -H "Content-Type: application/json" \
  -d '{
    "flight_number": "LA3456",
    "airline_id": "uuid-da-latam",
    "origin_iata": "BSB",
    "destination_iata": "CGH",
    "departure_datetime": "2025-07-01T09:30:00Z",
    "arrival_datetime": "2025-07-01T10:30:00Z",
    "frequency": [1, 2, 3, 4, 5]
  }'

# Listar voos (com filtros)
curl "http://localhost:3000/api/v1/flights?airline_code=LA&origin=BSB&destination=CGH"

# Filtrar por número do voo
curl "http://localhost:3000/api/v1/flights?flight_number=LA3456"

# Buscar voo específico
curl http://localhost:3000/api/v1/flights/{id}

# Atualizar voo
curl -X PUT http://localhost:3000/api/v1/flights/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "departure_datetime": "2025-07-01T10:00:00Z"
  }'

# Deletar voo
curl -X DELETE http://localhost:3000/api/v1/flights/{id}

# Recuperar voo deletado
curl -X POST http://localhost:3000/api/v1/flights/{id}/recovery
```

### 📅 Itineraries (Itinerários)

```bash
# Criar itinerário
curl -X POST http://localhost:3000/api/v1/itineraries \
  -H "Content-Type: application/json" \
  -d '{
    "flight_ids": [
      "uuid-voo-bsb-cgh",
      "uuid-voo-cgh-gig"
    ]
  }'

# Listar itinerários
curl http://localhost:3000/api/v1/itineraries

# Buscar itinerário específico
curl http://localhost:3000/api/v1/itineraries/{id}

# Deletar itinerário
curl -X DELETE http://localhost:3000/api/v1/itineraries/{id}
```

### 🔎 Availability (Busca de Disponibilidade)

```bash
# Buscar disponibilidade (ida e volta)
curl -X POST http://localhost:3000/api/v1/availability/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BSB",
    "destination": "GIG",
    "departure_date": "2025-07-01",
    "return_date": "2025-07-10",
    "airlines": ["LA", "G3"],
    "max_stops": 1
  }'

# Buscar disponibilidade (apenas ida)
curl -X POST http://localhost:3000/api/v1/availability/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BSB",
    "destination": "GIG",
    "departure_date": "2025-07-01",
    "max_stops": 0
  }'
```

### 🎫 Bookings (Reservas)

```bash
# Criar reserva
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-do-usuario",
    "itinerary_id": "uuid-do-itinerario"
  }'

# Cancelar reserva
curl -X DELETE http://localhost:3000/api/v1/bookings/{id}
```

### 👤 Users (Usuários)

```bash
# Criar usuário
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com"
  }'

# Listar usuários
curl http://localhost:3000/api/v1/users

# Buscar usuário específico
curl http://localhost:3000/api/v1/users/{id}

# Atualizar usuário
curl -X PUT http://localhost:3000/api/v1/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João S. Silva"
  }'

# Recuperar usuário deletado
curl -X POST http://localhost:3000/api/v1/users/{id}/recovery
```

## 🧪 Executando Testes

**⚠️ Importante:** Execute `npx prisma generate` antes dos testes:

```bash

# Instale as dependências do projeto
npm install
# Gerar cliente Prisma (obrigatório)
npx prisma generate

# Todos os testes (140+ implementados)
pnpm test:all

# Por categoria
pnpm test:unit          # Lógica de negócio
pnpm test:integration   # Repositórios e BD
pnpm test:e2e          # Endpoints completos
```

## 🌐 Exemplos de Requisições

### 📋 Configuração Inicial

Primeiro, crie dados básicos para testes:

```bash
# Criar companhia aérea
curl -X POST http://localhost:3000/airlines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LATAM Airlines",
    "iata_code": "LA"
  }'

# Criar aeroportos
curl -X POST http://localhost:3000/airports \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aeroporto de Brasília",
    "iata_code": "BSB",
    "city": "Brasília",
    "country": "Brazil"
  }'

curl -X POST http://localhost:3000/airports \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aeroporto de Congonhas",
    "iata_code": "CGH",
    "city": "São Paulo",
    "country": "Brazil"
  }'
```

### ✈️ Gestão de Voos

```bash
# Criar voo
curl -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{
    "flight_number": "LA3456",
    "airline_id": "uuid-da-latam",
    "origin_iata": "BSB",
    "destination_iata": "CGH",
    "departure_datetime": "2025-07-01T09:30:00Z",
    "arrival_datetime": "2025-07-01T10:30:00Z",
    "frequency": [1, 2, 3, 4, 5]
  }'

# Listar voos com filtros
curl "http://localhost:3000/flights?airline_code=LA&origin=BSB&destination=CGH"

# Buscar voo específico
curl http://localhost:3000/flights/{id}

# Atualizar voo
curl -X PUT http://localhost:3000/flights/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "departure_datetime": "2025-07-01T10:00:00Z"
  }'

# Deletar voo
curl -X DELETE http://localhost:3000/flights/{id}
```

### 📅 Itinerários com Validações Automáticas

```bash
# Criar itinerário (valida rota, tempo e conexões)
curl -X POST http://localhost:3000/itineraries \
  -H "Content-Type: application/json" \
  -d '{
    "flight_ids": [
      "uuid-voo-bsb-cgh",
      "uuid-voo-cgh-gig"
    ]
  }'

# Listar itinerários
curl http://localhost:3000/itineraries

# Buscar itinerário específico
curl http://localhost:3000/itineraries/{id}

# Deletar itinerário
curl -X DELETE http://localhost:3000/itineraries/{id}
```

### 🔍 Busca de Disponibilidade (Endpoint Principal)

```bash
# Busca com ida e volta
curl -X POST http://localhost:3000/availability/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BSB",
    "destination": "GIG",
    "departure_date": "2025-07-01",
    "return_date": "2025-07-10",
    "airlines": ["LA", "G3"],
    "max_stops": 1
  }'

# Busca apenas ida
curl -X POST http://localhost:3000/availability/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BSB",
    "destination": "GIG",
    "departure_date": "2025-07-01",
    "max_stops": 0
  }'
```

### 🎫 Sistema de Reservas

```bash
# Criar usuário (para teste)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "cpf": "123.456.789-00"
  }'

# Criar reserva
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-do-usuario",
    "itinerary_id": "uuid-do-itinerario"
  }'

# Listar reservas do usuário
curl http://localhost:3000/users/{userId}/bookings

# Cancelar reserva
curl -X DELETE http://localhost:3000/bookings/{id}
```

## 📖 Documentação Interativa

Acesse **http://localhost:3000/docs** para:

- Interface Swagger completa
- Teste direto dos endpoints
- Schemas detalhados de request/response
- Códigos de erro e validações

## ✅ Validações de Negócio Implementadas

### Itinerários (Conforme Especificação)

1. **Validação de Rota**: Aeroporto de destino do voo atual deve ser origem do próximo
2. **Validação Temporal**: Partida do próximo voo deve ser posterior à chegada do anterior
3. **Validação de Conexão**: Mínimo 45 minutos entre voos para conexão

### Entrada de Dados

- **Códigos IATA**: 3 letras maiúsculas para aeroportos, 2 para companhias
- **Datas**: Formato ISO 8601 UTC obrigatório
- **Frequências**: Array de inteiros 0-6 (Domingo=0 a Sábado=6)
- **UUIDs**: Validação automática em todos os identificadores

## 🚀 Scripts de Desenvolvimento

```bash
# Servidor
pnpm start:dev              # Desenvolvimento com hot reload
pnpm start:prod             # Produção

# Banco de dados
pnpm db:generate            # Gerar cliente Prisma
pnpm db:migrate             # Executar migrações
pnpm db:studio              # Interface visual do BD

# Qualidade
pnpm lint                   # Verificar código
pnpm format                 # Formatar código
pnpm build                  # Build para produção
```

---

**Tech Travel - Teste Técnico para Programador(a) Pleno(a)**

_Tecnologia: Node.js + NestJS | Arquitetura: Clean Architecture + DDD | Database: PostgreSQL_
