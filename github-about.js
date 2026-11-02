/* ==========================================================================
   Reeinold Portfolio — "GitHub Pulse" (About page)
   A compact, self-contained GitHub dashboard: stats, language donut,
   and a 14-day activity rhythm. Reuses the tracker's session cache.
   ========================================================================== */
(function () {
    'use strict';

    var USERNAME = 'Reeinold';
    var CACHE_KEY = 'rrn-gh-cache-v2';
    var CACHE_TTL = 10 * 60 * 1000;
    var API = 'https://api.github.com';

    // Ganti path ini kalau mau pakai foto custom lain.
    var COVER_IMAGE = 'Profile1.jpg';
    var COVER_ALT = 'Reynold Suherman';

    var LANG_COLORS = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Java: '#b07219',
        Python: '#3572A5',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        PHP: '#4F5D95',
        Ruby: '#701516',
        Go: '#00ADD8',
        Rust: '#dea584',
        Swift: '#F05138',
        Kotlin: '#A97BFF',
        Dart: '#00B4AB',
        Shell: '#89e051',
        Vue: '#41b883',
        SCSS: '#c6538c',
        Jupyter: '#DA5B0B',
        'Jupyter Notebook': '#DA5B0B',
        Batchfile: '#C1F12E',
        PowerShell: '#012456'
    };

    var FALLBACK_COLORS = ['#6b8e23', '#cbe86b', '#a8c256', '#8ea35c', '#4a5d23', '#b6cf74'];

    var CSS = `
    .gh-pulse{
        --p-ink:#1e2417;
        --p-soft:#5b6350;
        --p-line:#deddc9;
        --p-lime:#cbe86b;
        --p-olive:#4a5d23;
        --p-mono:'SUSE Mono',ui-monospace,monospace;
        position:relative;
        margin-top:clamp(44px,6vw,68px);
        border:1px solid var(--p-line);
        border-radius:24px;
        overflow:hidden;
        background:linear-gradient(180deg,#fffdf7 0%,#f8f6ea 100%);
        color:var(--p-ink);
        box-shadow:0 30px 70px -46px rgba(35,44,18,.55);
        font-family:'Rubik',system-ui,sans-serif;
        isolation:isolate;
    }
    .gh-pulse *{box-sizing:border-box}

    /* ---------------- header ---------------- */
    .ghp-head{
        position:relative;
        display:flex;align-items:center;justify-content:space-between;
        gap:18px;flex-wrap:wrap;
        padding:24px 26px;
        color:#eef3dd;
        background:
            radial-gradient(520px 220px at 92% -30%,rgba(203,232,107,.28),transparent 70%),
            linear-gradient(135deg,#33421a,#4a5d23 55%,#2a3714);
    }
    .ghp-head::after{
        content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.35;
        background-image:radial-gradient(rgba(203,232,107,.22) 1px,transparent 1px);
        background-size:22px 22px;
        -webkit-mask-image:radial-gradient(70% 120% at 80% 0%,#000,transparent 78%);
        mask-image:radial-gradient(70% 120% at 80% 0%,#000,transparent 78%);
    }
    .ghp-id{display:flex;align-items:center;gap:16px;min-width:0}
    .ghp-photo{
        position:relative;flex:0 0 auto;
        width:66px;height:66px;padding:4px;border-radius:8px;
        background:linear-gradient(145deg,#cbe86b,#6b8e23 65%,#4a5d23);
        box-shadow:0 14px 26px -16px rgba(0,0,0,.8);
    }
    .ghp-photo::before{
        content:"";position:absolute;inset:-5px;border-radius:11px;
        border:1px solid rgba(203,232,107,.34);pointer-events:none;
    }
    .ghp-photo img{
        width:100%;height:100%;display:block;border-radius:4px;
        object-fit:cover;filter:saturate(.95) contrast(1.03);
        background:#2a3418;
    }
    .ghp-idtext{min-width:0}
    .ghp-kicker{
        display:flex;align-items:center;gap:7px;
        margin:0 0 4px;
        font-family:var(--p-mono);font-size:9px;font-weight:600;
        letter-spacing:.2em;text-transform:uppercase;color:#b7ca86;
    }
    .ghp-dot{
        width:6px;height:6px;border-radius:50%;background:var(--p-lime);
        box-shadow:0 0 0 0 rgba(203,232,107,.55);
        animation:ghpPulse 2.2s infinite;
    }
    @keyframes ghpPulse{70%{box-shadow:0 0 0 8px rgba(203,232,107,0)}100%{box-shadow:0 0 0 0 rgba(203,232,107,0)}}
    .ghp-idtext h2{
        margin:0;font-size:clamp(1.35rem,2.4vw,1.75rem);
        font-weight:700;letter-spacing:-.025em;color:#f8fbee;
    }
    .ghp-idtext h2 em{font-style:normal;color:var(--p-lime)}
    .ghp-sub{
        margin:5px 0 0;max-width:52ch;
        font-size:.8rem;line-height:1.6;color:#c9d6ae;
    }
    .ghp-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .ghp-handle{
        padding:6px 11px;border-radius:999px;
        border:1px solid rgba(203,232,107,.26);
        background:rgba(255,255,255,.06);
        font-family:var(--p-mono);font-size:.64rem;letter-spacing:.08em;
        color:#dce8c2;white-space:nowrap;
    }
    .ghp-btn{
        display:inline-flex;align-items:center;gap:7px;
        padding:9px 14px;border-radius:999px;
        background:var(--p-lime);color:#1c2410;
        font-family:var(--p-mono);font-size:.66rem;font-weight:600;
        letter-spacing:.06em;text-decoration:none;white-space:nowrap;
        transition:background-color .25s,transform .25s;
    }
    .ghp-btn:hover{background:#dcf58a;transform:translateY(-1px)}
    .ghp-btn span{transition:transform .25s}
    .ghp-btn:hover span{transform:translate(2px,-2px)}

    /* ---------------- stats ---------------- */
    .ghp-stats{
        grid-column:1 / -1;
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
        background:rgba(203,232,107,.08);
        border-bottom:1px solid var(--p-line);
    }
    .ghp-stat{
        display:flex;flex-direction:column;gap:3px;
        padding:18px 22px;border-right:1px solid var(--p-line);
    }
    .ghp-stat:last-child{border-right:0}
    .ghp-num{
        font-family:var(--p-mono);font-size:clamp(1.55rem,2.6vw,2.1rem);
        font-weight:700;line-height:1;color:#3d5220;
        font-variant-numeric:tabular-nums;
    }
    .ghp-lbl{
        font-family:var(--p-mono);font-size:.58rem;letter-spacing:.18em;
        text-transform:uppercase;color:#7c8a63;
    }

    /* ---------------- panels ---------------- */
    .ghp-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
    .ghp-panel{padding:20px 24px 24px;border-right:1px solid var(--p-line);min-width:0}
    .ghp-panel:last-child{border-right:0}
    .ghp-panel-title{
        margin:0 0 14px;
        font-family:var(--p-mono);font-size:.58rem;font-weight:600;
        letter-spacing:.18em;text-transform:uppercase;color:#7c8a63;
    }
    .ghp-lang-wrap{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
    .ghp-donut-wrap{position:relative;flex:0 0 auto;width:138px;height:138px}
    .ghp-donut{display:block;width:100%;height:100%;transform:rotate(-90deg)}
    .ghp-donut circle{fill:none;stroke-width:12;stroke-linecap:butt}
    .ghp-donut-track{stroke:rgba(74,93,35,.1)}
    #ghp-slices circle{
        transition:stroke-dasharray .9s cubic-bezier(.2,.7,.2,1),opacity .25s,stroke-width .25s;
    }
    .ghp-donut-center{
        position:absolute;inset:0;display:grid;place-content:center;
        text-align:center;pointer-events:none;
    }
    #ghp-repo-count{
        display:block;font-family:var(--p-mono);font-size:1.5rem;
        font-weight:700;line-height:1;color:#3d5220;
        font-variant-numeric:tabular-nums;
    }
    .ghp-donut-center small{
        display:block;max-width:88px;margin:0 auto;
        font-family:var(--p-mono);font-size:.52rem;letter-spacing:.18em;
        text-transform:uppercase;color:#8b927c;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .ghp-legend{
        list-style:none;margin:0;padding:0;
        display:grid;gap:4px;flex:1;min-width:150px;
    }
    .ghp-legend button{
        appearance:none;border:0;background:transparent;
        display:flex;align-items:center;gap:9px;width:100%;
        padding:5px 7px;border-radius:8px;cursor:pointer;
        font-family:var(--p-mono);font-size:.7rem;color:#4f5a41;
        text-align:left;
        transition:background-color .2s,color .2s;
    }
    .ghp-legend button:hover,
    .ghp-legend button.is-active{background:rgba(107,142,35,.13);color:#2f3d17}
    .ghp-legend .dot{width:9px;height:9px;border-radius:2px;flex:0 0 auto}
    .ghp-legend .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ghp-legend .pct{color:#7c8a63;font-variant-numeric:tabular-nums}

    /* ---------------- rhythm ---------------- */
    .ghp-bars{
        display:flex;align-items:flex-end;justify-content:space-between;gap:4px;
        height:118px;padding-top:8px;
    }
    .ghp-bar{
        position:relative;flex:0 1 26px;max-width:26px;height:100%;
        display:flex;align-items:flex-end;min-width:0;
    }
    .ghp-bar i{
        display:block;width:100%;min-height:4px;border-radius:3px;
        background:linear-gradient(180deg,#d7f08a,#6b8e23);
        transform:scaleY(0);transform-origin:bottom;
        transition:transform .65s cubic-bezier(.2,.7,.2,1);
        transition-delay:var(--d,0ms);
    }
    .ghp-bar.is-empty i{background:rgba(74,93,35,.13)}
    .ghp-bar.is-today i{background:linear-gradient(180deg,#e7ff9c,#8fb53a)}
    .ghp-bar::after{
        content:attr(data-tip);
        position:absolute;left:50%;bottom:calc(100% + 8px);z-index:3;
        padding:4px 8px;border-radius:6px;
        background:#232c12;color:#eef3dd;
        font-family:var(--p-mono);font-size:.56rem;letter-spacing:.04em;
        white-space:nowrap;pointer-events:none;
        opacity:0;transform:translate(-50%,4px);
        transition:opacity .18s,transform .18s;
    }
    .ghp-bar:hover::after{opacity:1;transform:translate(-50%,0)}
    .ghp-note{
        margin:12px 0 0;
        font-family:var(--p-mono);font-size:.62rem;line-height:1.6;
        color:#8b927c;letter-spacing:.02em;
    }

    /* ---------------- footer ---------------- */
    .ghp-foot{
        display:flex;align-items:center;justify-content:space-between;
        gap:14px;flex-wrap:wrap;
        padding:15px 24px;
        border-top:1px solid var(--p-line);
        background:rgba(255,255,255,.55);
    }
    .ghp-spot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}
    .ghp-spot-label{
        font-family:var(--p-mono);font-size:.54rem;letter-spacing:.2em;
        text-transform:uppercase;color:#8b927c;
    }
    .ghp-spot-link{
        font-size:.86rem;font-weight:600;color:#3d5220;
        text-decoration:none;border-bottom:1px dashed rgba(107,142,35,.5);
    }
    .ghp-spot-link:hover{color:#6b8e23}
    .ghp-spot-meta{
        font-family:var(--p-mono);font-size:.62rem;color:#7c8a63;
        white-space:nowrap;
    }
    .ghp-foot-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
    .ghp-refresh{
        appearance:none;display:inline-flex;align-items:center;gap:6px;
        padding:7px 12px;border-radius:999px;
        border:1px solid var(--p-line);background:transparent;
        font-family:var(--p-mono);font-size:.62rem;font-weight:600;
        letter-spacing:.06em;color:#5b6350;cursor:pointer;
        transition:border-color .2s,color .2s,background-color .2s;
    }
    .ghp-refresh:hover{border-color:rgba(107,142,35,.5);color:#3d5220;background:rgba(107,142,35,.08)}
    .ghp-refresh.is-loading span{display:inline-block;animation:ghpSpin 1s linear infinite}
    @keyframes ghpSpin{to{transform:rotate(360deg)}}
    .ghp-more{
        font-family:var(--p-mono);font-size:.64rem;letter-spacing:.04em;
        color:#4a5d23;text-decoration:none;
    }
    .ghp-more:hover{color:#6b8e23;text-decoration:underline}
    .ghp-more span{display:inline-block;transition:transform .2s}
    .ghp-more:hover span{transform:translateX(3px)}

    /* ---------------- responsive ---------------- */
    @media (max-width:860px){
        .ghp-body{grid-template-columns:minmax(0,1fr)}
        .ghp-panel{border-right:0}
        .ghp-panel + .ghp-panel{border-top:1px solid var(--p-line)}
    }
    @media (max-width:620px){
        .ghp-head{padding:20px}
        .ghp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
        .ghp-stat{padding:15px 18px}
        .ghp-stat:nth-child(2n){border-right:0}
        .ghp-stat:nth-child(n+3){border-top:1px solid var(--p-line)}
        .ghp-panel{padding:18px 20px 22px}
        .ghp-lang-wrap{gap:18px;justify-content:center}
        .ghp-legend{min-width:0;width:100%}
        .ghp-donut-wrap{width:124px;height:124px}
        .ghp-bars{height:96px}
        .ghp-foot{padding:14px 20px}
        .ghp-sub{font-size:.76rem}
    }
    @media (prefers-reduced-motion:reduce){
        .ghp-dot{animation:none}
        .ghp-bar i{transition:none}
        #ghp-slices circle{transition:none}
    }
    `;

    /* ---------------------------------------------------------------------
       Helpers
       --------------------------------------------------------------------- */
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function compact(num) {
        if (!isFinite(num)) return '—';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(num);
    }

    function timeAgo(dateString) {
        var then = new Date(dateString).getTime();
        if (!isFinite(then)) return '';
        var diff = Math.max(0, Date.now() - then);
        var minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'baru saja';
        if (minutes < 60) return minutes + ' menit lalu';
        var hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + ' jam lalu';
        var days = Math.floor(hours / 24);
        if (days < 30) return days + ' hari lalu';
        var months = Math.floor(days / 30);
        if (months < 12) return months + ' bulan lalu';
        return Math.floor(months / 12) + ' tahun lalu';
    }

    function langColor(language, index) {
        return LANG_COLORS[language] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    }

    // Round percentages so they always add up to exactly 100.
    function roundPercentages(values) {
        var sum = values.reduce(function (a, b) { return a + b; }, 0) || 1;
        var raw = values.map(function (value) { return (value / sum) * 100; });
        var floors = raw.map(Math.floor);
        var missing = 100 - floors.reduce(function (a, b) { return a + b; }, 0);

        var order = raw.map(function (value, index) {
            return { index: index, frac: value - Math.floor(value) };
        }).sort(function (a, b) { return b.frac - a.frac; });

        for (var i = 0; i < missing; i++) {
            floors[order[i % order.length].index] += 1;
        }

        return floors;
    }

    function injectStyles() {
        if (document.getElementById('rrn-ghp-styles')) return;
        var style = document.createElement('style');
        style.id = 'rrn-ghp-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.at || !parsed.user) return null;
            if (Date.now() - parsed.at > CACHE_TTL) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function writeCache(payload) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                at: Date.now(),
                user: payload.user,
                repos: payload.repos,
                events: payload.events
            }));
        } catch (e) { /* ignore */ }
    }

    function fetchJSON(url) {
        return fetch(url, {
            headers: { Accept: 'application/vnd.github+json' },
            cache: 'default'
        }).then(function (res) {
            if (res.status === 403 || res.status === 429) {
                var err = new Error('RATE_LIMIT');
                err.code = 'RATE_LIMIT';
                throw err;
            }
            if (!res.ok) {
                var error = new Error('HTTP ' + res.status);
                error.code = res.status === 404 ? 'NOT_FOUND' : 'HTTP';
                throw error;
            }
            return res.json();
        });
    }

    /* ---------------------------------------------------------------------
       Counter animation
       --------------------------------------------------------------------- */
    function countUp(node, target) {
        if (!node) return;
        target = Number(target) || 0;

        var reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!window.requestAnimationFrame || reduceMotion) {
            node.textContent = compact(target);
            return;
        }

        var duration = 750;
        var start = performance.now();
        node.textContent = '0';

        function frame(now) {
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            node.textContent = compact(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(frame);
            else node.textContent = compact(target);
        }

        requestAnimationFrame(frame);

        setTimeout(function () {
            node.textContent = compact(target);
        }, duration + 500);
    }

    /* ---------------------------------------------------------------------
       Widget
       --------------------------------------------------------------------- */
    function Pulse(root) {
        this.root = root;
        this.user = null;
        this.repos = [];
        this.events = [];
        this.activeLang = null;
        this.revealed = false;
        this.observer = null;
    }

    Pulse.prototype.init = function () {
        if (this.root.dataset.ghpInit === '1') return;
        this.root.dataset.ghpInit = '1';

        injectStyles();

        this.el = {
            photo: this.root.querySelector('#ghp-photo'),
            handle: this.root.querySelector('#ghp-handle'),
            profile: this.root.querySelector('#ghp-profile'),
            repos: this.root.querySelector('[data-ghp="repos"]'),
            stars: this.root.querySelector('[data-ghp="stars"]'),
            followers: this.root.querySelector('[data-ghp="followers"]'),
            days: this.root.querySelector('[data-ghp="days"]'),
            slices: this.root.querySelector('#ghp-slices'),
            legend: this.root.querySelector('#ghp-legend'),
            repoCount: this.root.querySelector('#ghp-repo-count'),
            centerLabel: this.root.querySelector('#ghp-center-label'),
            bars: this.root.querySelector('#ghp-bars'),
            note: this.root.querySelector('#ghp-note'),
            spotLink: this.root.querySelector('#ghp-spot-link'),
            spotMeta: this.root.querySelector('#ghp-spot-meta'),
            refresh: this.root.querySelector('#ghp-refresh')
        };

        this.preparePhoto();
        this.bindRefresh();
        this.observeReveal();

        var cached = readCache();
        if (cached) {
            this.render(cached);
        } else {
            this.load();
        }
    };

    Pulse.prototype.preparePhoto = function () {
        var img = this.el.photo;
        if (!img) return;

        img.src = COVER_IMAGE;
        img.alt = COVER_ALT;

        img.addEventListener('error', function onError() {
            img.removeEventListener('error', onError);
            img.src = 'https://github.com/' + USERNAME + '.png?size=200';
        });
    };

    Pulse.prototype.bindRefresh = function () {
        var self = this;
        var button = this.el.refresh;
        if (!button) return;

        button.addEventListener('click', function () {
            if (button.classList.contains('is-loading')) return;
            try { sessionStorage.removeItem(CACHE_KEY); } catch (e) { /* ignore */ }
            self.load();
        });
    };

    Pulse.prototype.observeReveal = function () {
        var self = this;

        function reveal() {
            if (self.revealed) return;
            self.revealed = true;
            self.root.classList.add('is-revealed');
            self.animateAll();
        }

        if (!('IntersectionObserver' in window)) {
            reveal();
            return;
        }

        this.observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                reveal();
                self.observer.disconnect();
            });
        }, { threshold: 0.15 });

        this.observer.observe(this.root);

        // Safety net for throttled / background rendering.
        setTimeout(reveal, 2600);
    };

    Pulse.prototype.load = function () {
        var self = this;
        var button = this.el.refresh;

        if (button) button.classList.add('is-loading');
        this.root.setAttribute('aria-busy', 'true');

        var userPromise = fetchJSON(API + '/users/' + USERNAME);
        var reposPromise = fetchJSON(API + '/users/' + USERNAME + '/repos?per_page=100&sort=pushed&direction=desc')
            .catch(function () { return []; });
        var eventsPromise = fetchJSON(API + '/users/' + USERNAME + '/events/public?per_page=30')
            .catch(function () { return []; });

        Promise.all([userPromise, reposPromise, eventsPromise])
            .then(function (results) {
                var payload = {
                    user: results[0],
                    repos: Array.isArray(results[1]) ? results[1] : [],
                    events: Array.isArray(results[2]) ? results[2] : []
                };
                writeCache(payload);
                self.render(payload);
            })
            .catch(function () {
                self.renderError();
            })
            .then(function () {
                if (button) button.classList.remove('is-loading');
                self.root.setAttribute('aria-busy', 'false');
            });
    };

    Pulse.prototype.renderError = function () {
        if (this.el.note) {
            this.el.note.textContent = 'GitHub API sedang tidak bisa dihubungi. Coba refresh, atau buka profil langsung.';
        }
        var button = this.el.refresh;
        if (button) button.classList.remove('is-loading');
        this.root.setAttribute('aria-busy', 'false');
    };

    Pulse.prototype.render = function (data) {
        var self = this;
        var user = data.user || {};
        var repos = (data.repos || []).filter(function (repo) {
            return repo && !repo.fork;
        }).sort(function (a, b) {
            var starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
            if (starDiff !== 0) return starDiff;
            return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
        });

        this.user = user;
        this.repos = repos;
        this.events = data.events || [];

        if (this.el.handle) this.el.handle.textContent = '@' + (user.login || USERNAME);
        if (this.el.profile) this.el.profile.href = user.html_url || ('https://github.com/' + USERNAME);

        var stars = repos.reduce(function (total, repo) {
            return total + (repo.stargazers_count || 0);
        }, 0);

        var rhythm = this.computeRhythm();

        // Fill numbers (animated on reveal).
        this.numbers = {
            repos: user.public_repos != null ? user.public_repos : repos.length,
            stars: stars,
            followers: user.followers || 0,
            days: rhythm.activeDays
        };

        if (this.revealed) this.animateNumbers();

        this.renderLanguages();
        this.renderRhythm(rhythm);
        this.renderSpotlight();

        this.root.setAttribute('aria-busy', 'false');

        if (this.el.note) {
            var cached = readCache();
            var stamp = cached ? new Date(cached.at) : new Date();
            this.el.note.textContent = rhythm.totalEvents + ' aktivitas publik dalam 14 hari terakhir · diperbarui ' +
                stamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '.';
        }

        // Data can arrive after the widget was already on screen.
        if (this.revealed) {
            this.animateBars();
            this.animateDonut();
        }

        self.root.classList.add('is-ready');
    };

    Pulse.prototype.animateNumbers = function () {
        var nums = this.numbers || {};
        countUp(this.el.repos, nums.repos || 0);
        countUp(this.el.stars, nums.stars || 0);
        countUp(this.el.followers, nums.followers || 0);
        countUp(this.el.days, nums.days || 0);
    };

    Pulse.prototype.animateAll = function () {
        this.animateNumbers();
        this.animateDonut();
        this.animateBars();
    };

    Pulse.prototype.computeRhythm = function () {
        var days = 14;
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var buckets = [];
        for (var i = 0; i < days; i++) {
            var d = new Date(today);
            d.setDate(today.getDate() - (days - 1 - i));
            buckets.push({ date: d, count: 0 });
        }

        var total = 0;
        var activeDays = 0;

        (this.events || []).forEach(function (event) {
            var when = new Date(event.created_at);
            if (isNaN(when.getTime())) return;
            when.setHours(0, 0, 0, 0);
            var diff = Math.round((today - when) / 86400000);
            if (diff < 0 || diff >= days) return;
            var bucket = buckets[days - 1 - diff];
            if (!bucket) return;
            bucket.count++;
            total++;
        });

        var max = 1;
        buckets.forEach(function (bucket) {
            if (bucket.count > max) max = bucket.count;
            if (bucket.count > 0) activeDays++;
        });

        return {
            buckets: buckets,
            max: max,
            totalEvents: total,
            activeDays: activeDays
        };
    };

    Pulse.prototype.renderLanguages = function () {
        var self = this;
        var counts = {};
        var total = 0;

        this.repos.forEach(function (repo) {
            if (!repo.language) return;
            counts[repo.language] = (counts[repo.language] || 0) + 1;
            total++;
        });

        var entries = Object.keys(counts).map(function (language) {
            return { language: language, count: counts[language] };
        }).sort(function (a, b) { return b.count - a.count; });

        if (!entries.length) {
            if (this.el.legend) {
                this.el.legend.innerHTML = '<li><span class="ghp-note" style="margin:0">Belum ada data bahasa.</span></li>';
            }
            if (this.el.repoCount) this.el.repoCount.textContent = '0';
            if (this.el.slices) this.el.slices.innerHTML = '';
            return;
        }

        // Top 5 + "Lainnya" so the donut always stays readable.
        var top = entries.slice(0, 5);
        var rest = entries.slice(5);
        if (rest.length) {
            top.push({
                language: 'Lainnya',
                count: rest.reduce(function (sum, entry) { return sum + entry.count; }, 0),
                other: true
            });
        }

        var pcts = roundPercentages(top.map(function (entry) { return entry.count; }));

        this.langTotal = total;
        this.langPcts = {};
        this.langTop = { language: top[0].language, pct: pcts[0] };
        top.forEach(function (entry, index) {
            self.langPcts[entry.language] = pcts[index];
        });

        var circumference = 2 * Math.PI * 46;
        var offset = 0;

        var slices = top.map(function (entry, index) {
            var pct = pcts[index] / 100;
            var length = pct * circumference;
            var color = entry.other ? '#9aa585' : langColor(entry.language, index);
            var circle = '<circle cx="60" cy="60" r="46" data-lang="' + escapeHtml(entry.language) + '"' +
                ' stroke="' + color + '"' +
                ' stroke-dasharray="0 ' + circumference.toFixed(2) + '"' +
                ' stroke-dashoffset="' + (-offset).toFixed(2) + '"' +
                ' data-len="' + length.toFixed(2) + '"' +
                ' data-circ="' + circumference.toFixed(2) + '"></circle>';
            offset += length;
            return circle;
        }).join('');

        if (this.el.slices) this.el.slices.innerHTML = slices;
        if (this.el.repoCount) this.el.repoCount.textContent = pcts[0] + '%';
        if (this.el.centerLabel) this.el.centerLabel.textContent = top[0].language;

        if (this.el.legend) {
            this.el.legend.innerHTML = top.map(function (entry, index) {
                var color = entry.other ? '#9aa585' : langColor(entry.language, index);
                return '<li><button type="button" data-lang="' + escapeHtml(entry.language) + '" aria-pressed="false">' +
                    '<span class="dot" style="background:' + color + '"></span>' +
                    '<span class="name">' + escapeHtml(entry.language) + '</span>' +
                    '<span class="pct">' + pcts[index] + '%</span>' +
                '</button></li>';
            }).join('');

            this.el.legend.querySelectorAll('button').forEach(function (button) {
                var lang = button.getAttribute('data-lang');

                button.addEventListener('mouseenter', function () { self.highlightLanguage(lang); });
                button.addEventListener('focus', function () { self.highlightLanguage(lang); });
                button.addEventListener('mouseleave', function () { self.highlightLanguage(null); });
                button.addEventListener('blur', function () { self.highlightLanguage(null); });
                button.addEventListener('click', function () {
                    var next = self.activeLang === lang ? null : lang;
                    self.activeLang = next;
                    self.highlightLanguage(next, true);
                });
            });
        }

        if (this.revealed) this.animateDonut();
    };

    Pulse.prototype.highlightLanguage = function (language, persist) {
        if (!this.el.slices) return;
        if (!persist) language = this.activeLang || language;

        this.el.slices.querySelectorAll('circle').forEach(function (circle) {
            var match = !language || circle.getAttribute('data-lang') === language;
            circle.style.opacity = match ? '1' : '.22';
            circle.style.strokeWidth = (language && match) ? '15' : '12';
        });

        if (this.el.legend) {
            this.el.legend.querySelectorAll('button').forEach(function (button) {
                var isActive = button.getAttribute('data-lang') === language;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }

        // Center label mirrors the hovered / selected language.
        if (this.el.repoCount && this.el.centerLabel) {
            var pct = language && this.langPcts ? this.langPcts[language] : null;
            if (pct != null) {
                this.el.repoCount.textContent = pct + '%';
                this.el.centerLabel.textContent = language;
            } else if (this.langTop) {
                this.el.repoCount.textContent = this.langTop.pct + '%';
                this.el.centerLabel.textContent = this.langTop.language;
            } else {
                this.el.repoCount.textContent = String(this.langTotal || this.repos.length || 0);
                this.el.centerLabel.textContent = 'repo';
            }
        }
    };

    Pulse.prototype.animateDonut = function () {
        if (!this.el.slices) return;
        var slices = this.el.slices.querySelectorAll('circle');
        if (!slices.length) return;

        function paint(circle) {
            var len = Number(circle.getAttribute('data-len')) || 0;
            var circ = Number(circle.getAttribute('data-circ')) || 0;
            circle.setAttribute('stroke-dasharray', len.toFixed(2) + ' ' + Math.max(circ - len, 0).toFixed(2));
        }

        // Force a paint first so the transition has a start value.
        requestAnimationFrame(function () {
            slices.forEach(function (circle, index) {
                setTimeout(function () { paint(circle); }, index * 70);
            });
        });

        // Safety net for throttled frames (background tab, reduced motion).
        setTimeout(function () {
            slices.forEach(paint);
        }, 800);
    };

    Pulse.prototype.renderRhythm = function (rhythm) {
        if (!this.el.bars) return;

        var max = rhythm.max || 1;
        var todayIndex = rhythm.buckets.length - 1;

        this.el.bars.innerHTML = rhythm.buckets.map(function (bucket, index) {
            var count = bucket.count;
            var height = count === 0 ? 7 : Math.max(12, Math.round((count / max) * 100));
            var label = bucket.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            var tip = label + ' · ' + (count === 0 ? 'tidak ada aktivitas' : count + ' aktivitas');
            return '<span class="ghp-bar' + (count === 0 ? ' is-empty' : '') + (index === todayIndex ? ' is-today' : '') + '"' +
                ' data-tip="' + escapeHtml(tip) + '" title="' + escapeHtml(tip) + '">' +
                '<i style="height:' + height + '%;--d:' + (index * 45) + 'ms"></i>' +
            '</span>';
        }).join('');

        if (this.revealed) this.animateBars();
    };

    Pulse.prototype.animateBars = function () {
        if (!this.el.bars) return;
        var bars = this.el.bars.querySelectorAll('.ghp-bar i');

        requestAnimationFrame(function () {
            bars.forEach(function (bar) { bar.style.transform = 'scaleY(1)'; });
        });

        // Safety for reduced motion / throttled frames.
        setTimeout(function () {
            bars.forEach(function (bar) { bar.style.transform = 'scaleY(1)'; });
        }, 1200);
    };

    Pulse.prototype.renderSpotlight = function () {
        if (!this.repos.length) return;

        var repo = this.repos[0];
        var stars = repo.stargazers_count || 0;

        if (this.el.spotLink) {
            this.el.spotLink.textContent = repo.name;
            this.el.spotLink.href = repo.html_url || ('https://github.com/' + USERNAME);
        }

        if (this.el.spotMeta) {
            var bits = [];
            if (repo.language) bits.push(repo.language);
            bits.push(stars ? '★ ' + compact(stars) : 'belum ada star');
            bits.push(timeAgo(repo.pushed_at));
            this.el.spotMeta.textContent = bits.join(' · ');
        }
    };

    /* ---------------------------------------------------------------------
       Bootstrap
       --------------------------------------------------------------------- */
    function init() {
        var root = document.getElementById('gh-pulse');
        if (!root) return;
        if (window.__rrnGithubPulse && window.__rrnGithubPulse.root === root) return;
        var pulse = new Pulse(root);
        pulse.init();
        window.__rrnGithubPulse = pulse;
    }

    window.GitHubPulse = { init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
