import { createAndLoginDummyUser, createUser, validateJWT } from "./api.js";

window.onload = async () => {

    //check if session exists
    validateJWT().then(result => {
        if(result.ok) {
            window.location.href = "/chat.html";
        }
    });
    
 
    //avatar

    const nameInput = document.getElementById("nameinput");
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

    //login button
    const loginButton = document.getElementById("loginbutton");
    loginButton.addEventListener("click", ()=>{
        createAndLoginDummyUser(nameInput.value.toString().trim()).then(()=>{
            window.location.href = "/chat.html";
        });
    });
    
    //username inpu
    nameInput.addEventListener("keydown", (event) =>{
        if(event.key == "Enter") {
            createAndLoginDummyUser(nameInput.value.toString().trim()).then(()=>{
                window.location.href = "/chat.html";
            }); 
        }
       
    });


}