
module.exports = {
    create : function(spawn,data){
        let bodyParts = [WORK,CARRY,MOVE,MOVE];
        spawn.createCustomCreep(bodyParts,data);
    },

    run : function(creep){
        if (creep.memory.state == 'eating' && creep.carry.energy == creep.carryCapacity){
            creep.say('⚡ upgrade');
            creep.memory.state = 'working';
        } else if (creep.memory.state == 'working' && creep.carry.energy == 0){
            creep.say('🍔 eat');
            creep.memory.state = 'eating'
        }

        switch (creep.memory.state) {
            case 'eating':
                creep.do(creep.withdraw,[Game.getObjectById(creep.memory[creep.memory.supplyType]),RESOURCE_ENERGY]);
                break;
            case 'working':
                actions = ['upgrading'];
                creep.act(actions);
                break;
            default:
                creep.memory.state = 'eating';
        }
    }
};
