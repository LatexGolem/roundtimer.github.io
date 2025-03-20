// Function to update the time
function updateTime() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Initial call to display time immediately
updateTime();
setInterval(updateTime, 1000);

// Array of image sources for dynamic image
const imageArray = [
    'falloutfactions.png.',
    'KillTeam_Banner-750x469.png',
];

// Function to change the dynamic image
function changeImage() {
    const imageElement = document.getElementById('dynamic-image');
    const randomIndex = Math.floor(Math.random() * imageArray.length);
    imageElement.src = imageArray[randomIndex];
}

// Initial call to change image immediately
changeImage();
setInterval(changeImage, 300000); // Change image every 5 minutes (300,000 milliseconds)
