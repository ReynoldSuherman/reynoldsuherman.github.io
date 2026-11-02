/* ==========================================================================
   Reeinold Portfolio — app shell
   Theme switching, seamless page transitions, reveals, lightbox, filters.
   ========================================================================== */
(function () {
    'use strict';

    var APP_VERSION = '20261102-v1';
    var THEME_KEY = 'rrn-theme';
    var THEME_FILES = { modern: 'Theme.css', classic: 'Style.css' };
    var MAIN_PAGES = ['index.html', 'About.html', 'Portofolio.html', ''];

    function withCacheBust(fileName) {
        return fileName + '?v=' + APP_VERSION;
    }

    /* ---------------------------------------------------------------------
       Theme
       --------------------------------------------------------------------- */
    function readTheme() {
        try {
            return localStorage.getItem(THEME_KEY) === 'classic' ? 'classic' : 'modern';
        } catch (e) {
            return 'modern';
        }
    }

    function syncThemeButtons(theme) {
        document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-choice') === theme ? 'true' : 'false');
        });
    }

    function swapStylesheet(theme) {
        var href = THEME_FILES[theme] || THEME_FILES.modern;
        var finalHref = withCacheBust(href);
        var current = document.getElementById('theme-css');

        if (current && current.getAttribute('href') === finalHref) return;

        var next = document.createElement('link');
        next.id = 'theme-css';
        next.rel = 'stylesheet';
        next.href = finalHref;
        next.addEventListener('load', function () {
            if (current && current.parentNode) current.parentNode.removeChild(current);
        });
        next.addEventListener('error', function () {
            if (current && current.parentNode) current.parentNode.removeChild(current);
        });

        document.head.appendChild(next);
    }

    function setTheme(theme, options) {
        var next = theme === 'classic' ? 'classic' : 'modern';
        var current = document.documentElement.getAttribute('data-theme');

        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }

        if (current !== next || (options && options.force)) {
            swapStylesheet(next);
        }

        syncThemeButtons(next);

        document.dispatchEvent(new CustomEvent('rrn:themechange', { detail: { theme: next } }));

        // Re-check reveal elements: classic has no reveal styling, but this keeps
        // anything already observed in a sane state.
        requestAnimationFrame(function () {
            document.querySelectorAll('[data-reveal]').forEach(function (el) {
                el.classList.add('is-visible');
            });
        });
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-theme-choice]') : null;
        if (!btn) return;
        e.preventDefault();
        setTheme(btn.getAttribute('data-theme-choice'));
    });

    /* ---------------------------------------------------------------------
       Page transition progress bar
       --------------------------------------------------------------------- */
    var progressBar = null;

    function ensureProgressBar() {
        if (progressBar) return progressBar;

        if (!document.getElementById('rrn-progress-styles')) {
            var style = document.createElement('style');
            style.id = 'rrn-progress-styles';
            style.textContent =
                '#rrn-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;' +
                'background:linear-gradient(90deg,#6b8e23,#cbe86b);transform-origin:left;' +
                'transform:scaleX(0);opacity:0;pointer-events:none;}';
            document.head.appendChild(style);
        }

        progressBar = document.createElement('div');
        progressBar.id = 'rrn-progress';
        progressBar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progressBar);
        return progressBar;
    }

    function startProgress() {
        var bar = ensureProgressBar();
        bar.style.transition = 'none';
        bar.style.opacity = '1';
        bar.style.transform = 'scaleX(0)';
        requestAnimationFrame(function () {
            bar.style.transition = 'transform .5s ease';
            bar.style.transform = 'scaleX(.7)';
        });
    }

    function finishProgress() {
        var bar = ensureProgressBar();
        bar.style.transition = 'transform .3s ease, opacity .4s ease .1s';
        bar.style.transform = 'scaleX(1)';
        setTimeout(function () {
            bar.style.opacity = '0';
        }, 220);
    }

    /* ---------------------------------------------------------------------
       Reveal on scroll
       --------------------------------------------------------------------- */
    var revealObserver = null;

    function initReveal() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (revealObserver) revealObserver.disconnect();

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

        items.forEach(function (el, index) {
            el.style.setProperty('--reveal-delay', (index % 5) * 70 + 'ms');
            revealObserver.observe(el);
        });

        // Safety net: never leave content invisible.
        setTimeout(function () {
            items.forEach(function (el) {
                var rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.95) el.classList.add('is-visible');
            });
        }, 2200);
    }

    function revealAll() {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ---------------------------------------------------------------------
       Lightbox (project galleries)
       --------------------------------------------------------------------- */
    var lightbox = null;

    function injectLightboxStyles() {
        if (document.getElementById('rrn-lightbox-styles')) return;
        var style = document.createElement('style');
        style.id = 'rrn-lightbox-styles';
        style.textContent = [
            '#rrn-lightbox{position:fixed;inset:0;z-index:9500;display:grid;place-items:center;padding:24px;background:rgba(15,19,9,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:rrnLbFade .25s ease}',
            '#rrn-lightbox img{max-width:min(1180px,94vw);max-height:78vh;width:auto;height:auto;border-radius:14px;box-shadow:0 40px 100px -30px rgba(0,0,0,.9);border:1px solid rgba(203,232,107,.28);animation:rrnLbUp .35s cubic-bezier(.2,.7,.2,1)}',
            '#rrn-lightbox .rrn-lb-caption{margin-top:16px;text-align:center;color:#e6efd4;font-family:var(--font-mono,"SUSE Mono",monospace);font-size:.8rem;letter-spacing:.06em}',
            '#rrn-lightbox .rrn-lb-caption strong{display:block;color:#fff;font-family:var(--font-body,Rubik,sans-serif);font-size:1rem;letter-spacing:0;margin-bottom:4px}',
            '#rrn-lightbox .rrn-lb-close{position:fixed;top:18px;right:18px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.1);color:#fff;font-size:22px;line-height:1;cursor:pointer;transition:background .2s,transform .2s}',
            '#rrn-lightbox .rrn-lb-close:hover{background:rgba(255,255,255,.24);transform:rotate(90deg)}',
            '#rrn-lightbox .rrn-lb-nav{position:fixed;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:20px;cursor:pointer;transition:background .2s}',
            '#rrn-lightbox .rrn-lb-nav:hover{background:rgba(255,255,255,.22)}',
            '#rrn-lightbox .rrn-lb-prev{left:18px}',
            '#rrn-lightbox .rrn-lb-next{right:18px}',
            '@keyframes rrnLbFade{from{opacity:0}to{opacity:1}}',
            '@keyframes rrnLbUp{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:none}}',
            '@media(max-width:640px){#rrn-lightbox .rrn-lb-nav{display:none}#rrn-lightbox img{max-height:70vh}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.remove();
        lightbox = null;
        document.body.style.overflow = '';
    }

    function openLightbox(items, index) {
        injectLightboxStyles();
        closeLightbox();

        var current = index;

        lightbox = document.createElement('div');
        lightbox.id = 'rrn-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Pratinjau gambar project');

        lightbox.innerHTML =
            '<button type="button" class="rrn-lb-close" aria-label="Tutup">&times;</button>' +
            (items.length > 1 ? '<button type="button" class="rrn-lb-nav rrn-lb-prev" aria-label="Sebelumnya">‹</button><button type="button" class="rrn-lb-nav rrn-lb-next" aria-label="Berikutnya">›</button>' : '') +
            '<div class="rrn-lb-stage"><img alt=""><div class="rrn-lb-caption"><strong></strong><span></span></div></div>';

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        var img = lightbox.querySelector('img');
        var capTitle = lightbox.querySelector('.rrn-lb-caption strong');
        var capSub = lightbox.querySelector('.rrn-lb-caption span');

        function render() {
            var item = items[current];
            img.src = item.src;
            img.alt = item.alt || '';
            capTitle.textContent = item.title || '';
            capSub.textContent = item.sub || '';
        }

        function go(delta) {
            current = (current + delta + items.length) % items.length;
            render();
        }

        render();

        lightbox.querySelector('.rrn-lb-close').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        var prev = lightbox.querySelector('.rrn-lb-prev');
        var next = lightbox.querySelector('.rrn-lb-next');
        if (prev) prev.addEventListener('click', function () { go(-1); });
        if (next) next.addEventListener('click', function () { go(1); });

        function onKey(e) {
            if (e.key === 'Escape') { closeLightbox(); document.removeEventListener('keydown', onKey); }
            if (e.key === 'ArrowRight' && items.length > 1) go(1);
            if (e.key === 'ArrowLeft' && items.length > 1) go(-1);
        }
        document.addEventListener('keydown', onKey);
    }

    function initLightbox() {
        document.addEventListener('click', function (e) {
            var item = e.target.closest ? e.target.closest('.gallery-item') : null;
            if (!item) return;

            var img = item.querySelector('img');
            if (!img) return;

            e.preventDefault();

            var gallery = item.parentElement;
            var siblings = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));
            var items = siblings.map(function (node) {
                var thumb = node.querySelector('img');
                var title = node.querySelector('.gallery-overlay h4');
                var sub = node.querySelector('.gallery-overlay p');
                return {
                    src: thumb ? thumb.src : '',
                    alt: thumb ? thumb.alt : '',
                    title: title ? title.textContent : '',
                    sub: sub ? sub.textContent : ''
                };
            });

            openLightbox(items, siblings.indexOf(item));
        });
    }

    /* ---------------------------------------------------------------------
       Portfolio filters
       --------------------------------------------------------------------- */
    function initFilters() {
        var buttons = document.querySelectorAll('.filter-btn[data-filter]');
        if (!buttons.length) return;

        var cards = document.querySelectorAll('.project[data-categories]');
        var empty = document.getElementById('filter-empty');

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-filter');

                buttons.forEach(function (b) {
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });

                var visible = 0;
                cards.forEach(function (card) {
                    var cats = (card.getAttribute('data-categories') || '').split(/\s+/);
                    var match = filter === 'all' || cats.indexOf(filter) !== -1;
                    card.classList.toggle('is-filtered-out', !match);
                    if (match) {
                        visible++;
                        card.style.animation = 'none';
                        void card.offsetWidth;
                        card.style.animation = '';
                    }
                });

                if (empty) empty.hidden = visible !== 0;
            });
        });
    }

    /* ---------------------------------------------------------------------
       Seamless navigation between the three main pages
       --------------------------------------------------------------------- */
    var navigating = false;

    function isInternalPage(anchor) {
        if (!anchor || !anchor.href) return false;
        if (anchor.target && anchor.target !== '_self') return false;
        if (anchor.hasAttribute('download')) return false;

        var url;
        try { url = new URL(anchor.href, window.location.href); } catch (e) { return false; }

        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false;

        var file = url.pathname.split('/').pop();
        return MAIN_PAGES.indexOf(file) !== -1;
    }

    function scrollTop() {
        var root = document.documentElement;
        var previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previous;
    }

    function bootPage() {
        function safe(label, fn) {
            try { fn(); } catch (err) {
                if (window.console && console.warn) console.warn('[portfolio] ' + label + ' failed', err);
            }
        }

        safe('page', function () {
            if (window.PortfolioPage && typeof window.PortfolioPage.initPage === 'function') {
                window.PortfolioPage.initPage();
            }
        });
        safe('github-tracker', function () {
            if (window.GitHubTracker && typeof window.GitHubTracker.init === 'function') {
                window.GitHubTracker.init();
            }
        });
        safe('github-pulse', function () {
            if (window.GitHubPulse && typeof window.GitHubPulse.init === 'function') {
                window.GitHubPulse.init();
            }
        });
        safe('reveal', initReveal);
        safe('filters', initFilters);

        syncThemeButtons(document.documentElement.getAttribute('data-theme') || 'modern');
        document.querySelectorAll('[data-year]').forEach(function (node) {
            node.textContent = String(new Date().getFullYear());
        });
    }

    function loadPage(url, push) {
        if (navigating) return;
        navigating = true;
        startProgress();

        var targetHash = '';
        try { targetHash = new URL(url, window.location.href).hash; } catch (e) { /* ignore */ }

        fetch(url, { credentials: 'same-origin' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var nextPage = doc.getElementById('page');
                var currentPage = document.getElementById('page');

                if (!nextPage || !currentPage) throw new Error('Missing page container');

                // Fade the outgoing page out before swapping, so navigation
                // feels continuous instead of a hard cut.
                currentPage.classList.add('is-leaving');

                return new Promise(function (resolve) {
                    setTimeout(function () {
                        document.adoptNode(nextPage);
                        currentPage.replaceWith(nextPage);

                        nextPage.classList.add('page-enter');
                        setTimeout(function () {
                            nextPage.classList.remove('page-enter');
                        }, 640);

                        if (doc.title) document.title = doc.title;

                        var nextDescription = doc.querySelector('meta[name="description"]');
                        var currentDescription = document.querySelector('meta[name="description"]');
                        if (nextDescription && currentDescription) {
                            currentDescription.setAttribute('content', nextDescription.getAttribute('content') || '');
                        }

                        if (push) {
                            try { history.pushState({ soft: true }, '', url); } catch (e) { /* ignore */ }
                        }

                        scrollTop();
                        bootPage();

                        if (targetHash) {
                            var target = document.querySelector(targetHash);
                            if (target) {
                                requestAnimationFrame(function () {
                                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                });
                            }
                        }

                        finishProgress();
                        resolve();
                    }, 150);
                });
            })
            .catch(function () {
                // Anything unexpected: fall back to a real navigation.
                window.location.href = url;
            })
            .then(function () {
                navigating = false;
            });
    }

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var anchor = e.target.closest ? e.target.closest('a[href]') : null;
        if (!anchor || !isInternalPage(anchor)) return;

        // Let the lightbox / music player swallow their own clicks.
        if (anchor.closest('#rrn-music') || anchor.closest('#rrn-lightbox')) return;

        e.preventDefault();
        loadPage(anchor.href, true);
    });

    window.addEventListener('popstate', function () {
        var file = window.location.pathname.split('/').pop();
        if (MAIN_PAGES.indexOf(file) !== -1) {
            loadPage(window.location.href, false);
        } else {
            // We landed on a page that this shell does not own (docs, etc.).
            window.location.reload();
        }
    });

    // Prefetch main pages on hover so transitions feel instant.
    var prefetched = {};
    document.addEventListener('mouseover', function (e) {
        var anchor = e.target.closest ? e.target.closest('a[href]') : null;
        if (!anchor || !isInternalPage(anchor)) return;
        if (prefetched[anchor.href]) return;
        prefetched[anchor.href] = true;
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = anchor.href;
        document.head.appendChild(link);
    });

    /* ---------------------------------------------------------------------
       Init
       --------------------------------------------------------------------- */
    function init() {
        setTheme(readTheme(), { force: false });

        var year = new Date().getFullYear();
        document.querySelectorAll('[data-year]').forEach(function (node) {
            node.textContent = String(year);
        });

        initReveal();
        initLightbox();
        initFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    // Expose a tiny API for debugging / other modules.
    window.RRN = {
        setTheme: setTheme,
        revealAll: revealAll,
        loadPage: loadPage
    };
})();
