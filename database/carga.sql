

DELETE FROM resposta_livre;
DELETE FROM resposta_objetiva;
DELETE FROM resposta;
DELETE FROM realiza;
DELETE FROM questao_prova;
DELETE FROM alternativa;
DELETE FROM texto_livre;
DELETE FROM objetiva;
DELETE FROM questao;
DELETE FROM avaliacao;
DELETE FROM aluno;
DELETE FROM professor;
DELETE FROM usuario;

-- 1. Usuarios (Professores e Alunos)
INSERT INTO usuario (email, nome, senha, perfil) VALUES
    ('carlos.mendes@uel.br',   'Carlos Eduardo Mendes', 'prof123',  'PROFESSOR'),
    ('marina.silva@uel.br',    'Marina Aparecida Silva', 'prof456', 'PROFESSOR'),
    ('ana.paula@uel.br',       'Ana Paula Oliveira',    'aluno123', 'ALUNO'),
    ('lucas.ferreira@uel.br',  'Lucas Henrique Ferreira','aluno123','ALUNO'),
    ('beatriz.santos@uel.br',  'Beatriz Costa Santos',  'aluno123', 'ALUNO'),
    ('rafael.almeida@uel.br',  'Rafael Souza Almeida',  'aluno123', 'ALUNO');

INSERT INTO professor (email_usuario, departamento) VALUES
    ('carlos.mendes@uel.br', 'Computacao'),
    ('marina.silva@uel.br',  'Matematica');

INSERT INTO aluno (email_usuario, matricula) VALUES
    ('ana.paula@uel.br',      '202400101'),
    ('lucas.ferreira@uel.br', '202400102'),
    ('beatriz.santos@uel.br', '202400103'),
    ('rafael.almeida@uel.br', '202400104');

-- 2. Avaliacoes
INSERT INTO avaliacao (codigo, titulo, descricao, data, h_inicio, h_fim, email_prof) VALUES
    ('BD1-P1',   'Prova 1 - Modelagem de Dados',   'Avaliacao sobre MER, MER-X e mapeamento relacional.', DATE '2026-10-15', TIME '08:00:00', TIME '10:00:00', 'carlos.mendes@uel.br'),
    ('BD1-P2',   'Prova 2 - SQL e Normalizacao',   'Avaliacao pratica de DDL, DML, consultas e 3FN.',     DATE '2026-11-20', TIME '08:00:00', TIME '10:00:00', 'carlos.mendes@uel.br'),
    ('CALC1-T1', 'Trabalho 1 - Limites e Derivadas','Lista avaliativa online.',                             NULL,              TIME '14:00:00', TIME '16:00:00', 'marina.silva@uel.br');

-- 3. Banco de Questoes (Objetivas e Texto Livre)
INSERT INTO questao (numero, enunciado, tipo, email_professor) VALUES
    (1, 'Qual restricao garante que nenhum atributo componente da chave primaria possua valor nulo?', 'OBJETIVA',    'carlos.mendes@uel.br'),
    (2, 'Para que uma relacao esteja na Terceira Forma Normal (3FN), alem de estar na 2FN, ela nao pode possuir:', 'OBJETIVA', 'carlos.mendes@uel.br'),
    (3, 'Explique a diferenca entre especializacao total e parcial no Modelo Entidade-Relacionamento Estendido.', 'TEXTO_LIVRE', 'carlos.mendes@uel.br'),
    (4, 'Qual comando SQL pertence ao subconjunto DDL (Data Definition Language)?', 'OBJETIVA', 'carlos.mendes@uel.br'),
    (5, 'Apresente um cenario pratico em que o uso de agregacao se torna necessario na modelagem conceitual.', 'TEXTO_LIVRE', 'carlos.mendes@uel.br'),
    (6, 'Qual e a derivada primeira da funcao f(x) = 3x^2 + 5x - 2?', 'OBJETIVA', 'marina.silva@uel.br');

INSERT INTO objetiva (numero_questao) VALUES
    (1),
    (2),
    (4),
    (6);

INSERT INTO texto_livre (numero_questao) VALUES
    (3),
    (5);

-- 4. Alternativas das Questoes Objetivas
INSERT INTO alternativa (numero_questao, letra, texto, correta) VALUES
    (1, 'A', 'Integridade referencial', FALSE),
    (1, 'B', 'Integridade de entidade',  TRUE),
    (1, 'C', 'Integridade de dominio',   FALSE),
    (1, 'D', 'Dependencia transitiva',   FALSE),

    (2, 'A', 'Chaves estrangeiras compostas', FALSE),
    (2, 'B', 'Atributos atomicos',            FALSE),
    (2, 'C', 'Dependencias transitivas entre atributos nao-chave', TRUE),
    (2, 'D', 'Relacionamentos unarios',       FALSE),

    (4, 'A', 'CREATE TABLE', TRUE),
    (4, 'B', 'SELECT',       FALSE),
    (4, 'C', 'UPDATE',       FALSE),
    (4, 'D', 'INSERT INTO',  FALSE),

    (6, 'A', 'f''(x) = 3x + 5', FALSE),
    (6, 'B', 'f''(x) = 6x + 5', TRUE),
    (6, 'C', 'f''(x) = 6x - 2', FALSE),
    (6, 'D', 'f''(x) = x^2 + 5',FALSE);

-- 5. Questoes vinculadas a cada Avaliacao (Agregacao Questao_prova)
INSERT INTO questao_prova (codigo_avaliacao, numero_questao, valor, ordem) VALUES
    ('BD1-P1',   1, 2.50, 1),
    ('BD1-P1',   2, 2.50, 2),
    ('BD1-P1',   3, 5.00, 3),

    ('BD1-P2',   2, 3.00, 1),
    ('BD1-P2',   4, 3.00, 2),
    ('BD1-P2',   5, 4.00, 3),

    ('CALC1-T1', 6, 10.00, 1);

-- 6. Participacao dos Alunos nas Avaliacoes (Realiza)
INSERT INTO realiza (email_aluno, codigo_avaliacao, status, data) VALUES
    ('ana.paula@uel.br',      'BD1-P1', 'CORRIGIDA',    TIMESTAMP '2026-10-15 09:42:00'),
    ('lucas.ferreira@uel.br', 'BD1-P1', 'FINALIZADA',   TIMESTAMP '2026-10-15 09:55:00'),
    ('beatriz.santos@uel.br', 'BD1-P1', 'EM_ANDAMENTO', TIMESTAMP '2026-10-15 08:15:00'),
    ('ana.paula@uel.br',      'BD1-P2', 'FINALIZADA',   TIMESTAMP '2026-11-20 09:30:00');

-- 7. Respostas registradas (Agregacao Resposta + Especializacoes)
-- Caso 1: Ana Paula na BD1-P1 (prova totalmente corrigida: 2.50 + 0.00 + 4.50 = 7.00)
INSERT INTO resposta (email_aluno, codigo_avaliacao, numero_questao, nota) VALUES
    ('ana.paula@uel.br', 'BD1-P1', 1, 2.50),
    ('ana.paula@uel.br', 'BD1-P1', 2, 0.00),
    ('ana.paula@uel.br', 'BD1-P1', 3, 4.50);

INSERT INTO resposta_objetiva (email_aluno, codigo_avaliacao, numero_questao, letra_escolhida) VALUES
    ('ana.paula@uel.br', 'BD1-P1', 1, 'B'),
    ('ana.paula@uel.br', 'BD1-P1', 2, 'A');

INSERT INTO resposta_livre (email_aluno, codigo_avaliacao, numero_questao, texto, email_professor) VALUES
    ('ana.paula@uel.br', 'BD1-P1', 3,
     'Na especializacao total toda entidade da superclasse precisa pertencer a pelo menos uma subclasse; na parcial isso e opcional.',
     'carlos.mendes@uel.br');

-- Caso 2: Lucas Ferreira na BD1-P1 (objetivas corrigidas automaticamente; questao 3 aguardando correcao do professor)
INSERT INTO resposta (email_aluno, codigo_avaliacao, numero_questao, nota) VALUES
    ('lucas.ferreira@uel.br', 'BD1-P1', 1, 2.50),
    ('lucas.ferreira@uel.br', 'BD1-P1', 2, 2.50),
    ('lucas.ferreira@uel.br', 'BD1-P1', 3, NULL);

INSERT INTO resposta_objetiva (email_aluno, codigo_avaliacao, numero_questao, letra_escolhida) VALUES
    ('lucas.ferreira@uel.br', 'BD1-P1', 1, 'B'),
    ('lucas.ferreira@uel.br', 'BD1-P1', 2, 'C');

INSERT INTO resposta_livre (email_aluno, codigo_avaliacao, numero_questao, texto, email_professor) VALUES
    ('lucas.ferreira@uel.br', 'BD1-P1', 3,
     'Especializacao total obriga participacao em alguma subclasse, enquanto na parcial a entidade pode existir apenas na superclasse.',
     NULL);

-- Caso 3: Beatriz Santos na BD1-P1 (em andamento, respondeu apenas a questao 1)
INSERT INTO resposta (email_aluno, codigo_avaliacao, numero_questao, nota) VALUES
    ('beatriz.santos@uel.br', 'BD1-P1', 1, 0.00);

INSERT INTO resposta_objetiva (email_aluno, codigo_avaliacao, numero_questao, letra_escolhida) VALUES
    ('beatriz.santos@uel.br', 'BD1-P1', 1, 'D');

-- Caso 4: Ana Paula na BD1-P2 (finalizada, questao 5 aguardando correcao)
INSERT INTO resposta (email_aluno, codigo_avaliacao, numero_questao, nota) VALUES
    ('ana.paula@uel.br', 'BD1-P2', 2, 3.00),
    ('ana.paula@uel.br', 'BD1-P2', 4, 3.00),
    ('ana.paula@uel.br', 'BD1-P2', 5, NULL);

INSERT INTO resposta_objetiva (email_aluno, codigo_avaliacao, numero_questao, letra_escolhida) VALUES
    ('ana.paula@uel.br', 'BD1-P2', 2, 'C'),
    ('ana.paula@uel.br', 'BD1-P2', 4, 'A');

INSERT INTO resposta_livre (email_aluno, codigo_avaliacao, numero_questao, texto, email_professor) VALUES
    ('ana.paula@uel.br', 'BD1-P2', 5,
     'Quando precisamos relacionar uma entidade a um relacionamento ja existente entre outras duas entidades, como um aluno respondendo uma questao de uma prova.',
     NULL);