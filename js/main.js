/* ==========================================================================
   GEOVANA MÓVEIS — Interações e animações
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     0. Fallback sem JS
  --------------------------------------------------------- */
  document.documentElement.classList.remove("no-js");

  /* ---------------------------------------------------------
     1. Preloader
  --------------------------------------------------------- */
  var preloader = document.getElementById("preloader");
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add("is-done");
      document.body.classList.add("is-loaded");
    }, reduceMotion ? 0 : 400);
  });
  // Segurança: esconder após 3s mesmo se o load demorar
  setTimeout(function () {
    if (preloader) preloader.classList.add("is-done");
  }, 3000);

  /* ---------------------------------------------------------
     2. Ano dinâmico no footer
  --------------------------------------------------------- */
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     3. Scroll progress bar + header fixo
  --------------------------------------------------------- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scrollProgress");

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + "%";

    if (header) header.classList.toggle("is-scrolled", scrollTop > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     4. Menu mobile
  --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navClose = document.getElementById("navClose");

  function openNav() {
    if (!nav) return;
    nav.classList.add("is-open");
    document.body.classList.add("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle) navToggle.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  document.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------------------------------------------------------
     5. Reveal on scroll (Intersection Observer)
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // delay em cascata para grupos (lista, grid)
          var index = Array.prototype.indexOf.call(
            entry.target.parentElement.children,
            entry.target
          );
          var delay = Math.min(index, 6) * 70;
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     6. Contadores animados (stats do hero)
  --------------------------------------------------------- */
  var stats = document.querySelectorAll(".stat[data-count]");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1800;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { countIO.observe(el); });
  } else {
    stats.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     7. Cursor customizado (só ponteiros finos)
  --------------------------------------------------------- */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    });

    (function followRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(followRing);
    })();

    var hoverables = "a, button, .galeria__item, input, textarea, select, .filtro, .dot";
    document.querySelectorAll(hoverables).forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        dot.classList.add("is-hover");
        ring.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        dot.classList.remove("is-hover");
        ring.classList.remove("is-hover");
      });
    });

    document.addEventListener("mouseleave", function () {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  } else {
    if (dot) dot.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  /* ---------------------------------------------------------
     8. Botões magnéticos
  --------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + (x * 0.22) + "px, " + (y * 0.28) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     9. Nav link ativo conforme a seção visível
  --------------------------------------------------------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav__link");

  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + id &&
                !link.classList.contains("nav__link--cta")
            );
          });
        }
      });
    }, { threshold: 0.35, rootMargin: "-15% 0px -45% 0px" });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------------------------------------------------------
     10. Galeria — filtros + lightbox
  --------------------------------------------------------- */
  var filtros = document.querySelectorAll(".filtro");
  var itens = document.querySelectorAll(".galeria__item");

  filtros.forEach(function (f) {
    f.addEventListener("click", function () {
      var filter = f.getAttribute("data-filter");

      filtros.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      f.classList.add("is-active");
      f.setAttribute("aria-selected", "true");

      itens.forEach(function (item) {
        var cat = item.getAttribute("data-cat");
        var show = filter === "todos" || cat === filter;
        item.classList.toggle("is-hidden", !show);
        // re-anima os visíveis
        if (show) {
          item.classList.remove("is-visible");
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              item.classList.add("is-visible");
            });
          });
        }
      });
    });
  });

  // Lightbox com a foto do próprio card
  var lightbox = document.getElementById("lightbox");
  var lbContent = document.getElementById("lightboxContent");
  var lbCaption = document.getElementById("lightboxCaption");
  var lbClose = document.getElementById("lightboxClose");
  var lastFocused = null;

  function openLightbox(item) {
    var media = item.querySelector(".galeria__media");
    var caption = item.querySelector("figcaption");
    if (!media || !lightbox) return;

    lastFocused = document.activeElement;
    // Mantém o estilo do lightbox + textura de madeira como fallback
    var texturas = media.className.replace("galeria__media", "").trim();
    lbContent.className = "lightbox__content " + texturas;
    lbContent.style.borderRadius = "var(--r-lg)";

    // Clona a foto real para dentro do lightbox
    var img = media.querySelector("img.photo");
    lbContent.innerHTML = "";
    if (img) lbContent.appendChild(img.cloneNode(true));

    lbCaption.textContent = caption ? caption.textContent : "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  itens.forEach(function (item) {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    var cap = item.querySelector("figcaption");
    if (cap) item.setAttribute("aria-label", "Ampliar: " + cap.textContent);
    item.addEventListener("click", function () { openLightbox(item); });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------------------------------------------------------
     11. Slider de depoimentos
  --------------------------------------------------------- */
  var track = document.getElementById("sliderTrack");
  var slides = track ? track.querySelectorAll(".slide") : [];
  var dotsWrap = document.getElementById("sliderDots");
  var prevBtn = document.getElementById("sliderPrev");
  var nextBtn = document.getElementById("sliderNext");
  var current = 0;
  var autoTimer = null;

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Depoimento " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".dot");

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -current * 100 + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === current); });
      restartAuto();
    }

    function restartAuto() {
      clearInterval(autoTimer);
      if (!reduceMotion) {
        autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });

    // Pausa autoplay no hover
    var slider = document.querySelector(".slider");
    if (slider) {
      slider.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
      slider.addEventListener("mouseleave", restartAuto);
    }

    // Suporte a swipe no touch
    var startX = 0;
    track.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    restartAuto();
  }

  /* ---------------------------------------------------------
     12. Parallax suave nos blobs do hero
  --------------------------------------------------------- */
  var blobs = document.querySelectorAll(".blob");
  if (blobs.length && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      if (y > window.innerHeight) return;
      blobs.forEach(function (blob, i) {
        var speed = i === 0 ? 0.25 : 0.4;
        blob.style.transform = "translateY(" + y * speed + "px)";
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     13. Formulário — validação + envio para WhatsApp
  --------------------------------------------------------- */
  var form = document.getElementById("formContato");
  if (form) {
    // Configura aqui seu número (DDI + DDD + número, sem espaços)
    var WHATSAPP_NUMERO = "5531984539177";

    function showError(field, show) {
      var wrap = field.closest(".form__field");
      if (wrap) wrap.classList.toggle("has-error", show);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var nome = form.querySelector("#nome");
      var telefone = form.querySelector("#telefone");
      var email = form.querySelector("#email");

      var nomeOk = nome.value.trim().length >= 2;
      var telOk = telefone.value.replace(/\D/g, "").length >= 8;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      showError(nome, !nomeOk);
      showError(telefone, !telOk);
      showError(email, !emailOk);
      if (!nomeOk || !telOk || !emailOk) valid = false;

      if (!valid) {
        var firstError = form.querySelector(".form__field.has-error input");
        if (firstError) firstError.focus();
        return;
      }

      var ambiente = form.querySelector("#ambiente");
      var mensagem = form.querySelector("#mensagem");

      var texto =
        "Olá, Geovana Móveis! Gostaria de um orçamento de móveis planejados.\n\n" +
        "*Nome:* " + nome.value.trim() + "\n" +
        "*Telefone:* " + telefone.value.trim() + "\n" +
        "*E-mail:* " + email.value.trim() + "\n" +
        "*Ambiente:* " + (ambiente.value || "Não informado") + "\n" +
        "*Mensagem:* " + (mensagem.value.trim() || "—");

      var url = "https://wa.me/" + WHATSAPP_NUMERO +
        "?text=" + encodeURIComponent(texto);

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.innerHTML;
      btn.innerHTML = "Abrindo WhatsApp…";
      btn.disabled = true;

      window.open(url, "_blank");

      setTimeout(function () {
        btn.innerHTML = original;
        btn.disabled = false;
        form.reset();
        // volta as labels flutuantes ao estado inicial
        form.querySelectorAll(".form__field").forEach(function (f) {
          f.classList.remove("has-error");
        });
      }, 1600);
    });

    // Limpa o erro ao digitar
    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        showError(field, false);
      });
    });
  }
})();
