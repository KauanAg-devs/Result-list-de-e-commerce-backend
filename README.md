## 🛠️ Result-list-de-e-commerce-backend

![NestJS](https://img.shields.io/badge/NestJS-Backend-red?style=flat&logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?style=flat&logo=prisma)
![Resend](https://img.shields.io/badge/Email-Resend-8B5CF6?style=flat&logo=resend)
![License](https://img.shields.io/github/license/KauanAg-devs/result-list-de-e-commerce-backend)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)

> API do sistema de e-commerce com autenticação, gerenciamento de usuários e integração com banco de dados.

### 🔗 Repositórios

* **Frontend**: [https://github.com/KauanAg-devs/Result-List-de-e-commerce](https://github.com/KauanAg-devs/Result-List-de-e-commerce)

---

## 📦 Tecnologias

* **Backend**: NestJS · Prisma · PostgreSQL
* **Autenticação**: JWT (Access Token + Refresh Token)
* **Envio de E-mail**: Resend API

---

## 🚀 Pré-requisitos

1. **Node.js** ≥ 18.x
2. **npm** ≥ 9.x ou **yarn** ≥ 1.x
3. **Docker** ≥ 20.x (ou PostgreSQL instalado localmente)
4. **Arquivo `.env`** configurado (veja abaixo)

---

## 🔧 Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/KauanAg-devs/result-list-de-e-commerce-backend.git
cd result-list-de-e-commerce-backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis obrigatórias:

```env
# DATABASE
DATABASE_URL=postgresql://postgres:mypassword@localhost:5433/db
DATABASE_PASSWORD=mypassword

# JWT
JWT_SECRET_KEY=your_access_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
JWT_EMAIL_VERIFICATION_SECRET=your_email_verification_secret

# EMAIL
EMAIL_RESEND_API_KEY=your_resend_api_key
BACKEND_URI=http://localhost:3000
```

### 4. Rodar o banco com Docker

```bash
docker compose up -d
```

### 5. Aplicar as migrations

```bash
npx prisma migrate dev
```

---

## ▶️ Iniciar o servidor

```bash
npm run start:dev
```

O servidor estará disponível em: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Scripts disponíveis

```bash
npm run start         # Inicia em produção
npm run start:dev     # Inicia em modo desenvolvimento
npm run build         # Compila para produção
npm run lint          # Corrige problemas de lint
npm run test          # Executa testes unitários
```

---

## 📁 Estrutura de Pastas

```
src/
├─ auth/              # Autenticação e controle de acesso
├─ users/             # CRUD de usuários
├─ prisma/            # Configuração do Prisma ORM
├─ utils/             # Helpers e serviços utilitários (e-mail, etc)
├─ main.ts            # Bootstrap da aplicação
└─ app.module.ts      # Módulo principal
```

---

## 📬 Funcionalidades

* ✅ Cadastro de usuários
* ✅ Login com JWT
* ✅ Refresh token
* ✅ Verificação de e-mail via link
* ✅ Hash de senha com bcrypt
* ✅ Arquitetura modular com NestJS

---

## 🧑‍💻 Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/sua-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/sua-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob os termos da **MIT License**. Veja [LICENSE](./LICENSE) para mais detalhes.