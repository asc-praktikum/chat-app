const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { PrismaClient } = require('@prisma/client')
const jose = require('jose')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const streamifier = require('streamifier')
const { Configuration, OpenAIApi } =  require("openai");
const { v4: uuidv4 } = require('uuid');


const prisma = new PrismaClient()


const indexRouter = require('./routes/index');
const chatRouter = require('./routes/chat');

const fileUpload =  require("express-fileupload");
const azureStorage =  require("azure-storage");

const blobService = azureStorage.createBlobService(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);

global.blobService = blobService;

const app = express();


app.use(fileUpload({
    createParentPath: true,
    limits: {fileSize: 1024*1024*50}
}));




const http = require('http').Server(app);
const io = require('socket.io')(http);


io.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(80, function () {
    console.log('listening on *:80');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

app.post("/api/chat/newUser", async (req, res) => {
    const { username, password } = req.body;

    if (username == null || username.length < 3 || username.length > 30) {
        res.status(400).json({ error: "Invalid username" });
        return;
    }

    if (password == null || password.length < 8 || password.length > 1000) {
        res.status(400).json({ error: "Invalid password" });
        return;
    }

    //hash password
    let salt = await bcrypt
        .genSalt(10);
    let hash = await bcrypt.hash(password, salt);


    // check if username already exists
    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    })

    if (user != null) {
        res.status(400).json({ error: "Username already exists" });
        return;
    }


    const newUser = await prisma.user.create({
        data: {
            name: username,
            password: hash,
            salt: salt
        }
    })

    console.log("Created user with username" + newUser.name);

    res.json(newUser);

});

function checkMessage(message) {
    if(message.toString().trim().toLowerCase().includes("never gonna give you up")) {
        return false;
    }

    return true;
}


app.post("/api/chat/login", async (req, res) => {

    const { username, password } = req.body;

    if (username == null || username.length < 1 || username.length > 1000) {
        res.status(400).json({ error: "Invalid username" });
        return;
    }

    if (password == null || password.length < 1 || password.length > 1000) {
        res.status(400).json({ error: "Invalid password" });
        return;
    }

    //check if user with username exists
    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    })

    if (user == null) {
        res.status(400).json({ error: "Invalid user" });
        return;
    }

    //check if password is correct
    let hash = await bcrypt.hash(password, user.salt);

    if (hash != user.password) {
        res.status(400).json({ error: "Invalid password" });
        return;
    }

    //generate session token

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256'

    const jwt = await new jose.SignJWT({ id: user.id, username: user.name })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('chat-app')
        .setAudience('chat-user')
        .setExpirationTime('2h')
        .sign(secret)

    console.log(jwt)


    res.json({
        jwt: jwt,
        id: user.id,
        username: user.name
    });

});

async function validateJWT(jwt) {
    try {

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const alg = 'HS256'

        const verifiedJWT = await jose.jwtVerify(jwt, secret, {
            issuer: 'chat-app',
            audience: 'chat-user',
            algorithms: [alg]
        })

        return verifiedJWT.payload;
    } catch (e) {
        return null;
    }




}

app.get("/api/chat/validate", async (req, res) => {

    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];

    const user = await validateJWT(jwt);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    res.json(user);


});

async function sendAIMessage(message, channelID) {

    console.log(message)

    const newMessage = await prisma.chat.create({
        data: {
            message: message,
            type: "text",
            channelID: channelID
        }
    })


    newMessage.user = {};
    newMessage.user.name = "AI";
    newMessage.user.id = "AI";
    newMessage.userId = undefined;

    io.emit("message."+channelID, newMessage);

}

async function sendIframeMessage(url,channelID) {

    const newMessage = await prisma.chat.create({
        data: {
            message: "",
            type: "iframe",
            channelID: channelID,
            ressource: url
        }
    })


    newMessage.user = {};
    newMessage.user.name = "AI";
    newMessage.user.id = "AI";
    newMessage.userId = undefined;

    io.emit("message."+channelID, newMessage);
}

async function parseCommand(message, messageOBJ,channelID) {

  

    if(message.toString().startsWith("/ai")) {
        const promt = message.toString().split("/ai")[1].trim();

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(promt),
            temperature: 0.7,
            max_tokens: 2100
          });
        
        console.log(completion.data.choices[0].text)

        sendAIMessage(completion.data.choices[0].text,channelID);
   
    }else if(message.toString().startsWith("/rickroll")) {
        io.emit(`rickroll.${channelID}`, {});
    }else if(message.toString().startsWith("/help")) {
        sendAIMessage("Commands: \n /ai <promt> - Send a message to the AI \n /rickroll - Rickroll everyone \n /help - Show this message",channelID);
    }else if(message.toString().startsWith("/clear")) {
        io.emit(`clear.${channelID}`, {});
        //prisma.chat.deleteMany();
    }else if(message.toString().startsWith("/reload")) {
        io.emit(`reload.${channelID}`, {});

    }else if(message.toString().startsWith("/rick")) {
        sendAIMessage("https://www.youtube.com/watch?v=dQw4w9WgXcQ",channelID);

    }else if(message.toString().startsWith("/videochat")) {
        io.emit(`videochat.${channelID}`, {});
    }else if(message.toString().startsWith("/openlink4all")) {
        if(messageOBJ.user.name != "Tim") return sendAIMessage("You are not allowed to use this command",channelID);
        const link = message.toString().split("/openlink4all")[1].trim();
        io.emit(`link.${channelID}`, {link: link});
    }else if(message.toString().startsWith("/whoami")) {
        sendAIMessage("You are " + messageOBJ.user.name,channelID);
    }else if(message.toString().startsWith("/myid")) {
        sendAIMessage("Your id is " + messageOBJ.user.id,channelID);
    }else if(message.toString().startsWith("/idof")) {
        const username = message.toString().split("/idof")[1].trim();
        const user = await prisma.user.findFirst({
            where: {
                name: username
            }
        })
        if(user == null) {
            sendAIMessage("User not found",channelID);
        }else{
            sendAIMessage("User is " + user.id,channelID);
        }

    }else if(message.toString().startsWith("/easteregg")) {
        const games = ["/games/tetris.html", "/games/jump.html","/games/bobble.html","/games/snake.html","/games/frogger.html"];
        const g = games[Math.floor(Math.random() * games.length)];
        sendIframeMessage(g,channelID);

    }else if(message.toString().startsWith("/")) {
        sendAIMessage("Unknown command. Type /help to show all commands",channelID);
    }
}


function generatePrompt(promt) {
    return "This is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. It can execute the following command: /help /ai /rickroll. Try to explain all the commands if your asked to do so\n This is it's promt: " +"\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: "+ promt +"\n"; 

}


app.post("/api/chat/send", async (req, res) => {
    let { message,channelID } = req.body;

    if(channelID == null) {
        channelID = "default"
    }

    console.log(channelID)

    console.log(message);

    const messageAllowed = checkMessage(message)
    if(!messageAllowed) {
        message = "Verbotene Nachricht erkannt!"
    }

    //check command

    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];

    const user = await validateJWT(jwt);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const userID = user.id;


    if (message != null && message.length > 0 && message.length < 1000) {
       

            //check if user with userID exists
            const user = await prisma.user.findUnique({
                where: {
                    id: userID
                }
            })

            if (user == null) {
                res.status(400).json({ error: "Invalid user" });
                return;
            }

            const newMessage = await prisma.chat.create({
                data: {
                    message: message,
                    userId: userID,
                    type: "text",
                    channelID: channelID
                }
            })


            newMessage.user = {};
            newMessage.user.name = user.name;
            newMessage.user.id = user.id;
            newMessage.userId = undefined;

            io.emit("message."+channelID, newMessage);

            res.json(newMessage);

            parseCommand(message, newMessage, channelID);

            return;

    }

    res.status(400).json({ error: "Invalid message" });

});

app.post("/api/chat/endMeeting", async (req,res) => {
    io.emit("endMeeting", {});
    res.json({success: true});
})


app.post("/api/chat/sendImage", async (req, res) => {
    let {channelID} = req.body;

    if(channelID==null) {
        channelID = "default"
    }

    if(!req.files) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }


    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];

    const user = await validateJWT(jwt);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const userID = user.id;

    const file = req.files.file;

    if(file.mimetype.startsWith("image/")) {

        const blobName = uuidv4();
        const stream = streamifier.createReadStream(file.data);
        const streamLength = file.data.length;

        global.blobService.createContainerIfNotExists("chat", {publicAccessLevel: "container"}, (callback) => {

            global.blobService.createBlockBlobFromStream(
                "chat",
                blobName,
                stream,
                streamLength,
                async (err) => {

                    if(!err) {
                        const url = global.blobService.getUrl("chat", blobName);

                        const newMessage = await prisma.chat.create({
                            data: {
                                message: "",
                                ressource: url,
                                userId: userID,
                                type: "image",
                                channelID: channelID
                            }
                        })

                        newMessage.user = {};
                        console.log(user);
                        newMessage.user.name = user.username;
                        newMessage.user.id = user.id;
                        newMessage.userId = undefined;

                        io.emit("message."+channelID, newMessage);

                        res.json(newMessage);
                    }

                });

            });

    }else {
        res.status(400).json({ error: "Invalid file" });
        return;
    }





});
  

app.get("/api/chat/getUserRooms", async (req, res) => {
    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];

    const user = await validateJWT(jwt);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const userID = user.id;

    const rooms = await prisma.room.findMany({
        where: {
            users: {
                some: {
                    id: userID
                }
            }
        }
    })

    res.json(rooms);

})
    
app.post("/api/chat/joinRoom", async (req, res) => {
    let {channelID} = req.body;

    if(channelID == null) {
        channelID = "default"
    }

    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];

    const user = await validateJWT(jwt);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const userID = user.id;

    //check if room exists if nto create it
    const room = await prisma.room.findUnique({
        where: {
            id: channelID
        }
    })

    if(room==null) {
        const newRoom = await prisma.room.create({
            data: {
                id: channelID,
                name: channelID
            }
        })
    }
    
    //append this room to user rooms if not already in
    const userRoom = await prisma.user.findUnique({
        where: {
            id: userID
        },
        include: {
            rooms: {
                where: {
                    id: channelID
                }
            }
        }
    })

    if(userRoom.rooms.length==0) {
       const result = await prisma.user.update({
            where: {
                id: userID
            },
            data: {
                rooms: {
                    connect: {
                        id: channelID
                    }
                }
            }
        })
        console.log("ADDED");
        console.log(result);
    }



    res.json({success: true});


});



app.get("/api/chat/get", async (req, res) => {

    let {channelID} = req.query;

    if(channelID == null || channelID == "null") {
        channelID = "default"
    }


    console.log("chanel: "+channelID)

    if (req.headers.authorization == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }

    const jwt = req.headers.authorization.split(" ")[1];
    console.log(jwt);

    const user = await validateJWT(jwt);
    console.log(user);

    if (user == null) {
        res.status(400).json({ error: "Invalid session" });
        return;
    }


    //check if user is in room
   const rooms = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            rooms: {
                where: {
                    id: channelID
                },
                select: {
                    id: true
                }
            }
        }
    });

    console.log(rooms)

    if(rooms.rooms.length==0) {
        res.status(400).json({ error: "User is not part of room "+channelID });
        return;
    }



    let { page } = req.query;
    if (!page) page = 0;

    const messages = await prisma.chat.findMany({
        skip: page * 30,
        take: 30,
        orderBy: {
            createdAt: "desc"
        },

        where: {
            channelID: channelID
        },


        select: {
            id: true,
            message: true,
            createdAt: true,
            type: true,
            ressource: true,
            user: {
                select: {
                    name: true,
                    id: true
                }
            }
        }

    })

    res.json(messages);

});

process.on('exit', async () => {
    await prisma.$disconnect()
});

module.exports = app;


