new Swiper(".ensemble-swiper", {
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  freeMode: true,
  noSwiping: true,
  spaceBetween: 24,
  breakpoints: {
    851: {
      spaceBetween: 14,
    },
    1025: {
      spaceBetween: 16,
    },
  },
  pagination: {
    el: ".ensemble-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".ensemble-prev",
    nextEl: ".ensemble-next",
  },
});

const ensemblePlayer = new Audio();
const ensembleCards = document.querySelectorAll(".ensemble-card");
const backgroundMusic = document.querySelector("#background-music");
const backgroundMusicToggle = document.querySelector(
  "#background-music-toggle",
);
const backgroundMusicIcon =
  backgroundMusicToggle.querySelector(".music-player-icon");
const backgroundMusicLabel = backgroundMusicToggle.querySelector(
  ".music-player-label",
);
const backgroundMusicStatus = document.querySelector(
  "#background-music-status",
);
let activeAudioCard = null;

function setBackgroundMusicState(isPlaying) {
  backgroundMusicToggle.setAttribute("aria-pressed", String(isPlaying));
  backgroundMusicToggle.setAttribute(
    "aria-label",
    `${isPlaying ? "Pause" : "Play"} background music`,
  );
  backgroundMusicIcon.textContent = isPlaying ? "⏸" : "▶";
  backgroundMusicLabel.textContent = isPlaying ? "Pause" : "Play";
}

function playBackgroundMusic() {
  backgroundMusic
    .play()
    .then(() => {
      backgroundMusicStatus.textContent = "";
      setBackgroundMusicState(true);
    })
    .catch((error) => {
      setBackgroundMusicState(false);
      if (error.name === "NotAllowedError") {
        backgroundMusicStatus.textContent =
          "자동 재생이 차단되었습니다. 버튼을 눌러 배경음악을 재생해 주세요.";
        return;
      }

      console.error("Could not play background music.", error);
      backgroundMusicStatus.textContent =
        "배경음악을 재생할 수 없습니다. 다시 시도해 주세요.";
    });
}

backgroundMusic.addEventListener("play", () => {
  setBackgroundMusicState(true);
});
backgroundMusic.addEventListener("pause", () => {
  setBackgroundMusicState(false);
});
backgroundMusic.addEventListener("error", () => {
  backgroundMusicStatus.textContent = "배경음악 파일을 불러오지 못했습니다.";
});
backgroundMusicToggle.addEventListener("click", () => {
  if (!backgroundMusic.paused) {
    backgroundMusic.pause();
    return;
  }

  if (activeAudioCard) {
    setAudioButtonState(activeAudioCard, false);
    activeAudioCard = null;
    ensemblePlayer.pause();
  }
  playBackgroundMusic();
});

playBackgroundMusic();

function setAudioButtonState(card, isPlaying) {
  const button = card.querySelector(".card-audio-toggle");
  const label = button.querySelector(".card-audio-label");
  const action = isPlaying ? "Stop" : "Play";

  label.textContent = action;
  button.setAttribute("aria-pressed", String(isPlaying));
  button.setAttribute(
    "aria-label",
    `${action} ${card.querySelector("h3").textContent} music`,
  );
}

function playEnsembleCard(card) {
  if (!backgroundMusic.paused) {
    backgroundMusic.pause();
  }

  if (activeAudioCard !== card) {
    ensemblePlayer.pause();
    if (activeAudioCard) {
      setAudioButtonState(activeAudioCard, false);
    }
    activeAudioCard = card;
    ensemblePlayer.src = card.dataset.audio;
  }

  ensemblePlayer
    .play()
    .then(() => {
      if (activeAudioCard === card) {
        setAudioButtonState(card, true);
      }
    })
    .catch((error) => {
      console.error("Could not play ensemble audio.", error);
      if (activeAudioCard === card) {
        setAudioButtonState(card, false);
        const button = card.querySelector(".card-audio-toggle");
        button.querySelector(".card-audio-label").textContent = "재생 오류";
        button.setAttribute(
          "aria-label",
          `${card.querySelector("h3").textContent} 음악 재생 실패. 다시 시도`,
        );
      }
    });
}

ensembleCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".card-audio-toggle")) {
      if (activeAudioCard === card && !ensemblePlayer.paused) {
        ensemblePlayer.pause();
        setAudioButtonState(card, false);
      } else {
        playEnsembleCard(card);
      }
      return;
    }

    playEnsembleCard(card);
  });
});

ensemblePlayer.addEventListener("ended", () => {
  if (activeAudioCard) {
    setAudioButtonState(activeAudioCard, false);
  }
});

AOS.init({
  duration: 800,
  easing: "ease-out-cubic",
  offset: Math.round(window.innerHeight / 2),
  once: false,
  mirror: true,
  disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

const emailForm = document.querySelector(".amabile-form");
const emailStatus = emailForm.querySelector(".form-status");
const emailSubmitButton = emailForm.querySelector('button[type="submit"]');

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  emailStatus.textContent = "문의 내용을 전송하고 있습니다.";
  emailStatus.dataset.state = "sending";
  emailSubmitButton.disabled = true;

  try {
    if (typeof emailjs === "undefined") {
      throw new Error("EmailJS SDK failed to load.");
    }

    emailjs.init({ publicKey: "XGV2L7vh4zj_EUSEH" });
    await emailjs.sendForm("service_iutdv06", "template_h20dfsp", emailForm);
    emailStatus.textContent = "문의가 전송되었습니다. 감사합니다.";
    emailStatus.dataset.state = "success";
    emailForm.reset();
    showPopup("전송 완료!", "문의가 전송되었습니다. 감사합니다.", "success");
  } catch (error) {
    console.error("EmailJS request failed.", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "text" in error
          ? String(error.text)
          : String(error);
    emailStatus.textContent = `전송에 실패했습니다. 다시 확인해 주세요: ${errorMessage}`;
    emailStatus.dataset.state = "error";
    showPopup("전송 실패...", emailStatus.textContent, "error");
  } finally {
    emailSubmitButton.disabled = false;
  }
});
function showPopup(title, text, icon = "info") {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "확인",
    customClass: {
      popup: "amabile-popup",
      confirmButton: "amabile-confirm",
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const popupWrapper = document.getElementById("popup-wrapper");
  const closeBtn = document.getElementById("close-btn");
  const checkToday = document.getElementById("check-today");

  // 1. 로컬스토리지에서 만료 시간 확인하여 숨김 처리
  const expiredDate = localStorage.getItem("popupExpired");
  const today = new Date().getTime();

  if (expiredDate && today < expiredDate) {
    popupWrapper.style.display = "none";
  }

  // 2. 닫기 버튼 클릭 시 동작
  closeBtn.addEventListener("click", function () {
    if (checkToday.checked) {
      // 24시간 뒤의 시간 계산
      const tomorrow = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("popupExpired", tomorrow);
    }
    popupWrapper.style.display = "none";
  });
});
