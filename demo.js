webSnake.InitGame('.snake-canvas', {
  segSize: 20,
  speed: 60,
  segmentClassName: "snake-segment",
  foodClassName: "snake-food"
});
webSnake.RestartGame();
webSnake.OnScoreChanged(score => {
  document.querySelector("#score").textContent = score.CurrentScore;
  document.querySelector("#high-score").textContent = score.HighScore;
});

document.querySelector('#mySpeedRange').oninput = function() {
  webSnake.SetGameSpeed(900 / this.value);
  document.querySelector('#speed').textContent = this.value;
}

document.querySelector('#mySegSize').oninput = function() {
  webSnake.SetSegmentSize(this.value);
  document.querySelector('#seg-Size').textContent = this.value;
}

document.querySelector("#toggle-autoplay").addEventListener("click", e => {
  ToggleAutoplay();
});

function ToggleAutoplay() {
  ToggleAutoplay.on = !ToggleAutoplay.on;
  if (ToggleAutoplay.on) {
    document.querySelector("#toggle-autoplay").className = "snake-btn-on";
    document.querySelector("#toggle-autoplay").textContent = "AutoPlay ON";
  } else {
    document.querySelector("#toggle-autoplay").textContent = "AutoPlay OFF";
    document.querySelector("#toggle-autoplay").className = "snake-btn-off";
  }
  webSnake.ToggleAutoPilot();
}

ToggleAutoplay.on = false;