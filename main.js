require('prototype.spawn');
require('prototype.creep');
var config = require('config');
var roles = {}
for (let role of config.roles){
    roles[role] = require('role.'+role);
}
var strategies = {}
for (let room of config.rooms){
    strategies[room] = require('room.'+room);
}

module.exports.loop = function () {

  // collects data use by strategy
  var data = {
      rooms : {}
  };


  // creep loop
  for(let name in Memory.creeps) {

      // clean up memory
      if(!Game.creeps[name]) {
          delete Memory.creeps[name];
          console.log('Clearing non-existing creep memory:', name);
      }

      else {
          let creep = Game.creeps[name];

          // for role
          let role = creep.memory.role;
          if(roles[role]) {
              roles[role].run(creep);

              // gather data

              // count roles in room
              let room = creep.memory.home;
              initProp(data.rooms,room,{roles:{},sources:{},containers:{}});
              let roomData = data.rooms[room];
              initProp(roomData.roles,role,0);
              roomData.roles[role]++;

              // count roles assign on each object
              for (let prop of ['source','container']){
                  let objectId = creep.memory[prop];
                  initProp(roomData[prop+'s'],objectId,{count:0});
                  let objectData = roomData[prop+'s'][objectId];
                  initProp(objectData,role,0);
                  objectData[role]++;
                  objectData.count++;
              };

          } else {
              let flag = Game.flags.target;
              if (flag){

              }
          }
      }
  }


  // structure loop
  for (let name in Game.structures){
      let structure = Game.structures[name];
      switch (structure.structureType) {
          case STRUCTURE_SPAWN:
              let spawn = structure;
              let room = spawn.room;

              // if spawning
              if (spawn.spawning){
                  var spawningCreep = Game.creeps[spawn.spawning.name];
                  room.visual.text(
                      '🛠️' + spawningCreep.memory.role,
                        spawn.pos.x + 1,
                        spawn.pos.y - 1,
                        {align: 'left', opacity: 0.8});
                  break;
              }
              strategyCreate(spawn,data);
              break;
          case STRUCTURE_TOWER:
              let tower = structure;
              let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
              if (closestHostile){
                  tower.attack(closestHostile);
                  break;
              }
              let creep = tower.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(c)=>c.hits < c.hitsMax});
              if (creep){
                  tower.heal(creep);
                  break;
              }

              let strucs = tower.pos.findInRange(FIND_STRUCTURES,5,{
                  filter:(s)=>s.structureType != STRUCTURE_WALL &&
                  s.structureType != STRUCTURE_RAMPART &&
                  s.hits<s.hitsMax
                  });
              if (strucs.length > 0){
                  let struc = _.min(strucs,(s)=>s.hits/s.hitsMax);
                  tower.repair(struc);
              }
              break;
          default:
              //console.log('No handle for ' + structure.structureType);

        }
    }

}

function strategyCreate(spawn,data){
    var result;
    for (let func of [strategyCreateProducer,strategyCreateConsumer]){
        result = func.call(this,spawn,data);
        if (result && roles[result.role]){
            roles[result.role].create(spawn,result);
            return;
        } else if (result == 0){
            continue;
        } else {
            console.log("Error in creating:"+JSON.stringify(result));
        }
    }
}

function strategyCreateConsumer(spawn,data){
    var roomName = spawn.room.name;
    var strategy = strategies[roomName];
    var roomData = data.rooms[roomName] || {};
    var roleData = roomData.roles || {}
    var roleCreate;

    for (let role in strategy.roles){
        let current = roleData[role] || 0;
        if (current < strategy.roles[role]){
            roleCreate = role;
            break;
        }
    }

    if (! roleCreate) {
        return 0;
    }
    var supplyId;
    var min;
    for (let id in strategy.supplies){
        let type = strategy.supplies[id];
        let typeData = roomData[type+'s'] || {};
        let supplyData = typeData[id] || {};
        if (!supplyId || supplyData.count < min){
            supplyId = id;
            min = supplyData.count;
        }
    }

    var ret = {role:roleCreate};
    var supplyType = strategy.supplies[supplyId];
    ret[supplyType] = supplyId;
    ret.supplyType = supplyType;
    return ret

}

function strategyCreateProducer(spawn,data) {
    var roomName = spawn.room.name;
    var strategy = strategies[roomName];
    var roomData = data.rooms[roomName] || {};
    // spawn miner/harvester for each source
    for (let sourceId in strategy.sources){
        let sourceStrategy = strategy.sources[sourceId];
        if (sourceStrategy.method === config.CONTAINER_MINING){
            // for each container
            for (let containerId of sourceStrategy.containers){
                let containerData = (roomData.containers || {})[containerId] || {}

                let currentMiner = containerData.miner || 0;
                if (currentMiner < 1){
                    return {
                        role : 'miner',
                        source : sourceId,
                        container : containerId
                    }
                }

                let currentMover = containerData.mover || 0;
                if (currentMover < 1){
                    return {
                        role : 'mover',
                        container : containerId
                    }
                }
            }
        } else if (sourceStrategy.method === config.HARVESTER_MINING) {
            let currentHarvester = getProp(data,['rooms',roomName,'sources','harvester'],0);
            if (currentHarvester < sourceStrategy.assign){
                return {
                    role : 'harvester',
                    source : sourceId
                }
            }
        } else {
            console.log("strategy " + sourceStrategy.method + " is not defined");
        }
    }
    return 0
}

function initProp(object,prop,init){
    if(!object[prop]){
        object[prop] = init;
    }
}

function sumInObject(object){
    var sum = 0;
    for (let prop in object){
        sum += object[prop];
    }
    return sum;
}

function getProp(object,propArray,defret){
    for (let prop of propArray){
        object = object[prop]
        if (object === undefined){
            return defret
        }
    }
    return object
}
