/* =========================================================
   POLAROID DARKROOM
========================================================= */


/* =========================
   ELEMENTS
========================= */

const darkroomInput =
    document.getElementById("darkroomInput");

const developStep =
    document.getElementById("developStep");

const adjustmentStep =
    document.getElementById("adjustmentStep");

const developButton =
    document.getElementById("developButton");

const developerTray =
    document.getElementById("developerTray");

const trayEmpty =
    document.getElementById("trayEmpty");

const darkroomPrint =
    document.getElementById("darkroomPrint");

const darkroomCanvas =
    document.getElementById("darkroomCanvas");

const developerWash =
    document.getElementById("developerWash");

const darkroomMessage =
    document.getElementById("darkroomMessage");

const darkProgressWrap =
    document.getElementById("darkProgressWrap");

const darkProgress =
    document.getElementById("darkProgress");

const darkProgressText =
    document.getElementById("darkProgressText");

const darkroomFinalActions =
    document.getElementById("darkroomFinalActions");

const makePolaroid =
    document.getElementById("makePolaroid");

const darkroomPolaroidSection =
    document.getElementById("darkroomPolaroidSection");

const darkFinalInner =
    document.getElementById("darkFinalInner");

const darkFinalImage =
    document.getElementById("darkFinalImage");

const darkCaption =
    document.getElementById("darkCaption");

const darkMemory =
    document.getElementById("darkMemory");

const darkDate =
    document.getElementById("darkDate");

const darkBackDate =
    document.getElementById("darkBackDate");

const darkFlip =
    document.getElementById("darkFlip");

const darkSave =
    document.getElementById("darkSave");

const resetDarkroom =
    document.getElementById("resetDarkroom");

const chemicalWater =
    document.getElementById("chemicalWater");


/* =========================
   SLIDERS
========================= */

const exposure =
    document.getElementById("exposure");

const contrast =
    document.getElementById("contrast");

const warmth =
    document.getElementById("warmth");

const saturation =
    document.getElementById("saturation");

const grain =
    document.getElementById("grain");

const fade =
    document.getElementById("fade");


const exposureValue =
    document.getElementById("exposureValue");

const contrastValue =
    document.getElementById("contrastValue");

const warmthValue =
    document.getElementById("warmthValue");

const saturationValue =
    document.getElementById("saturationValue");

const grainValue =
    document.getElementById("grainValue");

const fadeValue =
    document.getElementById("fadeValue");


/* =========================
   STATE
========================= */

let originalImage = null;

let developmentTimer = null;

let development = 0;

let isDeveloped = false;

let finalImageData = null;


/* =========================
   DATE
========================= */

darkDate.textContent =
    formatDate();

darkBackDate.textContent =
    formatDate();


/* =========================================================
   LOAD PHOTO
========================================================= */

darkroomInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            darkroomMessage.textContent =
                "Please choose an image file.";

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (readerEvent) {

                const image =
                    new Image();


                image.onload =
                    function () {

                        originalImage =
                            image;


                        resetForNewPhoto();


                        drawImage();


                        trayEmpty.classList.add(
                            "hidden"
                        );


                        darkroomPrint.classList.remove(
                            "hidden"
                        );


                        developStep.classList.remove(
                            "hidden"
                        );


                        developerWash.style.opacity =
                            "0.94";


                        darkroomMessage.textContent =
                            "The print is in the tray. Ready to develop.";

                    };


                image.src =
                    readerEvent.target.result;

            };


        reader.readAsDataURL(
            file
        );

    }
);


/* =========================================================
   DRAW IMAGE
========================================================= */

function drawImage() {

    if (!originalImage) {
        return;
    }


    const maxSize = 900;


    let width =
        originalImage.width;

    let height =
        originalImage.height;


    if (
        width > maxSize ||
        height > maxSize
    ) {

        const ratio =
            Math.min(
                maxSize / width,
                maxSize / height
            );


        width *= ratio;

        height *= ratio;

    }


    darkroomCanvas.width =
        Math.round(width);


    darkroomCanvas.height =
        Math.round(height);


    const ctx =
        darkroomCanvas.getContext(
            "2d"
        );


    ctx.clearRect(
        0,
        0,
        darkroomCanvas.width,
        darkroomCanvas.height
    );


    /*
       Canvas filter applies the adjustments.
    */

    ctx.filter = `
        brightness(${exposure.value}%)
        contrast(${contrast.value}%)
        sepia(${warmth.value}%)
        saturate(${saturation.value}%)
        opacity(${100 - Number(fade.value) * 0.35}%)
    `;


    ctx.drawImage(
        originalImage,
        0,
        0,
        darkroomCanvas.width,
        darkroomCanvas.height
    );


    /*
       Add faded white layer.
    */

    const fadeAmount =
        Number(fade.value);


    if (fadeAmount > 0) {

        ctx.fillStyle =
            `rgba(245, 238, 220, ${fadeAmount / 180})`;


        ctx.fillRect(
            0,
            0,
            darkroomCanvas.width,
            darkroomCanvas.height
        );

    }


    /*
       Add photographic grain.
    */

    addGrain(
        ctx,
        darkroomCanvas.width,
        darkroomCanvas.height
    );

}


/* =========================================================
   GRAIN
========================================================= */

function addGrain(
    ctx,
    width,
    height
) {

    const amount =
        Number(grain.value);


    if (amount === 0) {
        return;
    }


    /*
       Instead of changing every pixel,
       scatter tiny translucent particles.

       Much lighter for browser performance.
    */

    const grainCount =
        Math.floor(
            width *
            height *
            (amount / 1000)
        );


    ctx.save();


    for (
        let i = 0;
        i < grainCount;
        i++
    ) {

        const x =
            Math.random() *
            width;


        const y =
            Math.random() *
            height;


        const light =
            Math.random() > 0.5;


        ctx.fillStyle =
            light
                ? "rgba(255,255,255,.08)"
                : "rgba(0,0,0,.08)";


        ctx.fillRect(
            x,
            y,
            1.3,
            1.3
        );

    }


    ctx.restore();

}


/* =========================================================
   DEVELOP PHOTO
========================================================= */

developButton.addEventListener(
    "click",
    () => {

        if (!originalImage) {
            return;
        }


        developButton.disabled =
            true;


        darkProgressWrap.classList.remove(
            "hidden"
        );


        adjustmentStep.classList.add(
            "hidden"
        );


        darkroomFinalActions.classList.add(
            "hidden"
        );


        development = 0;


        developerWash.style.opacity =
            "0.94";


        darkProgress.style.width =
            "0%";


        darkProgressText.textContent =
            "developing...";


        darkroomMessage.textContent =
            "Don't rush it. Watch the photograph appear.";


        clearInterval(
            developmentTimer
        );


        developmentTimer =
            setInterval(
                () => {

                    development += 4;


                    updateDevelopment();


                    if (
                        development >= 100
                    ) {

                        finishDevelopment();

                    }

                },
                180
            );

    }
);


/* =========================================================
   DEVELOPMENT VISUAL
========================================================= */

function updateDevelopment() {

    development =
        Math.min(
            development,
            100
        );


    darkProgress.style.width =
        `${development}%`;


    /*
       White chemical wash slowly disappears.
    */

    const opacity =
        0.94 -
        (
            development /
            100
        ) *
        0.94;


    developerWash.style.opacity =
        opacity;


    if (development < 30) {

        darkProgressText.textContent =
            "something is appearing...";

    }

    else if (development < 65) {

        darkProgressText.textContent =
            "give it a moment...";

    }

    else if (development < 95) {

        darkProgressText.textContent =
            "almost there...";

    }

}


/* =========================================================
   FINISH DEVELOPMENT
========================================================= */

function finishDevelopment() {

    clearInterval(
        developmentTimer
    );


    development = 100;

    isDeveloped = true;


    developerWash.style.opacity =
        "0";


    darkProgress.style.width =
        "100%";


    darkProgressText.textContent =
        "developed.";


    adjustmentStep.classList.remove(
        "hidden"
    );


    darkroomFinalActions.classList.remove(
        "hidden"
    );


    developButton.disabled =
        false;


    developButton.textContent =
        "DEVELOP AGAIN";


    darkroomMessage.textContent =
        "There it is. Now make it feel like yours.";

}


/* =========================================================
   SLIDER EVENTS
========================================================= */

const sliders = [

    exposure,
    contrast,
    warmth,
    saturation,
    grain,
    fade

];


sliders.forEach(
    slider => {

        slider.addEventListener(
            "input",
            () => {

                updateSliderLabels();


                if (
                    originalImage &&
                    isDeveloped
                ) {

                    drawImage();

                }

            }
        );

    }
);


/* =========================================================
   UPDATE LABEL VALUES
========================================================= */

function updateSliderLabels() {

    exposureValue.textContent =
        exposure.value;


    contrastValue.textContent =
        contrast.value;


    warmthValue.textContent =
        warmth.value;


    saturationValue.textContent =
        saturation.value;


    grainValue.textContent =
        grain.value;


    fadeValue.textContent =
        fade.value;

}


/* =========================================================
   RESET ADJUSTMENTS
========================================================= */

resetDarkroom.addEventListener(
    "click",
    () => {

        exposure.value =
            100;

        contrast.value =
            100;

        warmth.value =
            0;

        saturation.value =
            100;

        grain.value =
            0;

        fade.value =
            0;


        updateSliderLabels();


        drawImage();


        darkroomMessage.textContent =
            "Back to the original print.";

    }
);


/* =========================================================
   CHEMICAL / WATER INTERACTION
========================================================= */

developerTray.addEventListener(
    "pointermove",
    event => {

        const rect =
            developerTray
                .getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        chemicalWater.style.setProperty(
            "--ripple-x",
            `${x}px`
        );


        chemicalWater.style.setProperty(
            "--ripple-y",
            `${y}px`
        );


        chemicalWater.classList.add(
            "moving"
        );

    }
);


developerTray.addEventListener(
    "pointerleave",
    () => {

        chemicalWater.classList.remove(
            "moving"
        );

    }
);


/* =========================================================
   MAKE POLAROID
========================================================= */

makePolaroid.addEventListener(
    "click",
    () => {

        if (!isDeveloped) {
            return;
        }


        /*
           Render one final clean frame.
        */

        drawImage();


        finalImageData =
            darkroomCanvas.toDataURL(
                "image/jpeg",
                0.82
            );


        darkFinalImage.src =
            finalImageData;


        darkroomPolaroidSection.classList.remove(
            "hidden"
        );


        /*
           Restart lift animation.
        */

        const polaroid =
            document.getElementById(
                "darkFinalPolaroid"
            );


        polaroid.classList.remove(
            "lifted"
        );


        void polaroid.offsetWidth;


        polaroid.classList.add(
            "lifted"
        );


        darkSave.disabled =
            false;


        darkSave.textContent =
            "SAVE TO SHOEBOX ♡";


        darkroomMessage.textContent =
            "Your print is out of the tray.";


        setTimeout(
            () => {

                darkroomPolaroidSection
                    .scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "center"
                    });

            },
            350
        );

    }
);


/* =========================================================
   FLIP POLAROID
========================================================= */

darkFlip.addEventListener(
    "click",
    () => {

        darkFinalInner.classList.toggle(
            "flipped"
        );

    }
);


/* =========================================================
   SAVE TO SHOEBOX
========================================================= */

darkSave.addEventListener(
    "click",
    () => {

        if (!finalImageData) {
            return;
        }


        const memory = {

            id:
                Date.now(),

            type:
                "polaroid",

            source:
                "darkroom",

            image:
                finalImageData,

            film:
                "developed",

            caption:
                darkCaption
                    .value
                    .trim(),

            story:
                darkMemory
                    .value
                    .trim(),

            date:
                formatDate(),

            createdAt:
                new Date()
                    .toISOString()

        };


        const success =
            saveMemory(
                memory
            );


        if (success) {

            darkSave.textContent =
                "SAVED ♡";


            darkSave.disabled =
                true;


            darkroomMessage.textContent =
                "The memory is waiting in your Shoebox.";

        }

        else {

            darkroomMessage.textContent =
                "Browser storage is full.";

        }

    }
);


/* =========================================================
   RESET WHEN NEW PHOTO IS LOADED
========================================================= */

function resetForNewPhoto() {

    clearInterval(
        developmentTimer
    );


    development = 0;

    isDeveloped = false;

    finalImageData = null;


    /*
       Reset controls.
    */

    exposure.value =
        100;

    contrast.value =
        100;

    warmth.value =
        0;

    saturation.value =
        100;

    grain.value =
        0;

    fade.value =
        0;


    updateSliderLabels();


    /*
       Reset interface.
    */

    adjustmentStep.classList.add(
        "hidden"
    );


    darkroomFinalActions.classList.add(
        "hidden"
    );


    darkroomPolaroidSection.classList.add(
        "hidden"
    );


    darkProgressWrap.classList.add(
        "hidden"
    );


    developButton.disabled =
        false;


    developButton.textContent =
        "DEVELOP PHOTO";


    darkCaption.value =
        "";


    darkMemory.value =
        "";


    darkFinalInner.classList.remove(
        "flipped"
    );

}