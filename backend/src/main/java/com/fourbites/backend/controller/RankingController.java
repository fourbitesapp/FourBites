package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.RankingItemResponse;
import com.fourbites.backend.service.RankingService;

@RestController
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping("/ranking")
    public List<RankingItemResponse> ranking(@RequestParam(defaultValue = "semanal") String periodo) {
        return rankingService.calcular(periodo);
    }
}