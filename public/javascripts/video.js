import { sendEndMeeting } from "./api.js";

window.onload = async () => {


    const domain = 'meet.jit.si';
    const options = {
        roomName: 'ChatAPP',
        userInfo: {
            displayName: window.localStorage.getItem("username")
        },
        parentNode: document.querySelector('#meet'),
        lang: 'de',

    

        configOverwrite: {
            
            customToolbarButtons: [{
                icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMy4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIzIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTIzLjYgMzkxLjNjMTIuOS05LjQgMjkuNi0xMS44IDQ0LjYtNi40YzI2LjUgOS42IDU2LjIgMTUuMSA4Ny44IDE1LjFjMTI0LjcgMCAyMDgtODAuNSAyMDgtMTYwcy04My4zLTE2MC0yMDgtMTYwUzQ4IDE2MC41IDQ4IDI0MGMwIDMyIDEyLjQgNjIuOCAzNS43IDg5LjJjOC42IDkuNyAxMi44IDIyLjUgMTEuOCAzNS41Yy0xLjQgMTguMS01LjcgMzQuNy0xMS4zIDQ5LjRjMTctNy45IDMxLjEtMTYuNyAzOS40LTIyLjd6TTIxLjIgNDMxLjljMS44LTIuNyAzLjUtNS40IDUuMS04LjFjMTAtMTYuNiAxOS41LTM4LjQgMjEuNC02Mi45QzE3LjcgMzI2LjggMCAyODUuMSAwIDI0MEMwIDEyNS4xIDExNC42IDMyIDI1NiAzMnMyNTYgOTMuMSAyNTYgMjA4cy0xMTQuNiAyMDgtMjU2IDIwOGMtMzcuMSAwLTcyLjMtNi40LTEwNC4xLTE3LjljLTExLjkgOC43LTMxLjMgMjAuNi01NC4zIDMwLjZjLTE1LjEgNi42LTMyLjMgMTIuNi01MC4xIDE2LjFjLS44IC4yLTEuNiAuMy0yLjQgLjVjLTQuNCAuOC04LjcgMS41LTEzLjIgMS45Yy0uMiAwLS41IC4xLS43IC4xYy01LjEgLjUtMTAuMiAuOC0xNS4zIC44Yy02LjUgMC0xMi4zLTMuOS0xNC44LTkuOWMtMi41LTYtMS4xLTEyLjggMy40LTE3LjRjNC4xLTQuMiA3LjgtOC43IDExLjMtMTMuNWMxLjctMi4zIDMuMy00LjYgNC44LTYuOWMuMS0uMiAuMi0uMyAuMy0uNXoiLz48L3N2Zz4=",
                id: "custom-button-santo",
                text: "SatoConnect",
            }],

            apiLogLevels: ['warn', 'error'],
            prejoinPageEnabled: false,
            disableReactions: true,
            disableReactionsModeration: false,
            disablePolls: true,
            enableNoAudioDetection: false,
            enableNoisyMicDetection: false,
            speakerStats: {
                disabled: true
            },
            
            defaultRemoteDisplayName: 'User',
            hideEmailInSettings: true,
            readOnlyName: true,
            toolbarButtons: [
                'camera',
                   'chat',
                //    'closedcaptions',
                  'desktop',
                //    'download',
                //    'embedmeeting',
                //    'etherpad',
                //    'feedback',
                //    'filmstrip',
                //    'fullscreen',
                   'hangup',
                //    'help',
                //    'highlight',
                //    'invite',
                //    'linktosalesforce',
                    'livestreaming',
                 'microphone',
                //    'noisesuppression',
                    'participants-pane',
                //    'profile',
                //    'raisehand',
                //    'recording',
                    //'security',
                //    'select-background',
                //    'settings',
                //    'shareaudio',
                    'sharedvideo',
                //    'shortcuts',
                //    'stats',
                    'tileview',
                //   'toggle-camera',
                   // 'custom-button-santo'
                //    'videoquality',
                    'whiteboard',
                ],

                hideConferenceSubject: true,

                participantsPane: {
                    hideModeratorSettingsTab: true,
                    hideMoreActionsButton: true,
                    hideMuteAllButton: true
                }

               
                
        },

        interfaceConfigOverwrite: {
            TOOLBAR_ALWAYS_VISIBLE: true,
        },

    
        
        
    };

    const api = new JitsiMeetExternalAPI(domain, options);

    let localUserID;

    api.addEventListener("videoConferenceLeft", async () => {
       await sendEndMeeting();
        window.location.href = "/chat.html";
    });

    


    var socket = io();
    socket.on('message', function (msg) {
        api.executeCommand('showNotification', {
            title: `${msg.user.name}`, // Title of the notification.
            description: msg.message, // Content of the notification.
            uid: "Test", // Optional. Unique identifier for the notification.
            type: "normal", // Optional. Can be 'info', 'normal', 'success', 'warning' or 'error'. Defaults to 'normal'.
            timeout: "long" // optional. Can be 'short', 'medium', 'long', or 'sticky'. Defaults to 'short'.
          });
        //console.log(msg);
    });

    socket.on("endMeeting", () => {
        window.location.href = "/chat.html";
    });

}

