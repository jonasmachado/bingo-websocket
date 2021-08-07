var Room = require('./rooms');
var Game = require('./game');
var Integration = require('./integration');

var MatchMaker = class MatchMaker {
    constructor(io) {
        this.integration = new Integration();
        this.io = io;
        this.joinPlayer = enqueuePlayer;
        this.callBingo = callBingo;
        this.callLine = callLine;
        this.callEdges = callEdges;
        this.startGame = startGame;
        this.callUserMessage = callUserMessage;
        this.rooms = [];
        this.games = [];

        function enqueuePlayer(client, type) {
            var room = this.rooms.find(item => item.type == type && item.open)

            if(!room){
                createRoom(client, type, this);
                return;
            }

            room.addClient(client);
        }
        
        function createRoom(client, type, maker) {
            maker.integration.getIndex(type).then(response => {
                var room = new Room(response.id, type, maker);
                room.addClient(client);
                maker.rooms.push(room);
            })
            .catch(err => {
                console.log(err);
            });        
        }
        
        function startGame(room){   
            var game = new Game(room, room.io, getModePrize(room.type));

            room.maker.games.push(game);

            for(var i = 0; i < room.clients.length; i++) { 
                room.clients[i].game = game;
            }

            console.warn('Game Started for room: ' + room.name);
        }

        function getModePrize(mode) {
            switch(mode){
                case 1: return 0.5;
                case 2: return 1.5;
                case 3: return 5;
                case 4: return 20;
            }
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