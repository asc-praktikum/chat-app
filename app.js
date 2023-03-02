const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { PrismaClient } = require('@prisma/client')
const jose = require('jose')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const { Configuration, OpenAIApi } =  require("openai");

const prisma = new PrismaClient()


const indexRouter = require('./routes/index');
const chatRouter = require('./routes/chat');


const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);


io.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);



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

async function sendAIMessage(message) {
    const newMessage = await prisma.chat.create({
        data: {
            message: message,
            userId: "AI"
        }
    })

    newMessage.user = {};
    newMessage.user.name = "AI";
    newMessage.user.id = "AI";
    newMessage.userId = undefined;

    io.emit("message", newMessage);

    res.json(newMessage);
}

async function parseCommand(message) {
    if(message.toString().startsWith("/ai")) {
        const promt = message.toString().split("/ai")[1].trim();
        
   

    }
}


function generatePrompt(promt) {
    return "This is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n This is it's promt: " +"\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: "+ promt +"\nAI: "; 

}


app.post("/api/chat/send", async (req, res) => {
    let { message } = req.body;

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
                    userId: userID
                }
            })


            newMessage.user = {};
            newMessage.user.name = user.name;
            newMessage.user.id = user.id;
            newMessage.userId = undefined;

            io.emit("message", newMessage);

            res.json(newMessage);

            parseCommand(message);

            return;

    }

    res.status(400).json({ error: "Invalid message" });

});

app.get("/api/chat/get", async (req, res) => {

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

    let { page } = req.query;
    if (!page) page = 0;

    const messages = await prisma.chat.findMany({
        skip: page * 30,
        take: 30,
        orderBy: {
            createdAt: "desc"
        },

        select: {
            id: true,
            message: true,
            createdAt: true,
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
