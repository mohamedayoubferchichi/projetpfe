package com.example.back_end.controller;

import com.example.back_end.dto.AdminUtilisateurResponse;
import com.example.back_end.dto.UtilisateurProfileResponse;
import com.example.back_end.dto.UpdateUtilisateurRequest;
import com.example.back_end.model.Utilisateur;
import com.example.back_end.service.UtilisateurService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping("/me")
    public UtilisateurProfileResponse me(Authentication authentication) {
        return utilisateurService.getProfileByEmail(authentication.getName());
    }

    @GetMapping
    public List<AdminUtilisateurResponse> findAll() {
        return utilisateurService.findAllForAdmin();
    }

    @PutMapping("/{id}")
    public Utilisateur update(@PathVariable String id, @RequestBody UpdateUtilisateurRequest request) {
        return utilisateurService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        utilisateurService.delete(id);
    }
}
