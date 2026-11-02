/* ==========================================================================
   Reeinold Portfolio — GitHub "playlist" tracker
   Public GitHub API, no token required. Renders an interactive, music-player
   inspired dashboard: pick a repository like a track, see stats & activity.
   ========================================================================== */
(function () {
    'use strict';

    var USERNAME = 'Reeinold';
    var CACHE_KEY = 'rrn-gh-cache-v2';
    var CACHE_TTL = 10 * 60 * 1000;
    var API = 'https://api.github.com';

    // Foto custom untuk cover "playlist" GitHub. Ganti path di sini kalau mau foto lain.
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

    var CSS = `
    .gh-deck{
        --gh-bg:#151b0d;
        --gh-panel:#1c2413;
        --gh-line:rgba(203,232,107,.14);
        --gh-lime:#cbe86b;
        --gh-olive:#6b8e23;
        --gh-text:#eef3e0;
        --gh-muted:#98a77f;
        position:relative;
        overflow:hidden;
        border-radius:26px;
        border:1px solid rgba(203,232,107,.18);
        background:
            radial-gradient(900px 380px at 88% -12%, rgba(107,142,35,.35), transparent 62%),
            radial-gradient(700px 320px at 4% 6%, rgba(203,232,107,.14), transparent 60%),
            linear-gradient(165deg,#1a2211,#11160a 72%);
        color:var(--gh-text);
        font-family:'SUSE Mono',ui-monospace,monospace;
        box-shadow:0 40px 90px -50px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.03) inset;
        isolation:isolate;
    }
    .gh-deck *{box-sizing:border-box}
    .gh-deck::before{
        content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.4;
        background-image:radial-gradient(rgba(203,232,107,.18) 1px,transparent 1px);
        background-size:24px 24px;
        -webkit-mask-image:radial-gradient(80% 70% at 70% 0%,#000,transparent 80%);
        mask-image:radial-gradient(80% 70% at 70% 0%,#000,transparent 80%);
    }
    .gh-deck button{font-family:inherit}

    /* ---------------- featured row ---------------- */
    .gh-now{
        display:flex;align-items:center;gap:18px;
        padding:22px 24px 18px;
        border-bottom:1px solid var(--gh-line);
    }
    .gh-cover{
        position:relative;flex:0 0 auto;
        width:88px;height:88px;border-radius:6px;
        padding:5px;
        background:linear-gradient(145deg,#cbe86b,#6b8e23 62%,#33421a);
        box-shadow:0 18px 34px -20px rgba(0,0,0,.95);
    }
    .gh-cover img{
        width:100%;height:100%;border-radius:3px;object-fit:cover;display:block;
        filter:saturate(.95) contrast(1.03);
        background:#2a3418;
    }
    .gh-cover::after{
        content:"";position:absolute;inset:5px 5px auto;height:34%;
        border-radius:3px 3px 0 0;pointer-events:none;
        background:linear-gradient(180deg,rgba(21,27,13,.5),rgba(21,27,13,0));
    }
    .gh-cover-ring{
        position:absolute;inset:-7px;border-radius:10px;
        border:1px solid rgba(203,232,107,.3);
        pointer-events:none;
    }
    .gh-cover-ring::before,
    .gh-cover-ring::after{
        content:"";position:absolute;width:9px;height:9px;
        border:2px solid var(--gh-lime);
    }
    .gh-cover-ring::before{top:-2px;left:-2px;border-right:0;border-bottom:0;border-top-left-radius:3px}
    .gh-cover-ring::after{bottom:-2px;right:-2px;border-left:0;border-top:0;border-bottom-right-radius:3px}

    .gh-now-info{flex:1;min-width:0}
    .gh-kicker{
        display:flex;align-items:center;gap:7px;
        margin:0 0 5px;
        font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;
        color:var(--gh-muted);
    }
    .gh-dot{
        width:6px;height:6px;border-radius:50%;background:var(--gh-lime);
        box-shadow:0 0 0 0 rgba(203,232,107,.6);animation:ghPulse 2.1s infinite;
    }
    @keyframes ghPulse{70%{box-shadow:0 0 0 8px rgba(203,232,107,0)}100%{box-shadow:0 0 0 0 rgba(203,232,107,0)}}

    .gh-now-info h3{
        margin:0;
        font-family:'Rubik',system-ui,sans-serif;
        font-size:clamp(1.15rem,2.2vw,1.5rem);
        font-weight:700;letter-spacing:-.02em;
        color:#f8fbee;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    #gh-now-desc{
        margin:4px 0 0;max-width:56ch;
        font-size:11px;line-height:1.6;
        color:var(--gh-muted);
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
        overflow:hidden;
    }

    .gh-eq{display:flex;align-items:flex-end;gap:3px;height:18px;margin-top:10px}
    .gh-eq i{
        display:block;width:3px;height:100%;border-radius:3px;
        background:linear-gradient(180deg,var(--gh-lime),var(--gh-olive));
        transform:scaleY(var(--max,.8));transform-origin:bottom;
        animation:ghEq 1s ease-in-out infinite;
        opacity:.85;
        will-change:transform;
    }
    .gh-eq i:nth-child(1){animation-delay:-.1s;--min:.14;--max:.35}
    .gh-eq i:nth-child(2){animation-delay:-.5s;--min:.2;--max:.7}
    .gh-eq i:nth-child(3){animation-delay:-.9s;--min:.12;--max:.45}
    .gh-eq i:nth-child(4){animation-delay:-.3s;--min:.25;--max:.9}
    .gh-eq i:nth-child(5){animation-delay:-.7s;--min:.18;--max:.55}
    .gh-eq i:nth-child(6){animation-delay:-.2s;--min:.22;--max:.8}
    .gh-eq i:nth-child(7){animation-delay:-.6s;--min:.12;--max:.4}
    .gh-eq i:nth-child(8){animation-delay:-.4s;--min:.2;--max:.65}
    .gh-deck[data-loading="true"] .gh-eq i,
    .gh-deck[data-paused="true"] .gh-eq i{animation-play-state:paused;opacity:.35}
    @keyframes ghEq{0%,100%{transform:scaleY(var(--min,.18))}50%{transform:scaleY(var(--max,.8))}}

    .gh-now-side{
        display:grid;gap:8px;justify-items:end;flex:0 0 auto;
    }
    .gh-chip{
        display:inline-flex;align-items:center;gap:6px;
        padding:5px 11px;border-radius:999px;
        border:1px solid var(--gh-line);
        background:rgba(203,232,107,.08);
        font-size:9.5px;letter-spacing:.06em;
        color:#dbe8bd;
        white-space:nowrap;
    }
    .gh-profile-link{
        font-size:10px;letter-spacing:.06em;
        color:var(--gh-lime);text-decoration:none;
        border-bottom:1px solid transparent;
        transition:border-color .2s,color .2s;
        white-space:nowrap;
    }
    .gh-profile-link:hover{border-color:var(--gh-lime);color:#e6f7b0}

    /* ---------------- stats ---------------- */
    .gh-stats{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        border-bottom:1px solid var(--gh-line);
    }
    .gh-stat{
        padding:14px 12px;
        text-align:center;
        border-right:1px solid var(--gh-line);
        transition:background .25s;
    }
    .gh-stat:last-child{border-right:0}
    .gh-stat:hover{background:rgba(203,232,107,.06)}
    .gh-stat-label{
        display:block;
        font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;
        color:var(--gh-muted);
        margin-bottom:3px;
    }
    .gh-stat-value{
        display:block;
        font-family:'Rubik',system-ui,sans-serif;
        font-size:1.2rem;font-weight:700;letter-spacing:-.02em;
        color:var(--gh-lime);
        font-variant-numeric:tabular-nums;
        line-height:1.1;
    }

    /* ---------------- toolbar ---------------- */
    .gh-toolbar{
        display:flex;align-items:center;gap:12px;flex-wrap:wrap;
        padding:14px 18px 12px;
        border-bottom:1px solid var(--gh-line);
    }
    .gh-tabs{display:flex;gap:4px;flex-wrap:wrap}
    .gh-tab{
        appearance:none;border:1px solid transparent;
        padding:7px 13px;border-radius:999px;
        background:transparent;color:var(--gh-muted);
        font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
        cursor:pointer;
        transition:color .2s,background .2s,border-color .2s;
    }
    .gh-tab:hover{color:#e3efc8;background:rgba(255,255,255,.05)}
    .gh-tab[aria-selected="true"]{
        background:var(--gh-lime);color:#161d0c;border-color:var(--gh-lime);
    }
    .gh-search{
        margin-left:auto;display:flex;align-items:center;
        min-width:170px;flex:1;max-width:250px;
        position:relative;
    }
    .gh-search .sr-only{
        position:absolute;width:1px;height:1px;
        padding:0;margin:-1px;overflow:hidden;
        clip:rect(0 0 0 0);white-space:nowrap;border:0;
    }
    .gh-search input{
        width:100%;height:32px;
        padding:0 14px;
        border-radius:999px;
        border:1px solid var(--gh-line);
        background:rgba(255,255,255,.05);
        color:var(--gh-text);
        font-family:inherit;font-size:11px;
        outline:none;
        transition:border-color .2s,background .2s;
    }
    .gh-search input::placeholder{color:#7e8c67}
    .gh-search input:focus{border-color:var(--gh-lime);background:rgba(255,255,255,.08)}

    /* ---------------- panels ---------------- */
    .gh-panels{padding:12px 14px 16px}
    .gh-panel[hidden]{display:none}
    .gh-panel.is-active{animation:ghPanelIn .3s cubic-bezier(.2,.7,.2,1) both}
    @keyframes ghPanelIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
    @keyframes ghTitleIn{from{opacity:.25;transform:translateY(5px)}to{opacity:1;transform:none}}

    .gh-tracklist{
        display:flex;flex-direction:column;gap:2px;
        max-height:460px;overflow-y:auto;
        padding:2px;
        scrollbar-width:thin;scrollbar-color:#3d4c20 transparent;
    }
    .gh-tracklist::-webkit-scrollbar{width:7px}
    .gh-tracklist::-webkit-scrollbar-thumb{background:#3d4c20;border-radius:99px}
    .gh-tracklist::-webkit-scrollbar-track{background:transparent}

    .gh-track{
        display:flex;align-items:center;gap:4px;
        border-radius:12px;
        border:1px solid transparent;
        transition:background .2s,border-color .2s;
    }
    .gh-track:hover{background:rgba(255,255,255,.045);border-color:rgba(203,232,107,.1)}
    .gh-track.is-active{
        background:linear-gradient(90deg,rgba(203,232,107,.16),rgba(107,142,35,.05));
        border-color:rgba(203,232,107,.26);
    }

    .gh-track-main{
        appearance:none;flex:1;min-width:0;
        display:grid;
        grid-template-columns:30px 1fr auto;
        align-items:center;gap:12px;
        padding:10px 12px;
        border:0;border-radius:12px;
        background:transparent;
        color:inherit;text-align:left;
        cursor:pointer;
    }
    .gh-idx{
        position:relative;
        font-size:10px;color:#71805b;text-align:right;
        font-variant-numeric:tabular-nums;
        display:grid;place-items:center;
        height:20px;
    }
    .gh-idx::after{
        content:"";
        position:absolute;inset:0;
        margin:auto;
        width:0;height:0;
        border-left:7px solid var(--gh-lime);
        border-top:5px solid transparent;
        border-bottom:5px solid transparent;
        opacity:0;transform:scale(.6);
        transition:opacity .2s,transform .2s;
    }
    .gh-track:hover .gh-idx span{opacity:0}
    .gh-track:hover .gh-idx::after{opacity:1;transform:scale(1)}
    .gh-track.is-active .gh-idx{color:var(--gh-lime)}
    .gh-track.is-active .gh-idx span{opacity:0}
    .gh-track.is-active .gh-idx::after{opacity:1;transform:scale(1);animation:ghBlink 1.6s ease-in-out infinite}
    @keyframes ghBlink{50%{opacity:.35}}

    .gh-ti{min-width:0;display:block}
    .gh-title{
        display:block;
        font-size:12px;font-weight:600;line-height:1.35;letter-spacing:-.01em;
        color:#eaf1d8;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .gh-track.is-active .gh-title{color:#fff}
    .gh-sub{
        display:block;margin-top:2px;
        font-size:9.5px;line-height:1.35;color:#7f8d68;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .gh-track-meta{
        display:flex;align-items:center;gap:12px;
        font-size:9.5px;color:#8b9a72;
        flex:0 0 auto;
    }
    .gh-star{display:inline-flex;align-items:center;gap:3px;min-width:34px;justify-content:flex-end}
    .gh-star svg{width:10px;height:10px;opacity:.7}
    .gh-lang-dot{width:7px;height:7px;border-radius:50%;display:inline-block;box-shadow:0 0 6px rgba(0,0,0,.4)}

    .gh-open{
        flex:0 0 auto;
        display:grid;place-items:center;
        width:32px;height:32px;margin-right:6px;
        border-radius:50%;
        border:1px solid transparent;
        color:#8b9a72;text-decoration:none;
        font-size:13px;
        transition:background .2s,color .2s,border-color .2s,transform .2s;
    }
    .gh-open:hover{
        background:rgba(203,232,107,.14);
        border-color:var(--gh-line);
        color:var(--gh-lime);
        transform:translate(1px,-1px);
    }

    .gh-skeleton{
        height:44px;border-radius:12px;
        background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 37%,rgba(255,255,255,.04) 63%);
        background-size:400% 100%;
        animation:ghShimmer 1.4s ease-in-out infinite;
        margin-bottom:3px;
    }
    @keyframes ghShimmer{0%{background-position:100% 0}100%{background-position:0 0}}

    .gh-footnote{
        margin:10px 4px 0;
        font-size:9px;letter-spacing:.05em;color:#6f7c59;
        text-align:center;
    }
    .gh-empty{
        padding:28px 16px;
        text-align:center;
        color:#8b9a72;
        font-size:11px;
        line-height:1.7;
    }
    .gh-empty strong{display:block;color:#d7e5b8;font-size:12px;margin-bottom:4px}
    .gh-retry{
        margin-top:12px;
        appearance:none;border:1px solid var(--gh-line);
        background:rgba(203,232,107,.1);color:var(--gh-lime);
        padding:7px 16px;border-radius:999px;
        font-size:10px;font-weight:600;letter-spacing:.06em;
        cursor:pointer;transition:background .2s;
    }
    .gh-retry:hover{background:rgba(203,232,107,.2)}

    /* ---------------- languages ---------------- */
    .gh-langs{display:flex;flex-direction:column;gap:10px;padding:6px 4px 2px}
    .gh-lang-row{
        display:grid;
        grid-template-columns:minmax(90px,150px) 1fr 52px;
        align-items:center;gap:14px;
        padding:8px 10px;border-radius:10px;
        transition:background .2s;
    }
    .gh-lang-row:hover{background:rgba(255,255,255,.04)}
    .gh-lang-name{display:flex;align-items:center;gap:8px;font-size:11px;color:#dbe6c2;min-width:0}
    .gh-lang-name span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gh-lang-bar{
        height:7px;border-radius:999px;
        background:rgba(255,255,255,.07);
        overflow:hidden;
    }
    .gh-lang-bar i{
        display:block;height:100%;border-radius:999px;
        width:0;
        transition:width 1s cubic-bezier(.2,.7,.2,1);
    }
    .gh-lang-pct{
        text-align:right;font-size:10px;color:var(--gh-lime);
        font-variant-numeric:tabular-nums;
    }
    .gh-lang-total{
        display:flex;justify-content:space-between;gap:10px;
        margin-top:6px;padding:10px 10px 0;
        border-top:1px solid var(--gh-line);
        font-size:9.5px;color:#7f8d68;letter-spacing:.06em;
    }

    /* ---------------- activity ---------------- */
    .gh-activity{
        list-style:none;margin:0;padding:6px 2px;
        display:flex;flex-direction:column;gap:2px;
        max-height:460px;overflow-y:auto;
        scrollbar-width:thin;scrollbar-color:#3d4c20 transparent;
    }
    .gh-activity::-webkit-scrollbar{width:7px}
    .gh-activity::-webkit-scrollbar-thumb{background:#3d4c20;border-radius:99px}
    .gh-act{
        display:flex;align-items:flex-start;gap:12px;
        padding:10px 12px;border-radius:10px;
        border:1px solid transparent;
        transition:background .2s;
    }
    .gh-act:hover{background:rgba(255,255,255,.04);border-color:rgba(203,232,107,.08)}
    .gh-act-icon{
        flex:0 0 auto;width:26px;height:26px;border-radius:8px;
        display:grid;place-items:center;
        background:rgba(203,232,107,.1);
        border:1px solid var(--gh-line);
        color:var(--gh-lime);
        font-size:12px;
    }
    .gh-act-body{flex:1;min-width:0}
    .gh-act-text{
        font-size:10.5px;line-height:1.5;color:#c9d6ae;
    }
    .gh-act-text strong{color:#f2f7e6;font-weight:600}
    .gh-act-text a{color:var(--gh-lime);text-decoration:none}
    .gh-act-text a:hover{text-decoration:underline}
    .gh-act-time{display:block;margin-top:2px;font-size:9px;color:#71805b;letter-spacing:.04em}

    @media (max-width:760px){
        .gh-now{padding:18px;gap:14px;flex-wrap:wrap}
        .gh-cover{width:64px;height:64px}
        .gh-now-side{
            width:100%;flex-direction:row;display:flex;justify-content:space-between;
            align-items:center;order:3;
        }
        .gh-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
        .gh-stat:nth-child(3){border-right:0}
        .gh-stat:nth-child(4),.gh-stat:nth-child(5){border-top:1px solid var(--gh-line)}
        .gh-stat:nth-child(5){border-right:0}
        .gh-toolbar{padding:12px 14px}
        .gh-search{margin-left:0;max-width:none;min-width:0;flex-basis:100%}
        .gh-track-main{grid-template-columns:24px 1fr auto;gap:9px;padding:9px 8px}
        .gh-lang-row{grid-template-columns:minmax(80px,110px) 1fr 44px;gap:10px}
        .gh-eq{height:14px}
        .gh-panels{padding:8px 8px 12px}
    }
    @media (prefers-reduced-motion:reduce){
        .gh-cover-ring{animation:none}
        .gh-eq i{animation:none}
    }
    `;

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

    function langColor(language) {
        return LANG_COLORS[language] || '#8ea35c';
    }

    function injectStyles() {
        if (document.getElementById('rrn-gh-styles')) return;
        var style = document.createElement('style');
        style.id = 'rrn-gh-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.at) return null;
            if (Date.now() - parsed.at > CACHE_TTL) return null;
            if (!parsed.user) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function writeCache(data) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                at: Date.now(),
                user: data.user,
                repos: data.repos,
                events: data.events
            }));
        } catch (e) { /* quota / disabled */ }
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

    function Tracker(deck) {
        this.deck = deck;
        this.user = null;
        this.repos = [];
        this.events = [];
        this.activeIndex = 0;
        this.filterQuery = '';
        this.elements = {};
    }

    Tracker.prototype.init = function () {
        injectStyles();

        this.elements = {
            avatar: document.getElementById('gh-avatar'),
            nowTitle: document.getElementById('gh-now-title'),
            nowDesc: document.getElementById('gh-now-desc'),
            login: document.getElementById('gh-login'),
            profileLink: document.getElementById('gh-profile-link'),
            repos: document.getElementById('gh-repos'),
            stars: document.getElementById('gh-stars'),
            followers: document.getElementById('gh-followers'),
            following: document.getElementById('gh-following'),
            gists: document.getElementById('gh-gists'),
            tracklist: document.getElementById('gh-tracklist'),
            languages: document.getElementById('gh-languages'),
            activity: document.getElementById('gh-activity'),
            search: document.getElementById('gh-search'),
            note: document.getElementById('gh-note')
        };

        this.bindTabs();
        this.bindSearch();

        this.deck.setAttribute('data-loading', 'true');
        this.deck.setAttribute('aria-busy', 'true');
        this.renderSkeletons();

        var cached = readCache();
        if (cached) {
            this.render(cached);
            return;
        }

        this.load();
    };

    Tracker.prototype.load = function () {
        var self = this;

        var userPromise = fetchJSON(API + '/users/' + USERNAME);
        var reposPromise = fetchJSON(API + '/users/' + USERNAME + '/repos?per_page=100&sort=pushed&direction=desc')
            .catch(function (error) {
                if (error.code === 'RATE_LIMIT' || error.code === 'NOT_FOUND' || error.code === 'HTTP') return [];
                throw error;
            });
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
            .catch(function (error) {
                self.renderError(error);
            });
    };

    Tracker.prototype.renderSkeletons = function () {
        if (this.elements.tracklist) {
            this.elements.tracklist.innerHTML = new Array(6).fill('<div class="gh-skeleton"></div>').join('');
        }
        if (this.elements.languages) {
            this.elements.languages.innerHTML = new Array(5).fill('<div class="gh-skeleton" style="height:32px"></div>').join('');
        }
        if (this.elements.activity) {
            this.elements.activity.innerHTML = new Array(5).fill('<li><div class="gh-skeleton" style="height:46px"></div></li>').join('');
        }
        if (this.elements.note) {
            this.elements.note.textContent = 'Menghubungi GitHub API…';
        }
    };

    Tracker.prototype.bindTabs = function () {
        var self = this;
        var tabs = this.deck.querySelectorAll('[data-gh-tab]');

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                self.activateTab(tab.getAttribute('data-gh-tab'));
            });

            tab.addEventListener('keydown', function (e) {
                var list = Array.prototype.slice.call(tabs);
                var index = list.indexOf(tab);
                var next = null;

                if (e.key === 'ArrowRight') next = list[(index + 1) % list.length];
                if (e.key === 'ArrowLeft') next = list[(index - 1 + list.length) % list.length];

                if (next) {
                    e.preventDefault();
                    next.focus();
                    self.activateTab(next.getAttribute('data-gh-tab'));
                }
            });
        });
    };

    Tracker.prototype.activateTab = function (name) {
        this.deck.querySelectorAll('[data-gh-tab]').forEach(function (tab) {
            var active = tab.getAttribute('data-gh-tab') === name;
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.setAttribute('tabindex', active ? '0' : '-1');
            tab.classList.toggle('is-active', active);
        });

        ['repos', 'languages', 'activity'].forEach(function (panelName) {
            var panel = document.getElementById('gh-panel-' + panelName);
            if (!panel) return;
            var active = panelName === name;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });
    };

    Tracker.prototype.bindSearch = function () {
        var self = this;
        var input = this.elements.search;
        if (!input) return;

        input.addEventListener('input', function () {
            self.filterQuery = input.value.trim().toLowerCase();
            self.renderTracklist();
        });
    };

    Tracker.prototype.render = function (data) {
        this.user = data.user || {};
        this.repos = (data.repos || []).filter(function (repo) {
            return repo && !repo.fork;
        }).sort(function (a, b) {
            var starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
            if (starDiff !== 0) return starDiff;
            return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
        });
        this.events = data.events || [];

        this.renderProfile();
        this.renderStats();
        this.renderTracklist();
        this.renderLanguages();
        this.renderActivity();

        this.deck.setAttribute('data-loading', 'false');
        this.deck.setAttribute('aria-busy', 'false');

        if (this.elements.note) {
            var cached = readCache();
            var stamp = cached ? new Date(cached.at) : new Date();
            this.elements.note.textContent = 'Live from the GitHub public API · diperbarui ' +
                stamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
                ' · di-cache 10 menit.';
        }
    };

    Tracker.prototype.renderProfile = function () {
        var user = this.user || {};
        var el = this.elements;

        if (el.avatar) {
            el.avatar.src = COVER_IMAGE;
            el.avatar.alt = COVER_ALT;
            el.avatar.onerror = function () {
                el.avatar.onerror = null;
                if (user.avatar_url) el.avatar.src = user.avatar_url;
            };
        }

        if (el.login) el.login.textContent = '@' + (user.login || USERNAME);

        if (el.profileLink) {
            el.profileLink.href = user.html_url || ('https://github.com/' + USERNAME);
        }

        if (el.nowTitle) {
            el.nowTitle.textContent = user.name || user.login || USERNAME;
        }

        if (el.nowDesc) {
            el.nowDesc.textContent = user.bio ||
                'Software Engineering student at BINUS · building web things with HTML, CSS & JavaScript.';
        }

        // Default featured "track": the most starred repo.
        if (this.repos.length) {
            this.setFeatured(0, false);
        }

        this.deck.setAttribute('data-paused', 'false');
    };

    Tracker.prototype.renderStats = function () {
        var el = this.elements;
        var user = this.user || {};
        var stars = this.repos.reduce(function (total, repo) {
            return total + (repo.stargazers_count || 0);
        }, 0);

        countUp(el.repos, user.public_repos != null ? user.public_repos : this.repos.length);
        countUp(el.stars, stars);
        countUp(el.followers, user.followers || 0);
        countUp(el.following, user.following || 0);
        countUp(el.gists, user.public_gists || 0);
    };

    function countUp(node, target) {
        if (!node) return;
        target = Number(target) || 0;

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!window.requestAnimationFrame || reduceMotion) {
            node.textContent = compact(target);
            return;
        }

        var duration = 700;
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

        // Safety net for background tabs / throttled rAF.
        setTimeout(function () {
            node.textContent = compact(target);
        }, duration + 500);
    }

    Tracker.prototype.filteredRepos = function () {
        var query = this.filterQuery;
        if (!query) return this.repos;

        return this.repos.filter(function (repo) {
            var haystack = [
                repo.name || '',
                repo.description || '',
                repo.language || '',
                (repo.topics || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        });
    };

    Tracker.prototype.renderTracklist = function () {
        var el = this.elements;
        if (!el.tracklist) return;

        var repos = this.filteredRepos();

        if (!repos.length) {
            el.tracklist.innerHTML =
                '<div class="gh-empty"><strong>Tidak ada repository yang cocok.</strong>Coba kata kunci lain, atau buka profil GitHub langsung.</div>';
            return;
        }

        var html = repos.map(function (repo, index) {
            var active = this.repos.indexOf(repo) === this.activeIndex;
            var description = repo.description || 'Tanpa deskripsi — tetap layak dilihat.';
            var language = repo.language || 'Code';
            var color = langColor(language);
            var num = String(this.repos.indexOf(repo) + 1).padStart(2, '0');

            return '<div class="gh-track' + (active ? ' is-active' : '') + '" data-index="' + this.repos.indexOf(repo) + '">' +
                '<button type="button" class="gh-track-main" aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="Pilih repository ' + escapeHtml(repo.name) + '">' +
                    '<span class="gh-idx"><span>' + num + '</span></span>' +
                    '<span class="gh-ti">' +
                        '<span class="gh-title">' + escapeHtml(repo.name) + '</span>' +
                        '<span class="gh-sub">' + escapeHtml(description) + '</span>' +
                    '</span>' +
                    '<span class="gh-track-meta">' +
                        '<span class="gh-lang-dot" style="background:' + color + '"></span>' +
                        '<span class="gh-star">' + starIcon() + compact(repo.stargazers_count || 0) + '</span>' +
                    '</span>' +
                '</button>' +
                '<a class="gh-open" href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer" aria-label="Buka repository ' + escapeHtml(repo.name) + ' di GitHub" title="Buka di GitHub">↗</a>' +
            '</div>';
        }, this).join('');

        el.tracklist.innerHTML = html;

        var self = this;
        el.tracklist.querySelectorAll('.gh-track-main').forEach(function (button) {
            button.addEventListener('click', function () {
                var track = button.closest('.gh-track');
                var index = Number(track.getAttribute('data-index'));
                self.setFeatured(index, true);
            });
        });
    };

    function starIcon() {
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.95L12 2.6Z"/></svg>';
    }

    Tracker.prototype.setFeatured = function (index, animate) {
        var repo = this.repos[index];
        if (!repo) return;

        this.activeIndex = index;

        var el = this.elements;
        if (el.nowTitle) el.nowTitle.textContent = repo.name;
        if (el.nowDesc) {
            el.nowDesc.textContent = repo.description || 'Tanpa deskripsi — silakan mampir ke repository-nya.';
        }
        if (el.login) {
            var bits = ['@' + (this.user.login || USERNAME)];
            if (repo.language) bits.push(repo.language);
            if (repo.stargazers_count) bits.push('★ ' + compact(repo.stargazers_count));
            el.login.textContent = bits.join(' · ');
        }

        this.deck.setAttribute('data-paused', 'false');

        if (animate) {
            var eq = this.deck.querySelector('.gh-eq');
            if (eq) {
                eq.style.animation = 'none';
                void eq.offsetWidth;
                eq.style.animation = '';
            }

            [el.nowTitle, el.nowDesc].forEach(function (node) {
                if (!node) return;
                node.style.animation = 'none';
                void node.offsetWidth;
                node.style.animation = 'ghTitleIn .35s cubic-bezier(.2,.7,.2,1) both';
            });
        }

        this.deck.querySelectorAll('.gh-track').forEach(function (track) {
            var isActive = Number(track.getAttribute('data-index')) === index;
            track.classList.toggle('is-active', isActive);
            var button = track.querySelector('.gh-track-main');
            if (button) button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    };

    Tracker.prototype.renderLanguages = function () {
        var el = this.elements;
        if (!el.languages) return;

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
            el.languages.innerHTML = '<div class="gh-empty">Belum ada data bahasa.</div>';
            return;
        }

        var rows = entries.map(function (entry) {
            var pct = Math.round((entry.count / total) * 100);
            return '<div class="gh-lang-row">' +
                '<span class="gh-lang-name"><span class="gh-lang-dot" style="background:' + langColor(entry.language) + '"></span><span>' + escapeHtml(entry.language) + '</span></span>' +
                '<span class="gh-lang-bar"><i data-width="' + pct + '" style="background:linear-gradient(90deg,' + langColor(entry.language) + ',' + langColor(entry.language) + '99)"></i></span>' +
                '<span class="gh-lang-pct">' + pct + '%</span>' +
            '</div>';
        }).join('');

        el.languages.innerHTML = rows +
            '<div class="gh-lang-total"><span>' + this.repos.length + ' repository publik</span><span>' + entries.length + ' bahasa</span></div>';

        // Animate bars after paint.
        requestAnimationFrame(function () {
            el.languages.querySelectorAll('.gh-lang-bar i').forEach(function (bar) {
                bar.style.width = bar.getAttribute('data-width') + '%';
            });
        });
    };

    Tracker.prototype.renderActivity = function () {
        var el = this.elements;
        if (!el.activity) return;

        var events = (this.events || []).slice(0, 24);

        if (!events.length) {
            el.activity.innerHTML = '<li class="gh-empty"><strong>Belum ada aktivitas publik.</strong>GitHub hanya menampilkan event terbaru.</li>';
            return;
        }

        var html = events.map(function (event) {
            var info = describeEvent(event);
            if (!info) return '';

            return '<li class="gh-act">' +
                '<span class="gh-act-icon" aria-hidden="true">' + info.icon + '</span>' +
                '<span class="gh-act-body">' +
                    '<span class="gh-act-text">' + info.text + '</span>' +
                    '<span class="gh-act-time">' + timeAgo(event.created_at) + '</span>' +
                '</span>' +
            '</li>';
        }).join('');

        el.activity.innerHTML = html || '<li class="gh-empty">Belum ada aktivitas publik.</li>';
    };

    function describeEvent(event) {
        var repo = event.repo ? event.repo.name : '';
        var repoShort = repo.split('/').pop();
        var repoLink = repo ? '<a href="https://github.com/' + escapeHtml(repo) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(repoShort) + '</a>' : 'sebuah repo';
        var payload = event.payload || {};

        switch (event.type) {
            case 'PushEvent': {
                var commits = payload.commits || [];
                var count = payload.size || commits.length || 1;
                var message = commits.length && commits[commits.length - 1].message
                    ? commits[commits.length - 1].message.split('\n')[0]
                    : 'commit baru';
                return {
                    icon: '↑',
                    text: '<strong>' + count + ' commit</strong> ke ' + repoLink + ' — ' + escapeHtml(message.slice(0, 90))
                };
            }
            case 'WatchEvent':
                return { icon: '★', text: 'Memberi <strong>star</strong> ke ' + repoLink };
            case 'ForkEvent':
                return { icon: '⑂', text: 'Melakukan <strong>fork</strong> pada ' + repoLink };
            case 'CreateEvent': {
                var refType = payload.ref_type || 'repository';
                var ref = payload.ref ? ' <strong>' + escapeHtml(payload.ref) + '</strong>' : '';
                return { icon: '+', text: 'Membuat ' + refType + ref + ' di ' + repoLink };
            }
            case 'PullRequestEvent': {
                var action = payload.action || 'update';
                var number = payload.pull_request ? '#' + payload.pull_request.number : '';
                return { icon: '⇄', text: 'Pull request ' + escapeHtml(number) + ' <strong>' + escapeHtml(action) + '</strong> di ' + repoLink };
            }
            case 'IssuesEvent':
                return { icon: '!', text: 'Issue <strong>' + escapeHtml(payload.action || 'update') + '</strong> di ' + repoLink };
            case 'IssueCommentEvent':
                return { icon: '…', text: 'Komentar pada issue di ' + repoLink };
            case 'PublicEvent':
                return { icon: '◎', text: 'Menjadikan ' + repoLink + ' <strong>publik</strong>' };
            case 'ReleaseEvent':
                return { icon: '⬆', text: 'Merilis <strong>' + escapeHtml(payload.release ? payload.release.tag_name : 'versi baru') + '</strong> di ' + repoLink };
            default:
                return null;
        }
    }

    Tracker.prototype.renderError = function (error) {
        this.deck.setAttribute('data-loading', 'false');
        this.deck.setAttribute('aria-busy', 'false');

        var message = error && error.code === 'RATE_LIMIT'
            ? 'Batas permintaan GitHub API tercapai. Coba lagi beberapa menit lagi.'
            : 'Tidak bisa memuat data GitHub saat ini.';

        var block = '<div class="gh-empty"><strong>' + escapeHtml(message) + '</strong>' +
            'Kamu tetap bisa melihat semua repository langsung di profil GitHub.' +
            '<br><button type="button" class="gh-retry" id="gh-retry">Coba lagi</button></div>';

        if (this.elements.tracklist) this.elements.tracklist.innerHTML = block;
        if (this.elements.languages) this.elements.languages.innerHTML = block;
        if (this.elements.activity) this.elements.activity.innerHTML = '<li class="gh-empty">' + escapeHtml(message) + '</li>';
        if (this.elements.note) {
            this.elements.note.textContent = 'GitHub API sedang tidak tersedia · data akan dicoba ulang saat halaman dimuat.';
        }

        var self = this;
        document.querySelectorAll('.gh-retry').forEach(function (button) {
            button.addEventListener('click', function () {
                try { sessionStorage.removeItem(CACHE_KEY); } catch (e) { /* ignore */ }
                self.renderSkeletons();
                self.deck.setAttribute('data-loading', 'true');
                self.load();
            });
        });
    };

    /* ---------------------------------------------------------------------
       Bootstrap
       --------------------------------------------------------------------- */
    function init() {
        var deck = document.getElementById('gh-deck');
        if (!deck) return;
        if (deck.getAttribute('data-gh-init') === 'true') return;

        deck.setAttribute('data-gh-init', 'true');

        var tracker = new Tracker(deck);
        tracker.init();
    }

    window.GitHubTracker = { init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
