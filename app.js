const loginShell = document.querySelector("#login-shell");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#login-message");
const logoutButton = document.querySelector("#logout-button");
const adminButton = document.querySelector(".admin-only");
const tabButtons = document.querySelectorAll(".tab-button");
const previews = {
  agreement: document.querySelector("#agreement-preview"),
  disclosure: document.querySelector("#disclosure-preview"),
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    message.textContent = "Enter a username and password.";
    return;
  }

  message.textContent = "";
  loginShell.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  adminButton.hidden = username.toLowerCase() !== "admin";
});

logoutButton.addEventListener("click", () => {
  appShell.classList.add("is-hidden");
  loginShell.classList.remove("is-hidden");
  loginForm.reset();
  message.textContent = "";
  document.querySelector("#username").focus();
});

adminButton.addEventListener("click", () => {
  alert("Administration settings will be connected in a later build step.");
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedDocument = button.dataset.document;

    tabButtons.forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");

    Object.values(previews).forEach((preview) => preview.classList.add("is-hidden"));
    previews[selectedDocument].classList.remove("is-hidden");
  });
});
