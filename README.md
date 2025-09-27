# Users Service

Esse projeto é um Micro Serviço é construído utilizando NestJS, um framework progressivo NodeJS.

## Arquitetura

Foi construído utilizando um conceito de [**Arquitetura Hexagonal**](https://docs.aws.amazon.com/pt_br/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html#:~:text=O%20padr%C3%A3o%20de%20arquitetura%20hexagonal%20permite%20que%20voc%C3%AA%20projete%20seus,UX%20e%20componentes%20de%20servi%C3%A7o.), onde utilizamos Ports & Adapters, transformando a aplicação em algo agnóstico e focado no propósito, não na tecnologia utilizada.

### O que é Arquitetura Hexagonal?

A Arquitetura Hexagonal, também conhecida como **Ports and Adapters**, é um padrão arquitetural que visa isolar o núcleo da aplicação (domínio e regras de negócio) das preocupações externas como frameworks, bancos de dados, APIs externas, etc.

#### Principais benefícios:

- **Testabilidade**: Facilita a criação de testes unitários isolados
- **Flexibilidade**: Permite trocar implementações sem afetar o core da aplicação
- **Manutenibilidade**: Código mais organizado e fácil de manter
- **Independência de Framework**: O domínio não depende de tecnologias específicas

### Estrutura da Arquitetura no Projeto

```markdown
. 📂 src
├── 📂 adapters/ # Camada de Adaptadores
│ ├── 📂 in/ # Adapters de Entrada (Primary/Driving)
│ │ └── user.controller.ts # Controllers REST (HTTP)
│ └── 📂 out/ # Adapters de Saída (Secondary/Driven)
│ ├── 📂 domain/ # Entidades de Persistência
│ │ ├── user.entity.ts # Entidade User para TypeORM
│ │ ├── donor.entity.ts # Entidade Donor para TypeORM
│ │ └── company.entity.ts # Entidade Company para TypeORM
│ ├── 📂 mappers/ # Mapeadores Domínio ↔ Persistência
│ │ ├── user.mapper.ts # Converte entre User domain e persistence
│ │ ├── donor.mapper.ts # Converte entre Donor domain e persistence
│ │ └── company.mapper.ts # Converte entre Company domain e persistence
│ ├── users.repository.ts # Implementação do repositório de usuários
│ ├── donor.repository.ts # Implementação do repositório de doadores
│ └── company.repository.ts # Implementação do repositório de empresas
├── 📂 application/ # Camada de Aplicação (Core)
│ ├── 📂 core/ # Núcleo da Aplicação
│ │ ├── 📂 domain/ # Entidades de Domínio
│ │ │ ├── user.entity.ts # Entidade User do domínio
│ │ │ ├── donor.entity.ts # Entidade Donor do domínio
│ │ │ └── company.entity.ts # Entidade Company do domínio
│ │ ├── 📂 errors/ # Enums de Erros
│ │ │ └── errors.enum.ts # Definição de erros da aplicação
│ │ └── 📂 service/ # Serviços de Aplicação
│ │ └── users.service.ts # Orquestração dos Use Cases
│ ├── 📂 ports/ # Interfaces (Contratos)
│ │ ├── 📂 in/ # Ports de Entrada (Use Cases)
│ │ │ ├── 📂 user/ # Use Cases de Usuário
│ │ │ │ ├── createUser.useCase.ts # Criar usuário
│ │ │ │ ├── getUser.useCase.ts # Buscar usuário por ID
│ │ │ │ ├── getUserByEmail.useCase.ts # Buscar usuário por email
│ │ │ │ ├── changePassword.useCase.ts # Alterar senha
│ │ │ │ └── changeUserData.useCase.ts # Alterar dados do usuário
│ │ │ ├── 📂 donor/ # Use Cases de Doador
│ │ │ │ └── createDonor.useCase.ts # Criar doador
│ │ │ └── 📂 company/ # Use Cases de Empresa
│ │ │ └── createCompany.useCase.ts # Criar empresa
│ │ └── 📂 out/ # Ports de Saída (Repository Interfaces)
│ │ ├── users-repository.port.ts # Interface do repositório de usuários
│ │ ├── donor-repository.port.ts # Interface do repositório de doadores
│ │ └── company-repository.port.ts # Interface do repositório de empresas
│ └── 📂 types/ # Tipos e DTOs
│ ├── result.types.ts # Tipos para Result Pattern
│ ├── useCase.types.ts # Interface base para Use Cases
│ └── user.types.ts # DTOs e tipos relacionados a usuários
├── 📂 modules/ # Módulos Auxiliares
│ └── 📂 Hash/ # Módulo de Hash/JWT (Arquitetura Hexagonal)
│ ├── 📂 adapters/ # Adapters do módulo Hash
│ │ └── 📂 out/ # Implementações de hash e JWT
│ └── 📂 application/ # Core do módulo Hash
│ ├── 📂 core/ # Serviços de domínio
│ └── 📂 ports/ # Use Cases e interfaces
├── 📂 constants/ # Constantes da aplicação
│ └── index.ts # Tokens de injeção de dependência
├── data-source.ts # Configuração do banco de dados
├── main.ts # Ponto de entrada da aplicação
└── user.module.ts # Módulo principal do NestJS
```

### Explicação das Camadas

#### 1. **Core da Aplicação** (`application/core/`)

- **Domain**: Contém as entidades de negócio puras, sem dependências externas
- **Service**: Orquestra os Use Cases e implementa fluxos complexos de negócio
- **Errors**: Define os tipos de erro que a aplicação pode retornar

#### 2. **Ports** (`application/ports/`)

- **Ports In**: Interfaces que definem os casos de uso (Use Cases)
- **Ports Out**: Interfaces que definem contratos para recursos externos (Repositories)

#### 3. **Adapters** (`adapters/`)

- **Adapters In**: Implementações que recebem dados externos (Controllers, CLI, etc.)
- **Adapters Out**: Implementações que se comunicam com recursos externos (Database, APIs, etc.)

### Fluxo de Dados na Arquitetura

```
[HTTP Request] → [Controller] → [Service] → [Use Case] → [Repository Interface] → [Repository Implementation] → [Database]
     ↓              ↓             ↓           ↓                    ↓                        ↓                    ↓
  Adapter In    Adapter In   Application   Port In            Port Out              Adapter Out           External
```

### Padrões Implementados

#### 1. **Use Case Pattern**

Cada operação de negócio é encapsulada em um Use Case específico:

```typescript
export interface UseCase<T, R> {
  execute(params: T): R;
}
```

#### 2. **Repository Pattern**

Abstração para acesso a dados através de interfaces:

```typescript
export interface UserRepositoryPort {
  save(user: Omit<User, 'id'>): Promise<Omit<User, 'password'>>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  // ...
}
```

#### 3. **Result Pattern**

Tratamento de erros sem exceptions:

```typescript
type Result<T> = {
  isSuccess: boolean;
  value?: T;
  error?: string;
  isPartialSuccess?: boolean;
};
```

#### 4. **Mapper Pattern**

Conversão entre entidades de domínio e persistência:

```typescript
export class UserMapper {
  static toDomain(user: Users): User {
    /* ... */
  }
  static toPersistence(user: User): Users {
    /* ... */
  }
}
```

### Injeção de Dependências

O projeto utiliza o sistema de DI do NestJS com tokens personalizados:

```typescript
// constants/index.ts
export const USERS_REPOSITORY = 'USERS_REPOSITORY';
export const DONOR_REPOSITORY = 'DONOR_REPOSITORY';
export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

// user.module.ts
providers: [
  { provide: USERS_REPOSITORY, useClass: UsersRepository },
  { provide: DONOR_REPOSITORY, useClass: DonorRepository },
  { provide: COMPANY_REPOSITORY, useClass: CompanyRepository },
];
```

## Como Contribuir e Desenvolver no Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- PostgreSQL
- Docker (opcional, para ambiente containerizado)

### Configuração do Ambiente de Desenvolvimento

1. **Clone o repositório e instale as dependências:**

```bash
git clone <repository-url>
cd users-service
npm install
```

2. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com:

```env
POSTGRES_HOST=localhost
POSTGRES_USERNAME=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_DATABASE=sangue_solidario
```

3. **Execute o banco de dados:**

```bash
# Com Docker
docker-compose up -d

# Ou configure um PostgreSQL local
```

### Guia de Desenvolvimento

#### 1. **Criando um Novo Use Case**

Para adicionar uma nova funcionalidade, siga este fluxo:

1. **Defina a interface do Use Case** em `application/ports/in/`:

```typescript
// application/ports/in/user/newFeature.useCase.ts
export interface NewFeatureUseCasePort
  extends UseCase<InputType, Promise<Result<OutputType>>> {}

export class NewFeatureUseCase implements NewFeatureUseCasePort {
  constructor(@Inject(REPOSITORY_TOKEN) private repository: RepositoryPort) {}

  async execute(input: InputType): Promise<Result<OutputType>> {
    // Implementar lógica de negócio
  }
}
```

2. **Atualize o Service** em `application/core/service/`:

```typescript
// Adicione o novo Use Case no construtor e crie o método público
async newFeature(input: InputType): Promise<Result<OutputType>> {
  return await this.newFeatureUseCase.execute(input);
}
```

3. **Atualize o Controller** em `adapters/in/`:

```typescript
// Adicione o endpoint correspondente
@Post('/new-feature')
async newFeature(@Body() input: InputType) {
  const result = await this.service.newFeature(input);
  // Tratar resultado e retornar resposta HTTP
}
```

4. **Registre no Module**:

```typescript
// user.module.ts
providers: [
  // ... outros providers
  NewFeatureUseCase,
];
```

#### 2. **Adicionando um Novo Repository**

1. **Crie a interface** em `application/ports/out/`:

```typescript
// application/ports/out/new-repository.port.ts
export interface NewRepositoryPort {
  save(entity: Entity): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
}
```

2. **Implemente o Repository** em `adapters/out/`:

```typescript
// adapters/out/new.repository.ts
@Injectable()
export class NewRepository implements NewRepositoryPort {
  constructor(
    @InjectRepository(NewEntity) private repository: Repository<NewEntity>,
  ) {}

  async save(entity: Entity): Promise<Entity> {
    const entityToSave = NewMapper.toPersistence(entity);
    const saved = await this.repository.save(entityToSave);
    return NewMapper.toDomain(saved);
  }
}
```

3. **Crie o Mapper** em `adapters/out/mappers/`:

```typescript
// adapters/out/mappers/new.mapper.ts
export class NewMapper {
  static toDomain(entity: PersistenceEntity): DomainEntity {
    // Converter de persistência para domínio
  }

  static toPersistence(entity: DomainEntity): PersistenceEntity {
    // Converter de domínio para persistência
  }
}
```

#### 3. **Adicionando uma Nova Entidade**

1. **Entidade de Domínio** em `application/core/domain/`:

```typescript
// application/core/domain/new.entity.ts
export class NewEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // ... outros campos
  ) {}
}
```

2. **Entidade de Persistência** em `adapters/out/domain/`:

```typescript
// adapters/out/domain/new.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('new_entities')
export class NewEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

### Convenções de Código

#### 1. **Nomenclatura**

- **Use Cases**: `VerbNoun.useCase.ts` (ex: `createUser.useCase.ts`)
- **Repositories**: `noun.repository.ts` (ex: `users.repository.ts`)
- **Entities**: `noun.entity.ts` (ex: `user.entity.ts`)
- **Mappers**: `noun.mapper.ts` (ex: `user.mapper.ts`)
- **Services**: `noun.service.ts` (ex: `users.service.ts`)

#### 2. **Estrutura de Arquivos**

- Mantenha a separação clara entre as camadas
- Use barrels (`index.ts`) para exportações quando necessário
- Organize imports: externos primeiro, depois internos

#### 3. **Tratamento de Erros**

- Use o Result Pattern para operações que podem falhar
- Defina erros específicos em `application/core/errors/errors.enum.ts`
- Não use exceptions para fluxo de negócio

#### 4. **Testes**

- Teste Use Cases isoladamente usando mocks dos repositories
- Teste mappers com dados reais
- Use testes de integração para controllers

### Fluxo de Trabalho (Git Flow)

1. **Crie uma branch** para sua feature:

```bash
git checkout -b feature/nome-da-feature
```

2. **Faça commits pequenos e descritivos**:

```bash
git commit -m "feat: add new user validation use case"
```

3. **Execute os testes** antes de fazer push:

```bash
npm run test
npm run test:e2e
```

4. **Abra um Pull Request** com:

- Descrição clara da mudança
- Testes que cobrem a nova funcionalidade
- Documentação atualizada se necessário

### Debugging e Logs

- Use o sistema de logs do NestJS
- Para debugging, configure breakpoints nos Use Cases
- Monitore as queries do banco através do TypeORM logging

### Estrutura de Testes

```
test/
├── unit/                    # Testes unitários
│   ├── use-cases/          # Testes dos Use Cases
│   ├── services/           # Testes dos Services
│   └── mappers/            # Testes dos Mappers
├── integration/            # Testes de integração
│   ├── repositories/       # Testes dos Repositories
│   └── controllers/        # Testes dos Controllers
└── e2e/                    # Testes end-to-end
    └── app.e2e-spec.ts
```

## Endpoints planejados/construídos

**GET** /users/:id - Recupera informações de um usuário

**POST** /users - Cadastra um usuário na base de dados da aplicação.

**PATCH** /users/:id - Altera um conjunto parcial de dados de usuários.

**POST** /users/authenticate - Autentica um usuário a partir de algumas crendeciais como (email/nome de usuário, senha)

## Como executar o projeto

Para a execução do projeto, instale todas as dependências

```bash
npm i
```

Após instalar as dependências, rode o projeto dependendo do seu contexto/critério:

Desenvolvimento

```bash
npm start:dev
```

Rodar sem necessidade de verificar alteração de arquivos:

```bash
npm start
```

Rodar a versão de PROD

```bash
npm start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Desenvolvedores

Este projeto foi desenvolvido pelo grupo de estudantes da FATEC Votorantim, presentes atualmente no 3o semestre de Desenvolvimento de Software Multiplataforma.

[Ysrael Moreno](https://github.com/ysraelmoreno) - Desenvolvedor Full Stack | Android, React, NextJS, NodeJS.
