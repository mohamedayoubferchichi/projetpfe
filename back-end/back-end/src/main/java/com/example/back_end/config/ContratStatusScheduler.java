package com.example.back_end.config;

import com.example.back_end.service.ContratReferenceService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ContratStatusScheduler {

    private final ContratReferenceService contratReferenceService;

    public ContratStatusScheduler(ContratReferenceService contratReferenceService) {
        this.contratReferenceService = contratReferenceService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void updateExpiredContractsStatus() {
        contratReferenceService.refreshExpiredStatuses();
    }
}
