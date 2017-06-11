module.exports = {
  create : function(spawn,data){
      let bodyParts = [WORK,CARRY,MOVE,MOVE];
      spawn.createCustomCreep(bodyParts,data);
  },

  run : function(creep){
      if (creep.memory.state == 'go' && creep.carry.energy == creep.carryCapacity){
          creep.say('ð¢ï¸ put');
          creep.memory.state = 'back';
      } else if (creep.memory.state == 'back' && creep.carry.energy == 0){
          creep.say('ð take');
          creep.memory.state = 'go'
      }

      switch (creep.memory.state) {
          case 'go':
              creep.do(creep.harvest,[Game.getObjectById(creep.memory.source),RESOURCE_ENERGY]);
              break;
          case 'back':
              creep.put();
              break;
          default:
              creep.memory.state = 'go';
      }
  }
};
