export function createUser(username, password) {
    return fetch("/api/chat/newUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json());
}

export function loginUser(username, password) {
    return fetch("/api/chat/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json());
};

export function sendMessage(message) {
    return fetch("/api/chat/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: JSON.stringify({ message: message })
    }).then(res => res.json());
}

export function getMessages(page = 0) {
    return fetch(`/api/chat/get?page=${page}`, {
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        }
    }).then(res => res.json());
}

export async function createAndLoginDummyUser(username) {
    await createUser(username, "password1234");
    await loginUser(username, "password1234").then(result => {
        window.localStorage.setItem("jwt", result.jwt);
    });

}

export function validateJWT() {
    return fetch("/api/chat/validate", {
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
    });
}