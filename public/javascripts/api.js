export function createUser(username, password) {
    return fetch("/api/chat/newUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    });
}

export function loginUser(username, password) {
    return fetch("/api/chat/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json());
};

export function sendMessage(message, channelID) {
    if (checkLocalCommand(message)) {
        return;
    }


    return fetch("/api/chat/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: JSON.stringify({ message: message, channelID: channelID })
    }).then(res => res.json());
}

export function getMessages(channelID, page = 0) {
    return fetch(`/api/chat/get?page=${page}&channelID=${channelID}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        }
    }).then(res => res.json());
}

export async function createAndLoginDummyUser(username) {
    await createUser(username, "password1234");
    await loginUser(username, "password1234").then(result => {
        window.localStorage.setItem("jwt", result.jwt);
        window.localStorage.setItem("userID", result.id)
    });

}

export function validateJWT() {
    return fetch("/api/chat/validate", {
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
    });
}

export async function uploadImage(file, channelID) {


    const data = new FormData()
    data.append('file', file)
    data.append('channelID', channelID)

    return fetch("/api/chat/sendImage", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: data
    }).then(res => res.json());

}

export async function uploadFile(file, channelID) {

    const data = new FormData()
    data.append('file', file)
    data.append('channelID', channelID)

    return fetch("/api/chat/sendFile", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: data
    }).then(res => res.json());

}

export async function sendEndMeeting() {
    return fetch("/api/chat/endMeeting", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        method: "POST"
    }).then(res => res.json());
}

export async function joinRoom(channelID) {
    console.log(channelID)
    return fetch("/api/chat/joinRoom", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        },
        body: JSON.stringify({ channelID: channelID }),
    }).then(res => res.json());

}


function checkLocalCommand(message) {
    if (message.startsWith("/goto")) {
        if (message.split(" ")[1].length < 2) {
            window.location.href = "/chat.html?room=null"
            return true;
        }

        window.location.href = "/chat.html?room=" + message.split(" ")[1];
        return true;
    }
}


export async function getUserRooms() {
    return fetch("/api/chat/getUserRooms", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")

        }
    }).then(res => res.json())

}

export async function leaveRoom(channelID) {
    return fetch("/api/chat/leaveRoom", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ channelID: channelID })
    }).then(res => res.json());
}


export async function getOnlineUsers(channelID) {
    return fetch(`/api/chat/getOnlineUsers?channelID=${channelID}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("jwt")
        }
    }).then(res => res.json());
}