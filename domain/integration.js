const axios = require('axios');

var Integration = class Integration {

    constructor() {
        this.checkTicket = async (ticket, token) => {

            const response = await axios.get('https://d9027e76-505f-450c-b038-b86ce99711f4.mock.pstmn.io/game/check/ticket', {
                params : {
                    ticket,
                    token
                }
            });

            return response.data.mode;
        }
    }   
}

module.exports = Integration;