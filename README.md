# 🎵 Vorplay UI

Frontend em React + Vite + TailwindCSS, integrando a API Vorplay com o objetivo de servir como interface para um site de mesmo nome.

---

## 📦 Instalação local

**Requisitos**

- Node.js (>= 18)

```bash
git clone https://github.com/NoemyT/vorplay-ui.git
cd vorplay-ui
npm install
```

Após a criação de um arquivo `.env` na raíz, com as variáveis disponíveis no arquivo `.env.example`. Você poderá executá-lo com:

```bash
npm run dev
```

**Obs.:** Caso você não tenha a api instalada e executando localmente ou o servidor da api não esteja disponível, a interface será disponibilizada de forma estática com funcionalidade limitada.

---

## 📚 Informações Acadêmicas

**Disciplina**

Este projeto foi desenvolvido e utilizado na disciplina:

**Desenvolvimento de Software para Web**

**Professor:** Alexandre de Andrade Barbosa

**Foco:** Aprendizagem voltada ao desenvolvimento de sistemas web a partir da apresentação de conceitos (html, css e JS) e Frameworks WEB

**Instituição:** Universidade Federal de Alagoas (UFAL) - Campus Arapiraca

👩‍💻 **Equipe**

- Noemy Torres Pereira - Frontend, main dev do vorplay-ui
- Caio Teixeira da silva - Backend, main dev do [vorplay-api](https://github.com/CaioXTSY/VorPlay-API) e contribuinte do vorplay-ui

---

## 🕛 Estado atual do projeto

Em seu estado atual, o projeto implementa as seguintes funções:

- Cadastro, Login, Recuperação e Redefinição de Senha
- Busca e visualização de músicas, artistas, albums de artistas e usuários, baseados na api do Spotify para os três primeiros, e na base de dados da plataforma para o último
- Visualização de perfil pessoal (com possibilidade de alteração de dados e exclusão de conta)
- Visualização de perfil de outros usuários (com possibilidade de seguir/deixar de seguir)
- Fazer ou remover avaliações músicais próprias, com sistema de nota (1 a 5 estrelas) e espaço para comentário
- Favoritar ou desfavoritar músicas
- Criar e gerenciar playlists
- Visualizar e gerenciar histórico de buscas
- Visualização de estatísticas da plataforma e atividade recente dos usuários
- Visualização de avaliações próprias ou de outros usuários sobre uma música

Além disso a interface implementada é responsiva para diferentes resoluções, permitindo uma boa experiência de usuário.

---

## 🎶 A plataforma

A plataforma também pode ser utilizada diretamente (sem precisar instalar nada) a partir do link:

- https://vorplay.caiots.dev/
