window.onload = () => {
 
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

            if(nameInput.value.toString().toLowerCase()==atob("dG9iaQ==")) {
                usericon.src = `/images/tobi.png`;
            }else{
                usericon.src = `https://api.dicebear.com/5.x/pixel-art/svg?seed=${nameInput.value}`;

            }
            loading = false;
        },300)
    })

    

    
}