const MAX_COUNTRIES = 2;

const shownCountries = new Set(); // used by the SEARCH display, used in searchCountries

/**
 * document.getElementById("app").innerHTML finds the "app"-div in index.html
 *
 */
function renderSearchCountriesPage() {
    document.getElementById("page").innerHTML = `
        <h1>Søg efter to landenavne, så du kan lave en fusion</h1>
        <input type="text" id="countryInput" placeholder="Skriv et landenavn">
        <button type="button" id="searchBtn">Search</button>
        <button type="button" id="clearBtn">Ryd</button>
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
    const name = document.getElementById("countryInput").value.trim(); // read what the user typed in [<input type="text" id="countryInput"]  .value.trim removed whitespace, put it into a const
    const result = document.getElementById("result"); // <div id="message"></div> into a const
    const message = document.getElementById("message"); // <div id="result"></div> into a const

    message.textContent = ""; // will clear any old message

    if (name === "") { // if the input is empty, show a hint and return, === is strictly equality (also compares type); so not quite the same as ==
        message.textContent = "Skriv et landenavn først.";
        return; // ends the function so no request is sent.
    }

    // the request:
    try {
        // we send a GET to Spring
        // [encodeURIComponent] makes the text safe in a URL: space becomes %20, å becomes %C3%A5, & can't break the query
        // [await] pauses here until the response HEADERS arrive.
        // this all results in a [Response] object
        const response = await fetch(`${state.apiBaseUrl}/api/search?name=${encodeURIComponent(name)}`);

        // response.ok is true for status 200-299
        if (!response.ok) {
            message.textContent = "Ingen lande fundet.";
            return;
        }

        const json = await response.json(); // Reads the body of the [Response] and parses the JSON text into a JavaScript object.
        const countries = json.data?.objects ?? []; // Digs into [{ "data": { "objects": [...] } }. ?.], means "if data is missing, stop and give undefined instead of crashing". The double ?? means "if the left side is null/undefined, use the right side", here an empty array. So countries is always an array.

        // a successful answer with zero hits
        if (countries.length === 0) {
            message.textContent = "Ingen lande fundet.";
            return;
        }

        let limitReached = false; // a flag to remember if we skipped some ?

        // a loop over each country object
        for (const country of countries) {
            if (shownCountries.has(country.uuid)) continue; // Already in [shownCountries]? continue skips to the next country.

            // Already 2 in [shownCountries]? break to leave the loop
            if (shownCountries.size >= MAX_COUNTRIES) {
                limitReached = true; // this is for the error message that can be shown after this loop
                break;
            }

            shownCountries.add(country.uuid); // remember this uuid in [shownCountries]

            const p = document.createElement("p"); // create a <p> element in memory.
            const flag = country.flag?.emoji ?? ""; // try reading the [country.flag?.emoji] element from the nested object, "" as the fallback
            const countryName = country.names?.common ?? "Ukendt"; // try reading [country.names?.common] or "Ukent" as fallback
            const capital = country.capitals?.[0]?.name ?? "ingen hovedstad"; // try reading [country.capitals?.[0]?.name] or "ingen hovedstad" as fallback"
            p.textContent = `${flag} ${countryName} - ${capital}`; // fill the <p> with text content.
            result.appendChild(p); // puts the <p> element in the page. Now it will be visible.
        }

        if (limitReached) {
            message.textContent = `Der kan maks vises ${MAX_COUNTRIES} lande. Tryk Ryd for at starte forfra.`;
        }
    } catch (error) { // catch runs if anything inside [try] THROWS: bug in the code, invalid JSON, CORS blocked, backend not running
        console.error(error); // writes to the browser console
        message.textContent = "Noget gik galt, se Console for detaljer.";
    }
}

/**
 * takes an array of {code, name}
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
        option.value = country.code; // (the hidden value the code reads) "DK"
        option.textContent = country.name; // the name the user sees
        select.appendChild(option); // put it in the page dropdown
    }
}

/**
 * For keeping a list of countries from the dropdown choices
 */
function addSelectedCountry() {
    const select = document.getElementById("countrySelect"); // connects to [<select id="countrySelect"></select>] in renderSearchCountriesPage()
    const code = select.value; // (the hidden value the code reads) "DK"
    const name = select.selectedOptions[0].textContent; // "Denmark"
    // add to state.selectedCountries
    // not duplicate/already added check???
    if (state.selectedCountries.length >= MAX_COUNTRIES) return;
    state.selectedCountries.push({code, name}); // adds to our frontend list of contries
    renderSelectedCountries();
}

/**
 * Empties the user's chosen countries and updates the page. (the dropdown choices)
 * Changes the state first, and then redraws the screem from the state.
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
                code: c.names?.common,
                name: c.names?.common
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        fillDropdown(countries);
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent = "Something went wrong, check console for info";
    }
}