package com.example.back_end.service;

import com.example.back_end.dto.AdminUtilisateurResponse;
import com.example.back_end.dto.UtilisateurContratResponse;
import com.example.back_end.dto.UtilisateurProfileResponse;
import com.example.back_end.dto.UpdateUtilisateurRequest;
import com.example.back_end.model.ContratReference;
import com.example.back_end.model.Utilisateur;
import com.example.back_end.repository.ContratReferenceRepository;
import com.example.back_end.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final ContratReferenceRepository contratReferenceRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              ContratReferenceRepository contratReferenceRepository,
                              PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.contratReferenceRepository = contratReferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UtilisateurProfileResponse getProfileByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur not found"));
        return toProfileResponse(utilisateur);
    }

    public List<AdminUtilisateurResponse> findAllForAdmin() {
        return utilisateurRepository.findAll().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    public Utilisateur update(String id, UpdateUtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur not found"));

        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setCin(request.getCin());
        utilisateur.setNumeroContrat(request.getNumeroContrat());
        utilisateur.setStatutCompte(request.getStatutCompte());
        utilisateur.setRole("UTILISATEUR");

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            utilisateur.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return utilisateurRepository.save(utilisateur);
    }

    public void delete(String id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur not found");
        }
        utilisateurRepository.deleteById(id);
    }

    private UtilisateurProfileResponse toProfileResponse(Utilisateur utilisateur) {
        List<UtilisateurContratResponse> contrats = Collections.emptyList();
        if (StringUtils.hasText(utilisateur.getCin())) {
            contrats = contratReferenceRepository.findByCinOrderByDateFinContratDesc(utilisateur.getCin())
                    .stream()
                    .map(this::toContratResponse)
                    .collect(Collectors.toList());
        }

        UtilisateurProfileResponse response = new UtilisateurProfileResponse();
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setEmail(utilisateur.getEmail());
        response.setCin(utilisateur.getCin());
        response.setRole(utilisateur.getRole());
        response.setStatutCompte(utilisateur.getStatutCompte());
        response.setNombreContrats(contrats.size());
        response.setContrats(contrats);
        return response;
    }

    private UtilisateurContratResponse toContratResponse(ContratReference contrat) {
        UtilisateurContratResponse response = new UtilisateurContratResponse();
        response.setNumeroContrat(contrat.getNumeroContrat());
        response.setTypeContrat(contrat.getTypeContrat());
        response.setStatut(contrat.getStatut());
        response.setDateFinContrat(contrat.getDateFinContrat());
        return response;
    }

    private AdminUtilisateurResponse toAdminResponse(Utilisateur utilisateur) {
        AdminUtilisateurResponse response = new AdminUtilisateurResponse();
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setEmail(utilisateur.getEmail());
        response.setCin(utilisateur.getCin());
        response.setNumeroContrat(utilisateur.getNumeroContrat());
        response.setRole(utilisateur.getRole());
        response.setStatutCompte(utilisateur.getStatutCompte());
        return response;
    }
}
