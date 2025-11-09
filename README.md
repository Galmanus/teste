# Aplicativo de Cadastro de Dispositivos com Integração de IA

Uma aplicação web full-stack para cadastro de dispositivos com atualizações de status em tempo real usando WebSocket e descrições geradas por IA.

## Funcionalidades

- Cadastrar dispositivos com nome e endereço MAC
- Descrições geradas por IA usando Google Gemini API
- Listar todos os dispositivos cadastrados
- Alternar status do dispositivo (ATIVO/INATIVO) em tempo real
- Atualizações em tempo real via WebSocket

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, Socket.io, MySQL, Sequelize, Google Generative AI
- **Frontend**: Vue 3, Socket.io-client
- **Banco de Dados**: MySQL
- **IA**: Google Gemini API

## Configuração

### Pré-requisitos

- Node.js (v14 ou superior)
- MySQL

### Configuração do Backend

1. Navegue até o diretório backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie um banco de dados MySQL chamado `device_db`
   - Execute o script do esquema:
     ```bash
     mysql -u root -p < ../db/schema.sql
     ```

4. Atualize as credenciais do banco de dados em `config/database.js` se necessário.

5. Obtenha uma chave da API Google Gemini em [Google AI Studio](https://makersuite.google.com/app/apikey) e defina a variável de ambiente:
   ```bash
   export GEMINI_API_KEY=sua_chave_api_aqui
   ```

6. Inicie o servidor backend:
   ```bash
   npm start
   ```

### Configuração do Frontend

1. Navegue até o diretório frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra seu navegador e acesse `http://localhost:5173`

## Endpoints da API

- `POST /api/devices` - Criar um novo dispositivo (com descrição gerada por IA)
- `GET /api/devices` - Obter todos os dispositivos
- `PATCH /api/devices/:id/status` - Alternar status do dispositivo

## Eventos WebSocket

- `device:created` - Emitido quando um novo dispositivo é criado
- `device:status` - Emitido quando o status do dispositivo é alterado

## Testes

Execute os testes no diretório backend:
```bash
npm test
```

## Integração com IA

Ao cadastrar um novo dispositivo, a aplicação usa a IA Google Gemini para gerar automaticamente uma descrição baseada no nome do dispositivo e endereço MAC. A IA foca em características técnicas e possíveis usos do dispositivo. Se a API estiver indisponível, uma descrição padrão é usada.


### Configuração do Ambiente

Crie um arquivo `.env` no diretório backend com:

```env
# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=device_db

# Chaves de API
GEMINI_API_KEY=sua_chave_gemini_api

# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Recursos de Segurança

Esta aplicação implementa fortificações de segurança OWASP Top 10:

- **Validação e Sanitização de Entrada**: Todas as entradas são validadas e sanitizadas para prevenir ataques de injeção e XSS.
- **Limitação de Taxa**: Endpoints protegidos contra abuso com limitação de taxa.
- **Cabeçalhos Seguros**: Helmet.js define cabeçalhos HTTP seguros, incluindo CSP.
- **Configuração CORS**: Solicitações entre origens configuradas adequadamente.
- **Variáveis de Ambiente**: Dados sensíveis armazenados em variáveis de ambiente.
- **Logging**: Logging abrangente com Winston para eventos de segurança e rastreamento de erros.
- **Tratamento de Erros**: Respostas genéricas sem expor detalhes internos.
- **Validação de Endereço MAC**: Validação rigorosa do formato de endereço MAC.
- **Prevenção de Injeção SQL**: Uso de ORM Sequelize com consultas parametrizadas.
- **Prevenção XSS**: Sanitização de entrada e cabeçalhos CSP.

### Configuração do Ambiente

Crie um arquivo `.env` no diretório backend com as seguintes variáveis:

```env
DB_NAME=device_db
DB_USER=seu_usuario_db
DB_PASSWORD=sua_senha_db
DB_HOST=localhost
DB_DIALECT=mysql

GEMINI_API_KEY=sua_chave_gemini_api

PORT=3000
NODE_ENV=production

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://seudominio.com
```

**Importante**: Nunca faça commit do arquivo `.env` no controle de versão. Ele já está incluído no `.gitignore`.

## Project Structure

```
.
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.vue
│   └── package.json
├── db/
│   └── schema.sql
└── README.md
# teste
# teste
