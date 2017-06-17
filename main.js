require('prototype.creep');
var config = require('config');
var worker = require('type.worker');
var strategy = require('strategy');
var sturcMethod = require('type.structure');
var utility = require('utility');

Memory.supplies = {};
for (let room in config.rooms){
    let supplies = config.rooms[room].supplies
    for (let remote in supplies){
        Memory.supplies[remote||room] = supplies[remote].default.id;
    }
    Game.rooms[room].memory.updateQueue = true;
}


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
            Game.rooms[Memory.creeps[name].home].memory.updateQueue = true;
            delete Memory.creeps[name];
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
        sturcMethod.run(structure);
    }

    // flag loop
    for (let name in Game.flags){
        let flag = Game.flags[name];
        if (name == 'noCreeps'){
            let creeps = flag.pos.look(LOOK_CREEPS);
            for (let creep of creeps){
                creep.randomWalk();
            }
        }
    }

/*
    var path = Game.rooms['E91N51'].findPath(
        Game.getObjectById('59404d1cf3c9a06ceca2f53d').pos,
        Game.getObjectById('593b1a18232f08c861f89bf6').pos,
        { ignoreCreeps : true,
          ignoreRoads: true
        }
    )
    for (let p of path){
        Game.rooms['E91N51'].visual.circle(p.x,p.y)
    }
*/
    for (let name in Game.rooms){
        let room = Game.rooms[name];
        var opt =
        {
            font : "bold 1 serif",
            stroke : "#000",
            color : "#17C02E",
            align : "left"
        };
        room.visual.text(
            "Energy: " + room.energyAvailable + "/" + room.energyCapacityAvailable,
            0,1,opt
        );
        var x = 0
        var y = 3
        let remotes = utility.getPropRecursively(strategy.stat,['rooms',name,'remote'],{});
        for (let remoteName in remotes){
            let remote = remotes[remoteName]
            for (let role in remote){
                if (role != 'count'){
                    room.visual.text(
                        role + ": " + remote[role],
                        x,y,opt
                    );
                    y += 2;
                }
            }
        }
    }
}
