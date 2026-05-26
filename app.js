const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#login-message");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    message.textContent = "Enter a username and password.";
    return;
  }

  message.textContent = "Login security will be connected in the next build step.";
});
