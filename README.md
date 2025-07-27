# App de Blog React Native

## Visão Geral

Este é um aplicativo de blog desenvolvido em React Native que permite aos usuários criar, visualizar e interagir com posts através de comentários e curtidas. O app foi projetado para funcionar com um backend que utiliza autenticação baseada em tokens e suporta diferentes tipos de usuários (professores e alunos).

## Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Registro de novos usuários (professores e alunos)
- Gerenciamento automático de tokens de acesso
- Logout automático quando o token expira

### 📝 Gerenciamento de Posts
- Visualizar lista de posts
- Criar novos posts
- Editar posts existentes
- Excluir posts
- Buscar posts por termo

### 💬 Sistema de Comentários
- Adicionar comentários aos posts
- Editar comentários próprios
- Excluir comentários
- Visualizar todos os comentários de um post

### ❤️ Sistema de Curtidas
- Curtir/descurtir posts
- Visualizar número de curtidas
- Ver quem curtiu um post

## Arquitetura

### Camada de Serviço API
- **Manipulador de Autenticação**: Gerencia login, registro e tokens
- **Interceptadores de Requisição/Resposta**: Adiciona tokens e trata erros
- **Manipulador de Erros**: Suporte a mensagens em português
- **Configuração de Rede**: URLs base e configurações de timeout

### Modelos de Dados
- **Modelo de Post**: Alinhado com o formato do backend
- **Modelo de Usuário**: Suporte a tipos de usuário (professor/aluno)
- **Tipos de Requisição/Resposta**: TypeScript para segurança de tipos

### Componentes de UI
- **Exibição de Erros**: Mensagens em português
- **Estados de Carregamento**: Feedback visual para o usuário
- **Validação de Formulários**: Validação em tempo real

## Configuração da API

### URLs Base
```typescript
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3001/api',  // Compatível com emulador Android
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
```

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de novo usuário

#### Posts
- `GET /api/posts` - Listar todos os posts
- `GET /api/posts/{id}` - Obter post específico
- `POST /api/posts` - Criar novo post
- `PUT /api/posts/{id}` - Atualizar post
- `DELETE /api/posts/{id}` - Excluir post
- `GET /api/posts/search/{term}` - Buscar posts

#### Comentários
- `GET /api/posts/comentarios/{postId}` - Obter comentários do post
- `POST /api/posts/comentarios` - Criar comentário
- `PUT /api/posts/comentarios/{id}` - Atualizar comentário
- `DELETE /api/posts/comentarios/{id}` - Excluir comentário

#### Curtidas
- `POST /api/posts/like` - Curtir/descurtir post
- `GET /api/posts/like/{postId}` - Obter curtidas do post
- `DELETE /api/posts/like/{postId}` - Remover curtida

## Modelos de Dados

### Post
```typescript
interface Post {
  id?: number;
  title: string;
  content: string;
  author_id?: number;
}
```

### Autenticação
```typescript
interface LoginRequest {
  email: string;
  senha: string;
}

interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: 'professor' | 'aluno';
}
```

### Comentário
```typescript
interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: string;
}
```

### Curtida
```typescript
interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}
```

## Tratamento de Erros

### Tipos de Erro
1. **Erros de Autenticação**: Respostas 401, expiração de token
2. **Erros de Validação**: Respostas 400 com mensagens em português
3. **Erros de Rede**: Timeouts de conexão, servidor indisponível
4. **Erros de Dados**: Respostas malformadas, campos ausentes

### Mensagens de Erro Traduzidas
O app traduz automaticamente mensagens de erro do português para o inglês:
- 'Token de acesso não fornecido' → 'Access token not provided'
- 'Credenciais inválidas' → 'Invalid credentials'
- 'E-mail ou senha incorretos' → 'Incorrect email or password'

## Instalação e Configuração

### Pré-requisitos
- Node.js (versão 14 ou superior)
- React Native CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS)

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd react-native-blog-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
# Para Android
npx react-native run-android

# Para iOS
npx react-native run-ios
```

### Configuração do Backend

Certifique-se de que o servidor backend esteja rodando na porta 3001. Para emulador Android, use:
- URL: `http://10.0.2.2:3001/api`

Para dispositivo físico ou iOS, use:
- URL: `http://localhost:3001/api`

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas do aplicativo
├── services/           # Serviços de API
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários e helpers
└── navigation/         # Configuração de navegação
```

## Testes

### Testes Unitários
- Testes do serviço de API
- Testes de modelos de dados
- Testes de componentes

### Testes de Integração
- Fluxo de autenticação
- Gerenciamento de posts
- Sistema de comentários e curtidas

### Testes de Rede
- Testes de conectividade
- Tratamento de erros
- Cenários offline

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Problemas Conhecidos

### Conectividade de Rede
- Problemas de mapeamento de rede no emulador Android
- Use `10.0.2.2` em vez de `localhost` no emulador

### Autenticação
- O backend usa header `accesstoken` em vez de `Authorization: Bearer`
- Tokens expiram automaticamente após um período

### Mensagens de Erro
- Algumas mensagens do backend vêm em português
- O app traduz automaticamente para melhor UX

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Suporte

Para suporte e dúvidas, abra uma issue no repositório do projeto.