const axios = require('axios');
const https = require('https');
const crypto = require('crypto');


const username = "AB1ghs9wrRRjfnZZZZlgtMhHHHooOoOtBerrr22F76";
const password1 = "EEEEEEOOOOOOOOOOVIDADEGADOOOOOOOOO";
const password2 = "POVOMARCADOEEEEEEPOVOFELIZ";

var Integration = class Integration {

    constructor() {
        this.baseUrl = "https://megabingo.conveyor.cloud";

        this.client = axios.create({maxRedirects: 0, httpsAgent: new https.Agent({rejectUnauthorized: false})});
    
        this.checkTicket = async (ticket, token) => {

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }

            const body = {
                'ticket': ticket,
                'token': token
            }

            const response = await this.client.post(this.baseUrl + '/game/ticket', body, { headers: headers });

            return response.data;
        }

        this.getIndex = async (mode) => {
            const currentHour = new Date().getHours();
            const passwormd5 = crypto.createHash('md5').update(password1 + currentHour + password2).digest('hex');

            var body = {
                'mode': mode
            }

            const response = await this.client.post(this.baseUrl + '/Game/Create', body, 
                { 
                    headers : {
                        username: username,
                        time: currentHour,
                        password: passwormd5               
                    } 
            });

            return response.data;
        }

        this.abortGame = async (room) => {
            var headers = getHeaders();
            
            var playersId = [];

            for(var i = 0; i < room.clients.length; i++) {
                playersId.push(room.clients[i].userId);
            }

            var body = {
                'gameId': room.index,
                'players': playersId
            }

            await this.client.post(this.baseUrl + '/Game/Abort', body, { headers: headers });
        }

        this.finalizeGame = async (game) => {
            const currentHour = new Date().getHours();
            const passwormd5 = crypto.createHash('md5').update(password1 + currentHour + password2).digest('hex');
                 
            var playersId = [];
            var winnersEdges = [];
            var winnersLine = [];
            var winnersBingo = [];
            var gameId = game.room.index;
            let botId = -1;

            try{

                for(var i = 0; i < game.players.length; i++) {
                    
                    if(game.players[i].isBot)
                    {
                        playersId.push(botId);
                        continue;
                    }
                    
                    playersId.push(game.players[i].client.userId);             
                }

                for(var i = 0; i < game.winnersEdges.length; i++) {

                    if(game.winnersEdges[i].isBot)
                    {
                        winnersEdges.push(botId);
                        continue;
                    }   

                    winnersEdges.push(game.winnersEdges[i].client.userId);             
                }

                for(var i = 0; i < game.winnersLine.length; i++) {

                    if(game.winnersLine[i].isBot)
                    {
                        winnersLine.push(botId);
                        continue;
                    }   

                    winnersLine.push(game.winnersLine[i].client.userId);             
                }

                for(var i = 0; i < game.winnersBingo.length; i++) {

                    if(game.winnersBingo[i].isBot)
                    {
                        console.log("Adicionando bot aos vencedores do bingo");
                        winnersBingo.push(botId);
                        continue;
                    }   

                    winnersBingo.push(game.winnersBingo[i].client.userId);             
                }

            }catch(err) {
                console.log(err)
            }

            var body = {
                gameId: gameId,
                players: playersId,
                winnersEdges: winnersEdges,
                winnersLine: winnersLine,
                winnersBingo: winnersBingo
            }

            const response = await this.client.post(this.baseUrl + '/game/finalize', body, {
                headers : {
                    username: username,
                    time: currentHour,
                    password: passwormd5               
                }
            });

            return response;
        }

        function getHeaders(){
            const currentHour = new Date().getHours();
            const passwormd5 = crypto.createHash('md5').update(password1 + currentHour + password2).digest('hex');
       
            var headers = {
                username: username,
                time: currentHour,
                password: passwormd5               
            }

            return headers;
        }
    }   
}

module.exports = Integration;