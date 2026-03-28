/**
 * MathGame Battle WebSocket Client
 * Refactored using OOP & ES6 Features
 */

class BattleUI {
  constructor() {
    this.elements = {
      log: document.getElementById("log"),
      status: document.getElementById("status"),
      btnFind: document.getElementById("btnFind"),
      btnCancel: document.getElementById("btnCancel"),
      confirmBox: document.getElementById("confirmBox"),
      playBox: document.getElementById("playBox"),
      resultBox: document.getElementById("resultBox"),
      footerActions: document.getElementById("battleFooterActions"),
      matchInfo: document.getElementById("matchInfo"),
      resultTitle: document.getElementById("resultTitle"),
      resultWinner: document.getElementById("resultWinner"),
      resultScore: document.getElementById("resultScore"),
      resultDelta: document.getElementById("resultDelta"),
      resultPlayer1: document.getElementById("resultPlayer1"),
      resultPlayer2: document.getElementById("resultPlayer2"),
      btnForfeit: document.getElementById("btnForfeit"),
      question: document.getElementById("question"),
      options: document.getElementById("options"),
      optionLabels: document.getElementById("optionLabels"),
      timer: document.getElementById("timer"),
      btnAccept: document.getElementById("btnAccept"),
      btnDecline: document.getElementById("btnDecline"),
      btnPlayAgain: document.getElementById("btnPlayAgain"),
      me: document.getElementById("me")
    };
  }

  log(msg) {
    if (!this.elements.log) return;
    this.elements.log.textContent += msg + "\n";
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  setState({ status, showFind, showCancel, showConfirm, showPlay, showResult }) {
    if (this.elements.status) this.elements.status.textContent = status ?? "";
    if (this.elements.btnFind) this.elements.btnFind.style.display = showFind ? "inline-block" : "none";
    if (this.elements.btnCancel) this.elements.btnCancel.style.display = showCancel ? "inline-block" : "none";
    if (this.elements.confirmBox) this.elements.confirmBox.style.display = showConfirm ? "block" : "none";
    if (this.elements.playBox) this.elements.playBox.style.display = showPlay ? "block" : "none";
    if (this.elements.resultBox) this.elements.resultBox.style.display = showResult ? "block" : "none";
    if (this.elements.footerActions) this.elements.footerActions.style.display = showResult ? "none" : "flex";
  }

  showIdle(msg = "Sẵn sàng") {
    this.setState({ status: msg, showFind: true, showCancel: false, showConfirm: false, showPlay: false, showResult: false });
  }

  showQueuing(msg = "Đang tìm đối thủ...") {
    this.setState({ status: msg, showFind: false, showCancel: true, showConfirm: false, showPlay: false, showResult: false });
  }

  showFound(msg = "Tìm thấy đối thủ!", matchInfoText) {
    this.setState({ status: msg, showFind: false, showCancel: false, showConfirm: true, showPlay: false, showResult: false });
    if (this.elements.matchInfo) this.elements.matchInfo.textContent = matchInfoText;
  }

  showPlaying(msg = "Đang thi đấu") {
    this.setState({ status: msg, showFind: false, showCancel: false, showConfirm: false, showPlay: true, showResult: false });
    this.resetForfeitButton();
  }

  showResult(resultData, currentUser) {
    this.setState({ status: "Trận đấu kết thúc!", showFind: true, showCancel: false, showConfirm: false, showPlay: false, showResult: true });
    
    const { score1, score2, myDelta, player1, player2 } = resultData;
    const winner = score1 === score2 ? null : (score1 > score2 ? player1 : player2);
    
    let title = "HÒA";
    if (winner) {
      title = winner === currentUser ? "CHIẾN THẮNG" : "THẤT BẠI";
    }

    if (this.elements.resultTitle) {
      this.elements.resultTitle.textContent = title;
      this.elements.resultTitle.className = ""; // Reset classes
      if (!winner) this.elements.resultTitle.classList.add("result-draw");
      else if (winner === currentUser) this.elements.resultTitle.classList.add("result-win");
      else this.elements.resultTitle.classList.add("result-lose");
    }

    if (this.elements.resultWinner) this.elements.resultWinner.textContent = winner ?? "Không có (Hòa)";
    if (this.elements.resultScore) this.elements.resultScore.textContent = `${score1} : ${score2}`;
    if (this.elements.resultDelta) this.elements.resultDelta.textContent = `Điểm nhận: ${myDelta > 0 ? "+" : ""}${myDelta}`;
    if (this.elements.resultPlayer1) this.elements.resultPlayer1.textContent = player1 ?? "-";
    if (this.elements.resultPlayer2) this.elements.resultPlayer2.textContent = player2 ?? "-";
  }

  resetForfeitButton() {
    if (!this.elements.btnForfeit) return;
    this.elements.btnForfeit.disabled = false;
    this.elements.btnForfeit.textContent = "Hủy trận đấu";
  }

  disableOptions() {
    const buttons = document.querySelectorAll("#options button");
    buttons.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      btn.style.cursor = "not-allowed";
    });
  }

  renderQuestion(q, onAnswer) {
    if (this.elements.question) this.elements.question.textContent = `Câu ${q.index + 1}: ${q.questionText}`;
    if (this.elements.options) this.elements.options.innerHTML = "";
    if (this.elements.optionLabels) this.elements.optionLabels.innerHTML = "";

    const letters = ["A", "B", "C", "D"];
    (q.options || []).forEach((opt, i) => {
      // Label
      const label = document.createElement("span");
      label.className = "battle-option-label";
      label.textContent = `${letters[i]}) ${opt}`;
      this.elements.optionLabels.appendChild(label);

      // Button
      const btn = document.createElement("button");
      btn.className = "battle-option";
      btn.type = "button";
      btn.textContent = `${letters[i]}${opt}`;
      btn.onclick = () => onAnswer(letters[i], q.index);
      this.elements.options.appendChild(btn);
    });
  }

  updateTimer(secondsRemaining) {
    if (this.elements.timer) this.elements.timer.textContent = `Còn ${Math.max(0, secondsRemaining)}s`;
  }
}

class BattleGame {
  constructor(ui) {
    this.ui = ui;
    this.stompClient = null;
    this.currentMatchId = null;
    this.countdownTimer = null;
    this.countdownRemaining = 0;
    this.currentUser = this.ui.elements.me?.textContent?.trim() || "";
    this.answeredIndex = new Set();
  }

  init() {
    if (!this.currentUser) {
      if (this.ui.elements.status) this.ui.elements.status.textContent = "Bạn cần đăng nhập để chơi battle";
      window.location.href = "/login";
      return;
    }
    this.bindEvents();
    this.connectWs();
  }

  bindEvents() {
    this.ui.elements.btnFind?.addEventListener("click", () => this.findMatch());
    this.ui.elements.btnCancel?.addEventListener("click", () => this.cancelFind());
    this.ui.elements.btnAccept?.addEventListener("click", () => this.acceptMatch());
    this.ui.elements.btnDecline?.addEventListener("click", () => this.declineMatch());
    this.ui.elements.btnForfeit?.addEventListener("click", () => this.forfeitMatch());
    this.ui.elements.btnPlayAgain?.addEventListener("click", () => this.playAgain());
  }

  connectWs() {
    const socket = new SockJS("/ws");
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null; // Disable debug spam

    this.ui.showIdle("Đang kết nối...");

    this.stompClient.connect({}, () => {
      this.ui.log("Connected.");
      this.ui.showIdle("Sẵn sàng");
      this.subscribeToTopics();
    }, (err) => {
      console.error(err);
      this.ui.showIdle("Không kết nối được WebSocket");
    });
  }

  subscribeToTopics() {
    // System events
    this.stompClient.subscribe("/user/queue/system", (m) => {
      const evt = JSON.parse(m.body);
      this.ui.log("[SYS] " + m.body);

      switch (evt.type) {
        case "QUEUING": this.ui.showQueuing(); break;
        case "IDLE": this.resetGame(); this.ui.showIdle(); break;
        case "PLAYING": this.ui.showPlaying(); break;
        case "CONFIRM": if (this.ui.elements.status) this.ui.elements.status.textContent = "Bạn đã xác nhận. Đang chờ đối thủ..."; break;
        case "RESULT": if (this.ui.elements.status) this.ui.elements.status.textContent = "Trận đấu kết thúc!"; break;
      }
    });

    // Match Found
    this.stompClient.subscribe("/user/queue/match", (m) => {
      const evt = JSON.parse(m.body);
      this.ui.log("[MATCH] " + m.body);
      this.currentMatchId = evt.matchId;
      this.ui.showFound("Tìm thấy đối thủ!", `${evt.player1} vs ${evt.player2}`);
    });

    // Result
    this.stompClient.subscribe("/user/queue/result", (m) => {
      const resultData = JSON.parse(m.body);
      this.ui.log("[RESULT] " + m.body);
      this.clearCountdown();
      this.ui.showResult(resultData, this.currentUser);
    });
  }

  findMatch() {
    if (!this.stompClient) return;
    this.ui.showQueuing("Đang tìm đối thủ...");
    this.stompClient.send("/app/battle/queue/join", {}, JSON.stringify({}));
    this.ui.log("Join queue...");
  }

  cancelFind() {
    if (!this.stompClient) return;
    this.stompClient.send("/app/battle/queue/cancel", {}, JSON.stringify({}));
    this.resetGame();
    this.ui.showIdle("Đã hủy tìm trận");
    this.ui.log("Cancel queue...");
  }

  acceptMatch() {
    if (!this.stompClient || !this.currentMatchId) return;

    // Subscribe to specific match topic for questions
    this.stompClient.subscribe(`/topic/match/${this.currentMatchId}`, (m) => {
      const evt = JSON.parse(m.body);
      if (evt.questionText) {
        this.ui.showPlaying("Đang thi đấu");
        this.handleNewQuestion(evt);
      }
    });

    this.stompClient.send("/app/battle/match/accept", {}, JSON.stringify({ matchId: this.currentMatchId }));
    if (this.ui.elements.status) this.ui.elements.status.textContent = "Bạn đã xác nhận. Đang chờ đối thủ...";
    this.ui.log("Accept match: " + this.currentMatchId);
  }

  declineMatch() {
    if (!this.stompClient || !this.currentMatchId) return;
    this.stompClient.send("/app/battle/match/decline", {}, JSON.stringify({ matchId: this.currentMatchId }));
    this.ui.log("Decline match: " + this.currentMatchId);
    this.resetGame();
    this.ui.showIdle("Bạn đã từ chối trận.");
  }

  forfeitMatch() {
    if (!this.stompClient || !this.currentMatchId) return;
    if (this.ui.elements.btnForfeit) {
      this.ui.elements.btnForfeit.disabled = true;
      this.ui.elements.btnForfeit.textContent = "Đang hủy...";
    }
    if (this.ui.elements.status) this.ui.elements.status.textContent = "Bạn đã hủy trận. Đang xử lý kết quả...";
    this.stompClient.send("/app/battle/match/forfeit", {}, JSON.stringify({ matchId: this.currentMatchId }));
    this.ui.log("Forfeit match: " + this.currentMatchId);
  }

  handleNewQuestion(q) {
    this.answeredIndex.delete(q.index);
    this.ui.renderQuestion(q, (choice, idx) => this.submitAnswer(choice, idx));
    this.startCountdown(q.timeLimitSec || 10, q.index);
  }

  submitAnswer(choice, index) {
    if (!this.stompClient || !this.currentMatchId) return;
    if (this.answeredIndex.has(index)) return;
    
    this.answeredIndex.add(index);
    this.clearCountdown();
    this.ui.disableOptions();

    this.stompClient.send("/app/battle/answer", {}, JSON.stringify({
      matchId: this.currentMatchId,
      choice,
      index
    }));
    this.ui.log(`Answer: ${choice || "(timeout)"} (index=${index})`);
  }

  startCountdown(seconds, index) {
    this.clearCountdown();
    this.countdownRemaining = seconds;
    this.ui.updateTimer(this.countdownRemaining);

    this.countdownTimer = setInterval(() => {
      this.countdownRemaining -= 1;
      this.ui.updateTimer(this.countdownRemaining);

      if (this.countdownRemaining <= 0) {
        this.clearCountdown();
        if (!this.answeredIndex.has(index)) {
          this.submitAnswer("", index); // Auto-submit timeout
        }
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  resetGame() {
    this.currentMatchId = null;
    this.clearCountdown();
    this.answeredIndex.clear();
  }

  playAgain() {
    this.resetGame();
    this.ui.showIdle("Sẵn sàng");
    if (this.ui.elements.question) this.ui.elements.question.textContent = "Chưa có câu hỏi";
    if (this.ui.elements.options) this.ui.elements.options.innerHTML = "";
    if (this.ui.elements.optionLabels) this.ui.elements.optionLabels.innerHTML = "";
    if (this.ui.elements.timer) this.ui.elements.timer.textContent = "0s";
    this.ui.log("Play again.");
  }
}

// Ensure execution runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const ui = new BattleUI();
  const game = new BattleGame(ui);
  game.init();
});
