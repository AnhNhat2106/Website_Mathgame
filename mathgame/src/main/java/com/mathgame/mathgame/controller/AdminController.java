package com.mathgame.mathgame.controller;

import com.mathgame.mathgame.dto.AdminUserDto;
import com.mathgame.mathgame.dto.BattleSummaryDto;
import com.mathgame.mathgame.entity.User;
import com.mathgame.mathgame.repository.BattleResultRepository;
import com.mathgame.mathgame.repository.UserRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BattleResultRepository battleResultRepository;

    public AdminController(UserRepository userRepository, BattleResultRepository battleResultRepository) {
        this.userRepository = userRepository;
        this.battleResultRepository = battleResultRepository;
    }

    @GetMapping
    public String dashboard(Model model) {
        List<User> users = userRepository.findAll();
        List<AdminUserDto> userDtos = new ArrayList<>();
        
        long totalUsers = users.size();
        long adminCount = users.stream().filter(u -> "ADMIN".equals(u.getRole())).count();
        
        for (User u : users) {
             BattleSummaryDto summary = battleResultRepository.getSummary(u.getUsername());
             long points = summary != null ? summary.getTotalPoints() : 0;
             long matches = summary != null ? summary.getMatches() : 0;
             long wins = summary != null ? summary.getWins() : 0;
             int winRate = matches > 0 ? (int) Math.round((wins * 100.0) / matches) : 0;
             
             userDtos.add(new AdminUserDto(u, points, matches, winRate));
        }

        model.addAttribute("users", userDtos);
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("adminCount", adminCount);
        
        return "admin";
    }

    @PostMapping("/user/{id}/ban")
    public String banUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBanned(true);
            userRepository.save(user);
        });
        return "redirect:/admin";
    }

    @PostMapping("/user/{id}/unban")
    public String unbanUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBanned(false);
            userRepository.save(user);
        });
        return "redirect:/admin";
    }
}
