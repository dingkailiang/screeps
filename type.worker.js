/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('type.worker');
 * mod.thing == 'a thing'; // true
 */

var utility = require('utility');

var roleConfig = {
    upgrader : {
        word : 'â¡ upgrade',
        working : ['maintain','upgrading']
    },

    miner : {
        hasState : false,
        bodyParts : [WORK,WORK,MOVE],
        maintain : false
    },

    default : {
        hasState : true
        word : '🛠️ work',
        actions : [],
        eating : ['eat'],
        bodyBase : [],
        bodyParts : [WORK,CARRY,MOVE,MOVE],
        maintain : true
    }

}

module.exports = {
    create : function(spawn,data){
        let bodyParts = [WORK,CARRY,MOVE,MOVE];
        spawn.createCustomCreep(bodyParts,data);
    },

    run : function(creep){
        var role = creep.memory.role;
        var config = utility.getPropWithDefault(roleConfig,role);
        if (!config.hasState){

        } else if (creep.memory.state == 'eating' && creep.carry.energy == creep.carryCapacity){
            creep.say(config.word);
            creep.memory.state = 'working';
        } else if (creep.memory.state == 'working' && creep.carry.energy == 0)
            creep.say('ð eat');
            creep.memory.state = 'eating'
        }

        creep.act(config[creep.memory.state]);

    }
};
