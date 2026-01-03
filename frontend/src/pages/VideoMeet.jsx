import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from 'react-router-dom';
import server from '../environment';




const server_url = server;     //TODO

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }            /* STUN server */
  ]
}


export default function VideoMeetComponent() {
  
var socketRef = useRef();
let socketIdRef = useRef();      //id of socket connection

let localVideoRef = useRef();    //our video

let [videoAvailable, setVideoAvailable] = useState(true);   //specifies the hardware wise access

let [audioAvailable, setAudioAvailable] = useState(true);

let [video, setVideo] = useState([]);

let [audio, setAudio] = useState();

let [screen, setScreen] = useState();

let [showModal, setModal] = useState(true);

let [screenAvailable, setScreenAvailable] = useState(false);

let [messages, setMessages] = useState([]);

let [message, setMessage] = useState("");

let [newMessages, setNewMessages] = useState(0);

let [askForUsername, setAskForUsername] = useState(true);

let [username, setUsername] = useState("");

const videoRef = useRef([]);

let [videos, setVideos] = useState([]);


//TO DO
// if(Chrome === false){


// }

const getPermissions = async () => {
  try {
    const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

    if(videoPermission) {
    setVideoAvailable(true);

     } else {
    setVideoAvailable(false);
     }

    const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

    if(audioPermission) {
    setAudioAvailable(true);

     } else {
    setAudioAvailable(false);
     }     

   if(videoAvailable || audioAvailable) {
    const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable})

    if(localVideoRef.current) {
    localVideoRef.current.srcObject = userMediaStream;
     }
    }  
     
  } catch(err) {
    console.log(err);
  }
};



useEffect(() => {   
    getPermissions();

    if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
    }

}, []);



let getUserMediaSucess = (stream) =>{
try {

    window.localStream.getTracks().forEach(track => track.stop())

} catch (e) { console.log(e) }


window.localStream = stream;
localVideoRef.current.srcObject = stream;


for (let id in connections) {
    if (id === socketIdRef.current) continue;

    connections[id].addStream(window.localStream)

    connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
        .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
        })
        .catch(e => console.log(e))
    })
}


stream.getTracks().forEach(track => track.onended = () => {
    setVideo(false)
    setAudio(false);

    try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    } catch (e) { console.log(e) }

    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
    window.localStream = blackSilence();
    localVideoRef.current.srcObject = window.localStream;

    for (let id in connections) {
    connections[id].addStream(window.localStream)
    connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
        .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
        }).catch(e => console.log(e));
    })
}

})

}


let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}


let black = ({width = 640, height = 480} = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {width, height});

    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0],{enabled: false})
}



let getUserMedia = () => {
    if((video && videoAvailable) || (audio && audioAvailable)) {
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then((getUserMediaSucess)) // TODO: getUserMediaSucess
        .then((stream) => {})
        .catch((e) => console.log(e))
    } else{
      try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
          } catch (e) { }
    }
}

useEffect(() => {
    if (video !== undefined && audio !== undefined) {
        getUserMedia();
    }
}, [audio, video])




let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketRef.current.id) {
        if (signal.sdp) {
            connections[fromId]
                .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                        connections[fromId].setLocalDescription(description).then(() => {    
                            socketRef.current.emit("signal",fromId,JSON.stringify({sdp: connections[fromId].localDescription}))                               
                        }).catch(e => console.log(e))              
                      }).catch(e => console.log(e))                      
                     }                       
                   }).catch(e => console.log(e))                        
        }   
        if (signal.ice) {
                          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                   }
                           
      }                                    
    }                                  
                                    
                            
                    
                
 


//TODO addMessage
let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
        setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
};


let connectToSocketServer = () => {

socketRef.current = io.connect(server_url, { secure: false })

socketRef.current.on('signal', gotMessageFromServer);

socketRef.current.on("connect", () => {

    socketRef.current.emit("join-call", window.location.href)

    socketIdRef.current = socketRef.current.id

    socketRef.current.on("chat-message", addMessage)

    socketRef.current.on("user-left",(id)=>{                  //User leaves the call
    setVideos(videos=>videos.filter(video=>video.socketId !== id))
    })

    socketRef.current.on("user-joined", (id, clients) => {     //When a user joins the call
    clients.forEach((socketListId) => {                        //Create Peer Connections for each user

    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
    
    connections[socketListId].onicecandidate = (event) => {       //ICE Candidate Handling
       if (event.candidate != null) {
       socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
          }
        }

   //Receiving remote video stream
  connections[socketListId].onaddstream = (event) => {

  let videoExists = videoRef.current.find(video => video.socketId === socketListId); //Check if video already exists

  if (videoExists) {                //If exists → update stream
    setVideos(videos => {
      const updatedVideos = videos.map(video =>
        video.socketId === socketListId ? { ...video, stream: event.stream } : video
      );
      videoRef.current = updatedVideos;
      return updatedVideos;
    })
  } else {                         //Else → add new video
          let newVideo = {
          socketId: socketListId,
          stream: event.stream,
          autoPlay: true,
          playsInline: true
          }

          setVideos(videos => {
          const updatedVideos = [...videos, newVideo];
          videoRef.current = updatedVideos;
          return updatedVideos;
          })

         }   
      


          
      }
      
      if (window.localStream !== undefined && window.localStream !== null) {         //Add your local stream to peer
           connections[socketListId].addStream(window.localStream);
         } else {
  // TODO BLACKSILENCE
  // let blackSilence
  let blackSilence = (...args) => new MediaStream([black(...args), silence()])
  window.localStream = blackSilence();
  connections[socketListId].addStream(window.localStream);

         }


    })

    //Create offer (only for the joining user)
    if(id === socketIdRef.current){
       for (let id2 in connections) {
       if (id2 === socketIdRef.current) continue

  try {
    connections[id2].addStream(window.localStream)
  } catch (e) { }

    connections[id2].createOffer().then((description) => {
      connections[id2].setLocalDescription(description)
    .then(() => {
        socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))   // sdp -> session description
      })
      .catch(e => console.log(e))
  })
}
     
    }

  })



})


}


let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
}



let routeTo = useNavigate();

let connect = () => {
    setMessages([]); // <--- This ensures the chat is empty when you start
    setNewMessages(0); // <--- This resets the badge count
    setAskForUsername(false);
    getMedia();
}

let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
}
let handleAudio = () => {
    setAudio(!audio)
    // getUserMedia();
}



    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })

    stream.getTracks().forEach(track => track.onended = () => {
    setScreen(false);

    try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    } catch (e) { console.log(e) }

    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
    window.localStream = blackSilence();
    localVideoRef.current.srcObject = window.localStream;

    getUserMedia();
    })
  }
}

let getDislayMedia = () => {
    if (screen) {
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDislayMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        }
    }
}

useEffect(() => {
    if (screen !== undefined) {
        getDislayMedia();
    }
}, [screen])

let handleScreen = () => {
    setScreen(!screen);
}



let handleEndCall = () => {
   try {
       if (localVideoRef.current && localVideoRef.current.srcObject) {
             let tracks = localVideoRef.current.srcObject.getTracks();
             tracks.forEach(track => track.stop());
           }
     } catch (e) { }

     window.location.href = "/";



};

    

let sendMessage = () => {
  socketRef.current.emit("chat-message", message, username);
  setMessage("");
}


  return (
    <div>
{askForUsername === true ? (
    <div className={styles.lobbyContainer}>
        <div className={styles.lobbyCard}>
            <div className={styles.lobbyVideoPreview}>
                <video ref={localVideoRef} autoPlay muted></video>
                <div className={styles.videoOverlay}>
                    <p>{ "Your Preview"}</p>
                </div>
            </div>

            <div className={styles.lobbyActionArea}>
                <h2>Join Meeting</h2>
                <TextField 
                    fullWidth
                    id="outlined-basic" 
                    label="Display Name" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    variant="outlined" 
                    className={styles.inputField}
                />
                <Button 
                    fullWidth
                    variant="contained" 
                    onClick={connect}
                    className={styles.joinButton}
                    disabled={!username.trim()}
                >
                    Proceed
                </Button>
            </div>
        </div>
    </div>
 ) : 
          
          <div className={styles.meetVideoContainer}>

            {showModal ? <div className={styles.chatRoom}>

            <div className={styles.chatContainer}>
                          <h1>Chat</h1>
                            
                          <div className={styles.chattingDisplay}>
                            
                                  {messages.length !== 0 ? messages.map((item, index) => {

                                    console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}   
                          </div>

                          <div className={styles.chattingArea}>
                          <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Message" variant="outlined" />
                          <Button variant='contained' onClick={sendMessage}>Send</Button>
                          </div>

            </div>

           </div> : <></>}
           


          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style= {{color:"white"}}>
              {(video===true) ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{color: "red"}}>
                <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{color: "white"}}>
                {audio === true ? <MicIcon /> : <MicOffIcon/>}
            </IconButton>
            {screenAvailable === true ?
            <IconButton onClick={handleScreen} style={{color: "white"}}>
                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon/>}
            </IconButton> : <></>}

            <Badge badgeContent={newMessages} onClick={() => setModal(!showModal)} max={999} color='secondary'>
            <IconButton style={{color: "white"}}>
                <ChatIcon />
            </IconButton>
            </Badge>
                
          </div>

           



          <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

<div className={styles.conferenceView}>
    {videos.map((video) => (
        <div key={video.socketId} >
            <video
                data-socket={video.socketId}
                autoPlay
                playsInline
                ref={(node) => {
                    if (node && video.stream) {
                        node.srcObject = video.stream;
                    }
                }}
            />
        </div>
    ))}
</div>


           </div>
          

        }
    </div>
  )
}



