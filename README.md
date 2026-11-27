# Ciencia de Dados e Inteligencia Artificial - Alunos: Joao Vitor Ribeiro Flauzino e Otavio Dias de Melo

# Sistema de Avaliação de Aprendizado

Projeto desenvolvido para a disciplina de Banco de Dados usando Java com Spring Boot, PostgreSQL e JDBC puro (com classes DAO escritas por nós, sem usar JPA/Hibernate).

# Sobre o projeto

A natureza do sistema é Avaliação de Aprendizagem, com foco em nota por questão. Basicamente, o sistema permite que professores gerenciem provas e alunos respondam e acompanhem seu desempenho:

Professores podem cadastrar questões (objetivas e dissertativas), criar avaliações, montar provas escolhendo as questões e o valor de cada uma, definir quais alunos devem fazer cada prova, corrigir respostas dissertativas e visualizar relatórios.
Alunos podem fazer login, responder às avaliações atribuídas a eles, consultar suas notas por questão e ver os relatórios.
Relatórios: o sistema conta com 3 relatórios (média das notas por avaliação, questões com maior índice de erro e participação dos alunos) com tabela e gráfico.

## Como rodar
O projeto n tem migrations entao crie um banco chamado `avaliacao_aprendizado` no PostgreSQL (porta `5432`, usuário `postgres`, senha `root`) e rode na ordem:
   - `database/schema.sql`
   - `database/carga.sql`
Rode o projeto com `mvn spring-boot:run`.

