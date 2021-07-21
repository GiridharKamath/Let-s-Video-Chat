const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

//added 5th july
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const right_msg_window = document.getElementById("right_msg_window");

myVideo.muted = true;

const user = prompt("Enter your name", "Anonymous");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});

const peers = {}

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });

    // socket.on("user-connected", (userId) => {
    //   connectToNewUser(userId, stream);
    // });
    socket.on('user-connected', userId => {
        // user is joining
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)
    })
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close()
})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();

    });

    // added 5th july
    videoGrid.append(video);
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 2) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
            document.getElementsByTagName("video")[index].style.height =
                100 / totalUsers + "%";
        }
    }
};

//added on 5th july

//mute unmute
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const setUnmuteButton = () => {
    const html = `<img src="images/mute.png" width="35px" height="35px">`;
    document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
    const html = `<img src="images/unmute.png" width="35px" height="35px">`;
    document.getElementById("muteButton").innerHTML = html;
};

//added on 5th july

//play pause
const playPause = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};
const setPlayVideo = () => {
    const html = `<img src="images/voff.png" width="35px" height="35px">`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
    const html = `<img src="images/von.png" width="35px" height="35px">`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

//

//
let text = document.querySelector("#chat_message");
let sendMsg = document.getElementById("sendMsg");
let messages = document.querySelector(".messages");

sendMsg.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

//
//
const inviteButton = document.querySelector("#inviteButton");

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});

//
//
socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
          <b><span> ${userName === user ? "me" : userName
        }</span> </b>
          <span>${message}</span>
      </div>`;
});

//added on 6th july
//
showChat.addEventListener("click", () => {
    document.querySelector(".right_side").style.display = "flex";
    document.querySelector(".right_side").style.flex = "1";
    document.querySelector(".left_side").style.display = "none";
    document.querySelector(".header__back").style.display = "block"; 
});

//
backBtn.addEventListener("click", () => {
    document.querySelector(".left_side").style.display = "flex";
    document.querySelector(".left_side").style.flex = "1";
    document.querySelector(".right_side").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
});