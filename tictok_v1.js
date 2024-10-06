document.addEventListener("DOMContentLoaded", function () {

let accessToken = 'act.TnPomscz0k9UfsIYsw5BQbwQbwCPAs5YmfdTsPjcFTpSVlhXkx7DfX5dyoBj!4571.va'; // Replace with your access token
let refreshToken = 'demo-refresh-token';
let tokenExpiryTime;


function setTokenExpiry(expiresIn) {
    tokenExpiryTime = Date.now() + expiresIn * 1000; 
    setTimeout(refreshAccessToken, (expiresIn - 300) * 1000); 
    console.log(`Token expires in ${expiresIn / 60} minutes.`);

    console.log(refreshToken);
}


function refreshAccessToken() {
    console.log('Refreshing token...');
    fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: 'rft.XmLvWQskLzMsBiahUbgjYkzSc9cJGJXe5pbFEXfJXvLCCrNjqdiFOS58wUBL!4603.va',
            client_key: 'sbaw5eg838glrm3m2u',
            client_secret: '0LKbEy16sVKvuGO8v25Skiy8SEoFiaSZ'
        })
    })
        .then(response => response.json())
        .then(data => {
            accessToken = data.access_token;
            refreshToken = data.refresh_token || refreshToken;
            setTokenExpiry(data.expires_in);
            console.log('Token refreshed successfully');
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
        });
}


function fetchUserInfo() {
    fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,user.info.basic,display_name', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error.code === 'ok') {
                // Display user information
                document.getElementById('avatar').src = data.data.user.avatar_url;
                document.getElementById('openId').textContent = `Open ID: ${data.data.user.open_id}`;
                document.getElementById('unionId').textContent = `Union ID: ${data.data.user.union_id}`;
                document.getElementById('userName').textContent = `${data.data.user.display_name}`;
                console.log(data);
            } else {
                console.error("Error fetching user info: ", data.error.message);
                document.getElementById('openId').textContent = "Error fetching user info";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('openId').textContent = "Failed to load user info";
        });
}

// Fetch TikTok videos
function fetchTikTokVideos() {
    fetch('https://open.tiktokapis.com/v2/video/list/?fields=cover_image_url,id,create_time,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error.code === 'ok') {
                renderCarousel(data.data.videos);
                console.log(data);
            } else {
                console.error("Error fetching videos: ", data.error.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Render videos in a carousel
function renderCarousel(videos) {
    const carouselContainer = document.getElementById('videoCarousel');
    let carouselHTML = '';

    videos.forEach((video) => {
        const { embed_html } = video; // Only using the embed_html part for rendering

        carouselHTML += `
            <div class="video-item">
                ${embed_html} <!-- Embed the TikTok video -->
            </div>
        `;
    });

    carouselContainer.innerHTML = `
        <div class="video-list">
            ${carouselHTML}
        </div>
    `;
}




// Carousel functionality
function addCarouselFunctionality() {
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');

    let index = 0;
    let itemsToShow = 3; // Default for desktop
    const totalItems = items.length;

    function updateCarousel() {
        const width = items[0].clientWidth;
        track.style.transform = `translateX(-${index * width}px)`;
    }


    function adjustCarousel() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1024) {
            itemsToShow = 3; // Desktop
        } else if (screenWidth >= 768) {
            itemsToShow = 2; // Tablet
        } else {
            itemsToShow = 1; // Mobile
        }
        updateCarousel();
    }

    nextButton.addEventListener('click', () => {
        if (index < totalItems - itemsToShow) {
            index++;
        } else {
            index = 0; // Loop back to the start
        }
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        if (index > 0) {
            index--;
        } else {
            index = totalItems - itemsToShow; // Loop back to the end
        }
        updateCarousel();
    });

    window.addEventListener('resize', adjustCarousel);
    adjustCarousel(); // Set initial state
}

setTokenExpiry(3600); // Set token expiry for 1 hour
fetchUserInfo(); // Fetch TikTok user information
fetchTikTokVideos(); // Fetch TikTok videos
});
