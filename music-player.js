/* ==========================================================================
   Reeinold Portfolio — floating music player (v2)
   Features: real seek + volume, shuffle, repeat modes, searchable queue,
   keyboard support, media session, persistent state, soft-navigation safe.
   ========================================================================== */
(function () {
    'use strict';

    if (window.__rrnMusicPlayer) return;

    var STORAGE_KEY = 'rrn-music-v1';
    var TIME_KEY = 'rrn-music-time';
    var WANT_PLAY_KEY = 'rrn-music-wantplay';

    var FALLBACK_TRACKS = [
        { title: 'Blue Archive Theme 242', artist: 'Blue Archive', src: 'music/Blue Archive _ Theme 242 [10 Minutes Loop] [U8PWvarbgok].mp3' },
        { title: 'Blue Archive OST 135', artist: 'Blue Archive', src: 'music/blue archive ost 135.mp3' },
        { title: 'Chatter Between Roots', artist: 'Genshin', src: 'music/Chatter Between Roots.mp3' },
        { title: 'Flows of Jade-Like Water', artist: 'Genshin', src: 'music/Flows of Jade-Like Water.mp3' },
        { title: 'Nightcore Gwai san neung', artist: 'Nightcore', src: 'music/Nightcore Gwai san neung.mp3' },
        { title: 'Tsukihime Main Theme', artist: 'Tsukihime', src: 'music/Tsukihime main theme.mp3' },
        { title: 'Guiding Ahead Lobby Theme', artist: 'Arknights', src: 'music/アークナイツ BGM - Guiding Ahead Lobby Theme  Arknights明日方舟 吾导先路 OST.mp3' },
        { title: 'Invitation to Wine Lobby Theme', artist: 'Arknights', src: 'music/アークナイツ BGM - Invitation to Wine Lobby Theme  Arknights明日方舟 将进酒 OST.mp3' },
        { title: '安里屋ユンタ (沖ツラバージョン) M26', artist: 'hmm.....', src: 'music/安里屋ユンタ (沖ツラバージョン) M26.mp3' },
        { title: 'Frost Pillar - Another Side -', artist: 'NIKKE', src: 'music/Frost Pillar - Another Side -.mp3' },
        { title: 'Frost Pillar (Scenario Version)', artist: 'NIKKE', src: 'music/Frost Pillar (Scenario Version).mp3' },
        { title: 'Frost Pillar', artist: 'NIKKE', src: 'music/Frost Pillar.mp3' },
        { title: 'Sān-Z Studio Theme — ZZZ 1.3', artist: 'Zenless Zone Zero', src: 'music/Sān-Z Studio Theme  Zenless Zone Zero 1.3.mp3' },
        { title: 'Lumina Square Night OST', artist: 'Zenless Zone Zero', src: 'music/Zenless Zone Zero Lumina Square Night OST  ZZZ.mp3' }
    ];

    var ICONS = {
        play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.5-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4.4" height="15" rx="1.4"/><rect x="13.6" y="4.5" width="4.4" height="15" rx="1.4"/></svg>',
        prev: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="5" width="2.4" height="14" rx="1"/><path d="M20 5.3v13.4a1 1 0 0 1-1.56.83l-9.1-6.7a1 1 0 0 1 0-1.66l9.1-6.7A1 1 0 0 1 20 5.3Z"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="17.6" y="5" width="2.4" height="14" rx="1"/><path d="M4 5.3v13.4a1 1 0 0 0 1.56.83l9.1-6.7a1 1 0 0 0 0-1.66l-9.1-6.7A1 1 0 0 0 4 5.3Z"/></svg>',
        shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/></svg>',
        repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
        volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
        mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m17 9 5 6"/><path d="m22 9-5 6"/></svg>',
        queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h11"/><path d="M4 18h7"/><circle cx="19" cy="17" r="2.6" fill="currentColor" stroke="none"/><path d="M21.6 17V9.5l-3 1.2" stroke-width="1.6"/></svg>',
        minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
        expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>'
    };

    var CSS = `
    #rrn-music{
        --mp-bg:#171c0f;
        --mp-bg-2:#212a14;
        --mp-line:rgba(203,232,107,.16);
        --mp-lime:#cbe86b;
        --mp-olive:#6b8e23;
        --mp-text:#f0f4e2;
        --mp-muted:#9aa87f;
        position:fixed;
        right:20px;
        bottom:20px;
        z-index:9000;
        width:min(400px,calc(100vw - 40px));
        border-radius:20px;
        border:1px solid rgba(203,232,107,.2);
        background:
            radial-gradient(420px 200px at 100% 0%, rgba(107,142,35,.28), transparent 70%),
            linear-gradient(165deg,#1c2310,#141a0c 70%);
        color:var(--mp-text);
        font-family:'SUSE Mono',ui-monospace,monospace;
        box-shadow:0 30px 70px -30px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.03) inset;
        overflow:hidden;
        transition:width .35s cubic-bezier(.2,.7,.2,1),height .35s cubic-bezier(.2,.7,.2,1),border-radius .35s;
        isolation:isolate;
    }
    #rrn-music *{box-sizing:border-box}
    #rrn-music button{font-family:inherit}

    /* ---------- main row ---------- */
    .rrn-mp-main{display:flex;align-items:center;gap:12px;padding:13px 14px 9px}

    .rrn-mp-art{
        position:relative;
        flex:0 0 auto;
        width:52px;height:52px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.14);
        background:linear-gradient(145deg,var(--art-a,#4a5d23),var(--art-b,#232c12));
        color:#eef6d3;
        cursor:pointer;
        display:grid;place-items:center;
        overflow:hidden;
        transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s;
        padding:0;
    }
    .rrn-mp-art:hover{transform:scale(1.05);box-shadow:0 10px 24px -12px rgba(203,232,107,.5)}
    .rrn-mp-art::after{
        content:"";
        position:absolute;inset:0;
        background:
            radial-gradient(circle at 50% 50%, rgba(0,0,0,.22) 0 18%, transparent 19%),
            repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.06) 0 2px, transparent 2px 5px);
        opacity:.9;
        pointer-events:none;
    }
    .rrn-art-initials{position:relative;z-index:1;font-size:13px;font-weight:700;letter-spacing:.04em;text-shadow:0 1px 6px rgba(0,0,0,.45)}
    .rrn-art-disc{
        position:absolute;inset:0;z-index:2;border-radius:14px;
        background:conic-gradient(from 0deg,transparent 0deg,rgba(203,232,107,.28) 22deg,transparent 60deg,transparent 180deg,rgba(203,232,107,.2) 208deg,transparent 250deg);
        opacity:0;transition:opacity .3s;
        animation:rrnSpin 4.5s linear infinite;
        pointer-events:none;
    }
    #rrn-music[data-playing="true"] .rrn-art-disc{opacity:1}
    @keyframes rrnSpin{to{transform:rotate(360deg)}}

    .rrn-mp-meta{flex:1;min-width:0}
    .rrn-mp-kicker{
        display:flex;align-items:center;gap:6px;
        margin:0 0 3px;
        font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;
        color:var(--mp-muted);
    }
    .rrn-mp-dot{width:6px;height:6px;border-radius:50%;background:#5c6b45;transition:background .3s,box-shadow .3s}
    #rrn-music[data-playing="true"] .rrn-mp-dot{background:var(--mp-lime);box-shadow:0 0 0 0 rgba(203,232,107,.6);animation:rrnPulse 2s infinite}
    @keyframes rrnPulse{70%{box-shadow:0 0 0 7px rgba(203,232,107,0)}100%{box-shadow:0 0 0 0 rgba(203,232,107,0)}}

    .rrn-mp-title{
        margin:0;
        font-size:12.5px;font-weight:700;line-height:1.3;
        color:var(--mp-text);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        letter-spacing:-.01em;
    }
    .rrn-mp-artist{
        margin:2px 0 0;
        font-size:10.5px;line-height:1.3;
        color:var(--mp-muted);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }

    .rrn-mp-actions{display:flex;gap:4px;flex:0 0 auto}

    .rrn-icon-btn{
        appearance:none;display:grid;place-items:center;
        width:30px;height:30px;padding:0;
        border-radius:9px;
        border:1px solid transparent;
        background:transparent;
        color:var(--mp-muted);
        cursor:pointer;
        transition:background .2s,color .2s,border-color .2s,transform .2s;
    }
    .rrn-icon-btn svg{width:15px;height:15px}
    .rrn-icon-btn:hover{background:rgba(203,232,107,.1);border-color:var(--mp-line);color:var(--mp-lime)}
    .rrn-icon-btn[aria-pressed="true"],.rrn-icon-btn.is-on{
        color:#161d0c;background:var(--mp-lime);border-color:var(--mp-lime);
    }
    .rrn-icon-btn[aria-pressed="true"]:hover{background:#dcf28b;color:#161d0c}

    /* ---------- progress ---------- */
    .rrn-mp-progress{display:flex;align-items:center;gap:9px;padding:0 14px 2px}
    .rrn-time{font-size:9.5px;letter-spacing:.05em;color:var(--mp-muted);min-width:30px;text-align:center;font-variant-numeric:tabular-nums}
    .rrn-range-wrap{flex:1;display:flex;align-items:center;min-width:0}

    #rrn-music input[type=range]{
        -webkit-appearance:none;appearance:none;
        width:100%;height:4px;margin:8px 0;
        border-radius:999px;
        background:linear-gradient(90deg,var(--mp-lime) 0%,var(--mp-olive) var(--fill,0%),rgba(255,255,255,.14) var(--fill,0%));
        cursor:pointer;
        outline:none;
    }
    #rrn-music input[type=range]::-webkit-slider-thumb{
        -webkit-appearance:none;appearance:none;
        width:13px;height:13px;border-radius:50%;
        background:#f2f7e0;border:2px solid var(--mp-olive);
        box-shadow:0 0 0 3px rgba(203,232,107,.16);
        transition:transform .15s;
    }
    #rrn-music input[type=range]:hover::-webkit-slider-thumb{transform:scale(1.18)}
    #rrn-music input[type=range]::-moz-range-thumb{
        width:13px;height:13px;border-radius:50%;
        background:#f2f7e0;border:2px solid var(--mp-olive);
    }
    #rrn-music input[type=range]:focus-visible{outline:2px solid var(--mp-lime);outline-offset:5px;border-radius:999px}

    /* ---------- controls ---------- */
    .rrn-mp-controls{display:flex;align-items:center;gap:2px;padding:4px 12px 12px}
    .rrn-ctrl{
        appearance:none;display:grid;place-items:center;
        width:34px;height:34px;padding:0;
        border-radius:50%;border:1px solid transparent;
        background:transparent;color:#cfd9b6;cursor:pointer;
        transition:background .2s,color .2s,transform .2s,border-color .2s;
    }
    .rrn-ctrl svg{width:16px;height:16px}
    .rrn-ctrl:hover{background:rgba(255,255,255,.07);color:#fff;transform:translateY(-1px)}
    .rrn-ctrl[aria-pressed="true"]{color:var(--mp-lime);background:rgba(203,232,107,.12);border-color:var(--mp-line)}
    .rrn-ctrl.is-one{position:relative}
    .rrn-ctrl.is-one::after{
        content:"1";position:absolute;top:3px;right:5px;
        font-size:7px;font-weight:700;color:var(--mp-lime);
        line-height:1;
    }

    .rrn-play{
        width:42px;height:42px;margin-inline:3px;
        background:linear-gradient(145deg,#d8f184,#9dc33c);
        color:#161d0c;
        border:0;
        box-shadow:0 8px 20px -8px rgba(203,232,107,.75);
    }
    .rrn-play svg{width:18px;height:18px}
    .rrn-play:hover{background:linear-gradient(145deg,#e6fa9e,#aed24a);color:#161d0c;transform:scale(1.06)}

    .rrn-mp-volume{display:flex;align-items:center;gap:7px;margin-left:auto;min-width:0;width:112px}
    .rrn-mp-volume input[type=range]{height:3px;margin:6px 0}
    .rrn-mp-volume .rrn-icon-btn{width:26px;height:26px}
    .rrn-mp-volume .rrn-icon-btn svg{width:14px;height:14px}

    /* ---------- queue ---------- */
    .rrn-mp-queue{
        border-top:1px solid var(--mp-line);
        background:linear-gradient(180deg,rgba(30,38,20,.6),rgba(18,23,11,.9));
        display:flex;flex-direction:column;
        max-height:min(46vh,340px);
        animation:rrnQueueIn .3s cubic-bezier(.2,.7,.2,1);
    }
    .rrn-mp-queue[hidden]{display:none}
    @keyframes rrnQueueIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

    .rrn-queue-head{
        display:flex;align-items:center;gap:10px;
        padding:11px 13px 9px;
        border-bottom:1px solid rgba(203,232,107,.1);
        flex:0 0 auto;
    }
    .rrn-queue-head > span{
        display:block;
        font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;
        color:var(--mp-lime);white-space:nowrap;
    }
    .rrn-queue-head em{
        display:block;font-style:normal;font-size:8.5px;letter-spacing:.08em;
        color:var(--mp-muted);text-transform:none;margin-top:2px;
    }
    #rrn-search{
        flex:1;min-width:0;
        height:28px;padding:0 11px;
        border-radius:999px;
        border:1px solid rgba(203,232,107,.16);
        background:rgba(255,255,255,.05);
        color:var(--mp-text);
        font-family:inherit;font-size:10.5px;
        outline:none;
        transition:border-color .2s,background .2s;
    }
    #rrn-search::placeholder{color:#7d8a66}
    #rrn-search:focus{border-color:var(--mp-lime);background:rgba(255,255,255,.08)}

    .rrn-tracks{overflow-y:auto;overscroll-behavior:contain;padding:6px;flex:1 1 auto;scrollbar-width:thin;scrollbar-color:#4a5d23 transparent}
    .rrn-tracks::-webkit-scrollbar{width:6px}
    .rrn-tracks::-webkit-scrollbar-thumb{background:#3c4b1f;border-radius:99px}
    .rrn-tracks::-webkit-scrollbar-track{background:transparent}

    .rrn-track{
        appearance:none;width:100%;
        display:flex;align-items:center;gap:10px;
        padding:8px 9px;
        border:1px solid transparent;
        border-radius:9px;
        background:transparent;
        color:#cdd8b4;
        font-family:inherit;
        cursor:pointer;
        text-align:left;
        transition:background .18s,border-color .18s,transform .18s;
    }
    .rrn-track:hover{background:rgba(255,255,255,.055);border-color:rgba(203,232,107,.1);transform:translateX(2px)}
    .rrn-track[aria-selected="true"]{
        background:linear-gradient(90deg,rgba(203,232,107,.18),rgba(107,142,35,.06));
        border-color:rgba(203,232,107,.28);
    }
    .rrn-track[aria-selected="true"] .rrn-track-title{color:#fff}
    .rrn-track-num{
        flex:0 0 18px;
        font-size:9.5px;color:#71805b;text-align:right;font-variant-numeric:tabular-nums;
    }
    .rrn-track[aria-selected="true"] .rrn-track-num{color:var(--mp-lime)}
    .rrn-track-text{flex:1;min-width:0}
    .rrn-track-title{
        display:block;font-size:10.8px;font-weight:600;line-height:1.35;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .rrn-track-artist{
        display:block;font-size:9px;line-height:1.3;color:#7f8d68;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .rrn-track-dur{flex:0 0 auto;font-size:9px;color:#71805b;font-variant-numeric:tabular-nums}
    .rrn-eq{display:none;align-items:flex-end;gap:2px;height:12px;flex:0 0 auto}
    .rrn-eq i{display:block;width:2px;border-radius:2px;background:var(--mp-lime);height:30%;animation:rrnEq .9s ease-in-out infinite}
    .rrn-eq i:nth-child(2){animation-delay:-.25s;height:75%}
    .rrn-eq i:nth-child(3){animation-delay:-.5s;height:50%}
    .rrn-track[aria-selected="true"] .rrn-eq{display:flex}
    .rrn-track[aria-selected="true"] .rrn-track-dur{display:none}
    @keyframes rrnEq{0%,100%{height:25%}50%{height:100%}}
    #rrn-music[data-playing="false"] .rrn-eq i{animation-play-state:paused}

    .rrn-queue-empty{padding:22px 14px;text-align:center;color:#7f8d68;font-size:10.5px}

    /* ---------- minimized ---------- */
    #rrn-music[data-minimized="true"]{
        width:62px;height:62px;border-radius:50%;
    }
    #rrn-music[data-minimized="true"] .rrn-mp-main{padding:4px;height:100%;gap:0}
    #rrn-music[data-minimized="true"] .rrn-mp-meta,
    #rrn-music[data-minimized="true"] .rrn-mp-actions,
    #rrn-music[data-minimized="true"] .rrn-mp-progress,
    #rrn-music[data-minimized="true"] .rrn-mp-controls,
    #rrn-music[data-minimized="true"] .rrn-mp-queue{display:none}
    #rrn-music[data-minimized="true"] .rrn-mp-art{
        width:100%;height:100%;border-radius:50%;
        box-shadow:0 10px 26px -10px rgba(203,232,107,.55);
    }
    #rrn-music[data-minimized="true"] .rrn-mp-art:hover{transform:scale(1.06)}

    /* ---------- toast ---------- */
    .rrn-mp-toast{
        position:absolute;left:50%;bottom:12px;transform:translate(-50%,14px);
        max-width:calc(100% - 28px);
        padding:7px 13px;border-radius:999px;
        background:rgba(203,232,107,.94);color:#171d0c;
        font-size:10px;font-weight:600;letter-spacing:.02em;text-align:center;
        opacity:0;pointer-events:none;
        transition:opacity .25s,transform .25s;
        z-index:5;
    }
    .rrn-mp-toast.is-visible{opacity:1;transform:translate(-50%,0)}

    .rrn-mp-mobile-hint{display:none}

    @media (max-width:560px){
        #rrn-music{right:12px;bottom:12px;left:12px;width:auto;border-radius:18px}
        .rrn-mp-volume{width:96px}
        .rrn-mp-queue{max-height:min(42vh,300px)}
        #rrn-music[data-minimized="true"]{left:auto;width:58px;height:58px}
    }

    @media (prefers-reduced-motion:reduce){
        .rrn-art-disc{animation:none}
        .rrn-eq i{animation:none}
    }
    `;

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        var total = Math.floor(seconds);
        var mins = Math.floor(total / 60);
        var secs = total % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function encodeSrc(path) {
        try { return encodeURI(path); } catch (e) { return path; }
    }

    function initials(track) {
        if (!track) return 'R';
        var source = (track.artist || track.title || 'R').trim();
        var parts = source.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return source.slice(0, 2).toUpperCase();
    }

    function hashOf(text) {
        var hash = 0;
        for (var i = 0; i < text.length; i++) {
            hash = (hash * 31 + text.charCodeAt(i)) % 360;
        }
        return hash;
    }

    function artVars(track) {
        var hue = 62 + (hashOf((track && (track.artist || track.title)) || 'rrn') % 48);
        return '--art-a:hsl(' + hue + ' 40% 30%);--art-b:hsl(' + (hue + 14) + ' 46% 16%)';
    }

    function MusicPlayer() {
        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.tracks = [];
        this.index = 0;
        this.playing = false;
        this.volume = 0.7;
        this.muted = false;
        this.shuffle = false;
        this.repeat = 'off';
        this.minimized = false;
        this.minTouched = false;
        this.queueOpen = false;
        this.seeking = false;
        this.durations = {};
        this.failed = {};
        this.pendingTime = 0;
        this.toastTimer = null;
        this.savedAt = 0;
        this.root = null;
    }

    MusicPlayer.prototype.init = function () {
        if (document.getElementById('rrn-music')) return;

        this.readState();
        this.injectStyles();
        this.buildUI();
        this.bindAudio();
        this.bindUI();
        this.applyStateToUI();
        this.loadTracks();
        this.audio.volume = this.volume;
        this.audio.muted = this.muted;
    };

    /* ---------------------------------------------------------------------
       State
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.readState = function () {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var s = JSON.parse(raw);
                if (typeof s.index === 'number') this.index = s.index;
                if (typeof s.volume === 'number') this.volume = Math.min(1, Math.max(0, s.volume));
                if (typeof s.muted === 'boolean') this.muted = s.muted;
                if (typeof s.shuffle === 'boolean') this.shuffle = s.shuffle;
                if (s.repeat === 'all' || s.repeat === 'one' || s.repeat === 'off') this.repeat = s.repeat;
                if (typeof s.minimized === 'boolean') { this.minimized = s.minimized; this.minTouched = true; }
                if (typeof s.queueOpen === 'boolean') this.queueOpen = s.queueOpen;
            }
        } catch (e) { /* ignore */ }

        /* On phones and narrow windows the full player covers the content —
           start collapsed unless the visitor has chosen a state before. */
        if (!this.minTouched) {
            try {
                if (window.matchMedia && window.matchMedia('(max-width:900px)').matches) {
                    this.minimized = true;
                    this.queueOpen = false;
                }
            } catch (e) { /* ignore */ }
        }

        try {
            var t = parseFloat(sessionStorage.getItem(TIME_KEY));
            if (isFinite(t) && t > 0) this.pendingTime = t;
        } catch (e) { /* ignore */ }
    };

    MusicPlayer.prototype.saveState = function () {
        try {
            var s = {
                index: this.index,
                volume: this.volume,
                muted: this.muted,
                shuffle: this.shuffle,
                repeat: this.repeat,
                queueOpen: this.queueOpen
            };
            /* Persist the minimize choice only after the visitor made it,
               so the phone/desktop default can still follow the viewport. */
            if (this.minTouched) s.minimized = this.minimized;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch (e) { /* ignore */ }

        try {
            sessionStorage.setItem(TIME_KEY, String(this.audio.currentTime || 0));
            if (this.playing) sessionStorage.setItem(WANT_PLAY_KEY, '1');
            else sessionStorage.removeItem(WANT_PLAY_KEY);
        } catch (e) { /* ignore */ }
    };

    /* ---------------------------------------------------------------------
       UI
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.injectStyles = function () {
        if (document.getElementById('rrn-music-styles')) return;
        var style = document.createElement('style');
        style.id = 'rrn-music-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    };

    MusicPlayer.prototype.buildUI = function () {
        var root = document.createElement('section');
        root.id = 'rrn-music';
        root.className = 'rrn-mp';
        root.setAttribute('role', 'region');
        root.setAttribute('aria-label', 'Pemutar musik');
        root.setAttribute('data-playing', 'false');
        root.setAttribute('data-minimized', 'false');

        root.innerHTML = `
            <div class="rrn-mp-main">
                <button type="button" class="rrn-mp-art" id="rrn-art" aria-label="Buka playlist" title="Buka playlist">
                    <span class="rrn-art-initials" id="rrn-art-initials">R</span>
                    <span class="rrn-art-disc" aria-hidden="true"></span>
                </button>
                <div class="rrn-mp-meta">
                    <p class="rrn-mp-kicker"><span class="rrn-mp-dot" aria-hidden="true"></span> Now playing</p>
                    <p class="rrn-mp-title" id="rrn-title">Memuat playlist…</p>
                    <p class="rrn-mp-artist" id="rrn-artist">—</p>
                </div>
                <div class="rrn-mp-actions">
                    <button type="button" class="rrn-icon-btn" id="rrn-queue-btn" aria-label="Buka daftar lagu" aria-expanded="false" aria-pressed="false" title="Daftar lagu">${ICONS.queue}</button>
                    <button type="button" class="rrn-icon-btn" id="rrn-min-btn" aria-label="Kecilkan pemutar" title="Kecilkan">${ICONS.minimize}</button>
                </div>
            </div>

            <div class="rrn-mp-progress">
                <span class="rrn-time" id="rrn-current">0:00</span>
                <div class="rrn-range-wrap">
                    <input id="rrn-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Posisi lagu">
                </div>
                <span class="rrn-time" id="rrn-duration">0:00</span>
            </div>

            <div class="rrn-mp-controls">
                <button type="button" class="rrn-ctrl" id="rrn-shuffle" aria-label="Acak urutan lagu" aria-pressed="false" title="Acak">${ICONS.shuffle}</button>
                <button type="button" class="rrn-ctrl" id="rrn-prev" aria-label="Lagu sebelumnya" title="Sebelumnya">${ICONS.prev}</button>
                <button type="button" class="rrn-ctrl rrn-play" id="rrn-play" aria-label="Putar" title="Putar">${ICONS.play}</button>
                <button type="button" class="rrn-ctrl" id="rrn-next" aria-label="Lagu berikutnya" title="Berikutnya">${ICONS.next}</button>
                <button type="button" class="rrn-ctrl" id="rrn-repeat" aria-label="Ulangi: mati" aria-pressed="false" title="Ulangi">${ICONS.repeat}</button>
                <div class="rrn-mp-volume">
                    <button type="button" class="rrn-icon-btn" id="rrn-mute" aria-label="Bisukan suara" aria-pressed="false" title="Bisukan">${ICONS.volume}</button>
                    <input id="rrn-volume" type="range" min="0" max="100" step="1" value="70" aria-label="Volume">
                </div>
            </div>

            <div class="rrn-mp-queue" id="rrn-queue" hidden>
                <div class="rrn-queue-head">
                    <span>Playlist<em id="rrn-count">0 track</em></span>
                    <input id="rrn-search" type="search" placeholder="Cari lagu…" aria-label="Cari lagu" autocomplete="off" spellcheck="false">
                </div>
                <div class="rrn-tracks" id="rrn-tracks" role="listbox" aria-label="Daftar lagu"></div>
            </div>

            <div class="rrn-mp-toast" id="rrn-toast" role="status" aria-live="polite"></div>
        `;

        document.body.appendChild(root);
        this.root = root;

        this.el = {
            art: root.querySelector('#rrn-art'),
            initials: root.querySelector('#rrn-art-initials'),
            title: root.querySelector('#rrn-title'),
            artist: root.querySelector('#rrn-artist'),
            queueBtn: root.querySelector('#rrn-queue-btn'),
            minBtn: root.querySelector('#rrn-min-btn'),
            seek: root.querySelector('#rrn-seek'),
            current: root.querySelector('#rrn-current'),
            duration: root.querySelector('#rrn-duration'),
            shuffle: root.querySelector('#rrn-shuffle'),
            prev: root.querySelector('#rrn-prev'),
            play: root.querySelector('#rrn-play'),
            next: root.querySelector('#rrn-next'),
            repeat: root.querySelector('#rrn-repeat'),
            mute: root.querySelector('#rrn-mute'),
            volume: root.querySelector('#rrn-volume'),
            queue: root.querySelector('#rrn-queue'),
            tracks: root.querySelector('#rrn-tracks'),
            search: root.querySelector('#rrn-search'),
            count: root.querySelector('#rrn-count'),
            toast: root.querySelector('#rrn-toast')
        };
    };

    MusicPlayer.prototype.bindUI = function () {
        var self = this;
        var el = this.el;

        el.play.addEventListener('click', function () { self.togglePlay(); });
        el.prev.addEventListener('click', function () { self.prev(); });
        el.next.addEventListener('click', function () { self.next(true); });
        el.shuffle.addEventListener('click', function () { self.toggleShuffle(); });
        el.repeat.addEventListener('click', function () { self.cycleRepeat(); });
        el.mute.addEventListener('click', function () { self.toggleMute(); });
        el.queueBtn.addEventListener('click', function () { self.toggleQueue(); });
        el.minBtn.addEventListener('click', function () { self.toggleMinimize(); });
        el.art.addEventListener('click', function () {
            if (self.minimized) self.toggleMinimize();
            else self.toggleQueue();
        });

        el.seek.addEventListener('input', function () {
            self.seeking = true;
            var pct = Number(el.seek.value) / 10;
            el.seek.style.setProperty('--fill', pct + '%');
            if (isFinite(self.audio.duration)) {
                el.current.textContent = formatTime((pct / 100) * self.audio.duration);
            }
        });
        el.seek.addEventListener('change', function () {
            if (isFinite(self.audio.duration)) {
                self.audio.currentTime = (Number(el.seek.value) / 1000) * self.audio.duration;
            }
            self.seeking = false;
        });
        el.seek.addEventListener('pointerup', function () { self.seeking = false; });

        el.volume.addEventListener('input', function () {
            var value = Number(el.volume.value) / 100;
            self.volume = value;
            self.muted = value === 0;
            self.audio.muted = false;
            self.audio.volume = value;
            self.updateVolumeUI();
            self.saveState();
        });

        el.search.addEventListener('input', function () {
            self.renderQueue(el.search.value);
        });
        el.search.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                el.search.value = '';
                self.renderQueue('');
            }
        });

        // Track list (delegated).
        el.tracks.addEventListener('click', function (e) {
            var row = e.target.closest ? e.target.closest('.rrn-track') : null;
            if (!row) return;
            var index = Number(row.getAttribute('data-index'));
            if (!isNaN(index)) self.selectTrack(index, true);
        });

        // Keyboard support while focus is inside the player.
        this.root.addEventListener('keydown', function (e) {
            var tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input') return;

            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                self.togglePlay();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                self.seekBy(5);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                self.seekBy(-5);
            } else if (e.key === 'Escape' && self.queueOpen) {
                self.toggleQueue(false);
            }
        });

        // Persist on exit.
        window.addEventListener('beforeunload', function () { self.saveState(); });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) self.saveState();
        });

        setInterval(function () {
            if (self.playing) self.saveState();
        }, 8000);
    };

    MusicPlayer.prototype.bindAudio = function () {
        var self = this;

        this.audio.addEventListener('timeupdate', function () { self.updateProgressUI(); });
        this.audio.addEventListener('loadedmetadata', function () {
            self.durations[self.index] = self.audio.duration;
            self.updateDurationUI();
            if (self.pendingTime > 0 && isFinite(self.audio.duration)) {
                self.audio.currentTime = Math.min(self.pendingTime, Math.max(self.audio.duration - 1, 0));
                self.pendingTime = 0;
            }
            self.updateMediaSession();
        });
        this.audio.addEventListener('durationchange', function () {
            self.durations[self.index] = self.audio.duration;
            self.updateDurationUI();
            self.renderQueue(self.el.search ? self.el.search.value : '');
        });
        this.audio.addEventListener('ended', function () { self.handleEnded(); });
        this.audio.addEventListener('play', function () { self.setPlaying(true); });
        this.audio.addEventListener('pause', function () { self.setPlaying(false); });
        this.audio.addEventListener('error', function () {
            if (!self.audio.src) return;
            self.handleAudioError();
        });
        this.audio.addEventListener('volumechange', function () {
            self.muted = self.audio.muted || self.audio.volume === 0;
            self.updateVolumeUI();
        });
    };

    /* ---------------------------------------------------------------------
       Tracks
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.loadTracks = function () {
        var self = this;

        var request = (window.fetch && window.location.protocol !== 'file:')
            ? fetch('music/music.json', { cache: 'no-cache' })
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    if (!data || !Array.isArray(data.tracks)) throw new Error('Bad playlist');
                    return data.tracks.filter(function (t) { return t && t.src; });
                })
            : Promise.reject(new Error('Offline'));

        request
            .catch(function () { return FALLBACK_TRACKS.slice(); })
            .then(function (tracks) {
                self.tracks = tracks.length ? tracks : FALLBACK_TRACKS.slice();
                if (self.index < 0 || self.index >= self.tracks.length) self.index = 0;
                self.renderQueue('');
                self.applyTrackToUI();
                self.loadCurrentTrack(!self.pendingTime);
                self.updateVolumeUI();
                self.updateShuffleUI();
                self.updateRepeatUI();
                self.updateQueueUI();
                self.updateMinimizeUI();
                self.restorePlaybackIntent();
            });
    };

    MusicPlayer.prototype.restorePlaybackIntent = function () {
        var self = this;
        var wants = false;
        try { wants = sessionStorage.getItem(WANT_PLAY_KEY) === '1'; } catch (e) { /* ignore */ }

        if (!wants) return;

        // Browsers may block autoplay after a reload; fail silently and let the
        // user press play. The UI always reflects the real audio state.
        setTimeout(function () {
            self.play(false);
        }, 260);
    };

    MusicPlayer.prototype.loadCurrentTrack = function (resetTime) {
        var track = this.tracks[this.index];
        if (!track) return;

        this.audio.src = encodeSrc(track.src);
        this.audio.load();

        if (resetTime) {
            this.pendingTime = 0;
            try { sessionStorage.removeItem(TIME_KEY); } catch (e) { /* ignore */ }
        }

        this.applyTrackToUI();
        this.updateDurationUI();
        this.saveState();
    };

    MusicPlayer.prototype.selectTrack = function (index, autoplay) {
        if (!this.tracks[index]) return;

        if (index === this.index) {
            if (autoplay && !this.playing) this.play(true);
            return;
        }

        this.index = index;
        this.applyTrackToUI();
        this.loadCurrentTrack(true);
        if (autoplay) this.play(true);
        this.renderQueue(this.el.search ? this.el.search.value : '');
    };

    MusicPlayer.prototype.applyTrackToUI = function () {
        var track = this.tracks[this.index];
        if (!track || !this.el) return;

        this.el.title.textContent = track.title || 'Unknown track';
        this.el.title.setAttribute('title', track.title || '');
        this.el.artist.textContent = track.artist || 'Unknown artist';
        this.el.initials.textContent = initials(track);
        this.root.setAttribute('style', artVars(track));

        this.updateMediaSession();
    };

    MusicPlayer.prototype.applyStateToUI = function () {
        if (!this.el) return;
        this.updateVolumeUI();
        this.updateShuffleUI();
        this.updateRepeatUI();
        this.updateQueueUI();
        this.updateMinimizeUI();
        this.setPlaying(false);
    };

    /* ---------------------------------------------------------------------
       Playback
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.setPlaying = function (playing) {
        this.playing = !!playing;
        if (!this.el) return;

        this.root.setAttribute('data-playing', playing ? 'true' : 'false');
        this.el.play.innerHTML = playing ? ICONS.pause : ICONS.play;
        this.el.play.setAttribute('aria-label', playing ? 'Jeda' : 'Putar');
        this.el.play.setAttribute('title', playing ? 'Jeda' : 'Putar');
    };

    MusicPlayer.prototype.play = function (explicit) {
        if (!this.tracks.length) return;

        if (this.audio.error) {
            this.handleAudioError(true);
            return;
        }

        var self = this;
        var promise = this.audio.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function (error) {
                self.setPlaying(false);
                if (explicit && error && error.name === 'NotAllowedError') {
                    self.toast('Tap play sekali lagi untuk mulai memutar.');
                }
            });
        }
    };

    MusicPlayer.prototype.pause = function () {
        this.audio.pause();
    };

    MusicPlayer.prototype.togglePlay = function () {
        if (this.playing) {
            this.pause();
            this.saveState();
        } else {
            if (!this.audio.src) {
                this.loadCurrentTrack(true);
            }
            this.play(true);
        }
    };

    MusicPlayer.prototype.next = function (manual) {
        if (!this.tracks.length) return;

        if (this.shuffle) {
            this.selectTrack(this.randomIndex(), true);
            return;
        }

        var last = this.tracks.length - 1;
        if (this.index >= last) {
            if (this.repeat === 'all' || !manual) {
                this.selectTrack(0, true);
            } else {
                this.selectTrack(0, true);
            }
        } else {
            this.selectTrack(this.index + 1, true);
        }
    };

    MusicPlayer.prototype.prev = function () {
        if (!this.tracks.length) return;

        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        if (this.shuffle) {
            this.selectTrack(this.randomIndex(), true);
            return;
        }

        var index = this.index === 0 ? this.tracks.length - 1 : this.index - 1;
        this.selectTrack(index, true);
    };

    MusicPlayer.prototype.randomIndex = function () {
        if (this.tracks.length < 2) return 0;
        var next = this.index;
        while (next === this.index) {
            next = Math.floor(Math.random() * this.tracks.length);
        }
        return next;
    };

    MusicPlayer.prototype.handleEnded = function () {
        if (this.repeat === 'one') {
            this.audio.currentTime = 0;
            this.play(false);
            return;
        }

        if (this.shuffle) {
            this.selectTrack(this.randomIndex(), true);
            return;
        }

        var last = this.tracks.length - 1;

        if (this.index < last) {
            this.selectTrack(this.index + 1, true);
            return;
        }

        if (this.repeat === 'all') {
            this.selectTrack(0, true);
            return;
        }

        this.setPlaying(false);
        this.el.seek.value = '1000';
        this.el.seek.style.setProperty('--fill', '100%');
    };

    MusicPlayer.prototype.seekBy = function (seconds) {
        if (!isFinite(this.audio.duration)) return;
        this.audio.currentTime = Math.min(
            Math.max(this.audio.currentTime + seconds, 0),
            this.audio.duration
        );
    };

    MusicPlayer.prototype.handleAudioError = function (silent) {
        var self = this;
        var track = this.tracks[this.index];

        if (track) this.failed[this.index] = true;

        // Auto-skip to a track that has not failed yet.
        var nextIndex = -1;
        for (var i = 1; i <= this.tracks.length; i++) {
            var candidate = (this.index + i) % this.tracks.length;
            if (!this.failed[candidate]) { nextIndex = candidate; break; }
        }

        if (nextIndex === -1) {
            this.setPlaying(false);
            if (!silent) this.toast('File musik tidak ditemukan. Cek folder music/.');
            return;
        }

        if (!silent) this.toast('Lagu tidak bisa diputar — pindah ke lagu berikutnya.');

        setTimeout(function () {
            self.selectTrack(nextIndex, true);
        }, silent ? 60 : 900);
    };

    /* ---------------------------------------------------------------------
       Volume / modes
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.updateVolumeUI = function () {
        if (!this.el) return;

        var value = this.muted ? 0 : this.volume;
        this.el.volume.value = String(Math.round(value * 100));
        this.el.volume.style.setProperty('--fill', Math.round(value * 100) + '%');

        this.el.mute.innerHTML = this.muted || value === 0 ? ICONS.mute : ICONS.volume;
        this.el.mute.setAttribute('aria-pressed', this.muted ? 'true' : 'false');
        this.el.mute.setAttribute('aria-label', this.muted ? 'Nyalakan suara' : 'Bisukan suara');
    };

    MusicPlayer.prototype.toggleMute = function () {
        this.muted = !this.muted;
        this.audio.muted = this.muted;
        if (!this.muted && this.volume === 0) {
            this.volume = 0.6;
            this.audio.volume = this.volume;
        }
        this.updateVolumeUI();
        this.saveState();
    };

    MusicPlayer.prototype.toggleShuffle = function () {
        this.shuffle = !this.shuffle;
        this.updateShuffleUI();
        this.saveState();
    };

    MusicPlayer.prototype.updateShuffleUI = function () {
        if (!this.el) return;
        this.el.shuffle.setAttribute('aria-pressed', this.shuffle ? 'true' : 'false');
        this.el.shuffle.setAttribute('aria-label', this.shuffle ? 'Acak: aktif' : 'Acak: mati');
        this.el.shuffle.title = this.shuffle ? 'Acak: aktif' : 'Acak: mati';
    };

    MusicPlayer.prototype.cycleRepeat = function () {
        var order = { off: 'all', all: 'one', one: 'off' };
        this.repeat = order[this.repeat] || 'off';
        this.updateRepeatUI();
        this.saveState();
    };

    MusicPlayer.prototype.updateRepeatUI = function () {
        if (!this.el) return;

        var labels = { off: 'Ulangi: mati', all: 'Ulangi: semua', one: 'Ulangi: satu lagu' };
        this.el.repeat.setAttribute('aria-pressed', this.repeat !== 'off' ? 'true' : 'false');
        this.el.repeat.setAttribute('aria-label', labels[this.repeat]);
        this.el.repeat.title = labels[this.repeat];
        this.el.repeat.classList.toggle('is-one', this.repeat === 'one');
    };

    /* ---------------------------------------------------------------------
       Queue
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.toggleQueue = function (force) {
        var open = typeof force === 'boolean' ? force : !this.queueOpen;
        this.queueOpen = open;
        this.updateQueueUI();
        this.saveState();

        if (open) {
            this.renderQueue(this.el.search ? this.el.search.value : '');
            var active = this.el.tracks.querySelector('.rrn-track[aria-selected="true"]');
            if (active) active.scrollIntoView({ block: 'nearest' });
        }
    };

    MusicPlayer.prototype.updateQueueUI = function () {
        if (!this.el) return;
        this.el.queue.hidden = !this.queueOpen || this.minimized;
        this.el.queueBtn.setAttribute('aria-expanded', this.queueOpen ? 'true' : 'false');
        this.el.queueBtn.setAttribute('aria-pressed', this.queueOpen ? 'true' : 'false');
        this.el.queueBtn.setAttribute('aria-label', this.queueOpen ? 'Tutup daftar lagu' : 'Buka daftar lagu');
    };

    MusicPlayer.prototype.renderQueue = function (filter) {
        if (!this.el) return;

        var query = (filter || '').trim().toLowerCase();
        var list = this.el.tracks;
        var visible = 0;
        var html = '';

        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            var haystack = ((track.title || '') + ' ' + (track.artist || '')).toLowerCase();
            if (query && haystack.indexOf(query) === -1) continue;

            visible++;
            var selected = i === this.index;
            var duration = this.durations[i];

            html += '<button type="button" class="rrn-track" data-index="' + i + '" role="option" aria-selected="' + (selected ? 'true' : 'false') + '">' +
                '<span class="rrn-track-num">' + String(i + 1).padStart(2, '0') + '</span>' +
                '<span class="rrn-track-text">' +
                    '<span class="rrn-track-title">' + escapeHtml(track.title || 'Unknown') + '</span>' +
                    '<span class="rrn-track-artist">' + escapeHtml(track.artist || '') + '</span>' +
                '</span>' +
                '<span class="rrn-track-dur">' + (duration && isFinite(duration) ? formatTime(duration) : '–:–') + '</span>' +
                '<span class="rrn-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '</button>';
        }

        if (!visible) {
            html = '<div class="rrn-queue-empty">Tidak ada lagu yang cocok.</div>';
        }

        list.innerHTML = html;

        if (this.el.count) {
            this.el.count.textContent = this.tracks.length + ' track';
        }
    };

    /* ---------------------------------------------------------------------
       Minimize
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.toggleMinimize = function () {
        this.minimized = !this.minimized;
        this.minTouched = true;
        if (this.minimized) this.queueOpen = false;
        this.updateMinimizeUI();
        this.updateQueueUI();
        this.saveState();
    };

    MusicPlayer.prototype.updateMinimizeUI = function () {
        if (!this.el) return;

        this.root.setAttribute('data-minimized', this.minimized ? 'true' : 'false');
        this.el.minBtn.innerHTML = this.minimized ? ICONS.expand : ICONS.minimize;
        this.el.minBtn.setAttribute('aria-label', this.minimized ? 'Besarkan pemutar' : 'Kecilkan pemutar');
        this.el.minBtn.title = this.minimized ? 'Besarkan' : 'Kecilkan';
    };

    /* ---------------------------------------------------------------------
       Progress / media session / toast
       --------------------------------------------------------------------- */
    MusicPlayer.prototype.updateProgressUI = function () {
        if (!this.el) return;

        var duration = this.audio.duration;
        if (!isFinite(duration) || duration <= 0) {
            this.el.current.textContent = '0:00';
            return;
        }

        this.el.current.textContent = formatTime(this.audio.currentTime);

        if (!this.seeking) {
            var pct = (this.audio.currentTime / duration) * 100;
            this.el.seek.value = String(Math.round(pct * 10));
            this.el.seek.style.setProperty('--fill', pct + '%');
        }

        if (this.el.duration.textContent === '0:00') {
            this.el.duration.textContent = formatTime(duration);
        }
    };

    MusicPlayer.prototype.updateDurationUI = function () {
        if (!this.el) return;

        var duration = this.durations[this.index] || this.audio.duration;
        this.el.duration.textContent = isFinite(duration) && duration > 0 ? formatTime(duration) : '0:00';

        var pct = isFinite(duration) && duration > 0 ? (this.audio.currentTime / duration) * 100 : 0;
        this.el.seek.style.setProperty('--fill', pct + '%');
    };

    MusicPlayer.prototype.updateMediaSession = function () {
        if (!('mediaSession' in navigator)) return;

        var track = this.tracks[this.index];
        if (!track) return;

        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title || 'Unknown track',
                artist: track.artist || 'Reeinold Portfolio',
                album: 'Portfolio Playlist',
                artwork: [{ src: 'Profile1.jpg', sizes: '512x512', type: 'image/jpeg' }]
            });

            navigator.mediaSession.setActionHandler('play', this.play.bind(this, true));
            navigator.mediaSession.setActionHandler('pause', this.pause.bind(this));
            navigator.mediaSession.setActionHandler('previoustrack', this.prev.bind(this));
            navigator.mediaSession.setActionHandler('nexttrack', this.next.bind(this, true));
        } catch (e) { /* unsupported */ }
    };

    MusicPlayer.prototype.toast = function (message) {
        if (!this.el || !this.el.toast) return;
        var toast = this.el.toast;
        toast.textContent = message;
        toast.classList.add('is-visible');

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 3200);
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function boot() {
        if (window.__rrnMusicPlayer) return;
        window.__rrnMusicPlayer = new MusicPlayer();
        window.__rrnMusicPlayer.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
