const axios = require('axios');

var Integration = class Integration {

    constructor() {
        this.checkTicket = checkTicket;

        function checkTicket(ticket, token) {
            axios.get('https://d9027e76-505f-450c-b038-b86ce99711f4.mock.pstmn.io/game/check/ticket', null, {
                params : {
                    ticket,
                    token
                }
            })
            .then(response => {
                console.log(response.data.mode);
                return response.data.mode;
            })
            .catch(error => {
                console.log(error);
                return false;
            });
        }
    }   
}

module.exports = Integration;