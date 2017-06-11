/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.mover');
 * mod.thing == 'a thing'; // true
 */


module.exports = {
  create : function(spawn,data){
      let bodyParts = [CARRY,MOVE];
      spawn.createCustomCreep(bodyParts,data);
  },

  run : function(creep){
      if (creep.memory.state == 'go' && creep.carry.energy == creep.carryCapacity){
          creep.say('🛢️ put');
          creep.memory.state = 'back';
      } else if (creep.memory.state == 'back' && creep.carry.energy == 0){
          creep.say('🔄 take');
          creep.memory.state = 'go'
      }

      switch (creep.memory.state) {
          case 'go':
              creep.do(creep.withdraw,[Game.getObjectById(creep.memory.container),RESOURCE_ENERGY]);
              break;
          case 'back':
              creep.put();
              break;
          default:
              creep.memory.state = 'go';
      }
  }
};
