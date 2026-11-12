const MAX_COUNTRIES = 2;

const shownCountries = new Set(); // used by the SEARCH display, used in searchCountries

/**
 * document.getElementById("app").innerHTML finds the "app"-div in index.html
 *
 */
function renderSearchCountriesPage() {
    document.getElementById("page").innerHTML = `
        <h1>Select two country names to make a fusion</h1>
        <input type="text" id="countryInput" placeholder="Write the name of a country">
        <button type="button" id="searchBtn">Search</button>
        <button type="button" id="clearBtn">Clear</button>
        <select id="countrySelect"></select>
        <button type="button" id="addBtn">Add country</button>
        <button type="button" id="clearSelectionBtn">Clear selection</button>
        <ul id="selectedList"></ul>
        <div id="message"></div>
        <div id="result"></div>
        <button type="button" id="generateBtn">Generate recipe</button>
        <div id="recipe"></div>
    `;

    // event listeners, "when button clicked, call this function"
    document.getElementById("searchBtn").addEventListener("click", searchCountries);
    document.getElementById("clearBtn").addEventListener("click", clearResults);
    document.getElementById("addBtn").addEventListener("click", addSelectedCountry);
    document.getElementById("clearSelectionBtn").addEventListener("click", clearSelection);
    document.getElementById("generateBtn").addEventListener("click", generateRecipe);

    // calls fillDropdown with an array of a couple names
    loadCountries(); // hardcoded
}

/**
 * Used with the SEARCH
 * Empties the result area and message text
 */
function clearResults() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("message").textContent = "";
    shownCountries.clear();
}

/**
 * async means this function can use await and always returns a Promise.
 * A Promise is "a value that will arrive later".
 * fetch is slow (it goes over the network),
 * so the function waits at each await WITHOUT freezing the page.
 * @returns {Promise<void>}
 */
async function searchCountries() {
    const name = document.getElementById("countryInput").value.trim();
    const message = document.getElementById("message");

    message.textContent = "";

    if (name === "") {
        message.textContent = "Write the name of a country first";
        return;
    }

    try {
        const response = await fetch(`${state.apiBaseUrl}/api/search?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            message.textContent = "No countries found.";
            return;
        }

        const countries = await response.json(); // [{names:{common}, flag:{url_png}, subregion}]

        if (countries.length === 0) {
            message.textContent = "No countries found.";
            return;
        }

        addCountry(countries[0].names?.common);
    } catch (error) {
        console.error(error);
        message.textContent = "Something went wrong. Check console for info";
    }
}

/**
 * takes an array of {name}
 * Empties the select,
 * and for each country create an <option>,
 * set [value] and [textContent], and append it.
 * @param countries
 */
function fillDropdown(countries){
    const select = document.getElementById("countrySelect");
    select.innerHTML = ""; // empty it first
    for (const country of countries) {
        const option = document.createElement("option"); // 1. create the element
        option.value = country.name; // (the hidden value the code reads)
        option.textContent = country.name; // the name the user sees
        select.appendChild(option); // put it in the page dropdown
    }
}

function addCountry(name){
    if (!name) return; // it means: if the dropdown is empty, has no name, the backend is down and something is wrong
    if (state.selectedCountries.length >= MAX_COUNTRIES) {
        document.getElementById("message").textContent =
            `Max ${MAX_COUNTRIES} countries. Press clear selection to try again`;
        return;
    }
    if (state.selectedCountries.some(c => c.name === name)){
        document.getElementById("message").textContent =
            "Country already added";
        return;
    }
    state.selectedCountries.push({name});
    renderSelectedCountries();
}

/**
 * For keeping a list of countries from the dropdown choices
 */
function addSelectedCountry() {
    const select = document.getElementById("countrySelect"); // connects to [<select id="countrySelect"></select>] in renderSearchCountriesPage()
    const name = select.value;
    if (state.selectedCountries.length >= MAX_COUNTRIES) return;
    state.selectedCountries.push({name});
    renderSelectedCountries();
}

/**
 * Empties the user's chosen countries and updates the page. (the dropdown choices)
 * Changes the state first, and then redraws the screen from the state.
 */
function clearSelection() {
    state.selectedCountries.length = 0; // empties the SA;E in memory array object
    renderSelectedCountries(); // loops over am empty array so the list becomes empty
}

/**
 * The page will show the array in state.selectedCountries
 * (This is what has been selected from the dropdown)
 */
function renderSelectedCountries(){
    const list = document.getElementById("selectedList"); // the <ul> from the template
    list.innerHTML = ""; // empty the list, so old items arent displayed
    for (const country of state.selectedCountries) {
        const li = document.createElement("li"); // create a <li> list item in memory
        li.textContent = country.name;
        list.appendChild(li);
    }
}

async function loadCountries() {
    try {
        const response = await fetch(`${state.apiBaseUrl}/api/all`);
        if (!response.ok) {
            document.getElementById("message").textContent = "Could not load countries.";
            return;
        }

        const json = await response.json(); // array af {names, flag, subregion}

        const countries = json
            .map(c => ({
                name: c.names?.common
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        fillDropdown(countries);
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent = "Something went wrong, check console for info";
    }
}