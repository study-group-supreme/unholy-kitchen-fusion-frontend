function navigate(page) {
    if (page === "SearchCountriesPage") renderSearchCountriesPage();
}

function router() {
    const page = location.hash.replace("#", "") || "SearchCountriesPage";
    navigate(page);
}

window.addEventListener("hashchange", router);
router();