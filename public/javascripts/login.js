import { createAndLoginDummyUser, createUser, loginUser, validateJWT } from "./api.js";

window.onload = async () => {

    //check if session exists
    validateJWT().then(result => {
        if (result.ok) {
            window.location.href = "/chat.html";
        }
    });


    //avatar

    const nameInput = document.getElementById("nameinput");
    const passwordInput = document.getElementById("passinput");

    const usericon = document.getElementById("usericon");

    usericon.src = `https://api.dicebear.com/5.x/pixel-art/svg?seed=Test`;


    let debounceTimer = null;
    let lastSeed = "";
    let loading = false;

    nameInput.addEventListener("keydown", (event) => {

        if (!loading) {
            if (lastSeed != nameInput.value) {
                usericon.src = "/images/tail-spin.svg";
                loading = true;
            }
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (lastSeed == nameInput.value && !loading) return;
            lastSeed = nameInput.value;


            usericon.src = `https://api.dicebear.com/5.x/pixel-art/svg?seed=${nameInput.value}`;


            loading = false;
        }, 300)
    })

    //login button
    const loginButton = document.getElementById("loginbutton");
    loginButton.addEventListener("click", () => {
        loginUser(nameInput.value.toString().trim(), passwordInput.value.toString()).then((result) => {
            window.localStorage.setItem("jwt", result.jwt);
            window.localStorage.setItem("userID", result.id)
            window.localStorage.setItem("username", result.username)
            window.location.href = "/chat.html";
        });
    });

    //username inpu
    nameInput.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            loginUser(nameInput.value.toString().trim(), passwordInput.value.toString()).then((result) => {
                window.localStorage.setItem("jwt", result.jwt);
                window.localStorage.setItem("userID", result.id)
                window.localStorage.setItem("username", result.username)
                window.location.href = "/chat.html";
            });
        }
    });
    passwordInput.addEventListener("keydown", (event) => {
        if (event.key == "Enter"){
            loginUser(nameInput.value.toString().trim(), passwordInput.value.toString()).then((result) => {
                window.localStorage.setItem("jwt", result.jwt);
                window.localStorage.setItem("userID", result.id)
                window.localStorage.setItem("username", result.username)
                window.location.href = "/chat.html";
            });
        } 
     });
}