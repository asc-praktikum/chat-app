window.onload = async () => {
// Generate random room name if needed
if (!location.hash) {
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
   }
   const roomHash = location.hash.substring(1);

   const configuration = {
    iceServers: [{
      urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
    }]
   };

}


function onSuccess() {};
function onError(error) {
  console.error(error);
};

