//Start
let currentFrame = 0;   //Hier wird die aktuelle Bildnummer und Bildquelle für die Animation des Donuts initialisiert
const frames = [ // Das ist ein Array für die Dateipfade der benötigten Bilder
    'images/image0.png',
    'images/image15.png',
    'images/image30.png',
    'images/image45.png',
    'images/image60.png',
    'images/image75.png',
    'images/image90.png',
    'images/image105.png',
    'images/image120.png',
    'images/image135.png',
    'images/image150.png',
    'images/image165.png',
    'images/image180.png',
    'images/image195.png',
    'images/image210.png',
    'images/image225.png',
    'images/image240.png',
    'images/image255.png',
    'images/image270.png',
    'images/image285.png',
    'images/image300.png',
    'images/image315.png',
    'images/image330.png',
    'images/image345.png',
];
//An dieser Stelle wird das Bildelement sowie die Gradanzeige aus dem Document Object Model geladen
const disc = document.getElementById('donut');
const degreeDisplay = document.getElementById('degree-display'); // Referenz zum neuen Element

function updateDegree() { //In dieser Funktion wird die Gradanzeige basierend auf der aktuellen Bildnummer aktualisiert
    degreeDisplay.textContent = currentFrame * 15 + '°';
    }

function rotateRight() {  //In der Funktion wird das Drehen des Donuts nach rechts ermöglicht
    currentFrame = (currentFrame - 1 + frames.length) % frames.length;
    disc.src = frames[currentFrame];
    updateDegree();  // Hier wird der Grad der Drehung aktualisiert
}

function rotateLeft() { //In der Funktion wird das Drehen des Donuts nach links ermöglicht
    currentFrame = (currentFrame + 1) % frames.length;
    disc.src = frames[currentFrame];
    updateDegree();  // Hier wird der Grad der Drehung aktualisiert
}

let autoRotateInterval = null; // Diese Variable speichert den automatischen Drehintervall

function toggleAutoRotate() { //In der Funktion wird die automatische Drehung des Donuts definiert
    if (autoRotateInterval) { //Wenn sich der Donut bereits dreht, ...
        clearInterval(autoRotateInterval); // Stoppt die Drehung, wenn sie bereits läuft
        autoRotateInterval = null;
    } else { //Sonst startet die Drehung
        autoRotateInterval = setInterval(rotateLeft, 100); 
    }
}

// Dies fügt einen Event Listener hinzu, der auf die "a"-Taste reagiert
window.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        toggleAutoRotate();
    }
});
//Hier wird die aktuelle Bildnummer und Bildquelle für die Animation des Elefanten initialisiert
let currentElephantFrame = 0;
const elephantFrames = [ //Ein Array für die Dateipfade der Elefanten-Bilder
    'images/elephant0.png',
    'images/elephant1.png'
];

const elephant = document.getElementById('schwingender-elefant');

function Ruessel() { //In dieser Funktion wird das Elefanten Bild animiert
    currentElephantFrame = (currentElephantFrame + 1) % elephantFrames.length; 
    elephant.src = elephantFrames[currentElephantFrame];
}

setInterval(Ruessel, 1000); // Nach 1s wechseln die Bilder um die Animation zu erzeugen

//END