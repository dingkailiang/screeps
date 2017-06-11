/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.creep');
 * mod.thing == 'a thing'; // true
 */




// api to basic method
Creep.prototype.do = function(func,args){
    if (args && args.length > 0 && args[0] === null){
        this.moveTo(this.pos.findClosestByPath(this.room.findExitTo(Game.rooms[this.memory.remote])));
        return;
    }
    var res = func.apply(this,args);
    if (res == ERR_NOT_IN_RANGE){
        this.moveTo(args[0], {visualizePathStyle: {stroke: '#ffffff'}});
    } else if (!(res == 0 || res == -4 || res == -6)) {
        console.log("creep "+ this.name + "error in" + " do: " + res);
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

Creep.prototype.maintain = function(){
    var target = this.pos.findInRange(FIND_STRUCTURES,1,{
        filter : (s) => s.hits/s.hitsMax < 0.5
    });
    if (target.length > 0){
        this.do(this.repair,[target]);
        return true;
    }
    return false;
}

Creep.prototype.eat = function(){
    var targetId = this.memory[this.memory.supplyType];
    var eatFunc;
    var args = [Game.getObjectById(targetId)];
    if (this.memory.supplyType == 'source'){
        eatFunc = this.harvest;
    }  else {
        eatFunc = this.withdraw;
        args.push(RESOURCE_ENERGY);
    }

    this.do(eatFunc,args);
}

Creep.prototype.repairing = function(){
    var targets = this.room.find(FIND_STRUCTURES,{
        filter:(s) => s.hits < s.hitsMax &&
        s.structureType != STRUCTURE_WALL &&
        s.structureType != STRUCTURE_RAMPART
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
        s.structureType == STRUCTURE_WALL &&
        s.structureType == STRUCTURE_RAMPART
      });

    if (targets.length > 0){
        var target = _.min(targets,(s) => s.hits/s.hitsMax);
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

Creep.prototype.building = function(){
    var target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (target){
        this.do(this.build,[target]);
        return true;
    } else {
        return false;
    }
}

Creep.prototype.bricking = function(){
    var targets = this.room.find(FIND_STRUCTURES,{filter:(s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL});

    if (targets.length > 0){
        var target = _.min(targets,(s) => s.hits);
        this.do(this.repair,[target]);
        return true;
    } else {
        return false;
    }
}

Creep.prototype.put = function(){
    var room = Game.rooms[this.memory.home]
    var targets = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
    });
    if (targets.length > 0){
       targets.sort(function(s1,s2){
           let order = [STRUCTURE_EXTENSION,STRUCTURE_SPAWN,STRUCTURE_TOWER];
           return order.indexOf(s1.structureType) - order.indexOf(s2.structureType);
       });
       this.do(this.transfer,[targets[0],RESOURCE_ENERGY]);
       return true;
    } else {
       return false;
    }

}
