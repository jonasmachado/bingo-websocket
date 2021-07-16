const axios = require('axios');
const https = require('https');
const crypto = require('crypto');


const username = "AB1ghs9wrRRjfnZZZZlgtMhHHHooOoOtBerrr22F76";
const password1 = "EEEEEEOOOOOOOOOOVIDADEGADOOOOOOOOO";
const password2 = "POVOMARCADOEEEEEEPOVOFELIZ";

var Integration = class Integration {

    constructor() {
        this.baseUrl = "https://192.168.100.3:45456";

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
            
            try{

                for(var i = 0; i < game.players.length; i++) {
                    playersId.push(game.players[i].client.userId);             
                }

                for(var i = 0; i < game.winnersEdges.length; i++) {
                    playersId.push(game.winnersEdges[i].client.userId);             
                }

                for(var i = 0; i < game.winnersLine.length; i++) {
                    playersId.push(game.winnersLine[i].client.userId);             
                }

                for(var i = 0; i < game.winnersBingo.length; i++) {
                    playersId.push(game.winnersBingo[i].client.userId);             
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