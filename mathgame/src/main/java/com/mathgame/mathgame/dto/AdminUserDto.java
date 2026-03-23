package com.mathgame.mathgame.dto;

import com.mathgame.mathgame.entity.User;

public class AdminUserDto {
    private User user;
    private long totalPoints;
    private long matches;
    private int winRate;

    public AdminUserDto(User user, long totalPoints, long matches, int winRate) {
        this.user = user;
        this.totalPoints = totalPoints;
        this.matches = matches;
        this.winRate = winRate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public long getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(long totalPoints) {
        this.totalPoints = totalPoints;
    }

    public long getMatches() {
        return matches;
    }

    public void setMatches(long matches) {
        this.matches = matches;
    }

    public int getWinRate() {
        return winRate;
    }

    public void setWinRate(int winRate) {
        this.winRate = winRate;
    }
}
