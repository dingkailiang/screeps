/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('type.worker');
 * mod.thing == 'a thing'; // true
 */

var utility = require('utility');

const roleConfig = {
    upgrader : {
        word : '⚡ upgrade',
        working : ['maintain','upgrading']
    },

    miner : {
        hasState : false,
        bodyParts : [WORK,WORK,MOVE],
        working : ['mining'],
        eating : ['mining']
    },

    remoteMiner : {
        bodyParts : [WORK,WORK,MOVE],
        bodyBase : [WORK,CARRY,MOVE],
        working : ['maintain','mining'],
        eating : ['remoting','mining']
    },

    mover : {
        word : '🗑️ put',
        working : ['maintain','fill','store'],
        eating : ['maintain','eat','refill'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE]
    },

    remoteMover : {
        word : '🗑️ put',
        working : ['maintain','homing','store'],
        eating : ['maintain','remoting','eat'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE]
    },

    builder : {
        word : '🏗️ build',
        working : ['maintain','building','upgrading']
    },

    harvester : {
        word : '🗑️ put',
        working : ['maintain','put']
    },

    repairer : {
        word: '📌repair',
        working : ['maintain','repairing','bricking'],
        bodyParts : [WORK,CARRY,MOVE,MOVE]
    },

    remoteBuilder : {
        word : '🏗️ build',
        working : ['maintain','remoting','building','roadkeep'],
        eating : ['maintain','eat','remoting','eat']
    },

    reserver : {
        hasState : false,
        eating : ['remoting','reserve'],
        bodyParts : [CLAIM,MOVE]
    },

    default : {
        hasState : true,
        word : '🛠️ work',
        working : [],
        eating : ['maintain','eat'],
        bodyBase : [],
        bodyParts : [WORK,CARRY,MOVE],
    }

}

module.exports = {
    create : function(spawn,data){
        var role = data.role;
        var config = utility.getPropWithDefault(roleConfig,role);
        var cost = _.sum(config.bodyParts,(part)=>BODYPART_COST[part]);
        var body = config.bodyBase;
        var base = _.sum(body,(part)=>BODYPART_COST[part]);
        var total = spawn.room.energyCapacityAvailable;
        var numBodyParts = Math.floor((total-base)/cost);
        for (let part of config.bodyParts) {
            for (let i = 0; i < numBodyParts; ++i){
                body.push(part);
            }
        }
        spawn.createCreep(body,undefined,data);
    },

    run : function(creep){
        var role = creep.memory.role;

        var config = utility.getPropWithDefault(roleConfig,role);

        if (!config.hasState){

        } else if (creep.memory.state == 'eating' && creep.carry.energy == creep.carryCapacity){
            creep.say(config.word);
            creep.memory.state = 'working';
        } else if (creep.memory.state == 'working' && creep.carry.energy == 0){
            creep.say('🍔 eat');
            creep.memory.state = 'eating'
        }


        creep.act(config[creep.memory.state]);

    }
};
