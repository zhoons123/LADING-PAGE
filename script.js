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
let activeAudioCard = null;

function setAudioButtonState(card, isPlaying) {
  const button = card.querySelector(".card-audio-toggle");
  const label = button.querySelector(".card-audio-label");
  const action = isPlaying ? "정지" : "재생";

  label.textContent = action;
  button.setAttribute("aria-pressed", String(isPlaying));
  button.setAttribute(
    "aria-label",
    `${card.querySelector("h3").textContent} 음악 ${action}`,
  );
}

function playEnsembleCard(card) {
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
  disable: () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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
  } catch (error) {
    console.error("EmailJS request failed.", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "text" in error
          ? String(error.text)
          : String(error);
    emailStatus.textContent = `문의 전송 실패: ${errorMessage}`;
    emailStatus.dataset.state = "error";
  } finally {
    emailSubmitButton.disabled = false;
  }
});
