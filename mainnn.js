/* ===============================
   LOCAL STORAGE BACKEND SYSTEM
================================*/

// Helper: Get Data
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Helper: Save Data
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* ===============================
   1. REGISTER TUTOR
================================*/
function registerTutor() {
    const tutor = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        subjects: document.getElementById("subjects").value,
        experience: document.getElementById("experience").value,
        fees: document.getElementById("fees").value,
        location: document.getElementById("location").value,
        bio: document.getElementById("bio").value
    };

    let tutors = getData("tutors");
    tutors.push(tutor);
    saveData("tutors", tutors);

    alert("Tutor Registered Successfully!");
}

/* ===============================
   2. LOAD ALL TUTORS
================================*/
function loadTutors() {
    const tutors = getData("tutors");
    let container = document.getElementById("tutor-list");

    tutors.forEach((t, index) => {
        container.innerHTML += `
            <div class="tutor-card">
                <h2>${t.name}</h2>
                <p>${t.subjects} • ${t.experience} years</p>
                <p>Fees: ₹${t.fees}</p>
                <p>Location: ${t.location}</p>

                <a href="tutor-profile.html?id=${index}" class="btn-outline">
                    View Profile
                </a>
            </div>
        `;
    });
}

/* ===============================
   3. LOAD SINGLE TUTOR (PROFILE)
================================*/
function loadTutorProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const tutors = getData("tutors");
    const t = tutors[id];

    document.getElementById("name").innerText = t.name;
    document.getElementById("subjects").innerText = t.subjects;
    document.getElementById("experience").innerText = t.experience + " years";
    document.getElementById("location").innerText = t.location;
    document.getElementById("fees").innerText = "₹" + t.fees;
    document.getElementById("bio").innerText = t.bio;
}

/* ===============================
   4. STUDENT LOGIN (LOCAL)
================================*/
function loginUser() {
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-pass").value;

    if (email === "" || pass === "") {
        alert("Please fill all fields");
        return;
    }

    localStorage.setItem("loggedIn", "true");
    alert("Login Successful!");
    window.location.href = "index.html";
}

/* ===============================
   5. NOTES & BOOKS SYSTEM
================================*/
function uploadNote() {
    const note = {
        title: document.getElementById("note-title").value,
        subject: document.getElementById("note-subject").value,
        class: document.getElementById("note-class").value,
        link: document.getElementById("note-link").value,
    };

    let notes = getData("notes");
    notes.push(note);
    saveData("notes", notes);

    alert("Note uploaded!");
}

/* Load Notes */
function loadNotes() {
    const notes = getData("notes");
    let box = document.getElementById("notes-list");

    notes.forEach(n => {
        box.innerHTML += `
            <div class="note-card">
                <h3>${n.title}</h3>
                <p>Subject: ${n.subject}</p>
                <p>Class: ${n.class}</p>
                <a href="${n.link}" target="_blank" class="btn-primary">Download</a>
            </div>
        `;
    });
}
