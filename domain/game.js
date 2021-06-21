var Player = require('./player');
var CardCollection = require('./cardCollection');

var Game = class Game {
    constructor(room, io) {
        this.io = io;
        this.room = room;
        this.interval;
        this.countdown = 5;
        this.started = false;
        this.cardsGenerated = false;
        this.players = [];
        this.generateCards = generateCards;
        this.emitRoomMessage = emitRoomMessage;
        this.bingo = bingo;
        this.line = line;
        this.edges = edges;
        this.toBeDrawnNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75];
        this.drawnNumbers = [];
        this.gameOver = false;

        this.lineAlreadyPaid = false;
        this.edgesAlreadyPaid = false;

        io.to(room.name).emit("GameStarted");
        shuffleArray(this.toBeDrawnNumbers);

        function timeToStart(game){
            var io = game.io;
            var room = game.room;

            if(!game.cardsGenerated)
            {
                io.to(room.name).emit("CreatingCards");
                generateCards(game);
                
                game.cardsGenerated = true;
            }

            if(game.countdown > 0) {
                game.countdown -= 1;

                if(!game.started) {
                    io.to(room.name).emit("CountDownToStart", game.countdown + 1);
                } else {
                    io.to(room.name).emit("CountDownToNumber", game.countdown);
                }

                return;
            }
            
            game.started = true;
            game.countdown = 10;
            
            var drwnNbr = game.toBeDrawnNumbers.pop();
            
            if(drwnNbr === undefined) {
                clearInterval(game.intervalGame);
                io.to(room.name).emit("GameOver");   
                return; 
            }

            game.drawnNumbers.push(drwnNbr);

            io.to(room.name).emit("DrawnNumber", drwnNbr);     
        }   

        function generateCards(game) {

            for(var i = 0; i < game.room.clients.length; i++) {            
                var card;
                var index;
                var player;

                do {
                    index = Math.floor((Math.random() * 249) + 1);
                    player = game.players.find(player => player.card.id == index)
                } while(player)

                card = CardCollection[index];

                var newPlayer = new Player(game.room.clients[i], card);
                game.players.push(newPlayer);

                newPlayer.client.emit("UpdateCard", card);
            }
        }

        function bingo(socket) {
            var player = this.players.find(x => x.client == socket);
            var card = player.card.numbers.split(',');

            for(var i = 0; i < card.length; i++) {
                if(!this.drawnNumbers.includes(parseInt(card[i])))
                {
                    console.log("Missed Bingo");
                    player.client.emit("MissedBingo");
                    return;
                }
            }

            io.to(room.name).emit("BingoPaid", "Jonas"); 
            clearInterval(this.intervalGame);

            var player = this.players.find(x => x.client == socket);

            player.client.emit("YouWin");
        }
        
        function emitRoomMessage(message) {
            io.to(room.name).emit("RoomMessage", "[Jonas] ", message); 
        }

        function line(socket) {
            //0,1,2,3,4
            //0,5,10,14,19
            //2,7,16,21
            //3,8,12,17,22
            //4,9,13,18,23

            //5,6,7,8,9
            //10,11,12,23
            //14,15,16,17,18
            //19,20,21,22,23

            if(this.lineAlreadyPaid)
                return;

            var player = this.players.find(x => x.client == socket);
            var card = player.card.numbers.split(',');
            var boa = this.drawnNumbers[this.drawnNumbers.length -1];

            var v1 = [parseInt(card[0]), parseInt(card[1]), parseInt(card[2]), parseInt(card[3]), parseInt(card[4])];
            var v2 = [parseInt(card[5]), parseInt(card[6]), parseInt(card[7]), parseInt(card[8]), parseInt(card[9])];
            var v3 = [parseInt(card[10]), parseInt(card[11]), parseInt(card[12]), parseInt(card[13])];
            var v4 = [parseInt(card[14]), parseInt(card[15]), parseInt(card[16]), parseInt(card[17]), parseInt(card[18])];
            var v5 = [parseInt(card[19]), parseInt(card[20]), parseInt(card[21]), parseInt(card[22]), parseInt(card[23])];
            
            var h1 = [parseInt(card[0]), parseInt(card[5]), parseInt(card[10]), parseInt(card[14]), parseInt(card[19])];
            var h2 = [parseInt(card[1]), parseInt(card[6]), parseInt(card[11]), parseInt(card[15]), parseInt(card[20])];
            var h3 = [parseInt(card[2]), parseInt(card[7]), parseInt(card[16]), parseInt(card[21])];
            var h4 = [parseInt(card[3]), parseInt(card[8]), parseInt(card[12]), parseInt(card[17]), parseInt(card[22])];
            var h5 = [parseInt(card[4]), parseInt(card[9]), parseInt(card[13]), parseInt(card[18]), parseInt(card[23])];

            let isIn = (arr, target) => target.every(v => arr.includes(v));

            if((isIn(this.drawnNumbers, v1) && v1.includes(boa)) ||
               (isIn(this.drawnNumbers, v2) && v2.includes(boa)) ||
               (isIn(this.drawnNumbers, v3) && v3.includes(boa)) ||
               (isIn(this.drawnNumbers, v4) && v4.includes(boa)) ||
               (isIn(this.drawnNumbers, v5) && v5.includes(boa)) ||
               (isIn(this.drawnNumbers, h1) && h1.includes(boa)) ||
               (isIn(this.drawnNumbers, h2) && h2.includes(boa)) ||
               (isIn(this.drawnNumbers, h3) && h3.includes(boa)) ||
               (isIn(this.drawnNumbers, h4) && h4.includes(boa)) ||
               (isIn(this.drawnNumbers, h5) && h5.includes(boa))  ) {
                
                console.log("Line Paid");
                this.lineAlreadyPaid = true;
                io.to(room.name).emit("LinePaid", "Jonas"); 
                player.client.emit("YouWinLine");
                return;
            }

            console.log("Missed Line");
            player.client.emit("MissedLine");
        }

        function edges(socket) {
            //0,4,19,23
            if(this.edgesAlreadyPaid)
                return;

            var player = this.players.find(x => x.client == socket);
            var card = player.card.numbers.split(',');
            var boa = this.drawnNumbers[this.drawnNumbers.length -1];
            let isIn = (arr, target) => target.every(v => arr.includes(v));

            var edges = [parseInt(card[0]), parseInt(card[4]), parseInt(card[19]), parseInt(card[23])];

            if(isIn(this.drawnNumbers, edges) && edges.includes(boa))
            {
                console.log("Edge Paid");
                this.edgesAlreadyPaid = true;
                io.to(room.name).emit("EdgePaid", "Jonas"); 
                player.client.emit("YouWinEdge");
                return;
            }

            console.log("Missed Edge");
            player.client.emit("MissedEdge");
        }

        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        this.intervalGame = setInterval(() => {timeToStart(this)}, 100);
    }   
}

module.exports = Game;
