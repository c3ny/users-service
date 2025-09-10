# Users Service

Esse projeto é um Micro Serviço é construído utilizando NestJS, um framework progressivo NodeJS.

## Arquitetura

Foi construído utilizando um conceito de [**Arquitetura Hexagonal**](https://docs.aws.amazon.com/pt_br/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html#:~:text=O%20padr%C3%A3o%20de%20arquitetura%20hexagonal%20permite%20que%20voc%C3%AA%20projete%20seus,UX%20e%20componentes%20de%20servi%C3%A7o.), onde utilizamos Ports & Adapters, transformando a aplicação em algo agnóstico e focado no propósito, não na tecnologia utilizada.

### Estrutura básica da arquitetura

```markdown
. 📂 src
└── 📂 adapters/
│ └── 📂 in/
│ ├── // implementação da entrada de dados (ex: endpoints)
│ └── 📂 out/
│ ├── // implementações de recursos externos (ex: BD)
└── 📂 application/
│ └── 📂 core/
│ └── 📂 domain/
│ ├── // entidades, informações de dominio da aplicação
│ └── 📂 service/
│ ├── // implementações de useCases
│ └── 📂 ports/
│ └── 📂 in/
│ ├── use cases com regras de negócios.
│ └── 📂 out/
│ ├── // Interface que define quais critérios os adapters devem seguir.
└── 📂 constants/
│ ├── 📄 index.ts
├── 📄 main.ts
└── 📂 modules/
└── 📄 user.module.ts
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
