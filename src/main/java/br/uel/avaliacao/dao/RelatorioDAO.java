package br.uel.avaliacao.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class RelatorioDAO {

    private final JdbcTemplate jdbcTemplate;

    public RelatorioDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Relatório 1: Média por avaliação
    public List< Map< String, Object>> buscarMediasPorAvaliacao() {
        String sql = """
            SELECT 
                a.titulo AS "avaliacao",
                COUNT(DISTINCT r.email_aluno) AS "totalAlunos",
                ROUND(COALESCE(AVG(notas_aluno.nota_final), 0), 2) AS "media"
            FROM avaliacao a
            LEFT JOIN realiza r 
                ON r.codigo_avaliacao = a.codigo 
               AND r.status IN ('FINALIZADA', 'CORRIGIDA')
            LEFT JOIN (
                SELECT 
                    email_aluno, 
                    codigo_avaliacao, 
                    SUM(nota) AS nota_final
                FROM resposta
                WHERE nota IS NOT NULL
                GROUP BY email_aluno, codigo_avaliacao
            ) notas_aluno 
                ON notas_aluno.email_aluno = r.email_aluno 
               AND notas_aluno.codigo_avaliacao = r.codigo_avaliacao
            GROUP BY a.codigo, a.titulo, a.data
            HAVING COUNT(a.codigo) >= 1
            ORDER BY a.data, a.titulo
            """;

        return jdbcTemplate.queryForList(sql);
    }

    // Relatório 2: Ranking de questões com maior percentual de erro
    public List< Map< String, Object>> buscarQuestoesMaisErradas() {
        String sql = """
            SELECT 
                CONCAT('Q', q.numero, ' - ', LEFT(q.enunciado, 45)) AS "questao",
                COUNT(resp.email_aluno) AS "totalRespostas",
                ROUND(
                    (SUM(CASE WHEN resp.nota < qp.valor THEN 1 ELSE 0 END) * 100.0) / COUNT(resp.email_aluno),
                    1
                ) AS "percentualErro"
            FROM questao q
            JOIN questao_prova qp 
                ON qp.numero_questao = q.numero
            JOIN resposta resp 
                ON resp.codigo_avaliacao = qp.codigo_avaliacao 
               AND resp.numero_questao = qp.numero_questao
            WHERE resp.nota IS NOT NULL
              AND qp.valor > (SELECT MIN(valor) - 1 FROM questao_prova)
            GROUP BY q.numero, q.enunciado
            HAVING COUNT(resp.email_aluno) > 0
            ORDER BY "percentualErro" DESC, "totalRespostas" DESC
            FETCH FIRST 10 ROWS ONLY
            """;

        return jdbcTemplate.queryForList(sql);
    }

    // Relatório 3: Participação (Respondidas vs Pendentes)
    public List< Map< String, Object>> buscarParticipacaoPorAvaliacao() {
        String sql = """
            SELECT 
                a.titulo AS "avaliacao",
                COALESCE(SUM(CASE WHEN r.status IN ('FINALIZADA', 'CORRIGIDA') THEN 1 ELSE 0 END), 0) AS "respondidas",
                COALESCE(SUM(CASE WHEN r.status = 'EM_ANDAMENTO' THEN 1 ELSE 0 END), 0) AS "pendentes"
            FROM avaliacao a
            LEFT JOIN realiza r 
                ON r.codigo_avaliacao = a.codigo
            GROUP BY a.codigo, a.titulo, a.data
            ORDER BY a.data, a.titulo
            """;

        return jdbcTemplate.queryForList(sql);
    }
}