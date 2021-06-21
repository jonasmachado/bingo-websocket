var Room = class Room {
    constructor(number, type, maker) {
        this.name = 'room-' + number;
        this.clients = [];
        this.type = type;
        this.success = maker.startGame;
        this.error = maker.roomDismissed;
        this.io = maker.io;
        this.addClient = addClient;
        this.removeClient = removeClient;
        this.open = true;
        this.countdown = 10;
        this.maker = maker;
        
        function addClient(client) {
            this.clients.push(client);
            client.join(this.name);
            console.log("joining room: " + this.name);

            if(this.clients.length == 20) {
                success(this);
            }
        }

        function removeClient(client) {
            this.clients.splice(this.clients.indexOf(client), 1);
        }
        
        function startOrDismiss(room) {

            if(room.countdown > 0) {
                room.io.to(room.name).emit('CountDownRoom', room.countdown);
                room.countdown = room.countdown - 1;
                return;
            }

            clearInterval(room.interval);

            room.open = false;
       /*     if(room.clients.length < 3) {
                error(room);
                return;
            }
        */
            room.maker.startGame(room);          
        }

        this.interval = setInterval(() => {startOrDismiss(this)}, 1000)
    }
}

module.exports = Room;

