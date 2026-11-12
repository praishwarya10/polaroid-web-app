/* =========================================================
   POLAROID SHOEBOX
========================================================= */

const memoryPile =
    document.getElementById("memoryPile");

const emptyShoebox =
    document.getElementById("emptyShoebox");

const filterButtons =
    document.querySelectorAll(".box-filter");

const pickMemory =
    document.getElementById("pickMemory");

const memoryViewer =
    document.getElementById("memoryViewer");

const viewerMemory =
    document.getElementById("viewerMemory");

const closeViewer =
    document.getElementById("closeViewer");

const viewerBackdrop =
    document.getElementById("viewerBackdrop");

const viewerFlip =
    document.getElementById("viewerFlip");

const deleteMemory =
    document.getElementById("deleteMemory");

const addToWall =
    document.getElementById("addToWall");


let memories = getMemories();

let currentFilter = "all";

let selectedMemory = null;

let highestZ = 10;


/* =========================================================
   RENDER
========================================================= */

renderMemories();


function renderMemories() {

    memoryPile
        .querySelectorAll(".pile-memory")
        .forEach(item => item.remove());


    const filtered =
        memories.filter(memory => {

            if (currentFilter === "all") {
                return true;
            }

            return memory.type === currentFilter;

        });


    if (filtered.length === 0) {

        emptyShoebox.classList.remove("hidden");

    } else {

        emptyShoebox.classList.add("hidden");

    }


    filtered.forEach((memory, index) => {

        const element =
            createPileMemory(memory, index);

        memoryPile.appendChild(element);

    });

}


/* =========================================================
   CREATE MEMORY IN PILE
========================================================= */

function createPileMemory(memory, index) {

    const item =
        document.createElement("div");

    item.className =
        `pile-memory pile-${memory.type}`;

    item.dataset.id =
        memory.id;


    /*
       Deterministic-looking random rotation.
    */

    const rotations =
        [-8, 5, -3, 7, -5, 3, -1];

    const rotation =
        rotations[index % rotations.length];


    const left =
        8 + ((index * 17) % 65);

    const top =
        7 + ((index * 13) % 55);


    item.style.left =
        `${left}%`;

    item.style.top =
        `${top}%`;

    item.dataset.rotation =
        rotation;

    item.style.transform =
        `rotate(${rotation}deg)`;


    /* POLAROID */

    if (memory.type === "polaroid") {

        item.innerHTML = `
            <div class="pile-polaroid">

                <img
                    src="${memory.image}"
                    class="${memory.film ?
                        `filter-${memory.film}` : ""}"
                    alt="Saved memory"
                >

                <p>
                    ${escapeHTML(memory.caption || "")}
                </p>

                <small>
                    ${escapeHTML(memory.date || "")}
                </small>

            </div>
        `;

    }


    /* PHOTO STRIP */

    else if (memory.type === "strip") {

        item.innerHTML = `
            <div class="pile-strip ${memory.style || ""}">

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


    makeDraggable(item);


    item.addEventListener(
        "dblclick",
        () => openMemory(memory)
    );


    /*
       Mobile / normal click:
       first click brings it forward.
    */

    item.addEventListener(
        "click",
        () => {

            highestZ++;

            item.style.zIndex =
                highestZ;

        }
    );


    return item;

}


/* =========================================================
   DRAG MEMORIES AROUND THE BOX
========================================================= */

function makeDraggable(element) {

    let dragging = false;

    let moved = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    element.addEventListener(
        "pointerdown",
        event => {

            dragging = true;
            moved = false;

            highestZ++;

            element.style.zIndex =
                highestZ;


            const pileRect =
                memoryPile.getBoundingClientRect();

            const itemRect =
                element.getBoundingClientRect();


            startX =
                event.clientX;

            startY =
                event.clientY;


            startLeft =
                itemRect.left -
                pileRect.left;

            startTop =
                itemRect.top -
                pileRect.top;


            element.setPointerCapture(
                event.pointerId
            );

            element.classList.add(
                "dragging"
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
                event.clientX - startX;

            const dy =
                event.clientY - startY;


            if (
                Math.abs(dx) > 4 ||
                Math.abs(dy) > 4
            ) {
                moved = true;
            }


            const maxLeft =
                memoryPile.clientWidth -
                element.offsetWidth;

            const maxTop =
                memoryPile.clientHeight -
                element.offsetHeight;


            const newLeft =
                Math.max(
                    0,
                    Math.min(
                        startLeft + dx,
                        maxLeft
                    )
                );


            const newTop =
                Math.max(
                    0,
                    Math.min(
                        startTop + dy,
                        maxTop
                    )
                );


            element.style.left =
                `${newLeft}px`;

            element.style.top =
                `${newTop}px`;

        }
    );


    element.addEventListener(
        "pointerup",
        event => {

            dragging = false;

            element.classList.remove(
                "dragging"
            );


            try {

                element.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {}


            /*
               On mobile there is no double-click
               expectation, so a short tap opens.
            */

            if (
                !moved &&
                window.matchMedia(
                    "(max-width: 700px)"
                ).matches
            ) {

                const memory =
                    memories.find(
                        item =>
                            String(item.id) ===
                            String(element.dataset.id)
                    );


                if (memory) {
                    openMemory(memory);
                }

            }

        }
    );

}


/* =========================================================
   FILTERS
========================================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item =>
                    item.classList.remove("active")
            );


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderMemories();

        }
    );

});


/* =========================================================
   PICK A MEMORY
========================================================= */

pickMemory.addEventListener(
    "click",
    () => {

        const filtered =
            memories.filter(memory => {

                if (currentFilter === "all") {
                    return true;
                }

                return memory.type === currentFilter;

            });


        if (!filtered.length) {

            pickMemory.textContent =
                "BOX IS EMPTY";

            setTimeout(() => {

                pickMemory.textContent =
                    "PICK A MEMORY";

            }, 1200);

            return;

        }


        const random =
            filtered[
                Math.floor(
                    Math.random() *
                    filtered.length
                )
            ];


        /*
           Small rummaging animation.
        */

        memoryPile.classList.add(
            "rummaging"
        );


        setTimeout(() => {

            memoryPile.classList.remove(
                "rummaging"
            );

            openMemory(random);

        }, 700);

    }
);


/* =========================================================
   OPEN MEMORY
========================================================= */

function openMemory(memory) {

    selectedMemory =
        memory;


    viewerMemory.innerHTML =
        "";


    /* POLAROID VIEWER */

    if (memory.type === "polaroid") {

        viewerFlip.classList.remove(
            "hidden"
        );


        const card =
            document.createElement("div");

        card.className =
            "viewer-polaroid";


        card.innerHTML = `

            <div class="viewer-polaroid-inner">

                <div class="viewer-polaroid-front">

                    <img
                        src="${memory.image}"
                        class="${memory.film ?
                            `filter-${memory.film}` : ""}"
                        alt="Memory"
                    >

                    <p>
                        ${escapeHTML(memory.caption || "")}
                    </p>

                    <small>
                        ${escapeHTML(memory.date || "")}
                    </small>

                </div>


                <div class="viewer-polaroid-back">

                    <span>
                        THE STORY BEHIND THIS ONE
                    </span>

                    <p>
                        ${
                            escapeHTML(
                                memory.story ||
                                "No story written for this one."
                            )
                        }
                    </p>

                    <small>
                        ${escapeHTML(memory.date || "")}
                    </small>

                </div>

            </div>
        `;


        viewerMemory.appendChild(card);

    }


    /* STRIP VIEWER */

    else {

        viewerFlip.classList.add(
            "hidden"
        );


        const strip =
            document.createElement("div");

        strip.className =
            `viewer-strip ${memory.style || ""}`;


        strip.innerHTML = `

            ${(memory.images || [])
                .map(image => `
                    <img
                        src="${image}"
                        alt="Photobooth photograph"
                    >
                `)
                .join("")}

            <p>
                ${escapeHTML(memory.caption || "")}
            </p>

            <small>
                ${escapeHTML(memory.date || "")}
            </small>
        `;


        viewerMemory.appendChild(strip);

    }


    memoryViewer.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "viewer-open"
    );

}


/* =========================================================
   FLIP
========================================================= */

viewerFlip.addEventListener(
    "click",
    () => {

        const inner =
            viewerMemory.querySelector(
                ".viewer-polaroid-inner"
            );


        if (inner) {

            inner.classList.toggle(
                "flipped"
            );

        }

    }
);


/* =========================================================
   CLOSE
========================================================= */

closeViewer.addEventListener(
    "click",
    closeMemory
);

viewerBackdrop.addEventListener(
    "click",
    closeMemory
);


function closeMemory() {

    memoryViewer.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "viewer-open"
    );

    selectedMemory = null;

}


/* =========================================================
   DELETE
========================================================= */

deleteMemory.addEventListener(
    "click",
    () => {

        if (!selectedMemory) {
            return;
        }


        const confirmed =
            confirm(
                "Let this memory go?"
            );


        if (!confirmed) {
            return;
        }


        memories =
            memories.filter(
                memory =>
                    String(memory.id) !==
                    String(selectedMemory.id)
            );


        localStorage.setItem(
            "polaroidMemories",
            JSON.stringify(memories)
        );


        closeMemory();

        renderMemories();

    }
);


/* =========================================================
   PIN TO WALL
========================================================= */

addToWall.addEventListener(
    "click",
    () => {

        if (!selectedMemory) {
            return;
        }


        let wallItems = [];


        try {

            wallItems =
                JSON.parse(
                    localStorage.getItem(
                        "polaroidWall"
                    )
                ) || [];

        } catch (error) {

            wallItems = [];

        }


        const alreadyPinned =
            wallItems.some(
                item =>
                    String(item.memoryId) ===
                    String(selectedMemory.id)
            );


        if (alreadyPinned) {

            addToWall.textContent =
                "ALREADY ON WALL";

            setTimeout(() => {

                addToWall.textContent =
                    "PIN TO WALL";

            }, 1200);

            return;

        }


        wallItems.push({

            id:
                Date.now(),

            memoryId:
                selectedMemory.id,

            x:
                80 + Math.random() * 180,

            y:
                80 + Math.random() * 120,

            rotation:
                -5 + Math.random() * 10,

            scale:
                1,

            decoration:
                "tape"

        });


        localStorage.setItem(
            "polaroidWall",
            JSON.stringify(wallItems)
        );


        addToWall.textContent =
            "PINNED ♡";


        setTimeout(() => {

            addToWall.textContent =
                "PIN TO WALL";

        }, 1200);

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