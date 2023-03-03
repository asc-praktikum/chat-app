const account = document.getElementById("info")
const data = document.getElementById("content")
const backbtn = document.getElementById("BacktoChat")

 
let username = ("")
let editbtn = ("Edit")

username = localStorage.getItem('username');
console.log(username)
let TexteKnoten = document.createElement("div");
TexteKnoten.innerText = username + "  " + editbtn;
TexteKnoten.classList.add("profileusername")

account.addEventListener("click", () => {
    console.log("Test");
    data.appendChild(TexteKnoten);
} )

backbtn.addEventListener("click", () => {
    window.location.href = "/chat.html"
})