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
    roomkeeper : {
        word : '⚖️ keep',
        working : ['maintain','fillAround','fill','repairing','bricking'],
        bodyParts : [WORK,CARRY,MOVE,MOVE],
        priority : 7
    },
    upgrader : {
        word : '⚡ upgrade',
        working : ['maintain','upgrading'],
        priority : 4,
        ignoreCreeps : false
    },

    staticUpgrader : {
        hasState : false,
        word : '⚡ upgrade',
        eating : ['upgradingStatic'],
        priority : 4,
        ignoreCreeps : false,
        bodyBase : [CARRY,WORK,MOVE],
        bodyParts : [WORK,WORK,MOVE]
    },

    miner : {
        bodyParts : [WORK,WORK,MOVE],
        bodyBase : [WORK,CARRY,MOVE],
        working : ['maintain','mining'],
        eating : ['maintain','mining'],
        priority : 6
    },

    remoteMiner : {
        bodyParts : [WORK,WORK,MOVE],
        bodyBase : [WORK,CARRY,MOVE],
        working : ['maintain','mining'],
        eating : ['remoting','mining'],
        priority : 3
    },

    mover : {
        word : '🚚 move',
        working : ['maintain','fillAround','store'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE],
        priority : 5
    },

    remoteMover : {
        word : '🚚 move',
        working : ['maintain','homing','store'],
        eating : ['maintain','remoting','eat'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE],
        priority : 2
    },

    builder : {
        word : '🏗️ build',
        working : ['maintain','building','upgrading'],
        ignoreCreeps : false
    },

    harvester : {
        word : '🚚️ move',
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
        bodyParts : [CLAIM,MOVE],
        priority : 1
    },

    default : {
        hasState : true,
        word : '🛠️ work',
        working : [],
        eating : ['maintain','eat'],
        bodyBase : [],
        bodyParts : [WORK,CARRY,MOVE],
        priority : 0,
        ignoreCreeps : true
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
        data.ignoreCreeps = config.ignoreCreeps;
        return spawn.createCreep(body,undefined,data);
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

    },

    sortQueue : function(queue){
        queue.sort(function(a,b){
            let w1 = JSON.parse(a);
            let w2 = JSON.parse(b);
            let p1 = utility.getPropWithDefault(roleConfig,w1.role).priority;
            let p2 = utility.getPropWithDefault(roleConfig,w2.role).priority;
            return p2 - p1;
        })
    }
};
