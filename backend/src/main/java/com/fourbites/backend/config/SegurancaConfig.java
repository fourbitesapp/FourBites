package com.fourbites.backend.config;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fourbites.backend.seguranca.JwtFiltro;
import com.fourbites.backend.seguranca.JwtService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SegurancaConfig {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Regras de acesso da API.
    @Bean
    public SecurityFilterChain regrasDeAcesso(HttpSecurity http, JwtService jwtService) throws Exception {
        http

            .csrf(csrf -> csrf.disable())
            .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(regras -> regras
                .requestMatchers("/auth/**").permitAll()                      
                .requestMatchers("/usuarios/me/preferencias").hasRole("USUARIO") 
                .requestMatchers("/usuarios/me/**").authenticated()            
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/meus-restaurantes/**").hasRole("RESTAURANTE")
                .requestMatchers("/recomendacoes/**").hasRole("USUARIO")
                .requestMatchers(HttpMethod.GET, "/**").permitAll()         
                .anyRequest().authenticated())                                
            .exceptionHandling(erros -> erros
                .authenticationEntryPoint((request, response, ex) ->
                        escreverErro(response, 401, "Faça login para continuar."))
                .accessDeniedHandler((request, response, ex) ->
                        escreverErro(response, 403, "Você não tem permissão para acessar este recurso.")))
            .addFilterBefore(new JwtFiltro(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource configuracaoCors() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(frontendUrl));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/**", cors);
        return fonte;
    }

    private void escreverErro(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":" + status
                + ",\"mensagem\":\"" + mensagem + "\""
                + ",\"campos\":null"
                + ",\"dataHora\":\"" + OffsetDateTime.now() + "\"}");
    }
}
