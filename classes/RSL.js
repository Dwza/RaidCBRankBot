
// class is currently unused
const {Discord, Collection} = require('discord.js');
class RSLBot extends Discord {
    constructor(options) {
        super(options || {});

        this.commands = new Collection();
    }

}