var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
	    }
	    else {
            var source = Game.getObjectById(creep.memory.source);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }

	}
};

module.exports = {
    create : function(spawn,data){
        let bodyParts = [WORK,CARRY,MOVE,MOVE];
        spawn.createCustomCreep(bodyParts,data);
    },

    run : function(creep){
        if (creep.memory.state == 'eating' && creep.carry.energy == creep.carryCapacity){
            creep.say('🚧 build');
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
                actions = ['building','upgrading'];
                creep.act(actions);
                break;
            default:
                creep.memory.state = 'eating';
        }
    }
};
