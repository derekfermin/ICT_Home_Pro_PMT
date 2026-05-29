const loginShell = document.querySelector("#login-shell");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#login-message");
const logoutButton = document.querySelector("#logout-button");
const adminButton = document.querySelector(".admin-only");
const tabButtons = document.querySelectorAll(".tab-button");
const builderForm = document.querySelector("#agreement-builder-form");
const saveDraftButton = document.querySelector("#save-draft-button");
const printPacketButton = document.querySelector("#print-packet-button");
const draftMessage = document.querySelector("#draft-message");
const previews = {
  agreement: document.querySelector("#agreement-preview"),
  disclosure: document.querySelector("#disclosure-preview"),
};

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const periodsPerYear = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

const oldLateFeePlaceholder = "To be configured under Kansas and federal rules";
const kansasLateFeeTerms =
  "If a payment is not paid in full within 10 days after its due date, the late charge will be the lesser of 5% of the unpaid installment or $25, as permitted by Kansas law.";

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

builderForm.addEventListener("input", updateAgreementPreview);
builderForm.addEventListener("change", updateAgreementPreview);

saveDraftButton.addEventListener("click", () => {
  localStorage.setItem("ictHomeProsAgreementDraft", JSON.stringify(getBuilderData()));
  draftMessage.textContent = "Draft saved in this browser.";
});

printPacketButton.addEventListener("click", () => {
  window.print();
});

function getBuilderData() {
  const formData = new FormData(builderForm);
  return Object.fromEntries(formData.entries());
}

function getNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getInteger(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function flattenAddress(value) {
  return String(value || "").replace(/\s*\n\s*/g, ", ").trim() || "Not provided";
}

function titleCaseFrequency(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function generateAgreementNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ICT-${datePart}-${randomPart}`;
}

function ensureAgreementNumber() {
  const agreementNumberField = builderForm.elements.namedItem("agreementNumber");
  const currentValue = String(agreementNumberField.value || "").trim();

  if (!currentValue || currentValue === "ICT-0001") {
    agreementNumberField.value = generateAgreementNumber();
  }
}

function calculateFinancing(data) {
  const totalPrice = Math.max(0, getNumber(data.totalPrice));
  const downPayment = Math.min(totalPrice, Math.max(0, getNumber(data.downPayment)));
  const amountFinanced = Math.max(0, totalPrice - downPayment);
  const apr = Math.max(0, getNumber(data.apr));
  const numberOfPayments = getInteger(data.numberOfPayments);
  const paymentFrequency = data.paymentFrequency || "monthly";
  const periodicRate = apr / 100 / periodsPerYear[paymentFrequency];

  let paymentAmount = numberOfPayments ? amountFinanced / numberOfPayments : 0;

  if (periodicRate > 0 && numberOfPayments > 0) {
    paymentAmount =
      (amountFinanced * periodicRate) /
      (1 - Math.pow(1 + periodicRate, -numberOfPayments));
  }

  const totalOfPayments = paymentAmount * numberOfPayments;
  const financeCharge = Math.max(0, totalOfPayments - amountFinanced);

  return {
    totalPrice,
    downPayment,
    amountFinanced,
    apr,
    numberOfPayments,
    paymentFrequency,
    paymentAmount,
    totalOfPayments,
    financeCharge,
  };
}

function setOutputs(name, value) {
  document.querySelectorAll(`[data-output="${name}"]`).forEach((element) => {
    element.textContent = value;
  });
}

function updateAgreementPreview() {
  const data = getBuilderData();
  const financing = calculateFinancing(data);
  const paymentFrequency = financing.paymentFrequency;
  const frequencyLabel = titleCaseFrequency(paymentFrequency).toLowerCase();
  const paymentPlan = `${financing.numberOfPayments} ${frequencyLabel} payments`;
  const paymentAmount = dollars.format(financing.paymentAmount);
  const paymentSchedule = `${paymentPlan} of ${paymentAmount}`;
  const estimatedPayment = `${paymentAmount} ${frequencyLabel}`;

  setOutputs("clientName", data.clientName || "Not provided");
  setOutputs("agreementNumber", data.agreementNumber || "Not assigned");
  setOutputs("datePreparedDisplay", formatDate(data.datePrepared));
  setOutputs("projectDescription", data.projectDescription || "Not provided");
  setOutputs("clientAddress", flattenAddress(data.clientAddress));
  setOutputs("serviceAddress", flattenAddress(data.serviceAddress));
  setOutputs("totalPrice", dollars.format(financing.totalPrice));
  setOutputs("downPayment", dollars.format(financing.downPayment));
  setOutputs("amountFinanced", dollars.format(financing.amountFinanced));
  setOutputs("financeCharge", dollars.format(financing.financeCharge));
  setOutputs("aprDisplay", `${financing.apr.toFixed(2)}%`);
  setOutputs("totalOfPayments", dollars.format(financing.totalOfPayments));
  setOutputs("paymentPlan", paymentPlan);
  setOutputs("paymentAmount", paymentAmount);
  setOutputs("estimatedPayment", estimatedPayment);
  setOutputs("paymentSchedule", paymentSchedule);
  setOutputs("firstPaymentDateDisplay", formatDate(data.firstPaymentDate));
  setOutputs("lateFee", data.lateFee || kansasLateFeeTerms);
  setOutputs("securityInterest", data.securityInterest || "Not configured");
  setOutputs("prepaymentPolicy", data.prepaymentPolicy || "Not configured");
  setOutputs("paymentFrequencyDisplay", titleCaseFrequency(paymentFrequency));
  setOutputs("totalSalePrice", dollars.format(financing.totalPrice));
}

function loadSavedDraft() {
  const savedDraft = localStorage.getItem("ictHomeProsAgreementDraft");

  if (!savedDraft) {
    return;
  }

  const data = JSON.parse(savedDraft);
  Object.entries(data).forEach(([key, value]) => {
    const field = builderForm.elements.namedItem(key);

    if (field) {
      field.value = value;
    }
  });
}

function initializeLateFeeTerms() {
  const lateFeeField = builderForm.elements.namedItem("lateFee");
  const currentValue = String(lateFeeField.value || "").trim();

  if (!currentValue || currentValue === oldLateFeePlaceholder) {
    lateFeeField.value = kansasLateFeeTerms;
  }
}

function initializeDates() {
  const preparedField = builderForm.elements.namedItem("datePrepared");
  const firstPaymentField = builderForm.elements.namedItem("firstPaymentDate");
  const today = new Date();

  if (!preparedField.value) {
    preparedField.value = isoDate(today);
  }

  if (!firstPaymentField.value) {
    firstPaymentField.value = isoDate(addMonths(today, 1));
  }
}

loadSavedDraft();
initializeDates();
ensureAgreementNumber();
initializeLateFeeTerms();
updateAgreementPreview();
