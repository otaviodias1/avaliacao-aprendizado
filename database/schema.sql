

DROP TABLE IF EXISTS resposta_livre, resposta_objetiva, resposta, realiza, questao_prova, alternativa, texto_livre, objetiva, questao, avaliacao, aluno, professor, usuario;


CREATE TABLE usuario (
    email  VARCHAR(150) PRIMARY KEY,
    nome   VARCHAR(120) NOT NULL,
    senha  VARCHAR(255) NOT NULL,
    perfil VARCHAR(20)  NOT NULL CHECK (perfil IN ('PROFESSOR', 'ALUNO'))
);

CREATE TABLE professor (
    email_usuario VARCHAR(150) PRIMARY KEY REFERENCES usuario (email),
    departamento  VARCHAR(100) NOT NULL
);

CREATE TABLE aluno (
    email_usuario VARCHAR(150) PRIMARY KEY REFERENCES usuario (email),
    matricula     VARCHAR(30)  NOT NULL UNIQUE
);




CREATE TABLE avaliacao (
    codigo     VARCHAR(30)  PRIMARY KEY,
    titulo     VARCHAR(150) NOT NULL,
    descricao  TEXT,
    data       DATE,
    h_inicio   TIME         NOT NULL,
    h_fim      TIME         NOT NULL,
    email_prof VARCHAR(150) NOT NULL REFERENCES professor (email_usuario),
    CHECK (h_fim > h_inicio)
);


CREATE TABLE questao (
    numero          INT          PRIMARY KEY,
    enunciado       TEXT         NOT NULL,
    tipo            VARCHAR(20)  NOT NULL CHECK (tipo IN ('OBJETIVA', 'TEXTO_LIVRE')),
    email_professor VARCHAR(150) NOT NULL REFERENCES professor (email_usuario)
);

CREATE TABLE objetiva (
    numero_questao INT PRIMARY KEY REFERENCES questao (numero)
);

CREATE TABLE texto_livre (
    numero_questao INT PRIMARY KEY REFERENCES questao (numero)
);

CREATE TABLE alternativa (
    numero_questao INT     REFERENCES objetiva (numero_questao),
    letra          CHAR(1) NOT NULL,
    texto          TEXT    NOT NULL,
    correta        BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (numero_questao, letra)
);



CREATE TABLE questao_prova (
    codigo_avaliacao VARCHAR(30)  REFERENCES avaliacao (codigo),
    numero_questao   INT          REFERENCES questao (numero),
    valor            NUMERIC(5,2) NOT NULL CHECK (valor > 0),
    ordem            INT          NOT NULL CHECK (ordem > 0),
    PRIMARY KEY (codigo_avaliacao, numero_questao),
    UNIQUE (codigo_avaliacao, ordem)
);


CREATE TABLE realiza (
    email_aluno      VARCHAR(150) REFERENCES aluno (email_usuario),
    codigo_avaliacao VARCHAR(30)  REFERENCES avaliacao (codigo),
    status           VARCHAR(25)  NOT NULL DEFAULT 'EM_ANDAMENTO'
                     CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADA', 'CORRIGIDA')),
    data             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email_aluno, codigo_avaliacao)
);


CREATE TABLE resposta (
    email_aluno      VARCHAR(150) REFERENCES aluno (email_usuario),
    codigo_avaliacao VARCHAR(30),
    numero_questao   INT,
    nota             NUMERIC(5,2) CHECK (nota >= 0),
    PRIMARY KEY (email_aluno, codigo_avaliacao, numero_questao),
    FOREIGN KEY (codigo_avaliacao, numero_questao)
        REFERENCES questao_prova (codigo_avaliacao, numero_questao)
);

CREATE TABLE resposta_objetiva (
    email_aluno      VARCHAR(150),
    codigo_avaliacao VARCHAR(30),
    numero_questao   INT,
    letra_escolhida  CHAR(1) NOT NULL,
    PRIMARY KEY (email_aluno, codigo_avaliacao, numero_questao),
    FOREIGN KEY (email_aluno, codigo_avaliacao, numero_questao)
        REFERENCES resposta (email_aluno, codigo_avaliacao, numero_questao),
    FOREIGN KEY (numero_questao, letra_escolhida)
        REFERENCES alternativa (numero_questao, letra)
);

CREATE TABLE resposta_livre (
    email_aluno      VARCHAR(150),
    codigo_avaliacao VARCHAR(30),
    numero_questao   INT,
    texto            TEXT         NOT NULL,
    email_professor  VARCHAR(150) REFERENCES professor (email_usuario),
    PRIMARY KEY (email_aluno, codigo_avaliacao, numero_questao),
    FOREIGN KEY (email_aluno, codigo_avaliacao, numero_questao)
        REFERENCES resposta (email_aluno, codigo_avaliacao, numero_questao)
);