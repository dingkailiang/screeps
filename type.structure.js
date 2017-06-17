/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('type.structure');
 * mod.thing == 'a thing'; // true
 */
var strategy = require('strategy');
var worker = require('type.worker');
var config = require('config');
var utility = require('utility');

module.exports = {
    run : function(structure){
        let func = this['run_' + structure.structureType]
        if (func){
            func(structure);
        }
    },

    run_spawn : function(spawn){
        if (spawn.room.memory.updateQueue){
            spawn.room.memory.queue = []
            strategy.fillQueue(spawn);
            worker.sortQueue(spawn.room.memory.queue);
            console.log(spawn.room.name + " has updated queue!");
            spawn.room.memory.updateQueue = false;
        }
        if (spawn.spawning){
            var  spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                spawningCreep.memory.role + " (" +
                Math.floor((spawn.spawning.needTime - spawn.spawning.remainingTime)/
                spawn.spawning.needTime*100) + "%)",
                spawn.pos.x + 1,
                spawn.pos.y - 1,
                {align : 'left',opacity : 0.8}
            );
            return;

        } else if (spawn.room.memory.queue.length > 0){
            let data = JSON.parse(spawn.room.memory.queue[0]);
            if (!(worker.create(spawn,data) < 0)){
                spawn.room.memory.queue.shift()
            }
        }
    },

    run_tower : function(tower){
        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile){
            tower.attack(closestHostile);
            return;
        }
        let creep = tower.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(c)=>c.hits < c.hitsMax});
        if (creep){
            tower.heal(creep);
            return;
        }

        let strucs = tower.pos.findInRange(FIND_STRUCTURES,5,{
            filter:(s)=>s.structureType != STRUCTURE_WALL &&
            s.structureType != STRUCTURE_RAMPART &&
            s.hits/s.hitsMax < 0.8
        });

        if (strucs.length > 0){
            let struc = _.min(strucs,(s)=>s.hits/s.hitsMax);
            tower.repair(struc);
        }
    },

    run_link : function(link){
        if (link.energy < link.energyCapacity){
            return;
        }
        var targets = utility.getPropRecursively(config,['rooms',link.room.name,'links',link.id],[]);
        for (let targetId of targets){
            let target = Game.getObjectById(targetId);
            if (target.energy == 0){
                link.transferEnergy(target);
            }
        }
    }
};
