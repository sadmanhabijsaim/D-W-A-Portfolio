/**
 * Sadman Habij Saim — Interactive Portfolio
 * 
 * Features:
 * - ScrollSpy active navigation link highlighting
 * - IntersectionObserver-triggered skill progress bar animations
 * - Interactive testimonial carousel dots & contact form submission handler
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ==========================================================================
  // Interactive UI Systems (ScrollSpy, Skills, Testimonials, Form)
  // ==========================================================================

  /**
   * Sets up ScrollSpy to automatically highlight active navigation item
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], #skills');
    const navLinks = document.querySelectorAll('.nav-link');

    function checkActiveSection() {
      const scrollPos = window.scrollY + 200;
      let currentSectionId = 'home';

      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', checkActiveSection, { passive: true });
    checkActiveSection();
  }

  /**
   * Scrubs the pipeline line and background depth with scroll.
   */
  function initScrollLinkedMotion() {
    const processSection = document.getElementById('process');
    const processLine = document.querySelector('.process-track-line');
    const backgroundLayer = document.getElementById('canvas-container');
    const worldCanvas = document.getElementById('network-world-canvas');
    const worldContext = worldCanvas?.getContext('2d');
    if (!processSection && !backgroundLayer) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = null;
    let scrollListenersAttached = false;

    function renderNetworkWorld(progress) {
      if (!worldCanvas || !worldContext) return;

      const bounds = worldCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(bounds.width * pixelRatio);
      const pixelHeight = Math.round(bounds.height * pixelRatio);
      if (!pixelWidth || !pixelHeight) return;
      if (worldCanvas.width !== pixelWidth || worldCanvas.height !== pixelHeight) {
        worldCanvas.width = pixelWidth;
        worldCanvas.height = pixelHeight;
      }

      worldContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      worldContext.clearRect(0, 0, bounds.width, bounds.height);

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const radius = Math.min(bounds.width, bounds.height) * 0.24;
      const rotateY = progress * Math.PI * 3.4;
      const rotateX = progress * Math.PI * 1.25;
      const sinY = Math.sin(rotateY);
      const cosY = Math.cos(rotateY);
      const sinX = Math.sin(rotateX);
      const cosX = Math.cos(rotateX);

      function project(point, scale = 1, includeBack = false) {
        const x = (point.x * cosY + point.z * sinY) * scale;
        const depthY = (-point.x * sinY + point.z * cosY) * scale;
        const y = point.y * scale * cosX - depthY * sinX;
        const depth = (point.y * sinX + depthY * cosX) * scale;
        if (!includeBack && depth <= 0) return null;

        const perspective = 2.5 / (2.5 - depth * 0.45);
        return {
          x: centerX + x * radius * perspective,
          y: centerY - y * radius * perspective,
          depth
        };
      }

      function toPoint(latitude, longitude) {
        const lat = latitude * Math.PI / 180;
        const lon = longitude * Math.PI / 180;
        return {
          x: Math.cos(lat) * Math.sin(lon),
          y: Math.sin(lat),
          z: Math.cos(lat) * Math.cos(lon)
        };
      }

      function drawSurfaceLine(start, end, opacity, width) {
        const first = project(start);
        const last = project(end);
        if (!first || !last) return;

        const depthOpacity = opacity * (0.3 + ((first.depth + last.depth) / 2) * 0.7);
        worldContext.beginPath();
        worldContext.moveTo(first.x, first.y);
        worldContext.lineTo(last.x, last.y);
        worldContext.strokeStyle = `rgba(98, 199, 255, ${depthOpacity})`;
        worldContext.lineWidth = width;
        worldContext.stroke();
      }

      function drawWaveLine(start, end, opacity, width) {
        worldContext.beginPath();
        worldContext.moveTo(start.x, start.y);
        worldContext.lineTo(end.x, end.y);
        worldContext.strokeStyle = `rgba(98, 199, 255, ${opacity})`;
        worldContext.lineWidth = width;
        worldContext.stroke();
      }

      const cornerAngles = [
        Math.atan2(-centerY, -centerX),
        Math.atan2(-centerY, centerX),
        Math.atan2(centerY, centerX),
        Math.atan2(centerY, -centerX)
      ];
      const rayAngles = [
        ...Array.from({ length: 32 }, (_, index) => (index / 32) * Math.PI * 2),
        ...cornerAngles.map((angle) => (angle + Math.PI * 2) % (Math.PI * 2))
      ].sort((first, last) => first - last).filter((angle, index, angles) =>
        index === 0 || angle - angles[index - 1] > 0.001
      );
      const waveSegments = 12;
      const startDistance = radius * 1.08;
      const networkRays = rayAngles.map((angle) => {
        const horizontalReach = Math.abs(Math.cos(angle)) > 0.001
          ? centerX / Math.abs(Math.cos(angle))
          : Infinity;
        const verticalReach = Math.abs(Math.sin(angle)) > 0.001
          ? centerY / Math.abs(Math.sin(angle))
          : Infinity;
        const endDistance = Math.min(horizontalReach, verticalReach);

        return Array.from({ length: waveSegments + 1 }, (_, segment) => {
          const progressAlongRay = segment / waveSegments;
          const distance = startDistance + (endDistance - startDistance) * progressAlongRay;
          const waveOffset = Math.sin(
            distance / (radius * 0.75) - progress * Math.PI * 3 + angle * 2.5
          ) * radius * 0.07 * progressAlongRay;
          return {
            x: centerX + Math.cos(angle) * distance - Math.sin(angle) * waveOffset,
            y: centerY + Math.sin(angle) * distance + Math.cos(angle) * waveOffset,
            progressAlongRay
          };
        });
      });

      networkRays.forEach((ray, rayIndex) => {
        const nextRay = networkRays[(rayIndex + 1) % networkRays.length];
        ray.forEach((point, segment) => {
          const fade = 1 - point.progressAlongRay * 0.48;
          if (segment % 2 === 0 || segment === waveSegments) {
            worldContext.beginPath();
            worldContext.arc(point.x, point.y, 0.9 + fade * 0.55, 0, Math.PI * 2);
            worldContext.fillStyle = `rgba(139, 228, 255, ${fade * 0.34})`;
            worldContext.fill();
          }

          if (segment < waveSegments) {
            drawWaveLine(point, ray[segment + 1], fade * 0.32, 0.8);
            if (rayIndex % 2 === 0) {
              drawWaveLine(point, nextRay[segment], fade * 0.18, 0.7);
            }
            if ((rayIndex + segment) % 2 === 0) {
              drawWaveLine(point, nextRay[segment + 1], fade * 0.13, 0.65);
            }
          }
        });

        const pulseProgress = (progress * 1.7 + (rayIndex % 8) / 8) % 1;
        const pulseSegment = pulseProgress * waveSegments;
        const pulseIndex = Math.min(Math.floor(pulseSegment), waveSegments - 1);
        const pulseBlend = pulseSegment - pulseIndex;
        const pulseStart = ray[pulseIndex];
        const pulseEnd = ray[pulseIndex + 1];
        const pulseX = pulseStart.x + (pulseEnd.x - pulseStart.x) * pulseBlend;
        const pulseY = pulseStart.y + (pulseEnd.y - pulseStart.y) * pulseBlend;
        worldContext.shadowColor = 'rgba(139, 228, 255, 0.9)';
        worldContext.shadowBlur = 7;
        worldContext.beginPath();
        worldContext.arc(pulseX, pulseY, 2.2, 0, Math.PI * 2);
        worldContext.fillStyle = 'rgba(187, 240, 255, 0.9)';
        worldContext.fill();
        worldContext.shadowBlur = 0;
      });

      const spherePath = new Path2D();
      spherePath.arc(centerX, centerY, radius, 0, Math.PI * 2);
      const sphereFill = worldContext.createRadialGradient(
        centerX - radius * 0.38, centerY - radius * 0.42, radius * 0.04,
        centerX, centerY, radius * 1.12
      );
      sphereFill.addColorStop(0, 'rgba(74, 194, 255, 0.18)');
      sphereFill.addColorStop(0.58, 'rgba(34, 111, 178, 0.1)');
      sphereFill.addColorStop(1, 'rgba(4, 14, 34, 0.3)');
      worldContext.fillStyle = sphereFill;
      worldContext.fill(spherePath);

      worldContext.save();
      worldContext.clip(spherePath);

      for (let latitude = -60; latitude <= 60; latitude += 30) {
        for (let longitude = -180; longitude < 180; longitude += 3) {
          drawSurfaceLine(
            toPoint(latitude, longitude),
            toPoint(latitude, longitude + 3),
            0.24,
            0.7
          );
        }
      }

      for (let longitude = -180; longitude < 180; longitude += 30) {
        for (let latitude = -90; latitude < 90; latitude += 3) {
          drawSurfaceLine(
            toPoint(latitude, longitude),
            toPoint(latitude + 3, longitude),
            0.24,
            0.7
          );
        }
      }

      const latitudes = [-72, -54, -36, -18, 0, 18, 36, 54, 72];
      const longitudes = Array.from({ length: 18 }, (_, index) => index * 20);
      const network = latitudes.map((latitude) =>
        longitudes.map((longitude) => toPoint(latitude, longitude))
      );

      network.forEach((row, rowIndex) => {
        row.forEach((point, columnIndex) => {
          drawSurfaceLine(point, row[(columnIndex + 1) % row.length], 0.62, 1);
          if (rowIndex < network.length - 1) {
            drawSurfaceLine(point, network[rowIndex + 1][columnIndex], 0.62, 1);
            if (columnIndex % 2 === 0) {
              drawSurfaceLine(
                point,
                network[rowIndex + 1][(columnIndex + 1) % row.length],
                0.42,
                0.85
              );
            }
          }
        });
      });

      network.flat().forEach((point) => {
        const projected = project(point);
        if (!projected) return;

        worldContext.beginPath();
        worldContext.arc(projected.x, projected.y, 1.2 + projected.depth * 0.9, 0, Math.PI * 2);
        worldContext.fillStyle = `rgba(139, 228, 255, ${0.42 + projected.depth * 0.46})`;
        worldContext.fill();
      });

      const shade = worldContext.createRadialGradient(
        centerX - radius * 0.28, centerY - radius * 0.34, radius * 0.18,
        centerX, centerY, radius * 1.08
      );
      shade.addColorStop(0, 'rgba(1, 8, 24, 0)');
      shade.addColorStop(0.72, 'rgba(1, 8, 24, 0.04)');
      shade.addColorStop(1, 'rgba(1, 8, 24, 0.4)');
      worldContext.fillStyle = shade;
      worldContext.fill(spherePath);
      worldContext.restore();

      worldContext.beginPath();
      worldContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
      worldContext.strokeStyle = 'rgba(125, 214, 255, 0.56)';
      worldContext.lineWidth = 1;
      worldContext.stroke();
    }

    function renderFinalState() {
      processLine?.style.setProperty('--pipeline-fill', '1');
      backgroundLayer?.style.setProperty('--scroll-parallax-y', '0px');
      backgroundLayer?.style.setProperty('--scroll-parallax-x', '0px');
      backgroundLayer?.style.setProperty('--scroll-rotate-x', '52deg');
      backgroundLayer?.style.setProperty('--scroll-rotate-y', '0deg');
      backgroundLayer?.style.setProperty('--scroll-scale', '1');
      renderNetworkWorld(0);
    }

    function getSectionProgress(section) {
      const { top, height } = section.getBoundingClientRect();
      return Math.min(Math.max((window.innerHeight - top) / (window.innerHeight + height), 0), 1);
    }

    function renderScrollState() {
      animationFrame = null;
      if (motionQuery.matches) {
        renderFinalState();
        return;
      }

      if (processSection && processLine) {
        processLine.style.setProperty('--pipeline-fill', getSectionProgress(processSection).toFixed(4));
      }

      if (backgroundLayer) {
        const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const pageProgress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
        const centeredProgress = pageProgress * 2 - 1;
        renderNetworkWorld(pageProgress);
        backgroundLayer.style.setProperty('--scroll-parallax-y', `${(-pageProgress * 64).toFixed(2)}px`);
        backgroundLayer.style.setProperty('--scroll-parallax-x', `${(centeredProgress * 18).toFixed(2)}px`);
        backgroundLayer.style.setProperty('--scroll-rotate-x', `${(52 + pageProgress * 14).toFixed(2)}deg`);
        backgroundLayer.style.setProperty('--scroll-rotate-y', `${(centeredProgress * 4).toFixed(2)}deg`);
        backgroundLayer.style.setProperty('--scroll-scale', `${(1 + pageProgress * 0.04).toFixed(3)}`);
      }
    }

    function scheduleRender() {
      if (animationFrame === null) animationFrame = requestAnimationFrame(renderScrollState);
    }

    function attachScrollListeners() {
      if (scrollListenersAttached) return;
      scrollListenersAttached = true;
      window.addEventListener('scroll', scheduleRender, { passive: true });
      window.addEventListener('resize', scheduleRender, { passive: true });
      scheduleRender();
    }

    function detachScrollListeners() {
      if (!scrollListenersAttached) return;
      scrollListenersAttached = false;
      window.removeEventListener('scroll', scheduleRender);
      window.removeEventListener('resize', scheduleRender);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    function handleMotionPreferenceChange(event) {
      if (event.matches) {
        detachScrollListeners();
        renderFinalState();
      } else {
        attachScrollListeners();
      }
    }

    function cleanup() {
      detachScrollListeners();
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
      window.removeEventListener('pagehide', cleanup);
    }

    motionQuery.addEventListener('change', handleMotionPreferenceChange);
    window.addEventListener('pagehide', cleanup, { once: true });
    if (motionQuery.matches) renderFinalState();
    else attachScrollListeners();
  }

  /**
   * Interactive Contact Form Handling
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('btn-submit-message');
    const emailJsConfig = {
      serviceId: 'service_d77hywy',
      templateId: 'template_epmroh9',
      publicKey: '7BRV3z0UaB8ZzFp2e',
      recipientEmail: 'sadmansiam260@gmail.com'
    };

    if (!form || !feedback) return;

    const animateSentMessage = () => {
      if (prefersReducedMotion || !submitBtn) return;

      const sendIcon = submitBtn.querySelector('svg');
      sendIcon?.animate([
        { transform: 'translate(0, 0) rotate(0) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate(-3px, 3px) rotate(-12deg) scale(0.9)', opacity: 1, offset: 0.18 },
        {
          transform: 'translate(3px, -2px) rotate(8deg) scale(1.05)',
          opacity: 1,
          filter: 'drop-shadow(-2px 3px 3px rgba(0, 240, 255, 0.8))',
          offset: 0.4
        },
        {
          transform: 'translate(16px, -18px) rotate(30deg) scale(0.45)',
          opacity: 0,
          filter: 'drop-shadow(-3px 4px 5px rgba(0, 240, 255, 0.8))',
          offset: 1
        }
      ], {
        duration: 850,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      });
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const originalButtonMarkup = submitBtn?.innerHTML;
      let messageSentSuccessfully = false;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;
      }

      feedback.className = 'form-feedback';
      feedback.textContent = '';
      feedback.style.display = 'none';

      try {
        const formData = new FormData(form);
        const templateParams = Object.fromEntries(formData);
        const company = templateParams.company;
        delete templateParams.company;
        templateParams.from_name = templateParams.name;
        templateParams.reply_to = templateParams.email;
        templateParams.email_subject = templateParams.subject;
        templateParams.to_email = emailJsConfig.recipientEmail;

        if (typeof company === 'string' && company.trim()) {
          feedback.className = 'form-feedback success';
          feedback.textContent = 'Message sent successfully. Sadman will get back to you shortly.';
          feedback.style.display = 'block';
          form.reset();
          return;
        }

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: emailJsConfig.serviceId,
            template_id: emailJsConfig.templateId,
            user_id: emailJsConfig.publicKey,
            template_params: templateParams
          })
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || `Could not send your message (HTTP ${response.status}).`);
        }

        messageSentSuccessfully = true;
        feedback.className = 'form-feedback success';
        feedback.textContent = 'Message sent successfully. Sadman will get back to you shortly.';
        feedback.style.display = 'block';
        form.reset();
      } catch (error) {
        feedback.className = 'form-feedback error';
        feedback.textContent = error instanceof TypeError
          ? 'Could not connect to EmailJS. Please try again or email Sadman directly.'
          : error.message || 'Could not send your message. Please try again.';
        feedback.style.display = 'block';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalButtonMarkup;
          if (messageSentSuccessfully) animateSentMessage();
        }
      }
    });
  }

  /**
   * Scroll reveal: replays portfolio content while it enters the viewport
   */
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.glass-card, .floating-stat-card, .meta-item, .skill-row, .academic-entry, .achievement-item, .process-step, .channel-item, footer'
    );
    if (!revealTargets.length) return;

    revealTargets.forEach((el) => el.classList.add('reveal-card'));
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /**
   * Mobile hamburger menu toggle with click-outside dismissal
   */
  function initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    drawer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Back-to-top button smooth scroll
   */
  function initBackToTop() {
    const btn = document.getElementById('btn-back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Theme toggle with localStorage persistence.
   */
  function initThemeToggle() {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;

    const root = document.documentElement;
    const storageKey = 'portfolio-theme';

    function updateTheme(theme) {
      const isLight = theme === 'light';
      root.dataset.theme = isLight ? 'light' : 'dark';
      root.style.colorScheme = isLight ? 'light' : 'dark';
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      btn.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      try {
        localStorage.setItem(storageKey, root.dataset.theme);
      } catch {
        // Theme switching still works when storage is disabled or unavailable.
      }
    }

    btn.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      updateTheme(nextTheme);
    });

    updateTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  }

  /**
   * Certificate card previews and responsive lightbox.
   */
  function initCertificateLightbox() {
    const lightbox = document.getElementById('certificate-lightbox');
    const documentFrame = document.getElementById('certificate-lightbox-document');
    const title = document.getElementById('certificate-lightbox-title');
    const cards = document.querySelectorAll('.certificate-card');
    if (!lightbox || !documentFrame || !title || !cards.length) return;

    let lastTrigger = null;

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      if (lastTrigger) lastTrigger.focus();
    }

    function openLightbox(card) {
      const source = card.dataset.certificateSrc;
      if (!source) return;
      lastTrigger = card;
      documentFrame.src = encodeURI(source);
      documentFrame.title = card.dataset.certificateTitle || 'Certificate preview';
      title.textContent = documentFrame.title;
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      lightbox.querySelector('.certificate-lightbox-close').focus();
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => openLightbox(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(card);
        }
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach((element) => {
      element.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  /**
   * Pointer-driven parallax for the isolated hero technology composition.
   */
  function initTechComposition() {
    const composition = document.getElementById('tech-composition');
    const items = composition ? Array.from(composition.querySelectorAll('.tech-item')) : [];
    if (!composition || !items.length || prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = null;

    function renderParallax() {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      items.forEach((item) => {
        const depth = Number(item.dataset.depth) || 0.5;
        item.style.setProperty('--parallax-x', `${currentX}px`);
        item.style.setProperty('--parallax-y', `${currentY}px`);
        item.style.setProperty('--parallax-rotate-x', `${currentY * -0.08}deg`);
        item.style.setProperty('--parallax-rotate-y', `${currentX * 0.08}deg`);
        item.style.setProperty('--depth', depth);
      });

      const settling = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (settling) {
        animationFrame = requestAnimationFrame(renderParallax);
      } else {
        animationFrame = null;
      }
    }

    function requestParallaxFrame() {
      if (animationFrame === null) animationFrame = requestAnimationFrame(renderParallax);
    }

    composition.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = composition.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 34;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 26;
      requestParallaxFrame();
    });

    composition.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      requestParallaxFrame();
    });
  }

  /**
   * Initialize all modules
   */
  function init() {
    // Initialize UI interactions
    initScrollSpy();
    initScrollLinkedMotion();
    initContactForm();
    initScrollReveal();
    initHamburger();
    initBackToTop();
    initThemeToggle();
    initCertificateLightbox();
    initTechComposition();
    initNavbarDockMagnification();
    initTokiChat();
  }

  function initTokiChat() {
    const panel = document.getElementById('toki-panel');
    const launcher = document.querySelector('.toki-launcher');
    const closeButton = document.querySelector('.toki-close');
    const minimizeButton = document.querySelector('.toki-minimize');
    const expandButton = document.querySelector('.toki-expand');
    const form = document.getElementById('toki-form');
    const input = document.getElementById('toki-input');
    const messages = document.getElementById('toki-messages');
    if (!panel || !launcher || !form || !input || !messages) return;

    const portfolioLinks = {
      home: { actionLabel: 'View portfolio', href: '#home' },
      about: { actionLabel: 'View profile', href: '#about' },
      skills: { actionLabel: 'View skills', href: '#skills' },
      education: { actionLabel: 'View education', href: '#education' },
      certificates: { actionLabel: 'View certificates', href: '#education' },
      projects: { actionLabel: 'View projects', href: '#projects' },
      mealMaster: { actionLabel: 'View MealMaster Pro', href: 'https://mealhishab.netlify.app/' },
      github: { actionLabel: 'View GitHub', href: 'https://github.com/sadmanhabijsaim' },
      linkedin: { actionLabel: 'View LinkedIn', href: 'https://www.linkedin.com/in/sadman-habij-saimsiam/' },
      cv: { actionLabel: 'View CV', href: '/cv-sadman354.pdf' },
      contact: { actionLabel: 'View contact', href: '#contact' },
      email: { actionLabel: 'Email Sadman', href: 'mailto:sadmansiam260@gmail.com' }
    };

    const setMinimized = (minimized) => {
      panel.classList.toggle('is-minimized', minimized);
      minimizeButton?.setAttribute('aria-expanded', String(!minimized));
      minimizeButton?.setAttribute('aria-label', minimized ? 'Restore Toki chat' : 'Minimize Toki chat');
      if (!minimized && !panel.hidden) input.focus();
    };
    const setExpanded = (expanded) => {
      panel.classList.toggle('is-expanded', expanded);
      expandButton?.setAttribute('aria-pressed', String(expanded));
      expandButton?.setAttribute('aria-label', expanded ? 'Restore Toki chat size' : 'Expand Toki chat');
      expandButton?.setAttribute('title', expanded ? 'Restore size' : 'Expand');
    };
    const setOpen = (open) => {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      launcher.setAttribute('aria-label', open ? 'Close Toki chat' : 'Open Toki chat');
      if (!open) {
        setMinimized(false);
        setExpanded(false);
      }
      if (open) input.focus();
    };
    const addBubble = (text, kind, extraClass = '', linkIds = []) => {
      const bubble = document.createElement('p');
      bubble.className = `toki-bubble toki-${kind}${extraClass ? ` ${extraClass}` : ''}`;
      bubble.textContent = text;

      if (kind === 'bot' && Array.isArray(linkIds)) {
        const links = linkIds.map((id) => portfolioLinks[id]).filter(Boolean);
        links.forEach((link, index) => {
          bubble.append(document.createTextNode(index === 0 ? ' ' : ' · '));

          const anchor = document.createElement('a');
          anchor.className = 'toki-inline-link';
          anchor.href = link.href;
          anchor.textContent = link.actionLabel;
          if (/^https:\/\//i.test(link.href)) {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
          }
          bubble.appendChild(anchor);
        });
      }

      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    };

    launcher.addEventListener('click', () => setOpen(panel.hidden));
    closeButton?.addEventListener('click', () => setOpen(false));
    minimizeButton?.addEventListener('click', () => {
      const minimized = !panel.classList.contains('is-minimized');
      if (minimized) setExpanded(false);
      setMinimized(minimized);
    });
    expandButton?.addEventListener('click', () => {
      setMinimized(false);
      setExpanded(!panel.classList.contains('is-expanded'));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    panel.querySelector('.toki-faq-options')?.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-toki-faq]');
      if (!(button instanceof HTMLButtonElement)) return;
      input.value = button.dataset.tokiFaq || '';
      form.requestSubmit();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      addBubble(message, 'user');
      input.value = '';
      const submitButton = form.querySelector('button[type="submit"]');
      input.disabled = true;
      if (submitButton) submitButton.disabled = true;
      let answer;
      try {
        const response = await fetch('/api/toki', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ query: message })
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || `Toki FAQ request failed (${response.status})`);
        }
        if (typeof payload?.reply !== 'string' || !Array.isArray(payload.links)) {
          throw new Error('Toki FAQ returned an invalid response');
        }
        answer = payload;
      } catch (error) {
        console.error('Unable to request Toki FAQ:', error);
        answer = {
          reply: /[\u0980-\u09FF]/u.test(message)
            ? 'দুঃখিত, উত্তর এখন পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।'
            : 'Sorry, Toki is unavailable right now. Please try again later.',
          links: []
        };
      } finally {
        input.disabled = false;
        if (submitButton) submitButton.disabled = false;
      }
      addBubble(answer.reply, 'bot', '', answer.links);
      input.focus();
    });
  }

  /**
   * macOS Dock Magnification Effect for Navbar Items
   */
  function initNavbarDockMagnification() {
    const dockMenu = document.getElementById('mac-dock-menu');
    if (!dockMenu) return;

    const items = Array.from(dockMenu.querySelectorAll('.dock-nav-item'));
    const MAX_DISTANCE = 85;
    const MAX_SCALE = 1.2;

    function handleMouseMove(e) {
      if (window.innerWidth <= 980) return;
      const mouseX = e.clientX;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - itemCenterX);

        if (dist < MAX_DISTANCE) {
          const norm = dist / MAX_DISTANCE;
          const scale = 1 + (MAX_SCALE - 1) * Math.cos(norm * (Math.PI / 2));
          const icon = item.querySelector('.dock-nav-icon');
          if (icon) {
            icon.style.transform = `scale(${scale.toFixed(3)})`;
          }
        } else {
          const icon = item.querySelector('.dock-nav-icon');
          if (icon) {
            icon.style.transform = 'scale(1)';
          }
        }
      });
    }

    function handleMouseLeave() {
      items.forEach((item) => {
        const icon = item.querySelector('.dock-nav-icon');
        if (icon) {
          icon.style.transform = 'scale(1)';
        }
      });
    }

    dockMenu.addEventListener('mousemove', handleMouseMove, { passive: true });
    dockMenu.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
