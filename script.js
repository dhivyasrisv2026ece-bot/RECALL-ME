
/* ==================================
   RECALLME - JAVASCRIPT
================================== */

// GET SAVED MEMORIES

let memories = JSON.parse(
    localStorage.getItem("recallMemories")
) || [];

let currentFilter = "All";
let currentView = "all";


// SAVE DATA

function saveData() {
    localStorage.setItem(
        "recallMemories",
        JSON.stringify(memories)
    );
}


// GET ELEMENTS

const memoryModal = document.getElementById("memoryModal");
const detailsModal = document.getElementById("detailsModal");
const memoryForm = document.getElementById("memoryForm");
const memoryGrid = document.getElementById("memoryGrid");
const searchInput = document.getElementById("searchInput");


// OPEN ADD MEMORY MODAL

function openModal(id = null) {

    memoryForm.reset();

    document.getElementById("editId").value = "";

    document.getElementById("modalTitle").textContent =
        "Create a Memory";

    if (id !== null) {

        const memory = memories.find(m => m.id === id);

        if (!memory) return;

        document.getElementById("modalTitle").textContent =
            "Edit Memory";

        document.getElementById("editId").value = memory.id;

        document.getElementById("memoryTitle").value =
            memory.title;

        document.getElementById("memoryDescription").value =
            memory.description;

        document.getElementById("memoryCategory").value =
            memory.category;

        document.getElementById("memoryDate").value =
            memory.date || "";

        document.getElementById("memoryPerson").value =
            memory.person || "";

        document.getElementById("memoryContext").value =
            memory.context || "";

        document.getElementById("memoryKeywords").value =
            memory.keywords || "";

    }

    memoryModal.classList.add("show");
}


// CLOSE ADD MODAL

function closeModal() {
    memoryModal.classList.remove("show");
}


// ADD OR EDIT MEMORY

memoryForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const id = document.getElementById("editId").value;

    const existing = memories.find(m => m.id === id);

    const memory = {

        id: id || Date.now().toString(),

        title: document.getElementById("memoryTitle").value.trim(),

        description: document.getElementById("memoryDescription").value.trim(),

        category: document.getElementById("memoryCategory").value,

        date: document.getElementById("memoryDate").value,

        person: document.getElementById("memoryPerson").value.trim(),

        context: document.getElementById("memoryContext").value.trim(),

        keywords: document.getElementById("memoryKeywords").value.trim(),

        pinned: existing ? existing.pinned : false,

        completed: existing ? existing.completed : false,

        createdAt: existing ? existing.createdAt : new Date().toISOString()

    };


    if (id) {

        memories = memories.map(m =>
            m.id === id ? memory : m
        );

    } else {

        memories.unshift(memory);

    }

    saveData();

    closeModal();

    renderApp();

});


// DELETE MEMORY

function deleteMemory(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this memory?"
    );

    if (!confirmDelete) return;

    memories = memories.filter(m => m.id !== id);

    saveData();

    renderApp();

    closeDetails();

}


// PIN / UNPIN MEMORY

function togglePin(id) {

    memories = memories.map(m => {

        if (m.id === id) {
            m.pinned = !m.pinned;
        }

        return m;

    });

    saveData();

    renderApp();

}


// MARK TASK AS COMPLETED

function toggleComplete(id) {

    memories = memories.map(m => {

        if (m.id === id) {
            m.completed = !m.completed;
        }

        return m;

    });

    saveData();

    renderApp();

}


// OPEN MEMORY DETAILS

function showDetails(id) {

    const memory = memories.find(m => m.id === id);

    if (!memory) return;

    document.getElementById("detailTitle").textContent =
        memory.title;

    document.getElementById("detailContent").innerHTML = `

        <p class="detail-description"></p>

        <div class="detail-row">
            <strong>Category:</strong>
            ${escapeHTML(memory.category)}
        </div>

        <div class="detail-row">
            <strong>Related Person:</strong>
            ${escapeHTML(memory.person || "Not specified")}
        </div>

        <div class="detail-row">
            <strong>Context:</strong>
            ${escapeHTML(memory.context || "Not specified")}
        </div>

        <div class="detail-row">
            <strong>Reminder:</strong>
            ${memory.date ? formatDate(memory.date) : "No reminder"}
        </div>

        <div class="detail-row">
            <strong>Status:</strong>
            ${memory.completed ? "Completed" : "Active"}
        </div>

        <div class="detail-keywords">
            ${(memory.keywords || "").split(",")
                .filter(k => k.trim())
                .map(k => `<span class="keyword">${escapeHTML(k.trim())}</span>`)
                .join("")}
        </div>

    `;

    document.querySelector(".detail-description").textContent =
        memory.description;

    document.getElementById("detailEditBtn").onclick = function() {

        closeDetails();

        openModal(id);

    };

    detailsModal.classList.add("show");

}


// CLOSE DETAILS

function closeDetails() {
    detailsModal.classList.remove("show");
}


// SAFE HTML DISPLAY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


// FORMAT DATE

function formatDate(date) {

    return new Date(date + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// GET REMINDER STATUS

function getStatus(memory) {

    if (!memory.date || memory.completed) {
        return "none";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDate = new Date(memory.date + "T00:00:00");

    if (reminderDate < today) {
        return "overdue";
    }

    return "upcoming";

}


// SMART SEARCH

function searchMemories(memory, query) {

    const searchableText = [

        memory.title,
        memory.description,
        memory.category,
        memory.person,
        memory.context,
        memory.keywords

    ].join(" ").toLowerCase();

    return searchableText.includes(query.toLowerCase());

}


// RENDER MEMORY CARDS

function renderMemories() {

    let filtered = [...memories];

    const query = searchInput.value.trim();


    // SEARCH

    if (query) {

        filtered = filtered.filter(memory =>
            searchMemories(memory, query)
        );

    }


    // CATEGORY FILTER

    if (currentFilter !== "All") {

        filtered = filtered.filter(memory =>
            memory.category === currentFilter
        );

    }


    // VIEW FILTER

    if (currentView === "pinned") {

        filtered = filtered.filter(m => m.pinned);

    }


    // TIMELINE VIEW

    if (currentView === "timeline") {

        filtered.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

    } else {

        const sort = document.getElementById("sortSelect").value;

        if (sort === "newest") {

            filtered.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

        } else if (sort === "oldest") {

            filtered.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
            );

        } else if (sort === "alphabetical") {

            filtered.sort((a, b) =>
                a.title.localeCompare(b.title)
            );

        }

        if (currentView !== "pinned") {
            filtered.sort((a, b) =>
                Number(b.pinned) - Number(a.pinned)
            );
        }

    }


    // EMPTY STATE

    if (filtered.length === 0) {

        memoryGrid.innerHTML = `

            <div class="empty-state">

                <i data-lucide="search-x"></i>

                <h3>No memories found</h3>

                <p>Try another keyword or add a new memory.</p>

            </div>

        `;

        lucide.createIcons();

        return;

    }


    // DISPLAY CARDS

    memoryGrid.innerHTML = filtered.map(memory => {

        const keywords = (memory.keywords || "")
            .split(",")
            .filter(k => k.trim())
            .map(k =>
                `<span class="keyword">${escapeHTML(k.trim())}</span>`
            )
            .join("");


        return `

            <article class="memory-card">

                <div class="card-top">

                    <span class="category-badge ${memory.category}">
                        ${escapeHTML(memory.category)}
                    </span>

                    <button
                        class="pin-btn ${memory.pinned ? "pinned" : ""}"
                        onclick="togglePin('${memory.id}')"
                        title="Pin memory"
                    >
                        <i data-lucide="bookmark"></i>
                    </button>

                </div>


                <h3>${escapeHTML(memory.title)}</h3>

                <p class="memory-description">
                    ${escapeHTML(memory.description)}
                </p>


                <div class="context-info">

                    ${memory.person ? `
                        <span>
                            <i data-lucide="user"></i>
                            ${escapeHTML(memory.person)}
                        </span>
                    ` : ""}

                    ${memory.context ? `
                        <span>
                            <i data-lucide="map-pin"></i>
                            ${escapeHTML(memory.context)}
                        </span>
                    ` : ""}

                    ${memory.date ? `
                        <span>
                            <i data-lucide="calendar"></i>
                            ${formatDate(memory.date)}
                        </span>
                    ` : ""}

                    ${memory.completed ? `
                        <span>
                            <i data-lucide="check-circle"></i>
                            Completed
                        </span>
                    ` : ""}

                </div>


                <div class="keyword-list">
                    ${keywords}
                </div>


                <div class="card-footer">

                    <span class="card-date">
                        ${new Date(memory.createdAt).toLocaleDateString("en-IN")}
                    </span>

                    <div class="card-actions">

                        <button onclick="showDetails('${memory.id}')">
                            View
                        </button>

                        <button onclick="openModal('${memory.id}')">
                            Edit
                        </button>

                        <button
                            class="delete-action"
                            onclick="deleteMemory('${memory.id}')"
                        >
                            Delete
                        </button>

                        ${memory.date && !memory.completed ? `
                            <button onclick="toggleComplete('${memory.id}')">
                                Done
                            </button>
                        ` : ""}

                    </div>

                </div>

            </article>

        `;

    }).join("");


    lucide.createIcons();

}


// RENDER REMINDER OVERVIEW

function renderReminders() {

    const reminderList = document.getElementById("reminderList");

    const pending = memories.filter(m =>
        m.date && !m.completed
    );

    pending.sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    if (pending.length === 0) {

        reminderList.innerHTML =
            `<p class="empty-small">No pending reminders. You're all caught up!</p>`;

        return;

    }


    reminderList.innerHTML = pending.slice(0, 5).map(memory => {

        const status = getStatus(memory);

        const statusText =
            status === "overdue" ? "Overdue" : "Upcoming";

        return `

            <div class="reminder-item ${status}">

                <span class="reminder-marker"></span>

                <div class="reminder-info">

                    <h4>${escapeHTML(memory.title)}</h4>

                    <p>${formatDate(memory.date)}</p>

                </div>

                <span class="reminder-status">
                    ${statusText}
                </span>

            </div>

        `;

    }).join("");

}


// UPDATE STATISTICS

function updateStats() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const upcoming = memories.filter(m =>
        getStatus(m) === "upcoming"
    ).length;

    const overdue = memories.filter(m =>
        getStatus(m) === "overdue"
    ).length;

    const completed = memories.filter(m =>
        m.completed
    ).length;


    document.getElementById("statTotal").textContent =
        memories.length;

    document.getElementById("totalCount").textContent =
        memories.length;

    document.getElementById("statUpcoming").textContent =
        upcoming;

    document.getElementById("statOverdue").textContent =
        overdue;

    document.getElementById("statCompleted").textContent =
        completed;

}


// MEMORY OF THE DAY

function showDailyMemory() {

    const available = memories.filter(m => !m.completed);

    if (available.length === 0) {

        document.getElementById("dailyTitle").textContent =
            "Your next memory starts here!";

        document.getElementById("dailyDescription").textContent =
            "Add a memory and come back to rediscover it.";

        return;

    }


    const index = Math.floor(Math.random() * available.length);

    const memory = available[index];

    document.getElementById("dailyTitle").textContent =
        memory.title;

    document.getElementById("dailyDescription").textContent =
        memory.description;

}


// DISPLAY APP

function renderApp() {

    renderMemories();

    renderReminders();

    updateStats();

    lucide.createIcons();

}


// FILTER BUTTONS

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        renderMemories();

    });

});


// SIDEBAR NAVIGATION

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", function() {

        document.querySelectorAll(".nav-item").forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        currentView = this.dataset.view || "all";

        if (this.dataset.category) {

            currentFilter = this.dataset.category;

            document.querySelectorAll(".filter-btn").forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.filter === currentFilter
                );

            });

            currentView = "all";

        } else {

            currentFilter = "All";

            document.querySelectorAll(".filter-btn").forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.filter === "All"
                );

            });

        }

        const titles = {
            all: "All Memories",
            pinned: "Pinned Memories",
            timeline: "Memory Timeline"
        };

        const title = this.dataset.category || titles[currentView];

        document.getElementById("memoryHeading").textContent =
            title || "All Memories";

        renderMemories();

    });

});


// SEARCH LISTENER

searchInput.addEventListener("input", renderMemories);


// SORT LISTENER

document.getElementById("sortSelect").addEventListener(
    "change",
    renderMemories
);


// CLOSE MODALS ON OUTSIDE CLICK

memoryModal.addEventListener("click", function(event) {

    if (event.target === memoryModal) {
        closeModal();
    }

});

detailsModal.addEventListener("click", function(event) {

    if (event.target === detailsModal) {
        closeDetails();
    }

});


// INITIALISE APPLICATION

renderApp();

showDailyMemory();
