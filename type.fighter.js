/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('type.fighter');
 * mod.thing == 'a thing'; // true
 */
var utility = require('utility');
const roleConfig = {
    default : {
        working : ['attacking'],
        bodyBase : [],
        bodyParts : [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK],
        ignoreCreeps : true
    }
};
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
        return spawn.createCreep(body,data.role + _.random(999),data);
    },

    run : function(creep){
        var role = creep.memory.role;
        var config = utility.getPropWithDefault(roleConfig,role);
        creep.act(config.working);
    }
};
