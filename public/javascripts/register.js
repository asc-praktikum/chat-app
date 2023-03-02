import { createAndLoginDummyUser, createUser, loginUser, validateJWT } from "./api.js";


window.onload = ()=>{
    const nameInput = document.getElementById("nameinput");
    const passwordInput = document.getElementById("passinput");
    const passwordRepeatInput = document.getElementById("passrepeat");

    const usericon = document.getElementById("usericon");

    usericon.src = `https://api.dicebear.com/5.x/pixel-art/svg?seed=Test`;


    let debounceTimer = null;
    let lastSeed = "";
    let loading = false;

    nameInput.addEventListener("keydown", (event)=>{

        if(!loading) {
            if(lastSeed!=nameInput.value) {
                usericon.src = "/images/tail-spin.svg";
                loading = true;
            }
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(()=>{
            if(lastSeed==nameInput.value&&!loading) return;
            lastSeed = nameInput.value;

            
                usericon.src = `https://api.dicebear.com/5.x/pixel-art/svg?seed=${nameInput.value}`;

        
            loading = false;
        },300)
    })

    //register button
    const loginButton = document.getElementById("loginbutton");
    loginButton.addEventListener("click", ()=>{
        if(passwordInput.value!=passwordRepeatInput.value) {
            return;
        }

        try {
            createUser(nameInput.value.toString().trim(),passwordInput.value.toString()).then((result)=>{
                window.location.href = "/index.html";
            });
        }catch(e) {
            console.log(e);
        }
    });

    passwordRepeatInput.addEventListener("keydown", (event)=>{
        if(passwordInput.value==passwordRepeatInput.value && event.key == "Enter") {
            try {
                createUser(nameInput.value.toString().trim(),passwordInput.value.toString()).then((result)=>{
                    window.location.href = "/index.html";
                });
            }catch(e) {
                console.log(e);
            }
        }
       
    });
    passwordInput.addEventListener("keydown", (event)=>{
        if(passwordInput.value==passwordRepeatInput.value && event.key == "Enter") {
            try {
                createUser(nameInput.value.toString().trim(),passwordInput.value.toString()).then((result)=>{
                    window.location.href = "/index.html";
                });
            }catch(e) {
                console.log(e);
            }
        }
       
    });
    nameInput.addEventListener("keydown", (event)=>{
        if(passwordInput.value==passwordRepeatInput.value && event.key == "Enter") {
            try {
                createUser(nameInput.value.toString().trim(),passwordInput.value.toString()).then((result)=>{
                    window.location.href = "/index.html";
                });
            }catch(e) {
                console.log(e);
            }
        }
       
    });

}