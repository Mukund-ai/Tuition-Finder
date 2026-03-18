const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");
const remember = document.getElementById("remember");
const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const toast = document.getElementById("toast");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  const spinner = loginBtn.querySelector(".spinner");
  const text = loginBtn.querySelector(".btn-text");
  if (spinner) spinner.style.display = isLoading ? "inline-block" : "none";
  if (text) text.textContent = isLoading ? "Logging in..." : "Login";
}

function validateEmail(value) {
  const v = String(value || "").trim();
  // Simple and reliable enough for client-side UI validation
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return { ok, value: v };
}

function validatePassword(value) {
  const v = String(value || "");
  const ok = v.length >= 6;
  return { ok, value: v };
}

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  email.removeAttribute("aria-invalid");
  password.removeAttribute("aria-invalid");
}

function setError(el, errorEl, message) {
  errorEl.textContent = message;
  el.setAttribute("aria-invalid", "true");
}

togglePassword?.addEventListener("click", () => {
  const isPassword = password.type === "password";
  password.type = isPassword ? "text" : "password";
  togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});

email?.addEventListener("input", () => {
  if (!emailError.textContent) return;
  const { ok } = validateEmail(email.value);
  if (ok) {
    emailError.textContent = "";
    email.removeAttribute("aria-invalid");
  }
});

password?.addEventListener("input", () => {
  if (!passwordError.textContent) return;
  const { ok } = validatePassword(password.value);
  if (ok) {
    passwordError.textContent = "";
    password.removeAttribute("aria-invalid");
  }
});

document.getElementById("forgotLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  showToast("Password reset isn’t connected yet (frontend demo).");
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const e1 = validateEmail(email.value);
  const p1 = validatePassword(password.value);

  let ok = true;
  if (!e1.ok) {
    setError(email, emailError, "Please enter a valid email address.");
    ok = false;
  }
  if (!p1.ok) {
    setError(password, passwordError, "Password must be at least 6 characters.");
    ok = false;
  }
  if (!ok) return;

  const payload = {
    role: role.value,
    email: e1.value,
    password: p1.value,
    remember: Boolean(remember.checked),
  };

  setLoading(true);
  try {
    // Simulated login delay (replace with real API call later)
    await new Promise((r) => setTimeout(r, 900));

    // Demo-only behavior:
    // - if email contains "fail", show an error
    if (payload.email.toLowerCase().includes("fail")) {
      setError(email, emailError, "No account found for this email.");
      showToast("Login failed. Please check your details.");
      return;
    }

    showToast(`Logged in as ${payload.role}. Redirecting...`);
    await new Promise((r) => setTimeout(r, 700));

    // Redirect idea (adjust as your site grows)
    window.location.href = "index.html";
  } finally {
    setLoading(false);
  }
});

