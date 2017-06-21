require('prototype.creep');
require('prototype.structure');
var utility = require('utility');
var roomConfig = require('config.rooms')
for (let room in roomConfig){
    Game.rooms[room].memory.updateQueue = true;
}

module.exports.loop = function () {
    // room loop
    for (let name in Memory.rooms){
        delete Memory.rooms[name].stat;
    }


    // creep loop
    for(let name in Memory.creeps) {
        // clean up memory
        if(!Game.creeps[name]) {
            Game.rooms[Memory.creeps[name].home].memory.updateQueue = true;
            delete Memory.creeps[name];
            //console.log('Clearing non-existing creep memory:', name);
        } else {
            let creep = Game.creeps[name];
            if (creep.memory.supply == '594a3881954da02359e7ad1c' && creep.memory.role != 'upgraderC'){
              creep.memory.supply = '594af2055659551f61c24688'
            }
            if (!creep.spawning){
                creep.run();
            } else {
                utility.initProp(creep.memory,'timer',0);
                ++creep.memory.timer;
            }

            creep.record();

        }
    }

// Game.spawns['Spawn1'].createCreep([ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE],undefined,{type:'fighter'})
    // structure loop
    for (let name in Game.structures){
        let structure = Game.structures[name];
        structure.run();
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
/*
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
        let remotes = room.memory.remote;
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
    */

}
