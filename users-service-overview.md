## Users Service – Visão Geral Completa

### 1. Contexto e propósito

Este serviço (`users-service`) é um **microserviço NestJS** responsável por:

- Gestão de usuários da plataforma **Sangue Solidário**;
- Autenticação via **JWT**;
- Perfis de **doador (DONOR)** e **instituição/empresa (COMPANY)**;
- Gerenciamento de senhas (hash, troca de senha);
- Upload e exposição de **avatar** do usuário.

Ele segue **Arquitetura Hexagonal (Ports & Adapters)** para desacoplar regra de negócio de frameworks e infraestrutura.

---

### 2. Tecnologias principais (`package.json`)

- **Framework**: NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/typeorm`).
- **Validação & transformação**:
  - `class-validator`, `class-transformer`.
- **Banco de dados**:
  - `typeorm` (versão 0.3.x),
  - `pg` (driver PostgreSQL).
- **Autenticação / segurança**:
  - `jsonwebtoken` para criação/validação de tokens JWT;
  - `crypto` nativo do Node para hash de senhas (via `scryptSync`).
- **Ferramentas de desenvolvimento**:
  - `jest` + `@swc/jest` para testes,
  - `eslint` + `prettier` para lint/format,
  - `ts-node`, `tsconfig-paths`, `typescript` para desenvolvimento em TypeScript.
- **Scripts relevantes**:
  - `start`, `start:dev`, `build`, `test`, `test:e2e`, `lint`.

---

### 3. Entrada da aplicação (`src/main.ts`)

- Cria o app Nest:

  ```ts
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  ```

- **CORS** ativado:

  - Origens permitidas: `http://localhost:3000`, `http://localhost:3001`;
  - `credentials: true`.

- **Serviço de arquivos estáticos**:

  - `app.useStaticAssets(join(__dirname, '..', '..', 'temp', 'uploads'), { prefix: '/uploads/' })`;
  - Tudo que estiver em `temp/uploads` será acessível via URL `/uploads/<arquivo>`.

- **Swagger**:

  - Chama `setupSwagger(app)` definido em `swagger/swagger.config.ts`.

- **Porta do servidor**:

  - Usa `process.env.PORT` ou `3002` como default;
  - Loga a URL do serviço e da documentação.

---

### 4. Módulo raiz (`src/user.module.ts` – `AppModule`)

Este módulo integra todas as partes do microserviço.

#### 4.1 Imports

- **TypeOrmModule.forRoot**:
  - `type: 'postgres'`;
  - Config de conexão via `process.env.POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`;
  - `entities: [Users, Donors, Companies]` – entidades TypeORM (camada de adapter).

- **TypeOrmModule.forFeature([Users, Donors, Companies])**:
  - Habilita repositórios TypeORM para essas entidades.

- **HashModule**:
  - Módulo responsável por hash de senhas e JWT (descritos na seção específica).

- **HealthModule**:
  - Endpoints de healthcheck (`/health`, `/health/ready`, `/health/live`).

#### 4.2 Controllers

- `UsersController`:
  - Expõe as rotas HTTP de usuários, por exemplo:
    - `GET /users/:id`
    - `POST /users`
    - `POST /users/authenticate`
    - `PUT /users/change-password/:id`
    - `POST /users/:id/avatar`

#### 4.3 Providers (serviços, casos de uso, repositórios)

- **Casos de uso (ports in)**:
  - `CreateUserUseCase`
  - `GetUserUseCase`
  - `GetUserByEmailUseCase`
  - `ChangePasswordUseCase`
  - `ChangeUserDataUseCase`
  - `CreateDonorUseCase`
  - `CreateCompanyUseCase`
  - `UpdateUserAvatarUseCase`

- **Serviços de orquestração**:
  - `UsersService` (facade de domínio chamado pelo controller).

- **Bindings de repositórios (ports out → adapters)**:
  - `{ provide: USERS_REPOSITORY, useClass: UsersRepository }`
  - `{ provide: DONOR_REPOSITORY, useClass: DonorRepository }`
  - `{ provide: COMPANY_REPOSITORY, useClass: CompanyRepository }`

Esses providers conectam a camada de domínio (interfaces) às implementações reais (TypeORM).

---

### 5. Constantes de DI (`src/constants/index.ts`)

- Define tokens como `Symbol` para injeção:

  ```ts
  export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
  export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');
  export const DONOR_REPOSITORY = Symbol('DONOR_REPOSITORY');
  ```

- São usados em casos de uso para injetar repositórios de forma desacoplada.

---

### 6. Domínio: entidades (`src/application/core/domain`)

Entidades puras de negócio (sem dependência de Nest, TypeORM ou libs externas).

- **`User`** (`user.entity.ts`):
  - Campos:
    - `id: string`
    - `email: string`
    - `password?: string`
    - `name: string`
    - `city: string`
    - `uf: string`
    - `zipcode?: string`
    - `personType: string`
    - `avatarPath?: string`

- **`Donor`** (`donor.entity.ts`):
  - `id`, `cpf`, `bloodType`, `birthDate`, `fkUserId`.

- **`Company`** (`company.entity.ts`):
  - `id`, `cnpj`, `institutionName`, `cnes`, `fkUserId`.

O domínio trabalha com essas classes, não com entidades do ORM.

---

### 7. Tipos compartilhados (`src/application/types`)

#### 7.1 `user.types.ts`

- **Enum `PersonType`**:
  - `DONOR`, `COMPANY`.

- **`BaseCreateUserRequest`**:
  - Campos comuns a qualquer usuário: `email`, `password`, `name`, `city`, `uf`, `zipcode?`, `personType`.

- **`CreateDonorRequest`**:
  - `BaseCreateUserRequest` + `cpf`, `bloodType`, `birthDate`.

- **`CreateCompanyRequest`**:
  - `BaseCreateUserRequest` + `cnpj`, `institutionName`, `cnes`.

- **`CreateUserRequest`**:
  - Union: `CreateDonorRequest | CreateCompanyRequest`.

#### 7.2 `useCase.types.ts`

- Interface genérica de caso de uso:

  ```ts
  export interface UseCase<T, R> {
    execute(params: T): R;
  }
  ```

Todos os casos de uso (CreateUser, GetUser, etc.) implementam esta interface.

#### 7.3 `result.types.ts`

Implementa o **Result Pattern**:

- `SuccessResult<T>`:
  - `{ isSuccess: true, value: T, isPartialSuccess?: false }`
- `PartialSuccessResult<T>`:
  - `{ isSuccess: true, value: T, isPartialSuccess: true }`
- `FailureResult`:
  - `{ isSuccess: false, error: ErrorsEnum }`
- `Result<T>`:
  - União dos três tipos.

- `ResultFactory`:
  - `success(value)`, `failure(error)`, `partialSuccess(value)`.

---

### 8. Erros de domínio (`src/application/core/errors/errors.enum.ts`)

Enum `ErrorsEnum` lista os erros possíveis nos casos de uso:

- `InvalidPassword`
- `UserNotFound`
- `UserAlreadyExists`
- `UserNotFoundError`
- `CompanyNotFoundError`
- `CompanyAlreadyExists`
- `DonorNotFoundError`
- `DonorAlreadyExists`
- `DonorNotFound`

Esses valores são usados pelos casos de uso e traduzidos em códigos HTTP pelos controllers.

---

### 9. Ports de saída (repositórios) (`src/application/ports/out`)

Interfaces que definem o contrato que a camada de domínio espera da persistência.

- **`UserRepositoryPort`**:
  - `save(user: Omit<User, 'id'>): Promise<Omit<User, 'password'>>`
  - `findById(id: string): Promise<User | null>`
  - `findByEmail(email: string): Promise<User | null>`
  - `updatePassword(id: string, password: string): Promise<Users | null>`
  - `update(id: string, user: Omit<User, 'id' | 'password'>): Promise<Users | null>`
  - `updateAvatar(id: string, avatarPath: string): Promise<User | null>`

- **`DonorRepositoryPort`**:
  - `save`, `findById`, `update`, `delete`.

- **`CompanyRepositoryPort`**:
  - `save`, `findById`, `update`, `delete`.

Essas interfaces são implementadas pelos adapters com TypeORM.

---

### 10. Ports de entrada (casos de uso) – usuário, doador, empresa

Principais casos de uso:

- **`CreateUserUseCase`**:
  - Verifica se já existe user com o e-mail (`GetUserByEmailUseCase`).
  - Se existir → `Result.failure(UserAlreadyExists)`.
  - Se não existir → `UserRepositoryPort.save(user)` → `Result.success(userCriado)`.

- **`GetUserUseCase`**:
  - `findById`.
  - Se não achar → `Result.failure(UserNotFoundError)`.
  - Se achar → `Result.success(user)`.

- **`GetUserByEmailUseCase`**:
  - `findByEmail`.
  - Se não achar → `Result.failure(UserNotFound)`.
  - Se achar → `Result.success(user)`.

- **`ChangePasswordUseCase`**:
  - `updatePassword(id, newPassword)` no repositório.
  - Falha → `Result.failure(UserNotFound)`.
  - Sucesso → `Result.success(usuarioAtualizado)`.

- **`ChangeUserDataUseCase`**:
  - Atualiza dados de perfil (sem senha) via `update`.
  - Falha → `Result.failure(UserNotFound)`.

- **`UpdateUserAvatarUseCase`**:
  - Primeiro faz `findById` para garantir que o usuário existe.
  - Depois `updateAvatar(userId, avatarPath)`.
  - Falhas → `Result.failure(UserNotFound)`.

- **`CreateDonorUseCase`**:
  - Salva os dados do doador vinculados a `fkUserId`.
  - `Result.success(donor)`.

- **`CreateCompanyUseCase`**:
  - Salva os dados da empresa.
  - Se não salvar → `Result.failure(CompanyNotFoundError)` (semântica discutível, mas é o que o código faz).
  - Se salvar → `Result.success(company)`.

---

### 11. Serviço de domínio `UsersService` (`src/application/core/service/users.service.ts`)

`UsersService` funciona como **fachada** que o controller chama. Ele orquestra múltiplos casos de uso e lida com detalhes como remoção de senha dos retornos.

Principais métodos:

- **`getUserById(id)`**:
  - Usa `GetUserUseCase`.
  - Se falha → propaga `Result.failure`.
  - Se sucesso → remove `password` e retorna `Result.success(userSemSenha)`.

- **`createUser(user: CreateUserRequest)`**:
  - Gera hash da senha via `HashStringUseCase` (que usa `HashRepository` com `scryptSync`).
  - Chama `CreateUserUseCase` para salvar o usuário.
  - Dependendo de `personType`:
    - `DONOR` → chama `CreateDonorUseCase` para criar perfil de doador.
    - `COMPANY` → `CreateCompanyUseCase`.
  - Se criação de perfil falhar:
    - Retorna `Result.partialSuccess(userCriado)`.
  - Remove `password` e retorna `Result.success(userSemSenha)`.

- **`authenticate(user: AuthenticateUserDto)`**:
  - Busca por e-mail (`GetUserByEmailUseCase`).
  - Compara senha via `CompareHashUseCase`.
  - Gera JWT via `GenerateJwtUseCase` usando payload `{ email, id, personType }` e expiração:
    - `'30d'` se `rememberMe` true;
    - `'1h'` se false.
  - Remove senha do user e retorna `Result.success({ userSemSenha, token })`.

- **`changePassword(id, { old, new })`**:
  - Busca usuário por id.
  - Confere senha antiga com `CompareHashUseCase`.
  - Gera novo hash com `HashStringUseCase`.
  - Usa `ChangePasswordUseCase` para persistir.
  - Retorna `Result.success` ou `Result.failure`.

- **`uploadAvatar(userId, avatarPath)`**:
  - Usa `UpdateUserAvatarUseCase`.
  - Remove senha do retorno.
  - Retorna `Result.success(userSemSenha)`.

---

### 12. Adapters de saída – Banco de dados (TypeORM)

#### 12.1 Entidades TypeORM (`src/adapters/out/domain`)

- **`Users`**:
  - Tabela principal de usuários.
  - Campos: `id`, `email`, `password`, `name`, `city`, `uf`, `zipcode?`, `person_type`, `avatar_path`.

- **`Donors`**:
  - Tabela `donor`.
  - Campos: `id`, `cpf`, `blood_type`, `birth_date`.
  - Relacionamento `OneToOne` com `Users` via `fk_user_id`.

- **`Companies`**:
  - Tabela `company`.
  - Campos: `id`, `cnpj`, `institution_name`, `cnes`.
  - `OneToOne` com `Users` via `fk_user_id`.

#### 12.2 Mappers (`src/adapters/out/mappers`)

- **`UserMapper`**:
  - `toDomain(Users) → User`.
  - `toPersistence(User) → Users`.

- **`DonorMapper`**:
  - Converte entre `Donor` (domínio) e objeto compatível com TypeORM (incluindo propriedade `user: { id: fkUserId }`).

- **`CompanyMapper`**:
  - Mesma ideia para `Company`.

#### 12.3 Repositórios (`src/adapters/out`)

- **`UsersRepository`**:
  - Implementa `UserRepositoryPort`.
  - Usa `Repository<Users>` do TypeORM.
  - Implementa métodos `save`, `findById`, `findByEmail`, `updatePassword`, `update`, `updateAvatar`.

- **`DonorRepository`**:
  - Implementa `DonorRepositoryPort`.
  - Usa `Repository<Donors>`.
  - Métodos para `save`, `findById`, `update`, `delete`, `findByUserId`.

- **`CompanyRepository`**:
  - Implementa `CompanyRepositoryPort`.
  - Usa `Repository<Companies>`.
  - Métodos `save`, `findById`, `update`, `delete`.

---

### 13. Adapters de entrada – HTTP (controllers, guards, DTOs)

#### 13.1 DTOs de entrada (`src/adapters/in/dto`)

- **`BaseCreateUserDto`**:
  - Campos básicos com validação (email, senha forte, nome, cidade, uf, zipcode, personType).

- **`CreateDonorDto`**:
  - Herda `BaseCreateUserDto`.
  - `personType` fixo em `DONOR`.
  - Campos de doador: `cpf`, `bloodType`, `birthDate`, todos com validação.

- **`CreateCompanyDto`**:
  - Herda `BaseCreateUserDto`.
  - `personType` fixo em `COMPANY`.
  - Campos: `cnpj`, `institutionName`, `cnes`.

- **`ChangePasswordDto`**:
  - `old`, `new` com validação de senha forte.

- **`AuthenticateDto` / `AuthenticateUserDto`**:
  - Dados para login (`email`, `password` e opcionalmente `rememberMe`).

#### 13.2 DTOs de resposta (`user-response.dto.ts`)

- **`UserResponseDto`**:
  - Estrutura de usuário retornado nas respostas HTTP (sem `password`).

- **`AuthResponseDto`**:
  - `user: UserResponseDto`, `token: string`.

- **`ErrorResponseDto`**:
  - `statusCode`, `message`.

#### 13.3 Guard JWT (`jwt-auth.guard.ts`)

- Implementa `CanActivate`.
- Fluxo:
  - Extrai token do header `Authorization: Bearer <token>`;
  - Usa `jsonwebtoken` + `process.env.JWT_SECRET` para verificar;
  - Valida que payload contém `id`, `email`, `personType`;
  - Em caso de sucesso, coloca `request.user = payload`;
  - Em erros (token expirado, inválido, ausente), lança `UnauthorizedException` com mensagens específicas.

#### 13.4 Decorator `@CurrentUser` (`current-user.decorator.ts`)

- Cria um parâmetro decorado para recuperar `request.user` tipado como `JwtPayload`.
- Usado em métodos do controller para acessar o usuário autenticado de forma simples.

#### 13.5 `UsersController` (`src/adapters/in/user.controller.ts`)

Principais endpoints:

- `GET /users/:id`:
  - Protegido pelo `JwtAuthGuard`.
  - Verifica se o usuário autenticado só acessa o próprio `id`.
  - Usa `usersService.getUserById`.
  - Mapeia `ErrorsEnum` em status HTTP apropriados (`404`, `400`).

- `POST /users`:
  - Criação de usuário doador/empresa.
  - Recebe DTOs com validação.
  - Chama `usersService.createUser`.
  - Se `isPartialSuccess`, responde `206 Partial Content`.
  - Se sucesso total, `201 Created`.

- `PUT /users/change-password/:id`:
  - Protegido por `JwtAuthGuard`.
  - Garante que o usuário só altera a própria senha (`user.id === id`).
  - Usa `usersService.changePassword`.

- `POST /users/authenticate`:
  - Login.
  - Usa `usersService.authenticate`.
  - Retorna `{ user, token }`.

- `POST /users/:id/avatar`:
  - Protegido por `JwtAuthGuard`.
  - Usa `FileInterceptor` (Multer) para upload do arquivo.
  - Apenas o próprio usuário pode atualizar seu avatar.
  - Calcula `avatarPath` como `/uploads/<filename>`.
  - Usa `usersService.uploadAvatar`.

---

### 14. Módulo de Hash/JWT (`src/modules/Hash`)

Módulo especializado para hash de senhas e JWT, também seguindo conceito de ports/adapters.

#### 14.1 Ports de saída

- **`HashRepositoryPort`**:
  - `hash(password): "salt:hash"`.
  - `compare(password, hash): boolean`.

- **`JwtRepositoryPort`**:
  - `generate(payload, expiresIn?): string`.
  - `verify(token): JwtToken`.

#### 14.2 Implementações (adapters/out)

- **`HashRepository`**:
  - Usa `crypto.scryptSync` e `randomBytes` para gerar salt e hash.
  - Retorna `"<salt>:<hash>"`.
  - Faz `compare` recalculando o hash com o mesmo salt e comparando com `timingSafeEqual`.

- **`JwtRepository`**:
  - Usa `jsonwebtoken` com configuração (`secret`, `expiresIn`) definida em `config/auth`.
  - `generate`: `jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn })`.
  - `verify`: `jwt.verify(token, secret)`.

#### 14.3 Ports de entrada (casos de uso de hash/JWT)

- `HashStringUseCase`: encapsula `hashRepository.hash`.
- `CompareHashUseCase`: encapsula `hashRepository.compare`.
- `GenerateJwtUseCase`: encapsula `jwtRepository.generate`.
- `VerifyJwtUseCase`: encapsula `jwtRepository.verify`.

#### 14.4 Serviços (`HashService`, `JwtService`)

- `HashService`:
  - `hash(password)`, `compare(compare, passwordWithHash)` por cima dos use cases.

- `JwtService`:
  - `generate(payload)`, `verify(token)` por cima dos use cases.

#### 14.5 Módulo (`hash.module.ts`)

- Declara todos os use cases, services, e bindings:
  - `HASH_REPOSITORY → HashRepository`.
  - `JWT_REPOSITORY → JwtRepository`.
- Exporta os casos de uso para serem usados por outros módulos (como `UsersService`).

---

### 15. Health module (`src/modules/Health`)

- **`HealthController`**:
  - `GET /health`: status simples (`ok`), versão, uptime.
  - `GET /health/ready`: readiness (simula checks de banco/memória).
  - `GET /health/live`: liveness (processo vivo).

- **`HealthModule`**:
  - Apenas registra este controller.

---

### 16. Swagger (`swagger/swagger.config.ts`)

Configura a documentação:

- Título: `Sangue Solidário - Users Service API`.
- Descrição explicando:
  - Funcionalidades (registro, auth, perfis, avatar, senhas).
  - Tipos de usuário (`DONOR`, `COMPANY`).
  - Como enviar JWT via header `Authorization: Bearer <token>`.
- Adiciona tags:
  - `Authentication`, `Users`, `Health`.
- Configura `BearerAuth` chamado `JWT-auth`.
- Define servidores:
  - `http://localhost:3002` (dev),
  - `https://api.sanguesolidario.com` (prod).
- Customiza o UI do Swagger (CSS, título, etc.).

---

