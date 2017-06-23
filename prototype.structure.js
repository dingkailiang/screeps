/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.spawn');
 * mod.thing == 'a thing'; // true
 */

var roleConfig = require('config.roles');
var roomConfig = require('config.rooms');
var utility = require('utility');

Structure.prototype.run = function(){}

Structure.prototype.changeState = function(){
    let store = this.energy || _.sum(this.store||[]);
    utility.initProp(Memory,'needFill',{});
    if (store > 0.9*(this.storeCapacity || this.energyCapacity)){
        Memory.needFill[this.id] = false;
    } else if (store < 100){
        Memory.needFill[this.id] = true;
    }
}

Structure.prototype.full = function(){
    if (this.store){
        return _.sum(this.store) === this.storeCapacity;
    } else if (this.energy){
        return this.energy === this.energyCapacity;
    } else {
        return undefined;
    }
}

Structure.prototype.empty = function(){
    if (this.store){
        return _.sum(this.store) === 0;
    } else if (this.energy){
        return this.energy === 0;
    } else {
        return undefined;
    }
}
/*##############################################################################
                                  SPAWN
##############################################################################*/
Spawn.prototype.create = function(data){
    var role = data.role;
    var config = utility.getPropWithDefault(roleConfig,role);
    var cost = _.sum(config.bodyParts,(part)=>BODYPART_COST[part]);
    var body = config.bodyBase;
    var base = _.sum(body,(part)=>BODYPART_COST[part]);
    var total = this.room.energyCapacityAvailable;
    var numBodyParts = _.min([Math.floor((total-base)/cost),config.limit]);
    for (let part of config.bodyParts) {
        for (let i = 0; i < numBodyParts; ++i){
            body.unshift(part);
        }
    }
    return this.createCreep(body,data.role + _.random(999),data);
}

Spawn.prototype.fillQueue = function(){
    var roomStat = this.room.memory.stat || {};
    var supplies = roomConfig[this.room.name].supplies
    for (let id in supplies){
        let supply = supplies[id];
        let roles = supply.assign
        for (let role in roles){
            let current = utility.getPropRecursively(roomStat,[id,role],0);
            while (current < roles[role]){
                let data = {
                    home : this.room.name,
                    remote : supply.remote,
                    state : 'eating',
                    role : role,
                    supply : id
                }
                ++current;
                this.room.memory.queue.push(JSON.stringify(data));
            }
        }
    }
/*

    // fill fighter
    for (let flagName in Game.flags){
        let flag = Game.flags[flagName];
        let squadStrategy = strategy.squad[flag.color];
        for (let role in squadStrategy){
            let current = utility.getPropRecursively(roomStat,['squad',flag.color,role],0);
            while (current < squadStrategy[role]){
                let data = {
                    type : 'fighter',
                    role : role,
                    home : this.room.name,
                    state : 'standby',
                    squad : flag.color
                }
                this.room.memory.queue.push(JSON.stringify(data));
                ++current;
            }
        }
    }
    */
}

Spawn.prototype.sortQueue = function(){
    this.room.memory.queue.sort(function(a,b){
        let w1 = JSON.parse(a);
        let w2 = JSON.parse(b);
        let p1 = utility.getPropWithDefault(roleConfig,w1.role).priority;
        let p2 = utility.getPropWithDefault(roleConfig,w2.role).priority;
        return p1 - p2;
    });
}

Spawn.prototype.run = function(){
    if (this.room.memory.updateQueue){
        this.room.memory.queue = []
        this.fillQueue();
        this.sortQueue();
        //console.log(this.room.name + " has updated queue!");
        this.room.memory.updateQueue = false;
    }
    if (this.spawning){
        var  spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            spawningCreep.memory.role + " (" +
            Math.floor((this.spawning.needTime - this.spawning.remainingTime)/
            this.spawning.needTime*100) + "%)",
            this.pos.x + 1,
            this.pos.y - 1,
            {align : 'left',opacity : 0.8}
        );
        return;

    } else if (this.room.memory.queue.length > 0){
        let data = JSON.parse(this.room.memory.queue[0]);
        if (!(this.create(data) < 0)){
            this.room.memory.queue.shift();
        }
    }
}



/*##############################################################################
                                  LINK
##############################################################################*/
StructureLink.prototype.run = function(){
    if (this.energy < this.energyCapacity){
        return;
    }
    var targets = utility.getPropRecursively(roomConfig,['rooms',this.room.name,'links',this.id],[]);
    for (let targetId of targets){
        let target = Game.getObjectById(targetId);
        if (target.energy == 0){
            this.transferEnergy(target);
        }
    }
}
/*##############################################################################
                                TOWER
##############################################################################*/
StructureTower.prototype.run = function(){
    let closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile){
        this.attack(closestHostile);
        return;
    }
    let creep = this.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(c)=>c.hits < c.hitsMax});
    if (creep){
        this.heal(creep);
        return;
    }

    let hits = roomConfig[this.room.name].rampart;
    let strucs = this.room.find(FIND_MY_STRUCTURES,{
        filter:(s)=>s.structureType  == STRUCTURE_RAMPART &&
        s.hits < hits
    });

    if (strucs.length > 0){
        this.repair(strucs[0]);
    }


}
/*##############################################################################
                                container
##############################################################################*/
StructureContainer.prototype.full = function(){
    return _.sum(this.store) > 0.7 * this.storeCapacity
}
