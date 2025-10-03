// Floating Music Player - Bug-Free Version
class FloatingMusicPlayer {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.isMinimized = false;
        this.volume = 0.7;
        this.playlistVisible = false;
        this.isLooping = false;
        this.tracks = [];
        this.audio = null;
        this.isInitialized = false;
        this.eventListenersAttached = false;

        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Don't show on GitHub pages
        if (window.location.href.includes('github.com') || window.location.pathname.includes('github')) {
            console.log('Skipping music player on GitHub pages');
            return;
        }

        // Check if we should maintain existing audio playback
        const existingPlayer = document.getElementById('floating-music-player');
        const existingAudio = window.persistentAudio;

        if (existingPlayer && existingAudio && !existingAudio.paused) {
            console.log('🎵 Maintaining existing audio playback across page navigation');
            // Audio is already playing, just update UI
            this.audio = existingAudio;
            this.restoreState();
            this.updateExistingPlayerUI();
            this.setupEventListeners();
            this.restoreUIState();
            this.isInitialized = true;
            return;
        }

        // Prevent multiple initializations on same page
        if (this.isInitialized) {
            console.log('Music player already initialized on this page');
            return;
        }

        // Check if player element exists but audio stopped
        if (existingPlayer) {
            console.log('Music player element exists but audio stopped, recreating...');
            existingPlayer.remove();
        }

        console.log('🎵 Initializing new music player...');

        // Create persistent audio element
        this.audio = new Audio();
        this.audio.preload = 'none';
        this.audio.volume = this.volume;

        // Make audio persistent across page navigation
        window.persistentAudio = this.audio;

        // Add page visibility API to handle background playback
        this.setupPageVisibilityHandling();

        // Load tracks and create player
        this.loadTracksFromJSON().then(() => {
            console.log('✅ Tracks loaded from JSON');
            this.restoreState();
            this.createPlayer();
            this.setupEventListeners();
            this.loadTrack(this.currentTrack);
            this.restoreUIState();
            this.isInitialized = true;
            console.log('✅ Music player initialized successfully');
        }).catch(error => {
            console.error('❌ Failed to load music tracks:', error);
            this.loadFallbackTracks();
        });
    }

    loadFallbackTracks() {
        console.log('⚠️ Using fallback tracks');
        this.tracks = [
            { title: 'Blue Archive Theme 242', artist: 'Blue Archive', src: 'music/Blue Archive _ Theme 242 [10 Minutes Loop] [U8PWvarbgok].mp3' },
            { title: 'Blue Archive OST 135', artist: 'Blue Archive', src: 'music/blue archive ost 135.mp3' },
            { title: 'Chatter Between Roots', artist: 'Genshin Impact', src: 'music/Chatter Between Roots.mp3' },
            { title: 'Flows of Jade-Like Water', artist: 'Genshin Impact', src: 'music/Flows of Jade-Like Water.mp3' },
            { title: 'Nightcore Gwai san neung', artist: 'Nightcore', src: 'music/Nightcore Gwai san neung.mp3' },
            { title: 'Tsukihime Main Theme', artist: 'Tsukihime', src: 'music/Tsukihime main theme.mp3' },
            { title: 'Guiding Ahead Lobby Theme', artist: 'Arknights', src: 'music/アークナイツ BGM - Guiding Ahead Lobby Theme  Arknights明日方舟 吾导先路 OST.mp3' },
            { title: 'Invitation to Wine Lobby Theme', artist: 'Arknights', src: 'music/アークナイツ BGM - Invitation to Wine Lobby Theme  Arknights明日方舟 将进酒 OST.mp3' },
            { title: '安里屋ユンタ (沖ツラバージョン) M26', artist: 'Unknown', src: 'music/安里屋ユンタ (沖ツラバージョン) M26.mp3' },
            { title: 'Frost Pillar - Another Side -', artist: 'Genshin Impact', src: 'music/Frost Pillar - Another Side -.mp3' },
            { title: 'Frost Pillar (Scenario Version)', artist: 'Genshin Impact', src: 'music/Frost Pillar (Scenario Version).mp3' },
            { title: 'Frost Pillar', artist: 'Genshin Impact', src: 'music/Frost Pillar.mp3' },
            { title: 'Sān-Z Studio Theme Zenless Zone Zero 1.3', artist: 'Zenless Zone Zero', src: 'music/Sān-Z Studio Theme  Zenless Zone Zero 1.3.mp3' },
            { title: 'Zenless Zone Zero Lumina Square Night OST', artist: 'Zenless Zone Zero', src: 'music/Zenless Zone Zero Lumina Square Night OST  ZZZ.mp3' }
        ];

        this.restoreState();
        this.createPlayer();
        this.setupEventListeners();
        this.loadTrack(this.currentTrack);
        this.restoreUIState();
        this.isInitialized = true;
    }

    updateExistingPlayerUI() {
        console.log('🎵 Updating existing player UI for page navigation');

        // Update track info display
        this.updateTrackInfo();

        // Update playlist UI
        this.updatePlaylistUI();

        // Update play/pause button state
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }

        // Update loop button state
        const loopBtn = document.getElementById('loop-btn');
        if (loopBtn) {
            loopBtn.classList.toggle('active', this.isLooping);
        }

        console.log('✅ Existing player UI updated');
    }

    setupPageVisibilityHandling() {
        // Handle page visibility changes to maintain audio playback
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden - music will continue playing in background');
            } else {
                console.log('Page visible - updating UI state');
                // Update UI when page becomes visible again
                if (this.audio && !this.audio.paused) {
                    this.isPlaying = true;
                    const playBtn = document.getElementById('play-btn');
                    if (playBtn) playBtn.textContent = '⏸';
                }
            }
        });

        // Handle beforeunload to save state
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Handle page navigation (for SPA-like behavior)
        window.addEventListener('popstate', () => {
            console.log('Page navigation detected - maintaining audio');
            // Small delay to allow page to load
            setTimeout(() => {
                if (this.audio && !this.audio.paused) {
                    console.log('Audio still playing after navigation');
                }
            }, 100);
        });
    }

    createPlayer() {
        const playerHTML = `
            <div id="floating-music-player" class="music-player">
                <div class="player-header">
                    <div class="now-playing">
                        <div class="track-info">
                            <div class="track-title">${this.tracks[this.currentTrack].title}</div>
                            <div class="track-artist">${this.tracks[this.currentTrack].artist}</div>
                        </div>
                        <div class="player-controls">
                            <button class="control-btn" id="prev-btn">⏮</button>
                            <button class="control-btn play-btn" id="play-btn">▶</button>
                            <button class="control-btn" id="next-btn">⏭</button>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="action-btn" id="loop-btn">🔁</button>
                        <button class="action-btn" id="playlist-toggle">📋</button>
                        <button class="action-btn" id="minimize-btn">−</button>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="time-display">
                        <span id="current-time">0:00</span>
                        <span class="time-separator">/</span>
                        <span id="duration">0:00</span>
                    </div>
                </div>

                <div class="volume-section">
                    <span class="volume-icon">🔊</span>
                    <button class="volume-btn" id="volume-down">-</button>
                    <span class="volume-display" id="volume-display">${Math.round(this.volume * 100)}%</span>
                    <button class="volume-btn" id="volume-up">+</button>
                </div>

                <div class="playlist-section" id="playlist-section">
                    <div class="playlist-header">Playlist</div>
                    <div class="playlist-tracks" id="playlist-tracks">
                        ${this.tracks.length > 0 ? this.tracks.map((track, index) =>
                            `<div class="playlist-item ${index === this.currentTrack ? 'active' : ''}" data-index="${index}">
                                <div class="playlist-track-info">
                                    <div class="playlist-track-title">${track.title}</div>
                                    <div class="playlist-track-artist">${track.artist}</div>
                                </div>
                                <div class="playlist-play-icon">${index === this.currentTrack ? '🎵' : ''}</div>
                            </div>`
                        ).join('') : '<div class="playlist-item">Loading tracks...</div>'}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', playerHTML);

        // Debug: Check if buttons were created
        console.log('Music player created. Checking buttons...');
        console.log('Loop button:', document.getElementById('loop-btn'));
        console.log('Playlist button:', document.getElementById('playlist-toggle'));
        console.log('Minimize button:', document.getElementById('minimize-btn'));

        // Add CSS styles with high specificity
        const style = document.createElement('style');
        style.textContent = `
        /* Force application of new music player styles */
        #floating-music-player.music-player {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 480px !important;
            height: 180px !important;
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a) !important;
            border: 3px solid #444 !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1) !important;
            color: #fff !important;
            font-family: 'SUSE Mono', monospace !important;
            z-index: 9999 !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
        }

        /* Player header styles */
        .player-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 15px 20px !important;
            background: linear-gradient(135deg, #333, #444) !important;
            border-bottom: 2px solid #555 !important;
            color: white !important;
            min-height: 60px !important;
            position: relative !important;
        }

        .now-playing {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            flex: 1 !important;
            min-width: 0 !important;
        }

        .track-info {
            flex: 1 !important;
            min-width: 0 !important;
            overflow: hidden !important;
        }

        .track-title {
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: 2px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 200px !important;
        }

        .track-artist {
            font-size: 12px !important;
            opacity: 0.8 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 200px !important;
        }

        .player-controls {
            display: flex !important;
            gap: 8px !important;
        }

        .control-btn, .action-btn {
            background: #f0f8f0 !important;
            border: 2px solid olivedrab !important;
            color: olivedrab !important;
            font-size: 16px !important;
            cursor: pointer !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            transition: all 0.2s ease !important;
            font-weight: bold !important;
            min-width: 40px !important;
            text-align: center !important;
        }

        .control-btn:hover, .action-btn:hover {
            background-color: olivedrab !important;
            color: white !important;
            transform: scale(1.05) !important;
        }

        .play-btn {
            font-size: 20px !important;
            background: olivedrab !important;
            color: white !important;
            padding: 10px 15px !important;
            border: none !important;
        }

        .play-btn:hover {
            background: #4a5d23 !important;
            transform: scale(1.05) !important;
        }

        .player-actions {
            display: flex !important;
            gap: 8px !important;
            align-items: center !important;
            flex-shrink: 0 !important;
            margin-left: 15px !important;
        }

        .progress-section {
            padding: 15px 20px !important;
            background: linear-gradient(135deg, #222, #333) !important;
            border-top: 1px solid #444 !important;
        }

        .time-display {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #fff !important;
            gap: 5px !important;
        }

        .time-separator {
            color: olivedrab !important;
            font-weight: bold !important;
        }

        .volume-section {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            padding: 10px 20px !important;
            background: linear-gradient(135deg, #2a2a2a, #333) !important;
            border-top: 1px solid #444 !important;
        }

        .volume-icon {
            font-size: 16px !important;
            color: #ccc !important;
        }

        .volume-btn {
            background: #f0f8f0 !important;
            border: 2px solid olivedrab !important;
            color: olivedrab !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            padding: 5px 12px !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
            min-width: 35px !important;
        }

        .volume-btn:hover {
            background-color: olivedrab !important;
            color: white !important;
            transform: scale(1.05) !important;
        }

        .volume-display {
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #fff !important;
            min-width: 50px !important;
            text-align: center !important;
            background: #444 !important;
            padding: 5px 10px !important;
            border-radius: 4px !important;
            border: 1px solid #555 !important;
        }

        .action-btn.active {
            background: olivedrab !important;
            color: white !important;
            border-color: #4a5d23 !important;
            box-shadow: 0 0 8px rgba(107, 142, 35, 0.6) !important;
        }

        .playlist-section {
            border-top: 2px solid #555 !important;
            max-height: 200px !important;
            overflow-y: auto !important;
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a) !important;
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            transition: all 0.3s ease !important;
        }

        .playlist-section.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            max-height: 200px !important;
            overflow-y: auto !important;
        }

        .playlist-header {
            padding: 15px 20px !important;
            font-weight: 600 !important;
            border-bottom: 2px solid #555 !important;
            color: #fff !important;
            background: linear-gradient(135deg, #333, #444) !important;
            font-size: 14px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }

        .playlist-item {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 20px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            border-bottom: 1px solid #333 !important;
            background: #222 !important;
            color: #ccc !important;
        }

        .playlist-item:hover {
            background: #333 !important;
            transform: translateX(5px) !important;
        }

        .playlist-item.active {
            background: olivedrab !important;
            color: white !important;
            border-left: 4px solid #4a5d23 !important;
            box-shadow: 0 0 8px rgba(107, 142, 35, 0.4) !important;
        }

        .playlist-track-info {
            flex: 1 !important;
        }

        .playlist-track-title {
            font-size: 13px !important;
            font-weight: 500 !important;
            margin-bottom: 2px !important;
        }

        .playlist-track-artist {
            font-size: 11px !important;
            opacity: 0.7 !important;
        }

        .playlist-play-icon {
            font-size: 14px !important;
            margin-left: 10px !important;
        }

        .music-player.minimized {
            width: 80px !important;
            height: 80px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a) !important;
            border: 3px solid olivedrab !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            transition: all 0.3s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .music-player.minimized:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 6px 20px rgba(107, 142, 35, 0.4) !important;
            border-color: #4a5d23 !important;
        }

        .music-player.minimized .player-header,
        .music-player.minimized .progress-section,
        .music-player.minimized .volume-section,
        .music-player.minimized .playlist-section {
            display: none !important;
        }

        .music-player.minimized::before {
            content: '+' !important;
            position: static !important;
            font-size: 24px !important;
            font-weight: bold !important;
            color: olivedrab !important;
            text-shadow: 0 0 8px rgba(107, 142, 35, 0.6) !important;
            transform: none !important;
        }

        @media (max-width: 768px) {
            .music-player {
                width: calc(100vw - 40px) !important;
                height: 160px !important;
                bottom: 10px !important;
                right: 10px !important;
                left: 10px !important;
            }

            .player-header {
                padding: 12px 15px !important;
            }

            .progress-section {
                padding: 12px 15px !important;
            }

            .volume-section {
                padding: 8px 15px !important;
                gap: 8px !important;
            }

            .volume-display {
                font-size: 12px !important;
                min-width: 40px !important;
                padding: 4px 8px !important;
            }

            .volume-btn {
                padding: 4px 8px !important;
                font-size: 14px !important;
                min-width: 30px !important;
            }

            .now-playing {
                flex-direction: column !important;
                gap: 8px !important;
                align-items: flex-start !important;
            }

            .player-controls {
                align-self: center !important;
            }

            .track-title, .track-artist {
                max-width: 150px !important;
            }

            .player-actions {
                margin-left: 10px !important;
            }

            .playlist-header {
                padding: 12px 15px !important;
                font-size: 12px !important;
            }

            .playlist-item {
                padding: 10px 15px !important;
            }
        }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Prevent duplicate event listener setup
        if (this.eventListenersAttached) {
            console.log('Event listeners already attached');
            return;
        }

        console.log('Setting up event listeners...');

        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const playBtn = document.getElementById('play-btn');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const volumeDown = document.getElementById('volume-down');
            const volumeUp = document.getElementById('volume-up');
            const minimizeBtn = document.getElementById('minimize-btn');
            const playlistToggle = document.getElementById('playlist-toggle');
            const loopBtn = document.getElementById('loop-btn');

            console.log('Found elements:', {
                playBtn: !!playBtn,
                prevBtn: !!prevBtn,
                nextBtn: !!nextBtn,
                volumeDown: !!volumeDown,
                volumeUp: !!volumeUp,
                minimizeBtn: !!minimizeBtn,
                playlistToggle: !!playlistToggle,
                loopBtn: !!loopBtn
            });

            // Playback controls
            if (playBtn) {
                playBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Play button clicked');
                    this.togglePlay();
                };
            }

            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Prev button clicked');
                    this.prevTrack();
                };
            }

            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next button clicked');
                    this.nextTrack();
                };
            }

            // Volume controls
            if (volumeDown) {
                volumeDown.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Volume down clicked');
                    this.adjustVolume(-0.1);
                };
            }

            if (volumeUp) {
                volumeUp.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Volume up clicked');
                    this.adjustVolume(0.1);
                };
            }

            // Minimize button
            if (minimizeBtn) {
                minimizeBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Minimize button clicked');
                    this.toggleMinimize();
                };
            }

            // Playlist toggle
            if (playlistToggle) {
                playlistToggle.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Playlist toggle clicked');
                    this.togglePlaylist();
                };
            }

            // Loop toggle
            if (loopBtn) {
                loopBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Loop button clicked');
                    this.toggleLoop();
                };
            }

            // Audio events
            if (this.audio) {
                this.audio.ontimeupdate = () => this.updateProgress();
                this.audio.onloadedmetadata = () => this.updateDuration();
                this.audio.onended = () => this.nextTrack();
                this.audio.onerror = (e) => {
                    console.error('Audio error:', e);
                    this.handleAudioError();
                };
            }

            // Set initial volume
            if (this.audio) {
                this.audio.volume = this.volume;
            }

            this.eventListenersAttached = true;
            console.log('✅ Event listeners attached successfully');
        }, 100);
    }

    loadTrack(index) {
        if (!this.tracks || !this.tracks[index] || !this.audio) {
            console.error('Cannot load track: invalid track data or audio element');
            return;
        }

        try {
            this.currentTrack = index;
            this.audio.src = this.tracks[index].src;
            this.audio.load(); // Force reload

            this.updateTrackInfo();
            this.updatePlaylistUI();
            this.saveState();

            console.log('Loaded track:', this.tracks[index].title);

            // Auto-play if currently playing
            if (this.isPlaying) {
                setTimeout(() => this.play(), 100); // Small delay for loading
            }
        } catch (error) {
            console.error('Error loading track:', error);
            this.handleAudioError();
        }
    }

    playTrack(index) {
        this.loadTrack(index);
        setTimeout(() => this.play(), 200); // Give time for track to load
    }

    togglePlay() {
        if (!this.audio) {
            console.error('Audio element not available');
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.audio) return;

        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                const playBtn = document.getElementById('play-btn');
                if (playBtn) playBtn.textContent = '⏸';
                console.log('Playback started');
            }).catch(error => {
                console.error('Playback failed:', error);
                this.isPlaying = false;
                // Try to play again after a short delay
                setTimeout(() => {
                    if (this.audio && !this.isPlaying) {
                        this.audio.play().catch(e => console.error('Retry playback failed:', e));
                    }
                }, 1000);
            });
        }
    }

    pause() {
        if (!this.audio) return;

        try {
            this.audio.pause();
            this.isPlaying = false;
            const playBtn = document.getElementById('play-btn');
            if (playBtn) playBtn.textContent = '▶';
            console.log('Playback paused');
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    }

    handleAudioError() {
        console.error('Audio playback error - attempting recovery');

        // Try to reload the current track
        if (this.tracks && this.tracks[this.currentTrack]) {
            setTimeout(() => {
                console.log('Retrying track load...');
                this.loadTrack(this.currentTrack);
            }, 2000);
        }

        // Update UI to show error state
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.textContent = '❌';
            setTimeout(() => {
                if (playBtn) playBtn.textContent = '▶';
            }, 3000);
        }
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        this.updateVolumeDisplay();
        this.saveState();
    }

    updateVolumeDisplay() {
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = Math.round(this.volume * 100) + '%';
        }
    }

    nextTrack() {
        if (this.isLooping) {
            // If looping is enabled, restart current track
            this.audio.currentTime = 0;
            if (this.isPlaying) {
                this.audio.play();
            }
        } else {
            // Normal behavior - go to next track
            const nextIndex = (this.currentTrack + 1) % this.tracks.length;
            this.loadTrack(nextIndex);
        }
    }

    prevTrack() {
        const prevIndex = this.currentTrack === 0 ? this.tracks.length - 1 : this.currentTrack - 1;
        this.loadTrack(prevIndex);
    }

    seek(e) {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }

    updateProgress() {
        if (!this.audio || isNaN(this.audio.duration)) return;

        try {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            const progressFill = document.getElementById('progress-fill');
            const currentTime = document.getElementById('current-time');

            if (progressFill) {
                progressFill.style.width = Math.min(percent, 100) + '%';
            }

            if (currentTime) {
                currentTime.textContent = this.formatTime(this.audio.currentTime);
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    updateDuration() {
        if (!this.audio) return;

        try {
            const duration = document.getElementById('duration');
            if (duration) {
                duration.textContent = this.formatTime(this.audio.duration);
            }
        } catch (error) {
            console.error('Error updating duration:', error);
        }
    }

    updateTrackInfo() {
        if (!this.tracks || !this.tracks[this.currentTrack]) return;

        try {
            const titleElement = document.querySelector('.track-title');
            const artistElement = document.querySelector('.track-artist');

            if (titleElement) {
                titleElement.textContent = this.tracks[this.currentTrack].title || 'Unknown Title';
            }

            if (artistElement) {
                artistElement.textContent = this.tracks[this.currentTrack].artist || 'Unknown Artist';
            }

            console.log('Updated track info:', this.tracks[this.currentTrack].title);
        } catch (error) {
            console.error('Error updating track info:', error);
        }
    }

    safeUpdateElement(selector, content, property = 'textContent') {
        try {
            const element = document.querySelector(selector) || document.getElementById(selector.replace('#', '').replace('.', ''));
            if (element) {
                element[property] = content;
            }
        } catch (error) {
            console.error('Error updating element:', selector, error);
        }
    }

    updatePlaylistUI() {
        const playlistTracks = document.getElementById('playlist-tracks');
        if (playlistTracks && this.tracks.length > 0) {
            playlistTracks.innerHTML = this.tracks.map((track, index) =>
                `<div class="playlist-item ${index === this.currentTrack ? 'active' : ''}" data-index="${index}">
                    <div class="playlist-track-info">
                        <div class="playlist-track-title">${track.title}</div>
                        <div class="playlist-track-artist">${track.artist}</div>
                    </div>
                    <div class="playlist-play-icon">${index === this.currentTrack ? '🎵' : ''}</div>
                </div>`
            ).join('');

            // Attach event listeners to playlist items
            this.attachPlaylistListeners();
        }
    }

    toggleMinimize() {
        const player = document.getElementById('floating-music-player');
        if (!player) return;

        this.isMinimized = !this.isMinimized;
        player.classList.toggle('minimized', this.isMinimized);

        // Update button text
        const minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.textContent = this.isMinimized ? '+' : '−';
        }

        // Remove existing click listener if it exists
        if (this.isMinimized) {
            player.style.cursor = 'pointer';
            player.addEventListener('click', this.handleMinimizedClick);
        } else {
            player.style.cursor = 'default';
            player.removeEventListener('click', this.handleMinimizedClick);
        }

        this.saveState();
        console.log('Player minimized:', this.isMinimized);
    }

    handleMinimizedClick = () => {
        this.restorePlayer();
    }

    restorePlayer() {
        const player = document.getElementById('floating-music-player');
        if (!player) return;

        this.isMinimized = false;
        player.classList.remove('minimized');
        player.style.cursor = 'default';

        // Update button text
        const minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.textContent = '−';
        }

        // Remove click listener
        player.removeEventListener('click', this.handleMinimizedClick);

        this.saveState();
        console.log('Player restored to normal size');
    }

    togglePlaylist() {
        const playlistSection = document.getElementById('playlist-section');
        const playlistBtn = document.getElementById('playlist-toggle');

        console.log('Toggle playlist called. Current state:', {
            playlistVisible: this.playlistVisible,
            playlistSection: !!playlistSection,
            playlistBtn: !!playlistBtn
        });

        if (!playlistSection) {
            console.error('Playlist section not found!');
            return;
        }

        // Toggle the visibility state
        this.playlistVisible = !this.playlistVisible;

        // Force visibility with multiple approaches
        if (this.playlistVisible) {
            playlistSection.classList.add('show');
            playlistSection.style.setProperty('display', 'block', 'important');
            playlistSection.style.setProperty('visibility', 'visible', 'important');
            playlistSection.style.setProperty('opacity', '1', 'important');
            playlistSection.style.setProperty('height', 'auto', 'important');
            playlistSection.style.setProperty('max-height', '200px', 'important');
            console.log('Playlist shown - forced visibility');
        } else {
            playlistSection.classList.remove('show');
            playlistSection.style.setProperty('display', 'none', 'important');
            playlistSection.style.setProperty('visibility', 'hidden', 'important');
            playlistSection.style.setProperty('opacity', '0', 'important');
            console.log('Playlist hidden - forced invisibility');
        }

        // Debug: Check if class was applied
        console.log('Playlist section classes:', playlistSection.className);
        console.log('Playlist section computed style display:', getComputedStyle(playlistSection).display);

        // Update button appearance
        if (playlistBtn) {
            if (this.playlistVisible) {
                playlistBtn.classList.add('active');
                playlistBtn.style.backgroundColor = 'olivedrab';
                playlistBtn.style.color = 'white';
            } else {
                playlistBtn.classList.remove('active');
                playlistBtn.style.backgroundColor = '';
                playlistBtn.style.color = '';
            }
        }

        // Re-attach event listeners to playlist items when showing playlist
        if (this.playlistVisible) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                this.attachPlaylistListeners();
            }, 50);
        }

        this.saveState();
        console.log('Playlist toggle completed. New state:', this.playlistVisible);
    }

    attachPlaylistListeners() {
        console.log('Attaching playlist listeners...');
        const playlistItems = document.querySelectorAll('.playlist-item');
        console.log('Found playlist items:', playlistItems.length);

        playlistItems.forEach((item, index) => {
            item.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Playlist item clicked:', index);
                this.playTrack(index);
            };
        });
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        const loopBtn = document.getElementById('loop-btn');
        if (loopBtn) {
            loopBtn.classList.toggle('active', this.isLooping);
        }
        this.saveState();
    }

    saveState() {
        const state = {
            currentTrack: this.currentTrack,
            volume: this.volume,
            isLooping: this.isLooping,
            isMinimized: this.isMinimized,
            playlistVisible: this.playlistVisible
        };
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }

    restoreState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentTrack = state.currentTrack || 0;
                this.volume = state.volume || 0.7;
                this.isLooping = state.isLooping || false;
                this.isMinimized = state.isMinimized || false;
                this.playlistVisible = state.playlistVisible || false;
            } catch (e) {
                console.log('Error restoring music player state:', e);
            }
        }
    }

    loadTracksFromJSON() {
        return fetch('music/music.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load music.json');
                }
                return response.json();
            })
            .then(data => {
                this.tracks = data.tracks || [];
                console.log('Loaded', this.tracks.length, 'tracks from music.json');
            });
    }

    restoreUIState() {
        // Update volume display
        this.updateVolumeDisplay();

        // Restore minimized state and button text
        const player = document.getElementById('floating-music-player');
        const minimizeBtn = document.getElementById('minimize-btn');

        if (player) {
            player.classList.toggle('minimized', this.isMinimized);
            if (this.isMinimized) {
                player.style.cursor = 'pointer';
                player.addEventListener('click', this.handleMinimizedClick);
            }
        }

        if (minimizeBtn) {
            minimizeBtn.textContent = this.isMinimized ? '+' : '−';
        }

        // Restore playlist visibility (default to hidden)
        const playlistSection = document.getElementById('playlist-section');
        const playlistBtn = document.getElementById('playlist-toggle');

        if (playlistSection) {
            if (this.playlistVisible) {
                playlistSection.classList.add('show');
            } else {
                playlistSection.classList.remove('show');
            }
        }

        if (playlistBtn) {
            if (this.playlistVisible) {
                playlistBtn.classList.add('active');
                playlistBtn.style.backgroundColor = 'olivedrab';
                playlistBtn.style.color = 'white';
            } else {
                playlistBtn.classList.remove('active');
                playlistBtn.style.backgroundColor = '';
                playlistBtn.style.color = '';
            }
        }

        // Restore loop button state
        const loopBtn = document.getElementById('loop-btn');
        if (loopBtn) {
            loopBtn.classList.toggle('active', this.isLooping);
        }

        console.log('UI state restored - minimized:', this.isMinimized, 'playlist visible:', this.playlistVisible);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Prevent multiple music player instances
if (!window.musicPlayerInstance) {
    window.musicPlayerInstance = new FloatingMusicPlayer();
    console.log('🎵 Music player instance created');
} else {
    console.log('🎵 Music player instance already exists');
}