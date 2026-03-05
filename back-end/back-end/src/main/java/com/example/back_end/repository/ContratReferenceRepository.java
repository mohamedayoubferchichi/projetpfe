package com.example.back_end.repository;

import com.example.back_end.model.ContratReference;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContratReferenceRepository extends MongoRepository<ContratReference, String> {
	List<ContratReference> findByDateFinContratBeforeAndStatutNot(LocalDate date, String statut);
	List<ContratReference> findByCinOrderByDateFinContratDesc(String cin);
	boolean existsByCinAndNumeroContrat(String cin, String numeroContrat);
}
