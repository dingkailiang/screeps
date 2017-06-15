require('prototype.creep');
var config = require('config');
var worker = require('type.worker');
var utility = require('utility');
var strategy = require('strategy');

var needFillQueue = true;
Game.spawns['Spawn1'].queue = [];
module.exports.loop = function () {

    // collects data use by strategy
    strategy.stat = {
        rooms : {}
    };
    strategy.initMem;

    // creep loop
    for(let name in Memory.creeps) {
        // clean up memory
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            needFillQueue = true;
            console.log('Clearing non-existing creep memory:', name);
        } else {
            let creep = Game.creeps[name];
            // for role
            let role = creep.memory.role;

            if (!creep.spawning){
                if (creep.memory.type == 'worker'){
                    worker.run(creep);
                } else if (creep.memory.type == 'fighter'){
                    let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES,{
                        filt : (c) => c.structureType == STRUCTURE_RAMPART
                    });
                    if (target){
                        if (creep.attack(target) == ERR_NOT_IN_RANGE){
                            creep.moveTo(target);
                        }
                    } else {
                        creep.moveTo(Game.flags['target']);
                    }
                } else {
                    console.log('No handle for type' + creep.memory.type);
                }
            }

            strategy.getStat(creep.memory);
        }
    }
// Game.spawns['Spawn1'].createCreep([ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE],undefined,{type:'fighter'})
    // structure loop
    for (let name in Game.structures){
        let structure = Game.structures[name];
        if (structure.structureType == STRUCTURE_SPAWN){
            if (needFillQueue){
                for (let info of structure.memory.queue){
                    strategy.getStat(JSON.parse(info));
                }
                strategy.fillQueue(structure);
            }
            if (structure.spawning){
                var  spawningCreep = Game.creeps[structure.spawning.name];
                structure.room.visual.text(
                    "📢 " + spawningCreep.memory.role + " (" +
                    Math.floor((structure.spawning.needTime - structure.spawning.remainingTime)/
                    structure.spawning.needTime*100) + "%)",
                    structure.pos.x + 1,
                    structure.pos.y - 1,
                    {align : 'left',opacity : 0.8}
                );
                continue;
            } else if (
              structure.room.energyAvailable == structure.room.energyCapacityAvailable &&
              structure.memory.queue.length > 0)
            {
                let data = JSON.parse(structure.memory.queue.shift());
                worker.create(structure,data);
            }
        } else if (structure.structureType == STRUCTURE_TOWER){
            let tower = structure;
            let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
            if (closestHostile){
                tower.attack(closestHostile);
                continue;
            }
            let creep = tower.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(c)=>c.hits < c.hitsMax});
            if (creep){
                tower.heal(creep);
                continue;
            }
/*
            let strucs = tower.pos.findInRange(FIND_STRUCTURES,5,{
                filter:(s)=>s.structureType != STRUCTURE_WALL &&
                s.structureType != STRUCTURE_RAMPART &&
                s.hits/s.hitsMax < 0.8
            });
            if (strucs.length > 0){
                let struc = _.min(strucs,(s)=>s.hits/s.hitsMax);
                tower.repair(struc);
            }
            */
        }
    }

    if (needFillQueue){
        needFillQueue = false;
    }



}
