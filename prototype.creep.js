/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.creep');
 * mod.thing == 'a thing'; // true
 */



 /*##############################################################################
                                    BASIC API
 ##############################################################################*/
// api to basic method
Creep.prototype.do = function(func,args){

    var res = func.apply(this,args);
    if (res == ERR_NOT_IN_RANGE){
        this.go(args[0]);
    } else if (!(res == 0 || res == -4 || res == -6)) {
        console.log("creep "+ this.name + " error in do: " + res);
    }
}

// only api used now
Creep.prototype.act = function(actions){
    for (let action of actions){
        let func = this[action];
        let ret = func.call(this);
        if (ret){
            break;
        }
    }
}


/*##############################################################################
                                      MOVEMENT
##############################################################################*/
Creep.prototype.remoting = function(){
    if (this.room.name != this.memory.remote){
        this.go(this.pos.findClosestByPath(this.room.findExitTo(this.memory.remote)))
        return true;
    }
    return false;
}

Creep.prototype.homing = function(){
    if (this.room.name != this.memory.home){
        this.go(this.pos.findClosestByPath(this.room.findExitTo(this.memory.home)))
        return true;
    }
    return false;
}

Creep.prototype.go = function(target){
    var opt = {
        visualizePathStyle: {
            fill: 'transparent',
            stroke: '#fff',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
        }
    };
    opt.ignoreCreeps = this.memory.ignoreCreeps;
    opt.reusePath = 10;
    this.moveTo(target,opt);
}

Creep.prototype.randomWalk = function(){
    if (_.some(this.pos.lookFor(LOOK_STRUCTURES),(s)=>s.structureType === STRUCTURE_ROAD)){
        let direction = _.random(1,8);
        this.move(direction);
    }

}
/*##############################################################################
                                COMMON ACTIONS
##############################################################################*/

Creep.prototype.maintain = function(){
    var carrySum = _.sum(this.carry)
    var targets;
    if (this.name == 'Caroline'){console.log('here')}
    if (carrySum < this.carryCapacity){
        targets = this.pos.lookFor(LOOK_RESOURCES);
        if (targets.length > 0){
            this.do(this.pickup,[targets[0]]);
        }
    }
    if (carrySum > 0){
        targets = this.pos.lookFor(LOOK_STRUCTURES);
        targets = _.filter(targets,
            (s) => s.hits < s.hitsMax &&
            s.structureType != STRUCTURE_RAMPART);
        if (targets.length > 0){
            this.do(this.repair,[targets[0]]);
        }
    }
    return false;
}

Creep.prototype.eat = function(){
    if (_.sum(this.carry) == this.carryCapacity){
        return false;
    }

    var targetId = this.memory[this.memory.supplyType];
    var eatFunc;
    var target = Game.getObjectById(targetId)

    if (!target) {
        return false;
    }
    var args = [target];
    if (this.memory.supplyType == 'source'){
        eatFunc = this.harvest;
    }  else {
        let sourceEnergy = (target.store && target.store.energy) || 0;
        if (sourceEnergy === 0){
            if (this.carry.energy > 0){
                this.memory.state = 'working';
            } else {
                this.randomWalk();
            }
            return false;
        }
        eatFunc = this.withdraw;
        args.push(RESOURCE_ENERGY);
    }
    this.do(eatFunc,args);
    return false;
}

/*##############################################################################
                                ROLE ACTIONS
##############################################################################*/
Creep.prototype.mining = function(){
    let container = Game.getObjectById(this.memory.container);
    if (container && this.pos.isEqualTo(container.pos))
    {
        if (_.sum(container.store) < container.storeCapacity){

            this.do(this.harvest,[Game.getObjectById(this.memory.source)]);
        }
        return true;
    }
    this.go(container);
    return true;
}

Creep.prototype.reserve = function(){
    this.do(this.reserveController,[this.room.controller]);
    return true;
}
Creep.prototype.repairing = function(){
    var targets = this.room.find(FIND_STRUCTURES,{
        filter:(s) => s.hits < s.hitsMax &&
        s.structureType != STRUCTURE_WALL &&
        s.structureType != STRUCTURE_RAMPART &&
        s.structureType != STRUCTURE_ROAD
      });

    if (targets.length > 0){
        var target = _.min(targets,(s) => s.hits/s.hitsMax);
        this.do(this.repair,[target]);
        return true;
    } else {
        return false;
    }
}

Creep.prototype.bricking = function(){
    var targets = this.room.find(FIND_STRUCTURES,{
        filter:(s) => s.hits < s.hitsMax &&
        (
            s.structureType == STRUCTURE_WALL ||
            s.structureType == STRUCTURE_RAMPART
        )
    });

    if (targets.length > 0){
        var target = _.min(targets,(s) => s.hits);
        this.do(this.repair,[target]);
        return true;
    } else {
        return false;
    }
}

Creep.prototype.upgrading = function(){
    let room = Game.rooms[this.memory.home];
    this.do(this.upgradeController,[room.controller]);
    return true;
}

Creep.prototype.upgradingStatic = function(){
    var targetId = this.memory[this.memory.supplyType];
    var target = Game.getObjectById(targetId);
    this.do(this.withdraw,[target,RESOURCE_ENERGY]);
    this.do(this.upgradeController,[this.room.controller]);
}


Creep.prototype.building = function(){
    var target = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    if (target){
        this.do(this.build,[target]);
        return true;
    } else {
        return false;
    }
}

Creep.prototype.roadkeep = function(){
    var targets = this.room.find(FIND_STRUCTURES,{
        filter:(s) => s.hits < s.hitsMax &&
        s.structureType == STRUCTURE_ROAD
    });
    if (targets.length > 0){
        let target = this.pos.findClosestByPath(targets);
        this.do(this.repair,[target]);
        return true;
    }
    this.memory.role = 'remoteMover';
    return false;
}



/*##############################################################################
                              RESOURCES CONTROLL
##############################################################################*/
Creep.prototype.fillAround = function(){
    targets = this.pos.findInRange(FIND_MY_STRUCTURES,1,{
        filter :
            (s) => (s.structureType ==  STRUCTURE_SPAWN ||
            s.structureType == STRUCTURE_EXTENSION ||
            s.structureType == STRUCTURE_TOWER ||
            s.structureType == STRUCTURE_LINK) &&
            (s.energy < s.energyCapacity ||
            (s.store && s.store.energy < s.storeCapacity))
    });

    if (targets.length > 0){
        this.do(this.transfer,[targets[0],RESOURCE_ENERGY]);
        return true;
    }
    return false;
}

Creep.prototype.fill = function(){
    let targets = this.room.find(FIND_MY_STRUCTURES,{
        filter :
            (s) => (s.structureType ==  STRUCTURE_SPAWN ||
            s.structureType == STRUCTURE_EXTENSION ||
            s.structureType == STRUCTURE_TOWER) &&
            (s.energy < s.energyCapacity ||
            (s.store && s.store.energy < s.storeCapacity))
    });
    if (targets.length > 0){
        let target = this.pos.findClosestByPath(targets);
        this.do(this.transfer,[target,RESOURCE_ENERGY]);
        return true;
    }
    return false;
}

Creep.prototype.store = function(){
    var room = this.room;
    var supply = Game.getObjectById(Memory.supplies[this.room.name]);
    if (!supply){
        return false;
    }

    this.do(this.transfer,[supply,RESOURCE_ENERGY]);
    return true;
}
