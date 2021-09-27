var Bot = class Bot {
    constructor(playerCard, game) {
        this.card = playerCard;
        this.game = game;
        this.drawnNumbers = [];
        this.cardNumbers = playerCard.numbers.split(',');
        this.fireDrawnNumber = fireDrawnNumber;
        this.check = check;
        this.line = line;
        this.bingo = bingo;
        this.edges = edges;

        this.id = Math.floor(Math.random() * (999999 - 1)) + 1;

        this.stopTryLine = false;
        this.stopTryEdges = false;
        this.startTryBingo = false;
        
        let card = this.cardNumbers;

        this.edgesArray = [parseInt(card[0]), parseInt(card[4]), parseInt(card[19]), parseInt(card[23])];

        //vertical
        this.v1 = [parseInt(card[0]), parseInt(card[1]), parseInt(card[2]), parseInt(card[3]), parseInt(card[4])];
        this.v2 = [parseInt(card[5]), parseInt(card[6]), parseInt(card[7]), parseInt(card[8]), parseInt(card[9])];
        this.v3 = [parseInt(card[10]), parseInt(card[11]), parseInt(card[12]), parseInt(card[13])];
        this.v4 = [parseInt(card[14]), parseInt(card[15]), parseInt(card[16]), parseInt(card[17]), parseInt(card[18])];
        this.v5 = [parseInt(card[19]), parseInt(card[20]), parseInt(card[21]), parseInt(card[22]), parseInt(card[23])];
        
        //horizontal
        this.h1 = [parseInt(card[0]), parseInt(card[5]), parseInt(card[10]), parseInt(card[14]), parseInt(card[19])];
        this.h2 = [parseInt(card[1]), parseInt(card[6]), parseInt(card[11]), parseInt(card[15]), parseInt(card[20])];
        this.h3 = [parseInt(card[2]), parseInt(card[7]), parseInt(card[16]), parseInt(card[21])];
        this.h4 = [parseInt(card[3]), parseInt(card[8]), parseInt(card[12]), parseInt(card[17]), parseInt(card[22])];
        this.h5 = [parseInt(card[4]), parseInt(card[9]), parseInt(card[13]), parseInt(card[18]), parseInt(card[23])];


        function fireDrawnNumber(number, bot) {
            bot.drawnNumbers.push(number);
            bot.check(bot);
        }

        function check(bot) {
            bot.line(bot);
            bot.bingo(bot);
            bot.edges(bot);
        }

        function line(bot) {
            if(bot.stopTryLine) return;

            let boa = bot.drawnNumbers[bot.drawnNumbers.length -1];

            if(checkLine(bot.v1, boa, bot)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.v2, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.v3, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.v4, boa)) {
                bot.game.botLine(bot.id); 
                bot.stopTryLine = true;  
            }

            if(checkLine(bot.v5, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.h1, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.h2, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.h3, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.h4, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }

            if(checkLine(bot.h5, boa)) {
                bot.game.botLine(bot.id);  
                bot.stopTryLine = true; 
            }     
        }

        function checkLine(array, boa, bot) {
            let removeNumber = (number, array, bot) => {
                let index = array.indexOf(number) ;

                if(index != -1 ) {
                    array.splice(index, 1);
                }
            }

            let count = array.length;
            removeNumber(boa, array, bot);

            if(array.length == 0 && count > 0) { 
                return true;
            }

            return false;
        }

        function bingo(bot) {
            let removeNumber = (number, array) => {
                let index = array.indexOf(number) ;

                if(index != -1 ) {
                    array.splice(index, 1);
                    
                  //  console.log("Quantidade itens restantes bingo: " + array.length);
                }
            }

            var boa = bot.drawnNumbers[bot.drawnNumbers.length -1];

            var card = bot.cardNumbers;

            removeNumber('' + boa, card);

            if(card.length == 0)
                bot.game.botBingo(bot.id);
        }

        function edges(bot) {

            if(bot.stopTryEdges)
                return;

            let removeNumber = (number, array) => {
                let index = array.indexOf(number) ;
                console.log(number + " - " + array);

                if(index != -1 ) {
                    array.splice(index, 1);
                    console.log("Removendo.... " + number);
                }
            }

            var boa = bot.drawnNumbers[bot.drawnNumbers.length -1];

            removeNumber(boa, bot.edgesArray);

            if(bot.edgesArray.length == 0)
            {
                bot.game.botEdges(bot.id);
                bot.stopTryEdges = true;
            }
        }
    }
}

module.exports = Bot;