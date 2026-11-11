async function apiGet(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(
                errorBody.message || `HTTP ${response.status}`
            );
        }

        return response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

async function apiPost(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Post error:", error);
        return null;
    }
}

async function apiPut(url, body) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.message || `HTTP ${response.status}`)
        }
        return await response.json();
    } catch (error) {
        console.error("Put error:", error);
        throw error;
    }
}

async function apiDelete(url) {
    try {
        const response = await fetch(url, {method: "DELETE"});

        const text = await response.text();

        if (!response.ok) {
            const json = JSON.parse(text);
            return {error: json.error};
        }

        return null;

    } catch (error) {
        return {error: error.message};
    }
}