package com.example.back_end.service;

import com.example.back_end.model.ContratReference;
import com.example.back_end.repository.ContratReferenceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ContratReferenceService {

    private final ContratReferenceRepository contratReferenceRepository;

    public ContratReferenceService(ContratReferenceRepository contratReferenceRepository) {
        this.contratReferenceRepository = contratReferenceRepository;
    }

    public ContratReference create(ContratReference request) {
        ContratReference contrat = new ContratReference();
        applyEditableFields(contrat, request);
        contrat.setStatut(calculateStatut(contrat.getDateFinContrat()));
        return contratReferenceRepository.save(contrat);
    }

    public ContratReference update(String id, ContratReference request) {
        ContratReference contrat = contratReferenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat not found"));

        applyEditableFields(contrat, request);
        contrat.setStatut(calculateStatut(contrat.getDateFinContrat()));
        return contratReferenceRepository.save(contrat);
    }

    public void delete(String id) {
        if (!contratReferenceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat not found");
        }
        contratReferenceRepository.deleteById(id);
    }

    public ContratReference updateStatut(String id, String statut) {
        ContratReference contrat = contratReferenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat not found"));

        if (statut == null || statut.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut is required");
        }

        contrat.setStatut(statut.trim().toUpperCase());
        return contratReferenceRepository.save(contrat);
    }

    public List<ContratReference> findAll() {
        refreshExpiredStatuses();
        return contratReferenceRepository.findAll();
    }

    public void refreshExpiredStatuses() {
        List<ContratReference> expiredContrats =
                contratReferenceRepository.findByDateFinContratBeforeAndStatutNot(LocalDate.now(), "DESACTIVE");

        if (!expiredContrats.isEmpty()) {
            for (ContratReference contrat : expiredContrats) {
                contrat.setStatut("DESACTIVE");
            }
            contratReferenceRepository.saveAll(expiredContrats);
        }
    }

    private void applyEditableFields(ContratReference target, ContratReference source) {
        target.setCin(source.getCin());
        target.setNumeroContrat(source.getNumeroContrat());
        target.setCodeContrat(source.getCodeContrat());
        target.setTypeContrat(source.getTypeContrat());
        target.setDateDebutContrat(source.getDateDebutContrat());
        target.setDateFinContrat(source.getDateFinContrat());
    }

    private String calculateStatut(LocalDate dateFinContrat) {
        if (dateFinContrat == null) {
            return "DESACTIVE";
        }
        return !dateFinContrat.isBefore(LocalDate.now()) ? "ACTIF" : "DESACTIVE";
    }
}
