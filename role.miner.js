/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    create : function(spawn,data){
        let bodyParts = [WORK,WORK,MOVE];
        data.tick = 0;
        spawn.createCustomCreep(bodyParts,data);
    },

    run : function(creep){
        let container = Game.getObjectById(creep.memory.container);
        if (creep.memory.state == 'mining'){
            creep.harvest(Game.getObjectById(creep.memory.source));
            return;
        }
        else if ( creep.memory.state == 'moving' &&
                  !(_.isEqual(creep.pos,container.pos) &&
                  creep.room.name == container.room.name)){
            creep.memory.tick++;
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});

        }
        else if (creep.memory.state == 'moving' && _.isEqual(creep.pos,container.pos) && creep.room.name == container.room.name){
            creep.memory.state = 'mining';
        }
        else {
            creep.memory.state = 'moving';
        }

    }
};
