package com.fourbites.backend;

import java.util.Scanner;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHashSenha {

    public static void main(String[] args) {
        System.out.print("Digite a senha do admin: ");
        try (Scanner leitor = new Scanner(System.in)) {
            String senha = leitor.nextLine();
            if (senha.length() < 8) {
                System.out.println("A senha precisa ter pelo menos 8 caracteres.");
                return;
            }
            System.out.println(new BCryptPasswordEncoder().encode(senha));
        }
    }
}