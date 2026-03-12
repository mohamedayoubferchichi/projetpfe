package com.example.back_end.service;

import com.example.back_end.dto.LoginRequest;
import com.example.back_end.dto.UtilisateurRegisterRequest;
import com.example.back_end.dto.UtilisateurRegisterResponse;
import com.example.back_end.model.Administrateur;
import com.example.back_end.model.StatutCompte;
import com.example.back_end.model.Utilisateur;
import com.example.back_end.repository.AdminRepository;
import com.example.back_end.repository.ContratReferenceRepository;
import com.example.back_end.repository.UtilisateurRepository;
import com.example.back_end.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ContratReferenceRepository contratReferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminRepository adminRepository,
                       UtilisateurRepository utilisateurRepository,
                       ContratReferenceRepository contratReferenceRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.contratReferenceRepository = contratReferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(LoginRequest request) {
        Administrateur admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return jwtService.generateToken(admin.getEmail(), admin.getRole());
    }

    public UtilisateurRegisterResponse registerUtilisateur(UtilisateurRegisterRequest request) {
        String nom = request.getNom() == null ? "" : request.getNom().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();
        String cin = request.getCin() == null ? "" : request.getCin().trim();
        String numeroContrat = request.getNumeroContrat() == null ? "" : request.getNumeroContrat().trim();

        if (!StringUtils.hasText(nom) || !StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom, email et mot de passe sont obligatoires");
        }

        if (utilisateurRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(nom);
        utilisateur.setEmail(email);
        utilisateur.setPassword(passwordEncoder.encode(password));
        utilisateur.setCin(StringUtils.hasText(cin) ? cin : null);
        utilisateur.setNumeroContrat(StringUtils.hasText(numeroContrat) ? numeroContrat : null);
        utilisateur.setRole("UTILISATEUR");

        boolean isVerified = StringUtils.hasText(cin)
            && contratReferenceRepository.existsByCinAndDateFinContratGreaterThanEqual(cin, LocalDate.now());
        utilisateur.setStatutCompte(isVerified ? StatutCompte.VERIFIE : StatutCompte.NON_VERIFIE);

        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);
        return toRegisterResponse(savedUtilisateur);
    }

    public String loginUtilisateur(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), utilisateur.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        boolean isVerified = StringUtils.hasText(utilisateur.getCin())
                && contratReferenceRepository.existsByCinAndDateFinContratGreaterThanEqual(
                utilisateur.getCin().trim(),
                LocalDate.now()
        );
        StatutCompte computedStatut = isVerified ? StatutCompte.VERIFIE : StatutCompte.NON_VERIFIE;
        if (utilisateur.getStatutCompte() != computedStatut) {
            utilisateur.setStatutCompte(computedStatut);
            utilisateurRepository.save(utilisateur);
        }

        return jwtService.generateToken(utilisateur.getEmail(), utilisateur.getRole());
    }

    private UtilisateurRegisterResponse toRegisterResponse(Utilisateur utilisateur) {
        UtilisateurRegisterResponse response = new UtilisateurRegisterResponse();
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
