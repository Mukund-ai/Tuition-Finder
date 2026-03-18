/* ===========================================================
   TuitionFinder - Main JavaScript
   Works for ALL HTML pages
=========================================================== */

/* -------------------------------
   1. AUTO HIGHLIGHT ACTIVE NAV LINK
-------------------------------- */
const navLinks = document.querySelectorAll(".nav-links a, .nav .nav-link");
navLinks.forEach((link) => {
  if (link.href === window.location.href) link.classList.add("active");
});


/* -------------------------------
   2. SEARCH BAR (index.html)
-------------------------------- */
const searchForm = document.querySelector(".search-bar");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    // You can send values using URL parameters
    // Example: tutors.html?subject=Maths&class=10
    // Browser will handle redirect because action="tutors.html"
    console.log("Search submitted");
  });
}


/* -------------------------------
   3. FILTER SYSTEM (tutors.html)
-------------------------------- */
const filterForm = document.querySelector(".filter-sidebar form");
if (filterForm) {
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = filterForm.querySelector("input[name='subject']").value.trim();
    const className = filterForm.querySelector("input[name='class']").value.trim();
    const location = filterForm.querySelector("input[name='location']").value.trim();
    const maxFees = filterForm.querySelector("input[name='fees']").value.trim();

    alert(
      `Filters Applied:\nSubject: ${subject}\nClass: ${className}\nLocation: ${location}\nMax Fees: ${maxFees}`
    );
  });
}


/* -------------------------------
   4. CONTACT TUTOR (tutor-profile.html)
-------------------------------- */
const contactForm = document.querySelector(".sticky-card form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = contactForm.querySelector("input[placeholder='Name']").value.trim();
    const phone = contactForm.querySelector("input[placeholder='Phone']").value.trim();
    const message = contactForm.querySelector("textarea").value.trim();

    if (!name || !phone) {
      return showToast("Please enter name and phone.");
    }

    showToast("Your request has been sent to the tutor!");
    contactForm.reset();
  });
}


/* -------------------------------
   5. LOGIN PAGE HANDLING
-------------------------------- */
const loginForm = document.querySelector(".auth-card form");
const modernLoginForm = document.getElementById("loginForm");
if (!modernLoginForm && loginForm && window.location.pathname.includes("login.html")) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = loginForm.querySelector("select").value;
    const email = loginForm.querySelector("input[type='email']").value.trim();
    const password = loginForm.querySelector("input[type='password']").value.trim();

    if (!email || !password) {
      return showToast("Please fill all fields.");
    }

    showToast(`Logged in successfully as ${role}!`);
  });
}


/* -------------------------------
   6. REGISTER TUTOR
-------------------------------- */
const registerForm = document.querySelector(".grid-form");
if (registerForm && window.location.pathname.includes("register-tutor.html")) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = registerForm.querySelector("input[name='name']").value.trim();
    const email = registerForm.querySelector("input[name='email']").value.trim();
    const phone = registerForm.querySelector("input[name='phone']").value.trim();
    const subjects = registerForm.querySelector("input[name='subjects']").value.trim();

    if (!name || !email || !phone || !subjects) {
      return showToast("Please fill required fields.");
    }

    showToast("Tutor registered successfully!");
    registerForm.reset();
  });
}


/* -------------------------------
   7. SIMPLE TOAST NOTIFICATION
-------------------------------- */
function showToast(msg) {
  let toast = document.createElement("div");
  toast.innerText = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "25px";
  toast.style.right = "25px";
  toast.style.padding = "12px 18px";
  toast.style.background = "#2d63ff";
  toast.style.color = "#fff";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 3px 10px rgba(0,0,0,0.15)";
  toast.style.transition = "0.4s";
  toast.style.opacity = "1";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}


/* -------------------------------
   8. SMOOTH SCROLL (Optional)
-------------------------------- */
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
