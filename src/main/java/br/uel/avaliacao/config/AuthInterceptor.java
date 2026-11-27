package br.uel.avaliacao.config;

import br.uel.avaliacao.controller.AuthController;
import br.uel.avaliacao.model.UsuarioSessao;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        HttpSession sessao = request.getSession(false);
        UsuarioSessao usuario = sessao != null && sessao.getAttribute(AuthController.SESSAO_USUARIO) instanceof UsuarioSessao u
                ? u
                : null;

        if (usuario == null) {
            escreverErro(response, HttpServletResponse.SC_UNAUTHORIZED, "Autenticacao obrigatoria.");
            return false;
        }

        if (usuario.isProfessor()) {
            return true;
        }

        String method = request.getMethod().toUpperCase();
        String path = request.getRequestURI();

        if (permitidoParaAluno(method, path)) {
            return true;
        }

        escreverErro(response, HttpServletResponse.SC_FORBIDDEN, "Acesso restrito a professores.");
        return false;
    }

    private boolean permitidoParaAluno(String method, String path) {
        if ("GET".equals(method)) {
            return path.startsWith("/api/relatorios")
                    || path.startsWith("/api/realizacoes")
                    || path.startsWith("/api/avaliacoes");
        }
        return "POST".equals(method) && "/api/realizacoes".equals(path);
    }

    private void escreverErro(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"erro\":\"" + mensagem + "\"}");
    }
}
