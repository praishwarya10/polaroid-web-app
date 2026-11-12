const photoInput = document.getElementById("photoInput");

const previewImage = document.getElementById("previewImage");
const viewfinder = document.getElementById("viewfinder");
const viewfinderEmpty = document.getElementById("viewfinderEmpty");

const framingControls = document.getElementById("framingControls");
const dragHint = document.getElementById("dragHint");

const zoomSlider = document.getElementById("zoomSlider");
const zoomValue = document.getElementById("zoomValue");
const resetPosition = document.getElementById("resetPosition");

const takePolaroid = document.getElementById("takePolaroid");

const cameraFlash = document.getElementById("cameraFlash");
const cameraMessage = document.getElementById("cameraMessage");

const developingArea = document.getElementById("developingArea");

const polaroid = document.getElementById("polaroid");
const polaroidInner = document.getElementById("polaroidInner");

const polaroidImage = document.getElementById("polaroidImage");
const developWash = document.getElementById("developWash");

const developControls = document.getElementById("developControls");
const developText = document.getElementById("developText");
const developProgress = document.getElementById("developProgress");

const finishedControls = document.getElementById("finishedControls");

const captionInput = document.getElementById("captionInput");
const memoryInput = document.getElementById("memoryInput");

const flipPhoto = document.getElementById("flipPhoto");
const savePhoto = document.getElementById("savePhoto");

const dateLabel = document.getElementById("dateLabel");
const backDate = document.getElementById("backDate");

const cropCanvas = document.getElementById("cropCanvas");

const filmButtons = document.querySelectorAll(".film-btn");


let originalImage = null;
let capturedImage = null;

let selectedFilm = "classic";

let zoom = 1;

let imageX = 0;
let imageY = 0;

let baseWidth = 0;
let baseHeight = 0;

let draggingPreview = false;
let startPointerX = 0;
let startPointerY = 0;

let startImageX = 0;
let startImageY = 0;

let development = 0;
let developmentTimer = null;

let shaking = false;
let lastShakeX = 0;
let lastShakeTime = 0;


dateLabel.textContent = formatDate();
backDate.textContent = formatDate();


/* ======================================
   LOAD IMAGE
====================================== */

photoInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        cameraMessage.textContent =
            "Please choose an image file.";

        return;
    }


    const reader = new FileReader();


    reader.onload = event => {

        const image = new Image();


        image.onload = () => {

            originalImage = image;

            previewImage.src = event.target.result;

            viewfinderEmpty.classList.add("hidden");

            framingControls.classList.remove("hidden");

            dragHint.classList.remove("hidden");

            takePolaroid.disabled = false;


            /*
                Wait until the browser knows the
                viewfinder dimensions.
            */

            requestAnimationFrame(() => {
                resetFraming();
            });


            cameraMessage.textContent =
                "Drag the photograph to frame your moment.";

        };


        image.src = event.target.result;

    };


    reader.readAsDataURL(file);

});


/* ======================================
   CALCULATE COVER SIZE
====================================== */

function calculateBaseSize() {

    if (!originalImage) return;


    const frameWidth = viewfinder.clientWidth;
    const frameHeight = viewfinder.clientHeight;


    const imageRatio =
        originalImage.width / originalImage.height;

    const frameRatio =
        frameWidth / frameHeight;


    /*
       Same principle as object-fit: cover.
       Image always completely covers viewfinder.
    */

    if (imageRatio > frameRatio) {

        baseHeight = frameHeight;

        baseWidth =
            frameHeight * imageRatio;

    } else {

        baseWidth = frameWidth;

        baseHeight =
            frameWidth / imageRatio;

    }
}


/* ======================================
   RESET FRAMING
====================================== */

function resetFraming() {

    if (!originalImage) return;


    calculateBaseSize();


    zoom = 1;

    zoomSlider.value = 1;

    zoomValue.textContent = "100%";


    const displayedWidth =
        baseWidth * zoom;

    const displayedHeight =
        baseHeight * zoom;


    /*
       Center image in viewfinder.
    */

    imageX =
        (viewfinder.clientWidth - displayedWidth) / 2;

    imageY =
        (viewfinder.clientHeight - displayedHeight) / 2;


    clampPosition();

    updatePreview();

}


resetPosition.addEventListener("click", resetFraming);


/* ======================================
   UPDATE IMAGE POSITION
====================================== */

function updatePreview() {

    const displayedWidth =
        baseWidth * zoom;

    const displayedHeight =
        baseHeight * zoom;


    previewImage.style.width =
        `${displayedWidth}px`;

    previewImage.style.height =
        `${displayedHeight}px`;

    previewImage.style.transform =
        `translate(${imageX}px, ${imageY}px)`;

}


/* ======================================
   KEEP IMAGE INSIDE FRAME
====================================== */

function clampPosition() {

    const frameWidth =
        viewfinder.clientWidth;

    const frameHeight =
        viewfinder.clientHeight;


    const displayedWidth =
        baseWidth * zoom;

    const displayedHeight =
        baseHeight * zoom;


    const minX =
        frameWidth - displayedWidth;

    const minY =
        frameHeight - displayedHeight;


    imageX =
        Math.min(0, Math.max(minX, imageX));

    imageY =
        Math.min(0, Math.max(minY, imageY));

}


/* ======================================
   DRAG IMAGE
====================================== */

viewfinder.addEventListener("pointerdown", event => {

    if (!originalImage) return;


    draggingPreview = true;

    startPointerX = event.clientX;
    startPointerY = event.clientY;

    startImageX = imageX;
    startImageY = imageY;


    viewfinder.setPointerCapture(event.pointerId);

    viewfinder.classList.add("dragging");

    dragHint.classList.add("hidden");

});


viewfinder.addEventListener("pointermove", event => {

    if (!draggingPreview) return;


    const deltaX =
        event.clientX - startPointerX;

    const deltaY =
        event.clientY - startPointerY;


    imageX =
        startImageX + deltaX;

    imageY =
        startImageY + deltaY;


    clampPosition();

    updatePreview();

});


function stopPreviewDrag() {

    draggingPreview = false;

    viewfinder.classList.remove("dragging");

}


viewfinder.addEventListener(
    "pointerup",
    stopPreviewDrag
);

viewfinder.addEventListener(
    "pointercancel",
    stopPreviewDrag
);


/* ======================================
   ZOOM
====================================== */

zoomSlider.addEventListener("input", () => {

    if (!originalImage) return;


    const oldZoom = zoom;

    const newZoom =
        Number(zoomSlider.value);


    /*
        Preserve the image point currently
        under the centre of the viewfinder.
    */

    const frameCenterX =
        viewfinder.clientWidth / 2;

    const frameCenterY =
        viewfinder.clientHeight / 2;


    const imagePointX =
        (frameCenterX - imageX) / oldZoom;

    const imagePointY =
        (frameCenterY - imageY) / oldZoom;


    zoom = newZoom;


    imageX =
        frameCenterX -
        imagePointX * zoom;

    imageY =
        frameCenterY -
        imagePointY * zoom;


    zoomValue.textContent =
        `${Math.round(zoom * 100)}%`;


    clampPosition();

    updatePreview();

});


/* ======================================
   FILM SELECTION
====================================== */

filmButtons.forEach(button => {

    button.addEventListener("click", () => {

        filmButtons.forEach(item => {
            item.classList.remove("selected");
        });


        button.classList.add("selected");

        selectedFilm =
            button.dataset.filter;


        applyPreviewFilter();

    });

});


function applyPreviewFilter() {

    previewImage.className = "";

    previewImage.classList.add(
        `filter-${selectedFilm}`
    );

}


/* ======================================
   SHUTTER
====================================== */

takePolaroid.addEventListener("click", () => {

    if (!originalImage) return;


    triggerFlash();


    capturedImage =
        captureVisibleCrop();


    polaroidImage.src =
        capturedImage;


    polaroidImage.className = "";

    polaroidImage.classList.add(
        `filter-${selectedFilm}`
    );


    developingArea.classList.remove("hidden");


    /*
       Restart card animation every time
       shutter is pressed.
    */

    polaroid.classList.remove("photo-eject");

    void polaroid.offsetWidth;

    polaroid.classList.add("photo-eject");


    startDevelopment();


    cameraMessage.textContent =
        "Your Polaroid is developing.";


    /*
       Scroll slightly so result is visible,
       especially on smaller screens.
    */

    setTimeout(() => {

        developingArea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 500);

});


/* ======================================
   CAPTURE EXACT VISIBLE CROP
====================================== */

function captureVisibleCrop() {

    const ctx =
        cropCanvas.getContext("2d");


    const outputSize =
        cropCanvas.width;


    ctx.clearRect(
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
    );


    const displayedWidth =
        baseWidth * zoom;

    const displayedHeight =
        baseHeight * zoom;


    /*
       Convert displayed CSS coordinates
       back into coordinates on original image.
    */

    const scaleX =
        originalImage.width / displayedWidth;

    const scaleY =
        originalImage.height / displayedHeight;


    const sourceX =
        -imageX * scaleX;

    const sourceY =
        -imageY * scaleY;


    const sourceWidth =
        viewfinder.clientWidth * scaleX;

    const sourceHeight =
        viewfinder.clientHeight * scaleY;


    ctx.drawImage(
        originalImage,

        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,

        0,
        0,
        outputSize,
        outputSize
    );


    return cropCanvas.toDataURL(
        "image/jpeg",
        0.85
    );

}


/* ======================================
   FLASH
====================================== */

function triggerFlash() {

    cameraFlash.classList.remove("flash");

    void cameraFlash.offsetWidth;

    cameraFlash.classList.add("flash");

}


/* ======================================
   DEVELOPMENT
====================================== */

function startDevelopment() {

    development = 0;


    captionInput.disabled = true;
    memoryInput.disabled = true;


    polaroidInner.classList.remove("flipped");


    finishedControls.classList.add("hidden");

    developControls.classList.remove("hidden");


    developProgress.style.width = "0%";

    developText.textContent =
        "developing... 0%";


    /*
       White layer sits over image.
       It fades as photograph develops.
    */

    developWash.style.opacity = "0.94";


    clearInterval(developmentTimer);


    developmentTimer =
        setInterval(() => {

            developPhoto(2);

        }, 650);

}


/* ======================================
   DEVELOPMENT PROGRESS
====================================== */

function developPhoto(amount) {

    if (development >= 100) return;


    development =
        Math.min(
            100,
            development + amount
        );


    developProgress.style.width =
        `${development}%`;


    developText.textContent =
        `developing... ${Math.round(development)}%`;


    /*
       0% development = almost white
       100% development = transparent
    */

    const washOpacity =
        0.94 * (1 - development / 100);


    developWash.style.opacity =
        washOpacity;


    if (development >= 100) {

        clearInterval(developmentTimer);


        developControls.classList.add("hidden");

        finishedControls.classList.remove("hidden");


        captionInput.disabled = false;
        memoryInput.disabled = false;


        cameraMessage.textContent =
            "Developed. Now give this memory a story.";

    }

}


/* ======================================
   SHAKE THE POLAROID
====================================== */

polaroid.addEventListener("pointerdown", event => {

    if (development >= 100) return;


    shaking = true;

    lastShakeX = event.clientX;

    lastShakeTime = Date.now();


    polaroid.setPointerCapture(
        event.pointerId
    );

});


polaroid.addEventListener("pointermove", event => {

    if (!shaking || development >= 100) {
        return;
    }


    const now =
        Date.now();


    const distance =
        Math.abs(
            event.clientX - lastShakeX
        );


    const elapsed =
        Math.max(
            1,
            now - lastShakeTime
        );


    const speed =
        distance / elapsed;


    if (distance > 8) {

        const bonus =
            Math.min(
                7,
                speed * 10
            );


        developPhoto(bonus);


        /*
           Tiny visual shake.
        */

        const rotation =
            event.clientX > lastShakeX
                ? 4
                : -4;


        polaroid.style.transform =
            `rotate(${rotation}deg)`;

    }


    if (speed > 1.5) {

        cameraMessage.textContent =
            "easy there 😭";

    }


    lastShakeX = event.clientX;

    lastShakeTime = now;

});


function stopShake() {

    shaking = false;

    polaroid.style.transform = "";

}


polaroid.addEventListener(
    "pointerup",
    stopShake
);

polaroid.addEventListener(
    "pointercancel",
    stopShake
);


/* ======================================
   FLIP POLAROID
====================================== */

flipPhoto.addEventListener("click", () => {

    polaroidInner.classList.toggle(
        "flipped"
    );

});


/* ======================================
   SAVE
====================================== */

savePhoto.addEventListener("click", () => {

    if (!capturedImage || development < 100) {
        return;
    }


    const memory = {

        id: Date.now(),

        type: "polaroid",

        image: capturedImage,

        film: selectedFilm,

        caption:
            captionInput.value.trim(),

        story:
            memoryInput.value.trim(),

        date:
            formatDate(),

        createdAt:
            new Date().toISOString()

    };


    const success =
        saveMemory(memory);


    if (success) {

        cameraMessage.textContent =
            "♡ This one is in your Shoebox.";

        savePhoto.textContent =
            "Saved ♡";

        savePhoto.disabled = true;

    } else {

        cameraMessage.textContent =
            "Browser storage is full. Try a smaller photograph.";

    }

});


/* ======================================
   RESPONSIVE RECALCULATION
====================================== */

window.addEventListener("resize", () => {

    if (!originalImage) return;

    /*
       Reset on resize so crop coordinates
       remain accurate.
    */

    resetFraming();

});