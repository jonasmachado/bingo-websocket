const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {
    origins: ['http://localhost:4200']
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var Matchmaker = require('./domain/matchmaker');
var Integration = require('./domain/integration');

var maker = new Matchmaker(io);
var integration = new Integration();

app.use('/', (req, res) => {  
    res.render('index.html');
});

let messages = [];      

io.on('connection', socket => {
    console.log('Socket conectado: ' + socket.id);

    socket.on("join", (ticket, token)  => {
        var mode = integration.checkTicket(ticket, token);

        if(!mode) {
            socker.emit("InvalidTicket", "");
            return;
        }

        maker.joinPlayer(socket, mode, io);
    });

    socket.on("bingo", data  => {   
        var roomName;

        socket.rooms.forEach(function(rm, idx) {
            if(rm.includes("room-")){
                roomName=rm;
            }
         });

        maker.callBingo(roomName, socket);
    });

    socket.on("line", data  => {
        var roomName;

        socket.rooms.forEach(function(rm, idx) {
            if(rm.includes("room-")){
                roomName=rm;
            }
         });

        maker.callLine(roomName, socket);
    });

    socket.on("UserMessage", (message)  => {
        var roomName;

        socket.rooms.forEach(function(rm, idx) {
            if(rm.includes("room-")){
                roomName=rm;
            }
         });

        maker.callUserMessage(roomName, socket, message);
    });

    socket.on("edges", data  => {
        var roomName;

        socket.rooms.forEach(function(rm, idx) {
            if(rm.includes("room-")){
                roomName=rm;
            }
         });

        maker.callEdges(roomName, socket);
    });
    
});


server.listen(4200);