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
    'Abaddon_Bust-1024x650.png',
    'admech.png',
    'Angron-1024x691.png',
    'Corvus_Corax.png',
    'Ferrus_Manus.png',
    'Fulgrim-1024x768.png',
    'Guilliman_30k-1024x773.png',
    'Heresy_Imp_Fists.png',
    'HH_Iron_Warriors.png',
    'Horus.png',
    'iron_Hands.png',
    'IronWarrior-1024x768.png',
    'Jaghatai_Khan-1024x768.png',
    'Justaerin2-1024x768.png',
    'Konrad_Curze-1024x792.png',
    'Leman_Russ.png',
    'lionel_Johnson.png',
    'Lorgar.png',
    'Night_Lords_Terminator_30k-1024x792.png',
    'NL_Raptor.png',
    'TS_Sorcerer30k-1024x792.png',
    'Vulkan-1024x768.png',
    'WB_Possessed-1024x768.png',
    'WhiteScars_HH-1024x768.png',
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
