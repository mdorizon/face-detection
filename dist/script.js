const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

const btnSelect = document.querySelector('.btn')
const cursor = document.querySelector('#cursor')


function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, video);

        predictions.forEach(prediction => {
            if (prediction.label !== 'face') { // Assurez-vous que la classe 'hand' est correcte
                console.log(prediction)
                const [x, y, width, height] = prediction.bbox;
                console.log(`Main détectée à x: ${x}, y: ${y}, largeur: ${width}, hauteur: ${height}`);

                moveCursor(prediction.bbox, cursor)
                checkCollision(prediction)
                
            }
        });

        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function moveCursor(handBbox, cursor) {
    // Récupère les dimensions du canvas et de la page web
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    // Calcule la position relative de la main dans le canvas
    const [x, y, width, height] = handBbox;
    const relativeX = (x + width / 2) / canvasWidth;
    const relativeY = (y + height / 2) / canvasHeight;

    // Adapte la position relative aux dimensions de la page web
    const cursorX = relativeX * pageWidth;
    const cursorY = relativeY * pageHeight;

    // Positionne le curseur sur la page
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
}



// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});



function checkCollision(prediction) {
    const cursorRect = cursor.getBoundingClientRect();
    const btnRect = btnSelect.getBoundingClientRect();

    // Vérifie si les rectangles se chevauchent
    if (cursorRect.left < btnRect.right &&
        cursorRect.right > btnRect.left &&
        cursorRect.top < btnRect.bottom &&
        cursorRect.bottom > btnRect.top) {
        // Collision détectée, effectuez une action
        console.log('Collision détectée!');
        // Vous pouvez par exemple changer la couleur du bouton
        
        console.log("prediction : ", prediction.label)
        if(prediction.label == 'open'){
            btnSelect.style.backgroundColor = 'green';
        }
        else if(prediction.label == 'closed'){
            btnSelect.style.backgroundColor ='red';
        }
        else{
            btnSelect.style.backgroundColor = 'yellow';
        }
    } else {
        // Pas de collision, réinitialisez l'état du bouton si nécessaire
        btnSelect.style.backgroundColor = ''; // Réinitialise la couleur du fond
    }
}

