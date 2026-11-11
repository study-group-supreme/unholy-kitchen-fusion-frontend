const API_BASE = "http://localhost:8080";
const MAX_COUNTRIES = 2;

const shownCountries = new Set(); // selected by user, unique no duplicates

function renderSearchCountriesPage() {
    document.getElementById("app").innerHTML = `
        <h1>Søg efter to landenavne, så du kan lave en fusion</h1>
        <input type="text" id="countryInput" placeholder="Skriv et landenavn">
        <button type="button" id="searchBtn">Search</button>
        <button type="button" id="clearBtn">Ryd</button>
        <select id="countrySelect"></select>
        <button type="button" id="addBtn">Add country</button>
        <div id="message"></div>
        <div id="result"></div>
    `;

    document.getElementById("searchBtn").addEventListener("click", searchCountries);
    document.getElementById("clearBtn").addEventListener("click", clearResults);
    document.getElementById("addBtn").addEventListener("click", addSelectedCountry);

    fillDropdown([{code: "DK", name: "Denmark"}, {code: "SE", name: "Sweden"}]) // hardcoded
}

function clearResults() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("message").textContent = "";
    shownCountries.clear();
}

async function searchCountries() {
    const name = document.getElementById("countryInput").value.trim();
    const result = document.getElementById("result");
    const message = document.getElementById("message");

    message.textContent = "";

    if (name === "") {
        message.textContent = "Skriv et landenavn først.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/search?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            message.textContent = "Ingen lande fundet.";
            return;
        }

        const json = await response.json();
        const countries = json.data?.objects ?? [];

        if (countries.length === 0) {
            message.textContent = "Ingen lande fundet.";
            return;
        }

        let limitReached = false;

        for (const country of countries) {
            if (shownCountries.has(country.uuid)) continue; // dublet

            if (shownCountries.size >= MAX_COUNTRIES) {
                limitReached = true;
                break;
            }

            shownCountries.add(country.uuid);

            const p = document.createElement("p");
            const flag = country.flag?.emoji ?? "";
            const countryName = country.names?.common ?? "Ukendt";
            const capital = country.capitals?.[0]?.name ?? "ingen hovedstad";
            p.textContent = `${flag} ${countryName} - ${capital}`;
            result.appendChild(p);
        }

        if (limitReached) {
            message.textContent = `Der kan maks vises ${MAX_COUNTRIES} lande. Tryk Ryd for at starte forfra.`;
        }
    } catch (error) {
        console.error(error);
        message.textContent = "Noget gik galt, se Console for detaljer.";
    }
}

function fillDropdown(countries){
    const select = document.getElementById("countrySelect");
    select.innerHTML = ""; // empty it first
    for (const country of countries) {
        const option = document.createElement("option"); // 1. create the element
        option.value = country.code; // 2. what the code gets
        option.textContent = country.name; // 3. what the user reads
        select.appendChild(option); // 4. put it in the page
    }
}

function addSelectedCountry(){
    const select = document.getElementById("countrySelect");
    const code = select.value; // "DK"
    const name = select.selectedOptions[0].textContent; // "Denmark"
    console.log(code, name); // just prints to the log, we will want to add them to a list
}