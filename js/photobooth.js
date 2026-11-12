/* =========================================================
   POLAROID PHOTOBOOTH
   ---------------------------------------------------------
   Features:
   - Webcam
   - Flash ON / OFF
   - Screen becomes bright when Flash is ON
   - 3 photo session
   - 3 second countdown
   - Full screen flash during capture
   - Photo strip
   - Retake one photo
   - Strip styles
   - Save to Shoebox
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("captureCanvas");

const enableCamera =
    document.getElementById("enableCamera");

const flashToggle =
    document.getElementById("flashToggle");

const startBooth =
    document.getElementById("startBooth");

const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");

const countdown =
    document.getElementById("countdown");

const boothFlash =
    document.getElementById("boothFlash");

const boothMessage =
    document.getElementById("boothMessage");

const photoStrip =
    document.getElementById("photoStrip");

const stripFrames =
    document.querySelectorAll(".strip-photo");

const stripDate =
    document.getElementById("stripDate");

const stripCaption =
    document.getElementById("stripCaption");

const stripActions =
    document.getElementById("stripActions");

const restartBooth =
    document.getElementById("restartBooth");

const saveStrip =
    document.getElementById("saveStrip");

const retakeOne =
    document.getElementById("retakeOne");

const stripStyleButtons =
    document.querySelectorAll(".strip-style");

const videoWrapper =
    document.querySelector(".video-wrapper");


/* =========================================================
   VARIABLES
========================================================= */

let stream = null;

let photos = [];

let selectedStripStyle = "classic";

let retakeMode = false;

let sessionRunning = false;

let flashEnabled = false;


/* =========================================================
   INITIAL SETUP
========================================================= */

stripDate.textContent = formatDate();


/*
   Flash starts OFF.
*/

document.body.classList.remove(
    "booth-light-on"
);

flashToggle.textContent =
    "⚡ Flash OFF";


/* =========================================================
   ENABLE CAMERA
========================================================= */

enableCamera.addEventListener(
    "click",
    async () => {

        try {

            /*
               Ask browser for front-facing camera.
            */

            stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode: "user"
                        },

                        audio: false

                    });


            /*
               Put webcam stream into video.
            */

            video.srcObject =
                stream;


            /*
               Hide placeholder.
            */

            cameraPlaceholder
                .classList
                .add("hidden");


            /*
               Enable Start Session.
            */

            startBooth.disabled =
                false;


            /*
               Update camera button.
            */

            enableCamera.textContent =
                "Camera ready";


            enableCamera.disabled =
                true;


            boothMessage.textContent =
                "Camera ready. Turn on flash if you need more light.";

        }

        catch (error) {

            console.error(
                "Camera error:",
                error
            );


            boothMessage.textContent =
                "Camera access was blocked. Allow camera permission and try again.";

        }

    }
);


/* =========================================================
   FLASH ON / OFF
========================================================= */

flashToggle.addEventListener(
    "click",
    () => {

        /*
           Reverse current state.
        */

        flashEnabled =
            !flashEnabled;


        /* -------------------------
           FLASH ON
        ------------------------- */

        if (flashEnabled) {

            /*
               Makes the entire page brighter.

               CSS handles the actual light.
            */

            document.body
                .classList
                .add(
                    "booth-light-on"
                );


            /*
               Change button.
            */

            flashToggle.textContent =
                "⚡ Flash ON";


            flashToggle
                .classList
                .add(
                    "active-flash"
                );


            boothMessage.textContent =
                "Flash on — the screen is now your light.";

        }


        /* -------------------------
           FLASH OFF
        ------------------------- */

        else {

            document.body
                .classList
                .remove(
                    "booth-light-on"
                );


            flashToggle.textContent =
                "⚡ Flash OFF";


            flashToggle
                .classList
                .remove(
                    "active-flash"
                );


            /*
               Remove any charging glow.
            */

            videoWrapper
                .classList
                .remove(
                    "pre-flash"
                );


            boothMessage.textContent =
                "Flash off.";

        }

    }
);


/* =========================================================
   START PHOTOBOOTH
========================================================= */

startBooth.addEventListener(
    "click",
    async () => {

        /*
           Don't run if camera isn't ready
           or another session is happening.
        */

        if (
            !stream ||
            sessionRunning
        ) {

            return;

        }


        sessionRunning = true;


        startBooth.disabled =
            true;


        /*
           Remove old photos.
        */

        photos = [];


        clearStrip();


        /*
           Reset saved button in case
           previous strip was saved.
        */

        saveStrip.disabled =
            false;


        saveStrip.textContent =
            "Keep strip";


        boothMessage.textContent =
            "Get ready.";


        /*
           Messages shown before each photo.
        */

        const poseMessages = [

            "first one.",

            "change the pose.",

            "last one. make it count."

        ];


        /* =================================================
           TAKE THREE PHOTOS
        ================================================= */

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            /*
               Tell user which shot is happening.
            */

            boothMessage.textContent =
                poseMessages[i];


            /*
               3 → 2 → 1
            */

            await runCountdown();


            /*
               If flash is enabled,
               make whole screen flash white.
            */

            triggerFlash();


            /*
               Give flash a moment to appear.

               If flash is OFF, this tiny delay
               is still fine.
            */

            if (flashEnabled) {

                await wait(100);

            } else {

                await wait(50);

            }


            /*
               Capture webcam image.
            */

            const photo =
                capturePhoto();


            /*
               Save it.
            */

            photos.push(
                photo
            );


            /*
               Put it into the strip.
            */

            displayPhoto(
                i,
                photo
            );


            /*
               Wait before next pose.
            */

            if (i < 2) {

                if (i === 0) {

                    boothMessage.textContent =
                        "Got it — change the pose.";

                }

                else {

                    boothMessage.textContent =
                        "One more.";

                }


                await wait(1200);

            }

        }


        /* =================================================
           SESSION FINISHED
        ================================================= */

        countdown.textContent =
            "";


        videoWrapper
            .classList
            .remove(
                "pre-flash"
            );


        boothMessage.textContent =
            "Okay. That's actually cute.";


        /*
           Show Retake / Start Over / Keep buttons.
        */

        stripActions
            .classList
            .remove(
                "hidden"
            );


        startBooth.disabled =
            false;


        sessionRunning =
            false;

    }
);


/* =========================================================
   COUNTDOWN
========================================================= */

async function runCountdown() {

    /*
       Count:

       3
       2
       1
    */

    for (
        let number = 3;
        number >= 1;
        number--
    ) {

        countdown.textContent =
            number;


        /*
           When we reach 1 and flash
           is enabled, increase the glow.

           This makes it feel like the
           flash is charging.
        */

        if (
            number === 1 &&
            flashEnabled
        ) {

            videoWrapper
                .classList
                .add(
                    "pre-flash"
                );

        }


        await wait(
            1000
        );

    }


    /*
       Remove number immediately before
       taking photograph.
    */

    countdown.textContent =
        "";


    videoWrapper
        .classList
        .remove(
            "pre-flash"
        );

}


/* =========================================================
   FULL SCREEN CAMERA FLASH
========================================================= */

function triggerFlash() {

    /*
       Flash OFF?

       Then don't create the white burst.
    */

    if (!flashEnabled) {

        return;

    }


    /*
       Remove previous flash animation.
    */

    boothFlash
        .classList
        .remove(
            "flash"
        );


    /*
       Force browser to recalculate layout.

       This lets us replay the CSS
       animation multiple times.
    */

    void boothFlash.offsetWidth;


    /*
       BOOM — white screen.
    */

    boothFlash
        .classList
        .add(
            "flash"
        );

}


/* =========================================================
   CAPTURE WEBCAM PHOTO
========================================================= */

function capturePhoto() {

    /*
       Get actual webcam dimensions.
    */

    const width =
        video.videoWidth || 640;


    const height =
        video.videoHeight || 480;


    /*
       Canvas matches webcam resolution.
    */

    canvas.width =
        width;


    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
       Save canvas state.
    */

    ctx.save();


    /*
       Mirror the photo horizontally.

       This makes saved image match
       the selfie preview.
    */

    ctx.translate(
        width,
        0
    );


    ctx.scale(
        -1,
        1
    );


    /*
       Draw webcam frame.
    */

    ctx.drawImage(

        video,

        0,
        0,

        width,
        height

    );


    /*
       Restore canvas.
    */

    ctx.restore();


    /*
       Convert canvas into image.

       0.78 reduces file size so
       localStorage fills less quickly.
    */

    return canvas.toDataURL(
        "image/jpeg",
        0.78
    );

}


/* =========================================================
   DISPLAY PHOTO IN STRIP
========================================================= */

function displayPhoto(
    index,
    imageData
) {

    const frame =
        stripFrames[index];


    /*
       Remove number placeholder.
    */

    frame.innerHTML =
        "";


    /*
       Create image.
    */

    const image =
        document.createElement(
            "img"
        );


    image.src =
        imageData;


    image.alt =
        `Photobooth photograph ${index + 1}`;


    /*
       CSS developing effect.
    */

    image.classList.add(
        "strip-develop"
    );


    /*
       Put image into strip.
    */

    frame.appendChild(
        image
    );

}


/* =========================================================
   CLEAR PHOTO STRIP
========================================================= */

function clearStrip() {

    stripFrames.forEach(
        (frame, index) => {

            /*
               Restore placeholders:
               01
               02
               03
            */

            frame.innerHTML =
                `<span>0${index + 1}</span>`;


            /*
               Remove retake styling.
            */

            frame.style.cursor =
                "";


            frame.style.outline =
                "";

        }
    );


    /*
       Hide strip action buttons.
    */

    stripActions
        .classList
        .add(
            "hidden"
        );


    retakeMode =
        false;

}


/* =========================================================
   PHOTO STRIP STYLE
========================================================= */

stripStyleButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                /*
                   Remove selected style
                   from all buttons.
                */

                stripStyleButtons
                    .forEach(
                        item => {

                            item.classList
                                .remove(
                                    "selected"
                                );

                        }
                    );


                /*
                   Select clicked button.
                */

                button
                    .classList
                    .add(
                        "selected"
                    );


                /*
                   Remember style.
                */

                selectedStripStyle =
                    button.dataset.style;


                /*
                   Reset strip class.
                */

                photoStrip.className =
                    "photo-strip";


                /*
                   Add selected style.
                */

                if (
                    selectedStripStyle !==
                    "classic"
                ) {

                    photoStrip
                        .classList
                        .add(
                            selectedStripStyle
                        );

                }

            }
        );

    }
);


/* =========================================================
   RETAKE ONE PHOTO
========================================================= */

retakeOne.addEventListener(
    "click",
    () => {

        /*
           Prevent retake during active capture.
        */

        if (
            !stream ||
            sessionRunning
        ) {

            return;

        }


        retakeMode =
            true;


        boothMessage.textContent =
            "Click the photo you want to retake.";


        /*
           Highlight the three photographs.
        */

        stripFrames.forEach(
            frame => {

                frame.style.cursor =
                    "pointer";


                frame.style.outline =
                    "2px dashed #c84b3c";

            }
        );

    }
);


/* =========================================================
   SELECT PHOTO TO RETAKE
========================================================= */

stripFrames.forEach(
    frame => {

        frame.addEventListener(
            "click",
            async () => {

                /*
                   Ignore clicks unless
                   retake mode is active.
                */

                if (
                    !retakeMode ||
                    !stream ||
                    sessionRunning
                ) {

                    return;

                }


                sessionRunning =
                    true;


                /*
                   Which photograph?
                */

                const index =
                    Number(
                        frame.dataset.index
                    );


                /*
                   Leave retake mode.
                */

                retakeMode =
                    false;


                /*
                   Remove outlines.
                */

                stripFrames.forEach(
                    item => {

                        item.style.cursor =
                            "";


                        item.style.outline =
                            "";

                    }
                );


                boothMessage.textContent =
                    `Retaking photo ${index + 1}...`;


                /*
                   Countdown again.
                */

                await runCountdown();


                /*
                   Flash if enabled.
                */

                triggerFlash();


                if (flashEnabled) {

                    await wait(100);

                }

                else {

                    await wait(50);

                }


                /*
                   Take replacement photograph.
                */

                const newPhoto =
                    capturePhoto();


                /*
                   Replace photo in array.
                */

                photos[index] =
                    newPhoto;


                /*
                   Replace photo visually.
                */

                displayPhoto(
                    index,
                    newPhoto
                );


                countdown.textContent =
                    "";


                boothMessage.textContent =
                    "Much better?";


                sessionRunning =
                    false;

            }
        );

    }
);


/* =========================================================
   START OVER
========================================================= */

restartBooth.addEventListener(
    "click",
    () => {

        if (sessionRunning) {

            return;

        }


        /*
           Remove photographs.
        */

        photos = [];


        /*
           Reset strip.
        */

        clearStrip();


        /*
           Remove caption.
        */

        stripCaption.value =
            "";


        /*
           Remove countdown.
        */

        countdown.textContent =
            "";


        /*
           Reset save button.
        */

        saveStrip.disabled =
            false;


        saveStrip.textContent =
            "Keep strip";


        boothMessage.textContent =
            "Ready for another one.";

    }
);


/* =========================================================
   SAVE PHOTO STRIP
========================================================= */

saveStrip.addEventListener(
    "click",
    () => {

        /*
           Only save complete strips.
        */

        if (
            photos.length !== 3
        ) {

            boothMessage.textContent =
                "Take all three photos first.";

            return;

        }


        /*
           Create memory object.
        */

        const memory = {

            id:
                Date.now(),

            type:
                "strip",

            images:
                photos,

            style:
                selectedStripStyle,

            caption:
                stripCaption
                    .value
                    .trim(),

            date:
                formatDate(),

            createdAt:
                new Date()
                    .toISOString()

        };


        /*
           common.js handles localStorage.
        */

        const success =
            saveMemory(
                memory
            );


        if (success) {

            boothMessage.textContent =
                "♡ Photo strip added to your Shoebox.";


            saveStrip.textContent =
                "Saved ♡";


            saveStrip.disabled =
                true;

        }

        else {

            boothMessage.textContent =
                "Browser storage is full. Try removing an older memory.";

        }

    }
);


/* =========================================================
   WAIT FUNCTION
========================================================= */

function wait(
    milliseconds
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   STOP CAMERA WHEN LEAVING PAGE
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (!stream) {

            return;

        }


        stream
            .getTracks()
            .forEach(
                track => {

                    track.stop();

                }
            );

    }
);