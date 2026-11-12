async function generateRecipe () {
    const recipeOutput = document.getElementById("recipe");
    const generateButton = document.getElementById("generateBtn");
    const countries = state.selectedCountries;

    recipeOutput.textContent = "Generating recipe..";
    generateButton.disabled = true;

    const backendData = await apiPost(`${state.apiBaseUrl}/api/create-recipe`, countries);

    if (backendData === null) {
        recipeOutput.textContent = "Could not generate a recipe. Please try again.";
        generateButton.disabled = false;
        return;
    }

    recipeOutput.textContent = backendData.recipe;
    recipeOutput.style.whiteSpace = "pre-wrap";
    generateButton.disabled = false;



}