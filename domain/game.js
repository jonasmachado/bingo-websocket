const Player = require('./player');
const Integration = require('./integration');

var CardCollection = require('./cardCollection');
const Bot = require('./bot');

var Game = class Game {
    constructor(room, io, modePrize) {
        this.io = io;
        this.room = room;
        this.interval;
        this.countdown = 5;
        this.started = false;
        this.cardsGenerated = false;
        this.players = [];
        this.generateCards = generateCards;
        this.emitRoomMessage = emitRoomMessage;
        this.fireBots = fireBots;
        this.botBingo = botBingo;
        this.botLine = botLine;
        this.botEdges = botEdges;
        this.bingo = bingo;
        this.line = line;
        this.edges = edges;
        this.toBeDrawnNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75];
        this.drawnNumbers = [];
        this.gameOver = false;

        this.winnersEdges = [];
        this.winnersLine = [];
        this.winnersBingo = [];

        this.lineAlreadyPaid = false;
        this.edgesAlreadyPaid = false;

        this.entryFee;

        this.bingoTimeout = false;
        this.lineTimeout = false;
        this.edgesTimeout = false;

        this.modePrize = modePrize;
        this.linePrize = 0;
        this.edgesPrize = 0;
        this.bingoPrize = 0;
        this.tax = 0;

        this.bots = [];

        this.integration = new Integration();

        io.to(room.name).emit("GameStarted");
        shuffleArray(this.toBeDrawnNumbers);

        function timeToStart(game) {
            var io = game.io;
            var room = game.room;

            if(!game.cardsGenerated)
            {
                io.to(room.name).emit("CreatingCards");
                generateCards(game);
                
                game.cardsGenerated = true;

                emitTotalAmounts(game);
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

            if(game.bingoTimeout) {
                game.bingoTimeout = false;
                game.bingoAlreadyPaid = true;
                clearInterval(game.intervalGame);
                io.to(room.name).emit("GameOver");   
                game.integration.finalizeGame(game);
                emitAmountBingo(game);
            }
            
            if(game.lineTimeout) {
                game.lineTimeout = false;
                game.lineAlreadyPaid = true;
                emitAmountLine(game);
                stopBotsTryingLine(game);
            }

            if(game.edgesTimeout) {
                game.edgesTimeout = false;
                game.edgesAlreadyPaid = true;
                emitAmountEdges(game);
                stopBotsTryingEdges(game);
            }

            game.started = true;
            game.countdown = 4;
            
            var drwnNbr = game.toBeDrawnNumbers.pop();
            
            if(drwnNbr === undefined) {
                clearInterval(game.intervalGame);
                io.to(room.name).emit("GameOver");   
                game.integration.finalizeGame(game);
                return; 
            }
            
            game.drawnNumbers.push(drwnNbr);

            io.to(room.name).emit("DrawnNumber", drwnNbr);     

            game.fireBots(game, drwnNbr);
        }   

        function fireBots(game, drawnNumber) {
            for(var i = 0; i < game.bots.length; i++) {
                game.bots[i].fireDrawnNumber(drawnNumber, game.bots[i]);
            }
        }

        function stopBotsTryingLine(game) {
            for(var i = 0; i < game.bots.length; i++) {
                game.bots[i].stopTryLine = true;
            }
        }

        function stopBotsTryingEdges(game) {
            for(var i = 0; i < game.bots.length; i++) {
                game.bots[i].stopTryEdges = true;
            }
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

            var toBeCreatedBots = 20 - game.room.clients.length;

            for(var i = 0; i < toBeCreatedBots; i++)
            {
                var index = index = Math.floor((Math.random() * 240) + 250);
                let card = CardCollection[index];

                var newPlayer = new Player(null, null, true);
                game.players.push(newPlayer);

                game.bots.push(new Bot(card, game));

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
            this.bingoTimeout = true;

            var player = this.players.find(x => x.client == socket);

            player.client.emit("YouWin");

            this.winnersBingo.push(player);
        }
        
        function emitRoomMessage(message) {
            io.to(room.name).emit("RoomMessage", "[Jonas] ", message); 
        }

        function line(socket) {
            if(this.lineAlreadyPaid)
                return;

            var player = this.players.find(x => x.client == socket);
            var card = player.card.numbers.split(',');
            var boa = this.drawnNumbers[this.drawnNumbers.length -1];

            //vertical
            var v1 = [parseInt(card[0]), parseInt(card[1]), parseInt(card[2]), parseInt(card[3]), parseInt(card[4])];
            var v2 = [parseInt(card[5]), parseInt(card[6]), parseInt(card[7]), parseInt(card[8]), parseInt(card[9])];
            var v3 = [parseInt(card[10]), parseInt(card[11]), parseInt(card[12]), parseInt(card[13])];
            var v4 = [parseInt(card[14]), parseInt(card[15]), parseInt(card[16]), parseInt(card[17]), parseInt(card[18])];
            var v5 = [parseInt(card[19]), parseInt(card[20]), parseInt(card[21]), parseInt(card[22]), parseInt(card[23])];
            
            //horizontal
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
                io.to(room.name).emit("LinePaid", "Jonas"); 
                this.lineTimeout = true;
                this.winnersLine.push(player);
                player.client.emit("YouWinLine");
                return;
            }

            console.log("Missed Line");
            player.client.emit("MissedLine");
        }

        function emitAmountEdges(game){
            var winners = game.winnersEdges.length;
            game.winnersEdges.forEach(function(item) {
                if(!item.isBot)
                    item.client.emit("PlayerEdgesPrize" , game.edgesPrize / winners)
            });

            io.to(room.name).emit("RoomEdgesRate", game.edgesPrize / winners, winners); 
        }

        function emitAmountLine(game){
            var winners = game.winnersLine.length;
            game.winnersLine.forEach(function(item) {
                if(!item.isBot)
                  item.client.emit("PlayerLinePrize" , game.linePrize / winners)
            });

            io.to(room.name).emit("RoomLineRate", game.linePrize / winners, winners); 
        }

        function emitAmountBingo(game){
            var winners = game.winnersBingo.length;
            game.winnersBingo.forEach(function(item) {
                if(!item.isBot)
                    item.client.emit("PlayerBingoPrize" , game.bingoPrize / winners)
            });

            io.to(room.name).emit("RoomBingoRate", game.bingoPrize / winners, winners); 
        }

        function emitTotalAmounts(game) {
            var totalPrize = game.players.length * game.modePrize;
            game.linePrize = totalPrize * 0.20;
            game.bingoPrize = totalPrize * 0.30;
            game.edgesPrize = totalPrize * 0.20
            game.tax = totalPrize * 0.30;

            game.totalPrize -= game.tax;

            io.to(room.name).emit("TotalAmounts", totalPrize, game.bingoPrize, game.linePrize, game.edgesPrize); 
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
                this.edgesTimeout = true;
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

        function botBingo(id) {
            if(this.bingoAlreadyPaid)
                return;

            io.to(room.name).emit("BingoPaid", "BOT-" + id); 
            this.bingoTimeout = true;
            this.winnersBingo.push(new Player(null, null, true));
        }

        function botEdges(id) {
            if(this.edgesAlreadyPaid)
                return;

            io.to(room.name).emit("EdgePaid", "BOT-" + id); 
            this.edgesTimeout = true;
            this.winnersEdges.push(new Player(null, null, true));
        }

        function botLine(id) {
            if(this.lineAlreadyPaid)
              return;
            
            io.to(room.name).emit("LinePaid", "BOT-" + id); 
            this.lineTimeout = true;
            this.winnersLine.push(new Player(null, null, true));
        }

        this.intervalGame = setInterval(() => {timeToStart(this)}, 100);
    }   
}

module.exports = Game;

