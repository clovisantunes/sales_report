# 📁 Project Structure

Este documento descreve a estrutura de pastas e arquivos do projeto, explicando a função de cada um para facilitar a manutenção e o desenvolvimento.

---

## 🏗️ Estrutura Geral
    `
    ├── node_modules/ # Dependências do projeto
    ├── public/ # Arquivos públicos acessíveis diretamente (favicon, imagens estáticas etc.)
    ├── src/ # Código-fonte principal do projeto
    │ ├── assets/ # Imagens, ícones e outros arquivos estáticos
    │ ├── Components/ # Componentes reutilizáveis da aplicação
    │ │ ├── Customers/ # Componentes relacionados a clientes
    │ │ ├── Dashboard/ # Componentes do painel principal
    │ │ ├── ExportButton/ # Botão de exportação de dados
    │ │ ├── NavBar/ # Barra de navegação superior
    │ │ ├── Products/ # Componentes de produtos
    │ │ ├── Prospections/ # Componentes de prospecções
    │ │ ├── Sales/ # Componentes de vendas
    │ │ ├── Sidebar/ # Menu lateral
    │ │ ├── UI/ # Componentes visuais genéricos (botões, inputs etc.)
    │ │ ├── UserDetails/ # Detalhes do usuário
    │ │ └── UserForm/ # Formulário de cadastro/edição de usuário
    │ │
    │ ├── Firebase/ # Configuração e inicialização do Firebase
    │ │ └── Firebase.ts
    │ │
    │ ├── Pages/ # Páginas completas da aplicação
    │ │ └── Auth/ # Páginas de autenticação (login, registro)
    │ │ ├── index.tsx
    │ │ └── styles.module.scss
    │ │
    │ ├── services/ # Serviços responsáveis por comunicação com APIs e Firebase
    │ │ ├── AuthService/
    │ │ │ └── authService.ts
    │ │ ├── Customers/
    │ │ ├── DashboardService/
    │ │ ├── exportService/
    │ │ ├── ProductService/
    │ │ ├── ProspectionsService/
    │ │ ├── SalesService/
    │ │ └── userService/
    │ │
    │ ├── Styles/ # Estilos globais e variáveis SCSS
    │ │ ├── globals.scss
    │ │ └── theme.scss
    │ │
    │ ├── types/ # Definições de tipos TypeScript
    │ │ ├── Auth.ts
    │ │ ├── Customers.ts
    │ │ ├── DashBoard.ts
    │ │ ├── Navbar.ts
    │ │ ├── Products.ts
    │ │ ├── Prospections.ts
    │ │ ├── Sales.ts
    │ │ ├── Sidebar.ts
    │ │ └── User.ts
    │ │
    │ ├── App.tsx # Componente principal da aplicação
    │ └── main.tsx # Ponto de entrada do React
    │
    ├── .env # Variáveis de ambiente
    ├── .gitignore # Arquivos ignorados pelo Git
    ├── eslint.config.js # Configuração do ESLint
    ├── index.html # Template HTML principal
    ├── package.json # Configurações e dependências do projeto
    ├── tsconfig.json # Configuração principal do TypeScript
    ├── tsconfig.app.json # Configuração específica da aplicação
    ├── tsconfig.node.json # Configuração específica para scripts Node
    ├── vite.config.ts # Configuração do Vite
    └── README.md # Documentação principal do projeto
`

---

## 🧩 Descrição dos Principais Diretórios

### `Components/`
Contém todos os componentes visuais reutilizáveis da aplicação. Cada subpasta representa um módulo ou seção da interface.

### `Pages/`
Agrupa páginas completas que são renderizadas em rotas específicas (ex: `/auth`, `/dashboard`).

### `services/`
Contém a lógica de comunicação com APIs e o Firebase. Cada serviço é responsável por uma entidade do sistema (ex: usuários, produtos, vendas).

### `types/`
Definições de tipos e interfaces TypeScript para manter o código seguro e padronizado.

### `Styles/`
Guarda os estilos globais e o tema base da aplicação. Todos os componentes podem importar variáveis ou mixins definidos aqui.

### `Firebase/`
Configuração central do Firebase usada pelos serviços e autenticação.

---

## ⚙️ Ferramentas e Tecnologias

- **Framework:** React + TypeScript  
- **Build Tool:** Vite  
- **Estilização:** SCSS Modules  
- **Banco de Dados / Auth:** Firebase  
- **Linting:** ESLint  
- **Gerenciamento de Pacotes:** npm  

---

## 📚 Boas Práticas

- Criar novos componentes dentro de `Components/` com subpastas próprias e um arquivo `index.tsx`.
- Centralizar todos os tipos em `types/` para evitar duplicidade.
- Manter os serviços separados por entidade dentro de `services/`.
- Seguir o padrão de importação absoluta (configurável no `tsconfig.json`).
- Utilizar SCSS Modules para evitar conflito de classes.

---

