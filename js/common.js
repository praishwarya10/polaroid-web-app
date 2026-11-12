const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}


// Shared memory helpers

function getMemories() {
    try {
        return JSON.parse(localStorage.getItem("polaroidMemories")) || [];
    } catch (error) {
        return [];
    }
}


function saveMemory(memory) {
    const memories = getMemories();

    memories.push(memory);

    try {
        localStorage.setItem(
            "polaroidMemories",
            JSON.stringify(memories)
        );

        return true;
    } catch (error) {
        console.error("Could not save memory:", error);
        return false;
    }
}


function formatDate(date = new Date()) {
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}