var Room = require('./rooms');
var Game = require('./game');

var MatchMaker = class MatchMaker {
    constructor(io) {
        this.io = io;
        this.joinPlayer = enqueuePlayer;
        this.callBingo = callBingo;
        this.callLine = callLine;
        this.callEdges = callEdges;
        this.startGame = startGame;
        this.roomDismissed = roomDismissed;
        this.callUserMessage = callUserMessage;
        this.rooms = [];
        this.games = [];
        this.index = 1;

        function enqueuePlayer(client, type) {
            var room = this.rooms.find(item => item.type == type && item.open)

            if(!room){
                createRoom(client, type, this);
                return;
            }

            room.addClient(client);
        }
        
        function createRoom(client, type, maker) {
            var room = new Room(maker.index, type, maker);
            room.addClient(client);
            maker.rooms.push(room);
            maker.index += 1;
        }
        
        function roomDismissed(room){
            io.to(room.name).emit("NotEnoughPlayers","A sala foi fechada por falta de jogadores.");
            console.warn('Room dismissed: ' + room.name)
        }
        
        function startGame(room){   
            var game = new Game(room, room.io);

            room.maker.games.push(game);

            console.warn('Game Started for room: ' + room.name);
        }

        function callBingo(name, socket){
            var game = this.games.find(item => item.room.name == name);

            game.bingo(socket);
        }

        function callLine(name, socket){
            var game = this.games.find(item => item.room.name == name);

            game.line(socket);
        }

        function callEdges(name, socket){
            var game = this.games.find(item => item.room.name == name);

            game.edges(socket);
        }

        function callUserMessage(name, socket, message){
            var game = this.games.find(item => item.room.name == name);

            game.emitRoomMessage(message);
        }
    }
}



module.exports = MatchMaker;