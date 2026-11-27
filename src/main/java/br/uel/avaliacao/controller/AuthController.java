package br.uel.avaliacao.controller;

import br.uel.avaliacao.dao.AuthDAO;
import br.uel.avaliacao.model.LoginRequest;
import br.uel.avaliacao.model.UsuarioSessao;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String SESSAO_USUARIO = "USUARIO_LOGADO";

    private final AuthDAO authDAO;

    public AuthController(AuthDAO authDAO) {
        this.authDAO = authDAO;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()
                || request.getSenha() == null || request.getSenha().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "Informe e-mail e senha."));
        }

        Optional<UsuarioSessao> usuario = authDAO.autenticar(request.getEmail().trim(), request.getSenha());
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "E-mail ou senha invalidos."));
        }

        HttpSession sessao = httpRequest.getSession(true);
        sessao.setAttribute(SESSAO_USUARIO, usuario.get());
        return ResponseEntity.ok(usuario.get());
    }

    @GetMapping("/me")
    public ResponseEntity<?> usuarioAtual(HttpServletRequest httpRequest) {
        HttpSession sessao = httpRequest.getSession(false);
        if (sessao == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Usuario nao autenticado."));
        }
        Object attr = sessao.getAttribute(SESSAO_USUARIO);
        if (!(attr instanceof UsuarioSessao usuario)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Usuario nao autenticado."));
        }
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession sessao = httpRequest.getSession(false);
        if (sessao != null) {
            sessao.invalidate();
        }
        return ResponseEntity.noContent().build();
    }
}
