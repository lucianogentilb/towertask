# Ferramenta Colaborativa de Gerenciamento de Tarefas

Este projeto é uma aplicação web interativa e colaborativa para gerenciamento de tarefas, desenvolvida exclusivamente com HTML, CSS e JavaScript.

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Uso](#instalação-e-uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Contribuir](#como-contribuir)
- [Licença](#licença)

## Visão Geral

Este projeto foi criado para demonstrar habilidades de desenvolvimento front-end, incluindo autenticação de usuário, controle de acesso baseado em função, sincronização de dados em tempo real (simulada) e um design responsivo.

## Funcionalidades

- ** Autenticação de Usuário (Simulada): Sistema de login e registro gerenciado diretamente no lado do cliente, utilizando localStorage para persistência de dados do usuário.
- ** Funções de Usuário e Controle de Acesso: Implementação de perfis de usuário com funções distintas (Administrador e Membro), que controlam o acesso e a visibilidade de certas funcionalidades da interface.
- ** Quadro de Tarefas Colaborativo: Uma interface intuitiva para criar, visualizar e gerenciar tarefas. A colaboração multiusuário é simulada através da sincronização de dados entre múltiplas abas do navegador, proporcionando uma experiência semelhante a atualizações em tempo real.
- ** Notificações em Tempo Real: Sistema de notificação integrado que alerta os usuários sobre atualizações de tarefas e alterações de permissão, garantindo que todos estejam sempre cientes das modificações.
- ** Design Responsivo: Layout de interface de usuário limpo e adaptável, garantindo uma experiência otimizada em diversos tamanhos de tela, desde desktops até dispositivos móveis.
- ** Persistência e Sincronização de Dados: Utilização de localStorage para persistir o estado da aplicação e o Storage Event para simular a sincronização de dados entre diferentes abas do mesmo navegador. Isso cria uma experiência de "tempo real" limitada ao ambiente do cliente.

## Tecnologias Utilizadas

- **HTML5:** Estrutura do conteúdo.
- **CSS3:** Estilização da interface.
- **JavaScript (ES6+):** Lógica da aplicação e funcionalidades.

## Instalação e Uso

1. Clone o repositório:
   ```bash
   git clone https://github.com/lucianogentilb/towertask
2. Navegue até o diretório do projeto.
3. Abra o arquivo index.html no seu navegador.

## Estrutura do Projeto
towertask/
├── index.html    # Página principal
├── css/
│   └── style.css # Folha de estilo
└── js/
    └── app.js    # Lógica principal da aplicação

## Como contribuir com o Projeto
1. Faça um fork do repositório.
2. Crie uma branch para sua feature (git checkout -b minha-feature).
3. Faça suas alterações.
4. Envie suas alterações (git commit -m 'Adiciona minha feature').
5. Envie para o seu fork (git push origin minha-feature).
6. Abra um pull request.

## Licença
Este projeto está licenciado sob a Licença MIT.