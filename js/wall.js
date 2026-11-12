/* =========================================================
   MEMORY WALL
========================================================= */

const memoryWall =
    document.getElementById("memoryWall");

const emptyWall =
    document.getElementById("emptyWall");

const openMemoryPicker =
    document.getElementById("openMemoryPicker");

const wallPicker =
    document.getElementById("wallPicker");

const pickerBackdrop =
    document.getElementById("pickerBackdrop");

const closePicker =
    document.getElementById("closePicker");

const pickerMemories =
    document.getElementById("pickerMemories");

const addNote =
    document.getElementById("addNote");

const clearWall =
    document.getElementById("clearWall");

const wallItemControls =
    document.getElementById("wallItemControls");

const rotateLeft =
    document.getElementById("rotateLeft");

const rotateRight =
    document.getElementById("rotateRight");

const smallerItem =
    document.getElementById("smallerItem");

const largerItem =
    document.getElementById("largerItem");

const changePin =
    document.getElementById("changePin");

const removeWallItem =
    document.getElementById("removeWallItem");


let memories =
    getMemories();

let wallItems =
    getWallItems();

let selectedWallId =
    null;

let highestWallZ =
    10;


/* =========================================================
   STORAGE
========================================================= */

function getWallItems() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "polaroidWall"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveWall() {

    localStorage.setItem(
        "polaroidWall",
        JSON.stringify(wallItems)
    );

}


/* =========================================================
   RENDER WALL
========================================================= */

renderWall();


function renderWall() {

    memoryWall
        .querySelectorAll(".wall-memory")
        .forEach(item => item.remove());


    wallItems =
        wallItems.filter(item => {

            /*
               Notes don't need memory IDs.
            */

            if (item.type === "note") {
                return true;
            }


            return memories.some(
                memory =>
                    String(memory.id) ===
                    String(item.memoryId)
            );

        });


    saveWall();


    if (wallItems.length) {

        emptyWall.classList.add(
            "hidden"
        );

    } else {

        emptyWall.classList.remove(
            "hidden"
        );

    }


    wallItems.forEach(
        item => {

            const element =
                createWallElement(item);

            memoryWall.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   CREATE WALL ELEMENT
========================================================= */

function createWallElement(item) {

    const element =
        document.createElement("div");


    element.className =
        "wall-memory";


    element.dataset.wallId =
        item.id;


    element.style.left =
        `${item.x || 40}px`;


    element.style.top =
        `${item.y || 40}px`;


    element.style.zIndex =
        item.z || 1;


    /* NOTE */

    if (item.type === "note") {

        element.classList.add(
            "wall-note"
        );


        element.innerHTML = `

            <textarea
                maxlength="100"
                placeholder="write something..."
            >${escapeHTML(item.text || "")}</textarea>

        `;


        const textarea =
            element.querySelector(
                "textarea"
            );


        textarea.addEventListener(
            "input",
            () => {

                item.text =
                    textarea.value;

                saveWall();

            }
        );

    }


    /* MEMORY */

    else {

        const memory =
            memories.find(
                memory =>
                    String(memory.id) ===
                    String(item.memoryId)
            );


        if (!memory) {

            return element;

        }


        if (memory.type === "polaroid") {

            element.classList.add(
                "wall-polaroid"
            );


            element.innerHTML = `

                <div class="wall-decoration ${item.decoration || "tape"}"></div>

                <div class="wall-photo-paper">

                    <img
                        src="${memory.image}"
                        class="${memory.film ?
                            `filter-${memory.film}` : ""}"
                        alt="Memory"
                    >

                    <p>
                        ${escapeHTML(memory.caption || "")}
                    </p>

                </div>
            `;

        }


        else {

            element.classList.add(
                "wall-strip"
            );


            element.innerHTML = `

                <div class="wall-decoration ${item.decoration || "tape"}"></div>

                <div class="wall-strip-paper ${memory.style || ""}">

                    ${(memory.images || [])
                        .map(image => `
                            <img
                                src="${image}"
                                alt="Photobooth memory"
                            >
                        `)
                        .join("")}

                    <p>
                        ${escapeHTML(memory.caption || "")}
                    </p>

                </div>
            `;

        }

    }


    updateWallTransform(
        element,
        item
    );


    makeWallDraggable(
        element,
        item
    );


    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.tagName ===
                "TEXTAREA"
            ) {
                return;
            }

            selectWallItem(
                item.id,
                element
            );

        }
    );


    return element;

}


/* =========================================================
   TRANSFORM
========================================================= */

function updateWallTransform(
    element,
    item
) {

    element.style.transform =
        `rotate(${item.rotation || 0}deg)
         scale(${item.scale || 1})`;

}


/* =========================================================
   DRAGGING
========================================================= */

function makeWallDraggable(
    element,
    item
) {

    let dragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.tagName ===
                "TEXTAREA"
            ) {
                return;
            }


            dragging = true;


            startX =
                event.clientX;

            startY =
                event.clientY;


            startLeft =
                item.x || 0;

            startTop =
                item.y || 0;


            highestWallZ++;


            item.z =
                highestWallZ;


            element.style.zIndex =
                highestWallZ;


            element.setPointerCapture(
                event.pointerId
            );


            element.classList.add(
                "wall-dragging"
            );

        }
    );


    element.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {
                return;
            }


            const dx =
                event.clientX -
                startX;


            const dy =
                event.clientY -
                startY;


            item.x =
                startLeft + dx;


            item.y =
                startTop + dy;


            element.style.left =
                `${item.x}px`;


            element.style.top =
                `${item.y}px`;

        }
    );


    element.addEventListener(
        "pointerup",
        event => {

            if (!dragging) {
                return;
            }


            dragging = false;


            element.classList.remove(
                "wall-dragging"
            );


            try {

                element.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {}


            saveWall();

        }
    );

}


/* =========================================================
   SELECT ITEM
========================================================= */

function selectWallItem(
    id,
    element
) {

    selectedWallId =
        id;


    document
        .querySelectorAll(
            ".wall-memory.selected"
        )
        .forEach(item => {

            item.classList.remove(
                "selected"
            );

        });


    element.classList.add(
        "selected"
    );


    wallItemControls.classList.remove(
        "hidden"
    );

}


/* =========================================================
   ROTATE
========================================================= */

rotateLeft.addEventListener(
    "click",
    () => {

        changeSelected(
            item => {

                item.rotation =
                    (item.rotation || 0) - 5;

            }
        );

    }
);


rotateRight.addEventListener(
    "click",
    () => {

        changeSelected(
            item => {

                item.rotation =
                    (item.rotation || 0) + 5;

            }
        );

    }
);


/* =========================================================
   SIZE
========================================================= */

smallerItem.addEventListener(
    "click",
    () => {

        changeSelected(
            item => {

                item.scale =
                    Math.max(
                        .65,
                        (item.scale || 1) - .1
                    );

            }
        );

    }
);


largerItem.addEventListener(
    "click",
    () => {

        changeSelected(
            item => {

                item.scale =
                    Math.min(
                        1.7,
                        (item.scale || 1) + .1
                    );

            }
        );

    }
);


/* =========================================================
   CHANGE TAPE / PIN
========================================================= */

changePin.addEventListener(
    "click",
    () => {

        changeSelected(
            item => {

                if (item.type === "note") {
                    return;
                }


                const options =
                    [
                        "tape",
                        "pin",
                        "tape-left"
                    ];


                const current =
                    options.indexOf(
                        item.decoration
                    );


                item.decoration =
                    options[
                        (current + 1) %
                        options.length
                    ];

            },
            true
        );

    }
);


/* =========================================================
   CHANGE SELECTED HELPER
========================================================= */

function changeSelected(
    callback,
    rerender = false
) {

    if (!selectedWallId) {
        return;
    }


    const item =
        wallItems.find(
            item =>
                String(item.id) ===
                String(selectedWallId)
        );


    if (!item) {
        return;
    }


    callback(item);


    saveWall();


    if (rerender) {

        renderWall();

        selectedWallId = null;

        wallItemControls.classList.add(
            "hidden"
        );

        return;

    }


    const element =
        document.querySelector(
            `[data-wall-id="${selectedWallId}"]`
        );


    if (element) {

        updateWallTransform(
            element,
            item
        );

    }

}


/* =========================================================
   REMOVE ITEM
========================================================= */

removeWallItem.addEventListener(
    "click",
    () => {

        if (!selectedWallId) {
            return;
        }


        wallItems =
            wallItems.filter(
                item =>
                    String(item.id) !==
                    String(selectedWallId)
            );


        selectedWallId =
            null;


        saveWall();

        renderWall();


        wallItemControls.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   OPEN PICKER
========================================================= */

openMemoryPicker.addEventListener(
    "click",
    () => {

        memories =
            getMemories();


        renderPicker();


        wallPicker.classList.remove(
            "hidden"
        );

    }
);


closePicker.addEventListener(
    "click",
    closeWallPicker
);


pickerBackdrop.addEventListener(
    "click",
    closeWallPicker
);


function closeWallPicker() {

    wallPicker.classList.add(
        "hidden"
    );

}


/* =========================================================
   RENDER PICKER
========================================================= */

function renderPicker() {

    pickerMemories.innerHTML =
        "";


    if (!memories.length) {

        pickerMemories.innerHTML = `

            <div class="picker-empty">

                Your Shoebox is empty.

                <a href="camera.html">
                    Take a photograph →
                </a>

            </div>
        `;

        return;

    }


    memories.forEach(
        memory => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "picker-memory";


            if (memory.type === "polaroid") {

                button.innerHTML = `

                    <img
                        src="${memory.image}"
                        class="${memory.film ?
                            `filter-${memory.film}` : ""}"
                        alt="Memory"
                    >

                    <span>
                        ${escapeHTML(
                            memory.caption ||
                            "untitled"
                        )}
                    </span>
                `;

            }

            else {

                button.innerHTML = `

                    <div class="picker-mini-strip">

                        ${(memory.images || [])
                            .map(image => `
                                <img
                                    src="${image}"
                                    alt=""
                                >
                            `)
                            .join("")}

                    </div>

                    <span>
                        ${escapeHTML(
                            memory.caption ||
                            "photo strip"
                        )}
                    </span>
                `;

            }


            button.addEventListener(
                "click",
                () => {

                    addMemoryToWall(
                        memory
                    );

                }
            );


            pickerMemories.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   ADD MEMORY
========================================================= */

function addMemoryToWall(memory) {

    const wallRect =
        memoryWall.getBoundingClientRect();


    const item = {

        id:
            Date.now(),

        memoryId:
            memory.id,

        x:
            Math.max(
                30,
                wallRect.width / 2 - 110
            ),

        y:
            100,

        rotation:
            Math.floor(
                Math.random() * 9
            ) - 4,

        scale:
            1,

        decoration:
            "tape",

        z:
            ++highestWallZ

    };


    wallItems.push(
        item
    );


    saveWall();

    renderWall();

    closeWallPicker();

}


/* =========================================================
   ADD NOTE
========================================================= */

addNote.addEventListener(
    "click",
    () => {

        const item = {

            id:
                Date.now(),

            type:
                "note",

            text:
                "",

            x:
                80 +
                Math.random() * 120,

            y:
                80 +
                Math.random() * 100,

            rotation:
                -3 +
                Math.random() * 6,

            scale:
                1,

            z:
                ++highestWallZ

        };


        wallItems.push(
            item
        );


        saveWall();

        renderWall();

    }
);


/* =========================================================
   CLEAR WALL
========================================================= */

clearWall.addEventListener(
    "click",
    () => {

        if (!wallItems.length) {
            return;
        }


        const confirmed =
            confirm(
                "Take everything off the wall?"
            );


        if (!confirmed) {
            return;
        }


        wallItems = [];


        selectedWallId =
            null;


        saveWall();

        renderWall();


        wallItemControls.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}