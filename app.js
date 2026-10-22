
const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const FALLBACK_URL =
  "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

// Create currency dropdown options
for (let select of dropdowns) {
  for (let currCode in countryList) {
    let option = document.createElement("option");

    option.innerText = currCode;
    option.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      option.selected = true;
    } else if (select.name === "to" && currCode === "INR") {
      option.selected = true;
    }

    select.append(option);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

// Fetch exchange rates with fallback
async function getExchangeData(from, to) {
  const urls = [
    `${BASE_URL}/${from.toLowerCase()}.json`,
    `${FALLBACK_URL}/${from.toLowerCase()}.json`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const rate = data[from.toLowerCase()]?.[to.toLowerCase()];

      if (typeof rate === "number" && Number.isFinite(rate)) {
        return rate;
      }

      throw new Error("Exchange rate not found");
    } catch (error) {
      console.error("API request failed:", url, error);
    }
  }

  throw new Error("Both currency APIs failed");
}

// Convert currency
async function updateExchangeRate() {
  const amount = document.querySelector(".amount input");
  let amtVal = Number(amount.value);

  if (!amount.value.trim() || !Number.isFinite(amtVal) || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }

  const from = fromCurr.value;
  const to = toCurr.value;

  msg.innerText = "Getting exchange rate...";

  try {
    const rate = await getExchangeData(from, to);
    const finalAmount = amtVal * rate;

    msg.innerText =
      `${amtVal} ${from} = ${finalAmount.toFixed(2)} ${to}`;
  } catch (error) {
    console.error(error);
    msg.innerText =
      "Unable to get exchange rate. Please try again.";
  }
}

// Update country flag
const updateFlag = (element) => {
  const currCode = element.value;
  const countryCode = countryList[currCode];

  const img = element.parentElement.querySelector("img");

  if (countryCode && img) {
    img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
};

// Update when the button is clicked
btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// Load default exchange rate
window.addEventListener("load", () => {
  dropdowns.forEach(updateFlag);
  updateExchangeRate();
});
