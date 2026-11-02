/* ==========================================================================
   Reeinold Portfolio — page behaviour
   Typewriter, skill bars, easter egg. Safe to re-run after soft navigation.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       Typing effect — "hello" in many languages
       --------------------------------------------------------------------- */
    var greetings = [
        { word: 'Hello', lang: 'English' },
        { word: 'Halo', lang: 'Indonesia' },
        { word: 'Hola', lang: 'Español' },
        { word: 'Bonjour', lang: 'Français' },
        { word: 'Ciao', lang: 'Italiano' },
        { word: 'Hallo', lang: 'Deutsch' },
        { word: 'Olá', lang: 'Português' },
        { word: 'Привет', lang: 'Русский' },
        { word: 'こんにちは', lang: '日本語' },
        { word: '你好', lang: '中文' },
        { word: '안녕하세요', lang: '한국어' },
        { word: 'नमस्ते', lang: 'हिन्दी' },
        { word: 'Merhaba', lang: 'Türkçe' },
        { word: 'Hej', lang: 'Svenska' },
        { word: 'สวัสดี', lang: 'ไทย' },
        { word: 'مرحبا', lang: 'العربية' },
        { word: 'Xin chào', lang: 'Tiếng Việt' },
        { word: 'Kumusta', lang: 'Filipino' },
        { word: 'Zdravo', lang: 'Srpski' },
        { word: 'Ahoj', lang: 'Čeština' },
        { word: 'Szia', lang: 'Magyar' },
        { word: 'درود', lang: 'فارسی' },
        { word: 'Γειά σου', lang: 'Ελληνικά' },
        { word: 'Hei', lang: 'Norsk' },
        { word: 'Terve', lang: 'Suomi' },
        { word: 'Aloha', lang: 'Hawaiʻi' },
        { word: 'שלום', lang: 'עברית' },
        { word: 'Jambo', lang: 'Kiswahili' },
        { word: 'Sawubona', lang: 'isiZulu' },
        { word: 'Halló', lang: 'Íslenska' },
        { word: 'Përshëndetje', lang: 'Shqip' },
        { word: 'Labas', lang: 'Lietuvių' },
        { word: 'Sveiki', lang: 'Latviešu' },
        { word: 'Tere', lang: 'Eesti' },
        { word: 'Bună', lang: 'Română' },
        { word: 'Salut', lang: 'Català' },
        { word: 'Dia duit', lang: 'Gaeilge' },
        { word: 'Helo', lang: 'Cymraeg' },
        { word: 'Salve', lang: 'Latina' },
        { word: 'Cześć', lang: 'Polski' },
        { word: 'Salom', lang: 'Oʻzbekcha' },
        { word: 'Sugeng', lang: 'Jawa' },
        { word: 'Wilujeng', lang: 'Sunda' },
        { word: 'Mejuah-juah', lang: 'Batak' },
        { word: 'Tabe', lang: 'Bugis' },
        { word: 'Kaixo', lang: 'Euskara' },
        { word: 'Ia ora na', lang: 'Reo Tahiti' },
        { word: 'Bula', lang: 'Vosa Vakaviti' },
        { word: 'Salam', lang: 'Melayu' },
        { word: 'Namaskar', lang: 'मराठी' }
    ];

    // Defensive dedupe: never show the same word or the same language twice.
    (function dedupeGreetings() {
        var words = Object.create(null);
        var langs = Object.create(null);

        greetings = greetings.filter(function (item) {
            if (!item || !item.word || !item.lang) return false;
            var w = item.word.toLowerCase();
            var l = item.lang.toLowerCase();
            if (words[w] || langs[l]) return false;
            words[w] = true;
            langs[l] = true;
            return true;
        });
    })();

    var typingSpeed = 85;
    var deletingSpeed = 38;
    var holdTime = 1400;
    var gapTime = 260;

    function shuffleArray(items) {
        var array = items.slice();
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    var typer = {
        el: null,
        wordEl: null,
        langEl: null,
        queue: [],
        wordIndex: 0,
        charIndex: 0,
        deleting: false,
        timer: null,
        running: false,
        paused: false
    };

    function stopTyping() {
        if (typer.timer) {
            clearTimeout(typer.timer);
            typer.timer = null;
        }
        typer.running = false;
        typer.paused = false;
        typer.el = null;
        typer.wordEl = null;
        typer.langEl = null;
        typer.queue = [];
        typer.wordIndex = 0;
        typer.charIndex = 0;
        typer.deleting = false;
    }

    function paintGreeting(word, language) {
        if (typer.wordEl) typer.wordEl.textContent = word;
        if (typer.langEl) typer.langEl.textContent = language || '';
    }

    function mountGreeting(el) {
        if (!el.querySelector('.greet-word')) {
            el.innerHTML =
                '<span class="greet-label" aria-hidden="true">Say hello</span>' +
                '<span class="greet-word"></span>' +
                '<span class="greet-lang" aria-hidden="true"></span>';
        }
        el.classList.add('is-ready');
        el.setAttribute('aria-label', 'Hello dalam banyak bahasa');
        typer.wordEl = el.querySelector('.greet-word');
        typer.langEl = el.querySelector('.greet-lang');
    }

    function resetGreetingQueue() {
        typer.queue = shuffleArray(greetings);
        typer.wordIndex = 0;
        typer.charIndex = 0;
        typer.deleting = false;
    }

    function typeStep() {
        var el = typer.el;
        if (!el || !el.isConnected) {
            stopTyping();
            return;
        }
        if (typer.paused) return;

        var entry = typer.queue[typer.wordIndex] || greetings[0];

        if (!typer.deleting) {
            typer.charIndex++;
            paintGreeting(entry.word.slice(0, typer.charIndex), '');

            if (typer.charIndex >= entry.word.length) {
                paintGreeting(entry.word, entry.lang);
                typer.deleting = true;
                typer.timer = setTimeout(typeStep, holdTime);
                return;
            }
            typer.timer = setTimeout(typeStep, typingSpeed);
        } else {
            typer.charIndex--;
            paintGreeting(entry.word.slice(0, Math.max(typer.charIndex, 0)), '');

            if (typer.charIndex <= 0) {
                typer.deleting = false;
                typer.wordIndex = (typer.wordIndex + 1) % typer.queue.length;

                if (typer.wordIndex === 0) {
                    typer.queue = shuffleArray(greetings);
                }

                typer.timer = setTimeout(typeStep, gapTime);
                return;
            }
            typer.timer = setTimeout(typeStep, deletingSpeed);
        }
    }

    function startTyping() {
        var el = document.getElementById('Greetings');
        if (!el) return;

        stopTyping();

        typer.el = el;
        mountGreeting(el);

        resetGreetingQueue();
        typer.running = true;
        typer.timer = setTimeout(typeStep, 650);
    }

    // Save battery: pause while the tab is in the background.
    document.addEventListener('visibilitychange', function () {
        if (!typer.running || !typer.el) return;

        if (document.hidden) {
            typer.paused = true;
            if (typer.timer) {
                clearTimeout(typer.timer);
                typer.timer = null;
            }
            return;
        }

        if (typer.paused) {
            typer.paused = false;
            typer.timer = setTimeout(typeStep, 500);
        }
    });

    /* ---------------------------------------------------------------------
       Skill bars
       --------------------------------------------------------------------- */
    var skillObserver = null;

    function animateProgressBars() {
        var fills = Array.prototype.slice.call(document.querySelectorAll('.progress-fill'));
        if (!fills.length) return;

        fills.forEach(function (fill, index) {
            var value = Number(fill.getAttribute('data-percentage')) || 0;
            var clamped = Math.max(0, Math.min(100, value));
            fill.setAttribute('data-percentage', String(clamped));
            fill.style.transition = 'none';
            fill.style.width = '0%';
            fill.classList.remove('animating');

            requestAnimationFrame(function () {
                var delay = 120 + index * 90;
                setTimeout(function () {
                    fill.style.transition = 'width 1.3s cubic-bezier(.22, 1, .36, 1), filter 0.7s ease';
                    fill.style.width = clamped + '%';
                    fill.classList.add('animating');
                    setTimeout(function () {
                        fill.classList.remove('animating');
                    }, 1600);
                }, delay);
            });
        });
    }

    function initSkills() {
        var sections = document.querySelectorAll('.skills-section');
        if (!sections.length) return;

        sections.forEach(function (section) {
            section.removeAttribute('data-animated');
        });

        if (skillObserver) {
            skillObserver.disconnect();
            skillObserver = null;
        }

        function runAnimationIfVisible(section) {
            if (section.hasAttribute('data-animated')) return;
            section.setAttribute('data-animated', 'true');
            setTimeout(animateProgressBars, 180);
        }

        if (!('IntersectionObserver' in window)) {
            sections.forEach(function (section) {
                runAnimationIfVisible(section);
            });
            return;
        }

        skillObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                runAnimationIfVisible(entry.target);
                skillObserver.unobserve(entry.target);
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

        sections.forEach(function (section) {
            var rect = section.getBoundingClientRect();
            var visible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
            if (visible) {
                runAnimationIfVisible(section);
            } else {
                skillObserver.observe(section);
            }
        });
    }

    /* ---------------------------------------------------------------------
       Easter egg (About page profile photo)
       --------------------------------------------------------------------- */
    var modalStyleInjected = false;

    function injectModalStyles() {
        if (modalStyleInjected || document.getElementById('rrn-modal-styles')) return;
        modalStyleInjected = true;

        var style = document.createElement('style');
        style.id = 'rrn-modal-styles';
        style.textContent = [
            '#hidden-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px}',
            '#hidden-modal .modal-overlay{position:absolute;inset:0;background:rgba(18,23,10,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:rrnFade .3s ease}',
            '#hidden-modal .modal-content{position:relative;width:min(620px,100%);max-height:82vh;overflow:auto;background:var(--paper,#fffdf7);color:var(--ink,#1e2417);border:1px solid var(--line,#deddc9);border-radius:22px;box-shadow:0 40px 90px -40px rgba(0,0,0,.6);animation:rrnUp .35s cubic-bezier(.2,.7,.2,1)}',
            '#hidden-modal .modal-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;background:linear-gradient(140deg,#33421a,#5a771f);color:#f6f9ea}',
            '#hidden-modal .modal-header h2{margin:0;font-size:1.15rem;font-weight:600;font-family:var(--font-body,Rubik,sans-serif)}',
            '#hidden-modal .close-btn{appearance:none;border:0;background:rgba(255,255,255,.14);color:#fff;width:34px;height:34px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer;transition:background .2s,transform .2s;flex-shrink:0}',
            '#hidden-modal .close-btn:hover{background:rgba(255,255,255,.28);transform:rotate(90deg)}',
            '#hidden-modal .modal-body{padding:24px}',
            '#hidden-modal .interest-section{margin-bottom:22px}',
            '#hidden-modal .interest-section:last-child{margin-bottom:0}',
            '#hidden-modal .interest-section h3{margin:0 0 10px;font-size:.72rem;font-family:var(--font-mono,"SUSE Mono",monospace);letter-spacing:.16em;text-transform:uppercase;color:var(--olive-deep,#4a5d23)}',
            '#hidden-modal .interest-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}',
            '#hidden-modal .interest-list li{padding:9px 10px;border-radius:8px;border-bottom:1px solid var(--line,#deddc9);font-size:.9rem;color:var(--ink-soft,#5b6350);transition:background .2s,color .2s,padding-left .2s}',
            '#hidden-modal .interest-list li:hover{background:rgba(107,142,35,.09);color:var(--ink,#1e2417);padding-left:16px}',
            '#hidden-modal .interest-list li:last-child{border-bottom:0}',
            '@keyframes rrnFade{from{opacity:0}to{opacity:1}}',
            '@keyframes rrnUp{from{opacity:0;transform:translateY(26px) scale(.98)}to{opacity:1;transform:none}}',
            '@media(max-width:600px){#hidden-modal .modal-content{max-height:88vh}#hidden-modal .modal-body{padding:18px}#hidden-modal .modal-header{padding:16px 18px}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function closeHiddenModal() {
        var modal = document.getElementById('hidden-modal');
        if (!modal) return;
        modal.remove();
        document.body.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    var lastFocusedElement = null;

    function showHiddenInterests() {
        if (document.getElementById('hidden-modal')) return;

        injectModalStyles();
        lastFocusedElement = document.activeElement;

        var interests = [
            { title: 'Suka pergi ke Timezone', items: ['Maimai', 'Wangan Midnight'] },
            {
                title: 'Favorite VTubers & Anime Characters',
                items: [
                    '<strong>Aoi Nabi</strong> [Illustrator]',
                    '<strong>KAngle</strong> [Needy Streamer Overload]',
                    '<strong>Twin Turbo</strong> [Uma Musume]',
                    '<strong>Loves Only You</strong> [Uma Musume]',
                    '<strong>Hishi Amazon</strong> [Uma Musume]',
                    '<strong>Ines</strong> [Arknights]',
                    '<strong>Ray</strong> [Arknights]',
                    '<strong>Mudrock</strong> [Arknights]',
                    '<strong>Kureiji Ollie</strong> [hololive]',
                    '<strong>Nerissa Ravencroft</strong> [hololive]',
                    '<em>...and many more! 😄</em>'
                ]
            },
            { title: 'Favorite song type', items: ['Lofi', 'Hardbass', 'EDM', 'Pop 80s Japanese', 'And many more things...'] }
        ];

        var modal = document.createElement('div');
        modal.id = 'hidden-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Hidden interests and favorites');

        var sections = interests.map(function (section) {
            var list = section.items.map(function (item) {
                return '<li>' + item + '</li>';
            }).join('');
            return '<div class="interest-section"><h3>' + section.title + '</h3><ul class="interest-list">' + list + '</ul></div>';
        }).join('');

        modal.innerHTML =
            '<div class="modal-overlay" data-close-modal></div>' +
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h2>🎮 Hidden Interests &amp; Favorites</h2>' +
                    '<button type="button" class="close-btn" data-close-modal aria-label="Tutup">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' + sections + '</div>' +
            '</div>';

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelectorAll('[data-close-modal]').forEach(function (node) {
            node.addEventListener('click', closeHiddenModal);
        });

        var closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) closeBtn.focus();

        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', onKey);
                closeHiddenModal();
            }
        });
    }

    function initEasterEgg() {
        var photo = document.querySelector('.profile-photo');
        if (!photo) return;

        var isAboutPage = /About\.html$/i.test(window.location.pathname) ||
            (document.title || '').toLowerCase().indexOf('about') === 0;

        photo.style.cursor = isAboutPage ? 'pointer' : 'zoom-in';
        if (isAboutPage) {
            photo.onclick = showHiddenInterests;
            photo.setAttribute('title', 'Klik untuk kejutan kecil');
            photo.setAttribute('role', 'button');
            photo.setAttribute('tabindex', '0');
            photo.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showHiddenInterests();
                }
            });
        } else {
            photo.onclick = null;
            photo.removeAttribute('role');
            photo.removeAttribute('tabindex');
        }
    }

    /* ---------------------------------------------------------------------
       Misc
       --------------------------------------------------------------------- */
    function updateYear() {
        document.querySelectorAll('[data-year]').forEach(function (node) {
            node.textContent = String(new Date().getFullYear());
        });
    }

    function initPage() {
        startTyping();
        initSkills();
        initEasterEgg();
        updateYear();
        document.dispatchEvent(new CustomEvent('rrn:page-ready'));
    }

    window.PortfolioPage = {
        initPage: initPage,
        closeHiddenModal: closeHiddenModal
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage, { once: true });
    } else {
        initPage();
    }
})();
