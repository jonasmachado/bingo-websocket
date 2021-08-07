const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {
    origins: ['*']
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
        
        integration.checkTicket(ticket, token)
            .then(response => {
                socket.userId = response.userId;
                maker.joinPlayer(socket, response.mode, io);
                socket.emit("Joined", "");
            })
            .catch(err => {
                socket.emit("InvalidTicket", err.response.data.message);
            }); 
    });

    socket.on("bingo", data  => {   
        socket.game.bingo(socket);
    });

    socket.on("line", data  => {
        socket.game.line(socket);
    });

    socket.on("UserMessage", (message)  => {
        socket.game.emitRoomMessage(message);
    });

    socket.on("edges", data  => {
        socket.game.edges(socket);
    });
    
    socket.on('disconnect', function() {
        console.log('disconectei o safado');
     });
  
});


server.listen(4200, "192.168.100.3");