const translations = {
  ru: {
    pageTitle: "Свадебное приглашение",
    openInviteAria: "Открыть приглашение",
    eyebrow: "Вы приглашены",
    title: "Наша свадьба",
    hintInitial: "Нажмите на конверт",
    hintOpened: "Приглашение открыто",
    couple: "RÜSTEM & AYŞE",
    inviteWord: "Уважаемые",
    inviteText:
      "С любовью приглашаем вас разделить с нами самый важный день нашей жизни!",
    dateLabel: "Вечер свадьбы:",
    timeLabel: "Время",
    venueType: "Банкетный зал",
    venueAddress: "г. Симферополь, ул. Байрам, 5",
    guestFallback: "Дорогие гости",
    backToEnvelope: "← К конверту"
  },
  qtr: {
    pageTitle: "Той давети",
    openInviteAria: "Даветини ачиниз",
    eyebrow: "Сиз давет етильдиниз",
    title: "Бизим тоюмузгъа",
    hintInitial: "Конвертини ачиниз",
    hintOpened: "Давет ачилды",
    couple: "RÜSTEM & AYŞE",
    inviteWord: "Урьметли",
    inviteText:
      "СИЗНИ НИКЯХ ТОЮНА ДЖАН-ЮРЕКТЕН ДАВЕТ ЭТЕМИЗ! БУ БАХТЛЫ КУНЪДЕ АРАМЫЗДА СИЗНИ ДЕ КОРЬМЕГЕ БИЗЛЕР ИЧЮН БУЮК БИР КЪУВЫНЧ ОЛУР!",
    dateLabel: "ТОЙ АКЪШАМЫ:",
    timeLabel: "СААТ",
    venueType: "БФНКЕТ САЛОНЫ",
    venueAddress: "Акъмесджит ш., Байрам сокъагъы, 5",
    guestFallback: "Qıymetli qonaqlar",
    backToEnvelope: "← Конвертке къайтмакъ"
  }
};

const envelope = document.querySelector(".envelope");
const popup = document.querySelector(".envelope-popup");
const hint = document.querySelector(".hint");
const hero = document.querySelector(".hero");
const guestName = document.querySelector("#guestName");
const backButton = document.querySelector(".invite-back");
const langButtons = document.querySelectorAll(".lang-btn");

let currentLang = "ru";
let isOpened = false;
let confettiLayer = null;

function getQueryParam(name) {
  const query = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : "";
  const normalizedQuery = query.replace(/\?/g, "&");
  const params = new URLSearchParams(normalizedQuery);
  return params.get(name);
}

function resolveInitialLanguage() {
  const lang = getQueryParam("lang");
  return lang === "ru" || lang === "qtr" ? lang : "ru";
}

function setQueryLanguage(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
}

function resolveGuestName() {
  const nameParam = getQueryParam("name");
  if (!nameParam) {
    return "";
  }

  return nameParam.trim();
}

function applyGuestName(lang) {
  if (!guestName) {
    return;
  }

  const name = resolveGuestName();
  guestName.textContent = name || translations[lang].guestFallback;
}

function getConfettiLayer() {
  if (confettiLayer) {
    return confettiLayer;
  }

  confettiLayer = document.createElement("div");
  confettiLayer.className = "confetti-layer";
  hero.appendChild(confettiLayer);
  return confettiLayer;
}

function launchConfetti() {
  if (!hero || !envelope) {
    return;
  }

  const layer = getConfettiLayer();
  const envRect = envelope.getBoundingClientRect();
  const heroRect = hero.getBoundingClientRect();
  const centerX = envRect.left - heroRect.left + envRect.width / 2;
  const centerY = envRect.top - heroRect.top + envRect.height / 2;
  const colors = ["#f3a9b9", "#efc46d", "#9cc7ff", "#b8e2b0", "#ffffff", "#d77b93"];
  const count = 36;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 90 + Math.random() * 210;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 24;

    particle.className = "confetti";
    particle.style.setProperty("--start-x", `${centerX}px`);
    particle.style.setProperty("--start-y", `${centerY}px`);
    particle.style.setProperty("--dx", `${dx.toFixed(1)}px`);
    particle.style.setProperty("--dy", `${dy.toFixed(1)}px`);
    particle.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 960)}deg`);
    particle.style.setProperty("--size", `${(6 + Math.random() * 8).toFixed(1)}px`);
    particle.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    layer.appendChild(particle);
  }

  window.setTimeout(() => {
    layer.innerHTML = "";
  }, 4300);
}

function setLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang] || translations.ru;

  document.documentElement.lang = lang === "qtr" ? "crh" : "ru";
  document.title = dict.pageTitle;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (key === "hintInitial" && isOpened) {
      node.textContent = dict.hintOpened;
      return;
    }

    if (dict[key]) {
      node.textContent = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const key = node.dataset.i18nAria;
    if (dict[key]) {
      node.setAttribute("aria-label", dict[key]);
    }
  });

  applyGuestName(lang);

  langButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

if (envelope && popup && hint && hero) {
  envelope.addEventListener("click", () => {
    if (isOpened) {
      return;
    }

    isOpened = true;
    popup.classList.add("opened");
    hint.textContent = translations[currentLang].hintOpened;
    launchConfetti();

    window.setTimeout(() => {
      hero.classList.add("show-invite");
    }, 380);
  });
}

if (backButton && hero && popup && hint) {
  backButton.addEventListener("click", () => {
    hero.classList.remove("show-invite");
    popup.classList.remove("opened");
    isOpened = false;
    hint.textContent = translations[currentLang].hintInitial;
  });
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const nextLang = btn.dataset.lang;
    if (nextLang !== "ru" && nextLang !== "qtr") {
      return;
    }

    setLanguage(nextLang);
    setQueryLanguage(nextLang);
  });
});

setLanguage(resolveInitialLanguage());
