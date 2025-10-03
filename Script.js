console.log('Script.js loaded successfully');

// Typing effect for multilingual greetings
const greetings = [
    "Hello",
    "Halo",
    "Hola",
    "Bonjour",
    "Ciao",
    "你好",
    "안녕하세요",
    "Guten Tag",
    "こんにちは",
    "مرحبا",
    "Привет",
    "Olá",
    "नमस्ते",
    "Merhaba",
    "Hallo",
    "Hej",
    "สวัสดี"
];

let currentGreetingIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 150;
let pauseTime = 2000;

function typeWriter() {
    const greetingElement = document.getElementById('Greetings');

    // Only run if the Greetings element exists (only on index.html)
    if (!greetingElement) {
        console.log('Greetings element not found, skipping typewriter effect');
        return;
    }

    const currentGreeting = greetings[currentGreetingIndex];

    if (!isDeleting) {
        // Typing effect
        greetingElement.textContent = currentGreeting.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentGreeting.length) {
            // Finished typing, pause before deleting
            isDeleting = true;
            setTimeout(typeWriter, pauseTime);
            return;
        }
    } else {
        // Deleting effect
        greetingElement.textContent = currentGreeting.substring(0, currentCharIndex);
        currentCharIndex--;

        if (currentCharIndex < 0) {
            // Finished deleting, move to next greeting
            isDeleting = false;
            currentGreetingIndex = (currentGreetingIndex + 1) % greetings.length;
            setTimeout(typeWriter, 500); // Pause before starting next greeting
            return;
        }
        typingSpeed = 100; // Faster when deleting
    }

    setTimeout(typeWriter, typingSpeed);
}

// Animate progress bars - simplified and more reliable
function animateProgressBars() {
    console.log('🎯 Starting progress bar animation...');
    const progressFills = document.querySelectorAll('.progress-fill');
    console.log('📊 Found', progressFills.length, 'progress bars');

    if (progressFills.length === 0) {
        console.log('❌ No progress bars found on this page');
        return;
    }

    // Reset all bars to 0 first
    progressFills.forEach(fill => {
        fill.style.width = '0%';
        fill.style.transition = 'none';
        fill.style.opacity = '1';
    });

    // Force reflow to ensure reset takes effect
    if (progressFills[0]) {
        progressFills[0].offsetHeight;
    }

    // Small delay to ensure reset is complete
    setTimeout(() => {
        // Animate each bar with staggered timing
        progressFills.forEach((fill, index) => {
            const percentage = fill.getAttribute('data-percentage') || '0';
            console.log('🎨 Animating bar', index + 1, 'to', percentage + '%');

            setTimeout(() => {
                fill.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                fill.style.width = percentage + '%';
                console.log('✅ Set bar', index + 1, 'width to', percentage + '%');
            }, index * 300); // Increased delay for better visibility
        });
    }, 100);
}

// Function to initialize all animations
function initializeAnimations() {
    // Start typing effect
    setTimeout(typeWriter, 1000);

    // Set up scroll-triggered progress bar animation
    setupScrollAnimations();
}

// Function to handle scroll-triggered animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillsSection = entry.target;
                if (skillsSection && !skillsSection.hasAttribute('data-animated')) {
                    skillsSection.setAttribute('data-animated', 'true');
                    setTimeout(() => {
                        animateProgressBars();
                    }, 300);
                }
            }
        });
    }, observerOptions);

    // Observe skills sections
    const skillsSections = document.querySelectorAll('.skills-section');
    skillsSections.forEach(section => {
        observer.observe(section);
    });

    // Also trigger on page load if skills section is already visible
    setTimeout(() => {
        const skillsSection = document.querySelector('.skills-section');
        if (skillsSection) {
            const rect = skillsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (!skillsSection.hasAttribute('data-animated')) {
                    skillsSection.setAttribute('data-animated', 'true');
                    animateProgressBars();
                }
            }
        }
    }, 1000);
}

// Start animations when page loads
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeAnimations();
}

// Only run GitHub API calls on pages that have GitHub elements
if (document.getElementById("github-name")) {
    const username = "Reeinold";  // Replace with your GitHub username
    const apiUrl = `https://api.github.com/users/${username}`;

    console.log('Fetching GitHub API:', apiUrl);

    // Set default values first (only if elements exist)
    const githubName = document.getElementById("github-name");
    const githubRepos = document.getElementById("github-repos");
    const githubFollowers = document.getElementById("github-followers");
    const githubFollowing = document.getElementById("github-following");
    const githubPublicRepos = document.getElementById("github-public-repos");
    const githubGists = document.getElementById("github-gists");

    if (githubName) githubName.textContent = "Loading...";
    if (githubRepos) githubRepos.textContent = "Loading...";
    if (githubFollowers) githubFollowers.textContent = "Loading...";
    if (githubFollowing) githubFollowing.textContent = "Loading...";
    if (githubPublicRepos) githubPublicRepos.textContent = "Loading...";
    if (githubGists) githubGists.textContent = "Loading...";

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 second timeout
    });

    // Race between fetch and timeout
    Promise.race([
        fetch(apiUrl).then(response => {
            console.log('GitHub API response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }),
        timeoutPromise
    ])
        .then(data => {
            console.log('GitHub data received:', data);
            // Update with actual data (only if elements exist)
            const githubName = document.getElementById("github-name");
            const githubRepos = document.getElementById("github-repos");
            const githubFollowers = document.getElementById("github-followers");
            const githubFollowing = document.getElementById("github-following");
            const githubPublicRepos = document.getElementById("github-public-repos");
            const githubGists = document.getElementById("github-gists");

            if (githubName) githubName.textContent = `Username: ${data.login || 'N/A'}`;
            if (githubRepos) githubRepos.textContent = `Public Repositories: ${data.public_repos || 0}`;
            if (githubFollowers) githubFollowers.textContent = `Followers: ${data.followers || 0}`;
            if (githubFollowing) githubFollowing.textContent = `Following: ${data.following || 0}`;
            if (githubPublicRepos) githubPublicRepos.textContent = `Public Repos: ${data.public_repos || 0}`;
            if (githubGists) githubGists.textContent = `Gists: ${data.public_gists || 0}`;
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
            // Set fallback values on error or timeout (only if elements exist)
            const githubName = document.getElementById("github-name");
            const githubRepos = document.getElementById("github-repos");
            const githubFollowers = document.getElementById("github-followers");
            const githubFollowing = document.getElementById("github-following");
            const githubPublicRepos = document.getElementById("github-public-repos");
            const githubGists = document.getElementById("github-gists");

            if (githubName) githubName.textContent = "Username: Reeinold";
            if (githubRepos) githubRepos.textContent = "Public Repositories: N/A";
            if (githubFollowers) githubFollowers.textContent = "Followers: N/A";
            if (githubFollowing) githubFollowing.textContent = "Following: N/A";
            if (githubPublicRepos) githubPublicRepos.textContent = "Public Repos: N/A";
            if (githubGists) githubGists.textContent = "Gists: N/A";
        });

    const statsUrl = `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&hide_title=true`;

    console.log('Setting GitHub stats image URL:', statsUrl);

    // Set a loading placeholder for the image
    const githubCardImage = document.getElementById("github-card-image");
    if (githubCardImage) {
        githubCardImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcgR2l0SHViIFN0YXRzLi4uPC90ZXh0Pjwvc3ZnPg==";
        githubCardImage.src = statsUrl;
    }
}

// Progress bar refresh function removed to prevent conflicts

// Hidden Easter Egg for About Photo
function showHiddenInterests() {
    alert("selamat kamu menemukan hidden things 😊");

    // Create modal for interests
    const modal = document.createElement('div');
    modal.id = 'hidden-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeHiddenModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>🎮 Hidden Interests & Favorites 🎮</h2>
                    <span class="close-btn" onclick="closeHiddenModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="interest-section">
                        <h3>🎯 Suka Pergi ke Timezone</h3>
                        <ul class="interest-list">
                            <li>Maimai</li>
                            <li>Wangan Midnight</li>
                        </ul>
                    </div>

                    <div class="interest-section">
                        <h3>🎭 Favorite VTubers & Anime Characters</h3>
                        <ul class="interest-list">
                            <li><strong>Aoi Nabi</strong> [Illustrator]</li>
                            <li><strong>KAngle</strong> [Need Streamer Overload]</li>
                            <li><strong>Twin Turbo</strong> [Uma Musume]</li>
                            <li><strong>Loves Only you</strong> [Uma Musume]</li>
                            <li><strong>Hishi Amazon</strong> [Uma Musume]</li>
                            <li><strong>Ines</strong> [Arknights]</li>
                            <li><strong>Ray</strong> [Arknights]</li>
                            <li><strong>Mudrock</strong> [Arknights]</li>
                            <li><strong>kureiji Ollie</strong> [hololive]</li>
                            <li><strong>Nerissa Ravencroft</strong> [hololive]</li>
                            <li><em>...and many more! 😄</em></li>
                        </ul>
                    </div>
                    <div class="interest-section">
                        <h3>🎵 Favorite song type</h3>
                        <ul class="interest-list">
                            <li>Lofi</li>
                            <li>Hardbass</li>
                            <li>EDM</li>
                            <li>Pop 80 japanese</li>
                            <li>And many more things......</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        #hidden-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid olivedrab;
            background: linear-gradient(135deg, olivedrab, #4a5d23);
            color: white;
            border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .close-btn {
            font-size: 28px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .close-btn:hover {
            transform: scale(1.2);
        }

        .modal-body {
            padding: 25px;
        }

        .interest-section {
            margin-bottom: 25px;
        }

        .interest-section h3 {
            color: olivedrab;
            margin-bottom: 15px;
            font-size: 1.2rem;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 5px;
        }

        .interest-list {
            list-style: none;
            padding: 0;
        }

        .interest-list li {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s;
        }

        .interest-list li:hover {
            background-color: #f8f9fa;
            padding-left: 10px;
        }

        .interest-list li:last-child {
            border-bottom: none;
            font-style: italic;
            color: #666;
        }

        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                margin: 20px;
            }

            .modal-header {
                padding: 15px 20px;
            }

            .modal-body {
                padding: 20px;
            }
        }
    `;
    document.head.appendChild(style);
}

function closeHiddenModal() {
    const modal = document.getElementById('hidden-modal');
    if (modal) {
        modal.remove();
    }
}

// Add click event to profile photo (only on About page)
document.addEventListener('DOMContentLoaded', function() {
    // Only activate Easter egg on About.html page
    const isAboutPage = window.location.pathname.includes('About.html') ||
                        document.querySelector('title')?.textContent?.includes('About');

    const profilePhoto = document.querySelector('.profile-photo');
    if (profilePhoto && isAboutPage) {
        profilePhoto.style.cursor = 'pointer';
        profilePhoto.addEventListener('click', showHiddenInterests);
    }
});

// Music player moved to separate file: music-player.js