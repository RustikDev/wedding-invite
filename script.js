const translations = {
  ru: {
    pageTitle: "Свадебное приглашение",
    openInviteAria: "Открыть приглашение",
    eyebrow: "Вы приглашены",
    title: "Наша свадьба",
    hintInitial: "Нажмите на конверт",
    hintOpened: "Приглашение открыто",
    couple: "RUSTEM & AYSE",
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
    pageTitle: "Toy daveti",
    openInviteAria: "Davetni aç",
    eyebrow: "Siz davet etildiniz",
    title: "Bizim toy",
    hintInitial: "Konvertke basyñız",
    hintOpened: "Davet açıldı",
    couple: "RUSTEM & AYSE",
    inviteWord: "Ürbmetli",
    inviteText:
      "Sizni nikyah toyuna can-yürekten davet etemiz! Bu bahtlı künde aramızda sizni de körmege bizler içün büyük bir quvanç olur!",
    dateLabel: "Toy aqşamı:",
    timeLabel: "Saat",
    venueType: "Banket salonı",
    venueAddress: "Aqmescit ş., Bayram sokağı, 5",
    guestFallback: "Qıymetli qonaqlar",
    backToEnvelope: "← Konvertke qayt"
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

function getRawQueryParam(name) {
  const query = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : "";
  const normalizedQuery = query.replace(/\?/g, "&");
  const segments = normalizedQuery.split("&");

  for (const segment of segments) {
    if (!segment) {
      continue;
    }

    const eqIndex = segment.indexOf("=");
    const rawKey = eqIndex >= 0 ? segment.slice(0, eqIndex) : segment;
    const rawValue = eqIndex >= 0 ? segment.slice(eqIndex + 1) : "";

    if (rawKey === name) {
      return rawValue;
    }
  }

  return null;
}

function decodeLatinBytes(input, encoding) {
  try {
    const bytes = Uint8Array.from(input, (ch) => ch.charCodeAt(0) & 0xff);
    return new TextDecoder(encoding, { fatal: false }).decode(bytes);
  } catch (_) {
    return input;
  }
}

function decodePercentBytes(rawValue, encoding) {
  try {
    const bytes = [];
    for (let i = 0; i < rawValue.length; i += 1) {
      const char = rawValue[i];
      if (
        char === "%" &&
        i + 2 < rawValue.length &&
        /^[0-9A-Fa-f]{2}$/.test(rawValue.slice(i + 1, i + 3))
      ) {
        bytes.push(parseInt(rawValue.slice(i + 1, i + 3), 16));
        i += 2;
      } else {
        bytes.push(char.charCodeAt(0) & 0xff);
      }
    }
    return new TextDecoder(encoding, { fatal: false }).decode(Uint8Array.from(bytes));
  } catch (_) {
    return rawValue;
  }
}

function unicodeToCp1251Byte(ch) {
  const code = ch.charCodeAt(0);
  if (code <= 0x7f) {
    return code;
  }
  if (code >= 0x0410 && code <= 0x044f) {
    return code - 0x350;
  }
  if (code === 0x0401) {
    return 0xa8;
  }
  if (code === 0x0451) {
    return 0xb8;
  }

  const map = {
    0x0402: 0x80, 0x0403: 0x81, 0x201a: 0x82, 0x0453: 0x83, 0x201e: 0x84,
    0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x20ac: 0x88, 0x2030: 0x89,
    0x0409: 0x8a, 0x2039: 0x8b, 0x040a: 0x8c, 0x040c: 0x8d, 0x040b: 0x8e,
    0x040f: 0x8f, 0x0452: 0x90, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
    0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x2122: 0x99,
    0x0459: 0x9a, 0x203a: 0x9b, 0x045a: 0x9c, 0x045c: 0x9d, 0x045b: 0x9e,
    0x045f: 0x9f, 0x00a0: 0xa0, 0x040e: 0xa1, 0x045e: 0xa2, 0x0408: 0xa3,
    0x00a4: 0xa4, 0x0490: 0xa5, 0x00a6: 0xa6, 0x00a7: 0xa7, 0x0404: 0xaa,
    0x00ab: 0xab, 0x00ac: 0xac, 0x00ad: 0xad, 0x00ae: 0xae, 0x0407: 0xaf,
    0x00b0: 0xb0, 0x00b1: 0xb1, 0x0406: 0xb2, 0x0456: 0xb3, 0x0491: 0xb4,
    0x00b5: 0xb5, 0x00b6: 0xb6, 0x00b7: 0xb7, 0x2116: 0xb9, 0x0454: 0xba,
    0x00bb: 0xbb, 0x0458: 0xbc, 0x0405: 0xbd, 0x0455: 0xbe, 0x0457: 0xbf
  };

  return map[code] ?? null;
}

function repairUtf8FromCp1251Mojibake(value) {
  if (!value || !/[РС]/.test(value)) {
    return value;
  }

  const bytes = [];
  for (const ch of value) {
    const byte = unicodeToCp1251Byte(ch);
    if (byte === null) {
      return value;
    }
    bytes.push(byte);
  }

  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(Uint8Array.from(bytes));
  } catch (_) {
    return value;
  }
}

function normalizeGuestName(rawName) {
  if (!rawName) {
    return "";
  }

  const base = rawName.replace(/\+/g, " ").trim();
  const variants = new Set([base]);

  try {
    variants.add(decodeURIComponent(base));
  } catch (_) {}

  variants.add(decodePercentBytes(rawName, "utf-8").replace(/\+/g, " "));
  variants.add(decodePercentBytes(rawName, "windows-1251").replace(/\+/g, " "));
  variants.add(decodeLatinBytes(base, "utf-8"));
  variants.add(decodeLatinBytes(base, "windows-1251"));
  variants.add(repairUtf8FromCp1251Mojibake(base));

  let best = base;
  let bestScore = -1;

  variants.forEach((value) => {
    const cyr = (value.match(/[\u0400-\u04FF]/g) || []).length;
    const bad = (value.match(/[\uFFFD?]/g) || []).length;
    const score = cyr * 2 - bad;
    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  });

  return best.trim();
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
  const rawNameParam = getRawQueryParam("name");
  if (!rawNameParam) {
    return "";
  }

  return normalizeGuestName(rawNameParam);
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
