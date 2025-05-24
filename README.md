# Controla+ : Seu Assistente Financeiro Pessoal Inteligente

Bem-vindo ao Controla+\! Este projeto é uma aplicação web de controle financeiro pessoal projetada para ajudar usuários a gerenciar suas finanças, planejar o futuro e, crucialmente, ganhar autoconhecimento sobre seus hábitos de consumo, incluindo a identificação de gastos compulsivos e os gatilhos emocionais associados.

## 🎯 Propósito

O Controla+ vai além de uma simples planilha de gastos. Ele oferece um fluxo guiado para o planejamento financeiro e uma ferramenta de acompanhamento mensal detalhada, com o objetivo de trazer clareza, controle e bem-estar financeiro, ajudando o usuário a tomar decisões mais conscientes.

## ✨ Funcionalidades Principais

  * **Autenticação Segura de Usuários:**
      * Cadastro de novos usuários.
      * Login com e-mail e senha.
      * Fluxo completo de recuperação de senha (solicitação, verificação de código e redefinição).
      * Uso de JSON Web Tokens (JWT) para autenticação segura das requisições.
  * **Planejamento Financeiro Guiado:**
      * **Cadastro de Rendas:** Permite registrar diversas fontes de renda (salários, bônus, etc.) com diferentes frequências (mensal, trimestral, semestral, anual, único) e mês de referência.
      * **Cadastro de Gastos Fixos:** Permite registrar despesas regulares (aluguel, contas, assinaturas), categorizá-las e definir sua frequência e mês de referência.
      * **Cadastro de Metas e Investimentos:** Permite definir objetivos financeiros (ex: viagem, compra de um bem) com valor total e prazo em meses, calculando automaticamente a parcela mensal.
  * **Projeção Financeira Anual:**
      * Visualização de uma projeção de 12 meses (Janeiro a Dezembro) baseada nos dados de renda, gastos fixos e metas inseridos.
      * Cálculo de recebimentos, gastos totais e saldo para cada mês.
      * Detalhes expandidos por mês mostrando as rendas e gastos específicos.
      * Identificação de frequência e mês de referência para itens não mensais nos detalhes.
      * Alertas visuais para meses com saldo negativo ou alto comprometimento da renda.
      * Opção de ajustar valores de gastos ou metas diretamente na projeção (com atualização no backend).
  * **Dashboard Inteligente (Tela Inicial Pós-Login):**
      * Saudação personalizada ao usuário.
      * Botão para "Alterar Projeção" (leva de volta à tela de Renda/Gastos/Metas).
      * Botão de "Sair" (Logout).
      * **Progresso das Metas:** Visualização individual do progresso de cada meta cadastrada.
      * **Análise de Gastos:** Gráfico com as top 3 categorias de gastos realizados (não compulsivos).
      * **Análise de Gatilhos Emocionais:** Gráfico com os principais gatilhos emocionais associados a gastos compulsivos.
      * **Navegação para Controle Mensal:** Cards para cada mês do ano, exibindo o saldo *realizado* do mês e permitindo acesso rápido à tela de controle detalhado daquele mês.
      * Destaque visual para o card do mês atual.
  * **Controle Mensal Detalhado (`/controle-mensal/:mes`):**
      * Visão "Planejado vs. Realizado" para o mês selecionado.
      * **Coluna "Planejado":** Lista as rendas, gastos fixos e parcelas de metas projetadas para o mês, com opção de "Registrar" cada item.
      * **Coluna "Realizado":**
          * Cards de resumo com totais de receitas, gastos e gastos compulsivos do mês.
          * Formulário para adicionar novos lançamentos (receitas ou gastos) não planejados.
          * **Tracking de Gastos Compulsivos:** Ao adicionar um novo gasto, o usuário pode marcá-lo como compulsivo e selecionar a emoção que o motivou.
          * Listas separadas para "Receitas", "Gastos (Não Compulsivos)" e "Gastos Compulsivos", cada uma com opções de editar e excluir lançamentos.
      * **Restrição de Data:** O modal de adição/edição de lançamentos permite apenas datas dentro do mês selecionado.
      * **Alertas Contextuais e Feedback Positivo:**
          * Aviso se os gastos compulsivos estiverem muito altos.
          * Sugestão para revisar o planejamento se os gastos superarem muito o projetado.
          * Popup de parabéns com "confetes" se houver uma redução significativa nos gastos compulsivos em relação ao mês anterior (aparece apenas uma vez por mês/ano para manter o efeito).

## 🛠️ Tecnologias Utilizadas

  * **Frontend:**
      * React (CRA - Create React App ou Vite)
      * JavaScript (ES6+)
      * React Router DOM para navegação
      * CSS-in-JS (estilos definidos diretamente nos componentes React)
      * Paleta de cores consistente aplicada via variáveis CSS injetadas globalmente.
  * **Backend:**
      * Node.js
      * Express.js para a criação da API RESTful
      * SQLite como banco de dados (via pacote `sqlite3`)
      * `bcryptjs` para hashing de senhas
      * `jsonwebtoken` para autenticação baseada em tokens JWT
      * `cors` para permitir requisições do frontend

## 📁 Estrutura do Projeto (Sugestão)

ControlaPlus
|
|-- /FrontEnd
|   |-- /public
|   |-- /src
|   |   |-- /assets
|   |   |-- /componets
|   |   |   |-- /features
|   |   |   |   |-- Cadastro/Cadastro.jsx
|   |   |   |   |-- Login/Login.jsx
|   |   |   |   |-- EsqueceuSenhaLink/EsqueceuSenhaLink.jsx
|   |   |   |   |-- CodigoVerificacao/CodVerificacao.jsx
|   |   |   |   |-- RedefinirSenha/RedefinirSenha.jsx
|   |   |   |   |-- Renda/renda.jsx
|   |   |   |   |-- Gastos/gastos.jsx
|   |   |   |   |-- Metas/metas.jsx
|   |   |   |   |-- Projecao/projecao.jsx
|   |   |   |   |-- Dashboard/Dashboard.jsx  (Nova tela inicial)
|   |   |   |   |-- ControleMensal/ControleMensal.jsx
|   |   |   |   |-- ResumodeGastos/ (Pode ser o nome antigo do Dashboard ou um componente diferente)
|   |   |   |-- /shared
|   |   |   |   |-- Input.jsx
|   |   |   |   |-- Label.jsx
|   |   |   |   |-- Select.jsx
|   |   |   |   |-- ModalRenda.jsx
|   |   |   |   |-- ModalGasto.jsx
|   |   |   |   |-- ModalMeta.jsx
|   |   |-- /context
|   |   |   |-- ProgressoContext.js
|   |   |-- /styles
|   |   |   |-- Projecao.module.css (Usado como referência para o CSS-in-JS)
|   |   |   |-- (Outros .css ou .module.css se houver)
|   |   |-- App.js
|   |   |-- AppRoutes.jsx (Contém a configuração das rotas)
|   |   |-- index.js
|   |-- package.json
|
|-- /meu-app-backend  (Ou o nome que você deu à pasta do backend)
|   |-- server.js         (Arquivo principal do servidor Express)
|   |-- database.js       (Configuração do banco de dados SQLite e criação das tabelas)
|   |-- finance_app.sqlite (Arquivo do banco de dados - gerado automaticamente)
|   |-- package.json
|   |-- node_modules/

## 🚀 Configuração e Instalação

### Pré-requisitos

  * Node.js (versão 16 ou superior recomendada)
  * npm (geralmente vem com o Node.js)

### Backend

1.  Navegue até a pasta do backend: `cd meu-app-backend`
2.  Instale as dependências: `npm install`
      * Dependências principais: `express`, `cors`, `sqlite3`, `bcryptjs`, `jsonwebtoken`.
3.  **Importante (Produção):** A `JWT_SECRET` em `server.js` deve ser configurada como uma variável de ambiente segura, e não diretamente no código.

### Frontend

1.  Navegue até a pasta do frontend: `cd FrontEnd`
2.  Instale as dependências: `npm install`
      * Dependências principais: `react`, `react-dom`, `react-router-dom`.

## ▶️ Executando a Aplicação

É necessário executar o backend e o frontend separadamente, em terminais diferentes.

### 1\. Iniciar o Backend

```bash
cd meu-app-backend
node server.js
```

O servidor backend estará rodando em http://localhost:3001 (ou na porta definida em PORT). Você verá logs no console, incluindo "Conectado ao banco de dados SQLite." e a criação das tabelas.

### 2\. Iniciar o FrontEnd

```bash
cd FrontEnd
npm start
```

A aplicação React será aberta no seu navegador, geralmente em http://localhost:3000.

## ⚙️ Principais Endpoints da API (Backend)

Todas as rotas de dados financeiros são protegidas e requerem um token JWT no cabeçalho Authorization: Bearer <token>.

Autenticação:
    - POST /api/cadastro
    - POST /api/login
    - POST /api/solicitar-redefinicao
    - POST /api/verificar-codigo-redefinicao
    - POST /api/redefinir-senha

Rendas:
    -  GET /api/rendas
    -  POST /api/rendas
    -  PUT /api/rendas/:id
    -  DELETE /api/rendas/:id

Gastos:
    -  GET /api/gastos
    -  POST /api/gastos
    -  PUT /api/gastos/:id
    -  DELETE /api/gastos/:id

Metas:
    -  GET /api/metas
    -  POST /api/metas
    -  PUT /api/metas/:id
    -  DELETE /api/metas/:id

Dados para Projeção e Dashboard:
    -  GET /api/dados-completos-usuario: Retorna todas as rendas, gastos fixos e metas do usuário.

Controle Mensal (Registros Realizados):
    -  GET /api/registros-mensais/:mes: Busca os registros de um mês específico.
    -  GET /api/todos-registros-mensais: Busca todos os registros de todos os meses do usuário (usado pelo Dashboard).
    -  POST /api/registros-mensais/:mes: Adiciona um novo registro realizado.
    -  PUT /api/registros-mensais/:mes/:registroId: Atualiza um registro.
    -  DELETE /api/registros-mensais/:mes/:registroId: Deleta um registro.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.