import { createAndLoginDummyUser, createUser, validateJWT, getMessages, sendMessage } from "./api.js";


window.onload = async () => {
    console.log("loaded");

    const result = await validateJWT();
    if (!result.ok) {
        window.location.href = "/";
    }


    const logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", () => {
        window.localStorage.removeItem("jwt");
        window.location.href = "/";
    });

    const messagecontainer = document.getElementById("messagecontainer");

    let loadMore = false;
    let page = 0;

    messagecontainer.addEventListener("scroll", () => {
        //scroll percentage
        const scrollPercentage = messagecontainer.scrollTop / (messagecontainer.scrollHeight - messagecontainer.clientHeight);
        if ((-scrollPercentage) > 0.8) {

            if (!loadMore) {
                loadMore = true;
                page++;
                getMessages(page).then(messages => {
                    messages.forEach(element => {
                        appendMessage(messagecontainer, element, true);
                    });
                    loadMore = false;
                });
            }

            console.log("load more");
        }
    })

    //get messages
    const messages = await getMessages();
    messages.forEach(element => {
        appendMessage(messagecontainer, element, true);
    });

    console.log(messages);


    var socket = io();
    socket.on('message', function (msg) {
        appendMessage(messagecontainer, msg);
        //console.log(msg);
    });

    const messageBox = document.getElementById("chatinput");
    const sendButton = document.getElementById("sendbutton");


    sendButton.addEventListener("click", () => {
        if (messageBox.value.toString().trim().length > 0) {
            sendMessage(messageBox.value.toString());
            messageBox.value = "";
        }
    });

    messageBox.addEventListener("keydown", (event) => {
        if (event.key == "Enter" && event.shiftKey) {
            event.preventDefault()
            if (messageBox.value.toString().trim().length > 0) {
                sendMessage(messageBox.value.toString());
                messageBox.value = "";
            }
        }
    });

}

function appendMessage(messagecontainer, messageOBJ, top = false) {

    const message = document.createElement("div");
    const messageText = document.createElement("p");
    message.classList.add("imessage");
    messageText.classList.add("from-them");
    messageText.innerHTML = urlify(DOMPurify.sanitize(messageOBJ.message));
    message.appendChild(messageText);

    if (!top) { //swap because of reversed flexbox
        messagecontainer.prepend(message);
    } else {
        messagecontainer.append(message);

    }

    console.log(messageOBJ);
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    })

}