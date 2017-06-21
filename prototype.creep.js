/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.creep');
 * mod.thing == 'a thing'; // true
 */


var utility = require('utility');
var roleConfig = require('config.roles');
var roomConfig = require('config.rooms');
 /*##############################################################################
                                    BASIC API
 ##############################################################################*/
Creep.prototype.do = function(func,args){
    var res = func.apply(this,args);
    if (res == ERR_NOT_IN_RANGE){
        this.go(args[0]);
    } else if (!(res == 0 || res == -4 || res == -6 || res == -8)) {
        console.log("creep "+ this.name + " error in do: " + res);
    }
    return res;
}

Creep.prototype.act = function(actions){
    for (let action of actions){
        //if(this.memory.role =='upgraderC'){console.log(action)}
        let func = this[action];
        let ret = func.call(this);
        if (ret){
            break;
        }
    }
}

Creep.prototype.run = function(){
    var role = this.memory.role;
    var config = utility.getPropWithDefault(roleConfig,role);
    /*
    if (!config.hasState){

    } else if (this.memory.state == 'eating' && this.carry.energy == this.carryCapacity){
        this.say(config.word);
        this.memory.state = 'working';
    } else if (this.memory.state == 'working' && this.carry.energy == 0){
        this.say('🍔 eat');
        this.memory.state = 'eating'
    }
*/
    roleConfig[config.changeState].call(this);
    this.act(config[this.memory.state]);

}

Creep.prototype.record = function(){
    let room = this.memory.home;
    let timer1 = utility.getPropWithDefault(roleConfig,this.memory.role).timer;
    let timer2 = utility.getPropRecursively(Memory.rooms[room],['timer',this.memory.supply],0);
    let timer = _.max([timer1,timer2]);
    if(this.ticksToLive < timer){
        return;
    } else if (this.ticksToLive == timer){
        Memory.rooms[room].updateQueue = true;
        return;
    }
    let role = this.memory.role;
    let supply = this.memory.supply;
    utility.initProp(Memory.rooms[room],'stat',{});
    let roomStat = Memory.rooms[room].stat;

    utility.initProp(roomStat,supply,{});
    utility.initProp(roomStat[supply],role,0);
    ++roomStat[supply][role];
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
    opt.ignoreCreeps = utility.getPropWithDefault(roleConfig,this.memory.role).ignoreCreeps;
    opt.reusePath = 10;
    if (this.moveTo(target,opt)!=OK){
        this.checkBlock();
    }
}

Creep.prototype.checkBlock = function(){
    var creeps = this.pos.findInRange(FIND_MY_CREEPS,1,{
        filter : (c) => c.name != this.name && utility.getPropWithDefault(roleConfig,c.memory.role).dynamic
    });
    if (creeps.length > 0){
        this.move(this.pos.getDirectionTo(creeps[_.random(creeps.length-1)]));
    }
}

Creep.prototype.flaging = function(){
    var color1 = roomConfig[this.memory.home].flag;
    var color2 = utility.getPropWithDefault(roleConfig,this.memory.role).flag;
    if (this.pos.lookFor(LOOK_FLAGS).length > 0 ){
        return;
    }
    var flags = _.filter(Game.flags,(f) =>
        f.color == color1 &&
        f.secondaryColor== color2
    );
    if (flags.length > 0){
        this.go(flags[0]);
    } else{
        console.log(this.name + ' found no flag!');
        console.log(''+color1+color2)
        return;
    }
}
/*##############################################################################
                                COMMON ACTIONS
##############################################################################*/

Creep.prototype.maintain = function(){
    var carrySum = _.sum(this.carry)
    var targets;
    if (carrySum < this.carryCapacity){
        targets = this.pos.lookFor(LOOK_RESOURCES);
        if (targets.length > 0){
            this.do(this.pickup,[targets[0]]);
        }
    }
    if (carrySum > 0){
        targets = this.pos.lookFor(LOOK_STRUCTURES);
        targets = _.filter(targets,
            (s) => s.hits < s.hitsMax);
        if (targets.length > 0){
            this.do(this.repair,[targets[0]]);
            return false;
        }

        targets = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (targets.length > 0){
            this.do(this.build,[targets[0]]);
        }
    }
    return false;
}

Creep.prototype.eat = function(){
    var target = Game.getObjectById(this.memory.supply);
    if (!target){
        console.log(this.name + ' no target found in eat');
    }
    if ((target.store && target.store.energy == 0) ||target.energy == 0){
        this.go(target);
        return;
    }
    var method = roomConfig[this.memory.home].supplies[this.memory.supply].method;
    var args = [target,RESOURCE_ENERGY];
    this.do(this[method],args);
    return true;
}

/*##############################################################################
                                ROLE ACTIONS
##############################################################################*/
Creep.prototype.mining = function(){
    let container = Game.getObjectById(this.memory.container);
    if (container && this.pos.isEqualTo(container.pos))
    {

        let source = Game.getObjectById(this.memory.source);
        if (_.sum(container.store) < container.storeCapacity){

            this.do(this.harvest,[source]);
        }

        if (source.ticksToRegeneration == 1){
            console.log("Energy left in " + source.room.name + source.id + ": "+source.energy);
        }

        return true;
    }
    this.go(container);
    return true;
}

Creep.prototype.reserve = function(){
    if (this.do(this.reserveController,[this.room.controller]) == OK){
        this.checkBlock();
    }
},

Creep.prototype.containerControll = function(){
    var target = Game.getObjectById(this.memory.target);
    if (!target){
        console.log(this.name = ' found no container in CC method');
        return;
    }
    let store = _.sum(target.store);
    utility.initProp(Memory,'needFill',{});
    if (store > 0.9*target.storeCapacity){
        Memory.needFill[target.id] = false;
    } else if (store < 100){
        Memory.needFill[target.id] = true;
    }
}



Creep.prototype.bricking = function(){
    var room = this.memory.remote
    if (!room){
        room = this.memory.home
    }
    var targets = Game.rooms[room].find(FIND_STRUCTURES,{
        filter:(s) => s.hits < s.hitsMax &&
        (
            s.structureType == STRUCTURE_WALL ||
            s.structureType == STRUCTURE_RAMPART
        )
    });

    if (targets.length > 0){
        var target = _.min(targets,(s) => Math.floor(s.hits/1000));
        this.do(this.repair,[target]);
        return true;
    } else {
        return false;
    }
}
Creep.prototype.upgrading = function(){
    let room = Game.rooms[this.memory.home];
    this.do(this.upgradeController,[room.controller]);
}

Creep.prototype.building = function(){
    var room = this.memory.remote
    if (!room){
        room = this.memory.home
    }
    var targets = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES
        //,{filter : (c) => c.pos.lookFor(LOOK_CREEPS).length == 0}
    );
    if (targets.length){
        this.checkBlock();
        var target;
        if (this.room.name == room){
            target = this.pos.findClosestByRange(targets);
        } else {
            target = targets[0];
        }
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
        let target = this.pos.findClosestByRange(targets);
        this.do(this.repair,[target]);
        return true;
    }
    console.log('mission complete');
    return false;
}

Creep.prototype.immigrate = function(){
    this.memory.home = this.room.name;
    this.memory.remote = '';
    this.memory.role = 'builder';
    this.memory.type = 'consumer';
    this.memory.ignoreCreeps = false;
}

Creep.prototype.findContainer = function(){
    if (!this.memory.target){
        var supply = Game.getObjectById(this.memory.supply);
        if (!supply){
            console.log(this.name + ' no supply found in findContainer');
            return;
        }
        var containers = supply.pos.findInRange(FIND_STRUCTURES,1,{
            filter : (s) => s.structureType == STRUCTURE_CONTAINER
        });

        if (containers.length > 0){
            this.memory.target = containers[0].id;
        } else {
            console.log(this.name + ' no container found in findContainer');
            return;
        }
    }
    this.go(Game.getObjectById(this.memory.target));
    return true;
}

/*##############################################################################
                              RESOURCES CONTROLL
##############################################################################*/
Creep.prototype.fillAround = function(){
    if (_.sum(this.carry) === 0){
        return false;
    }
    targets = this.pos.findInRange(FIND_STRUCTURES,1,{
        filter :
            (s) => (s.structureType ==  STRUCTURE_SPAWN ||
            s.structureType == STRUCTURE_EXTENSION ||
            s.structureType == STRUCTURE_TOWER ||
            s.structureType == STRUCTURE_LINK ||
            s.structureType == STRUCTURE_CONTAINER) &&
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
    utility.initProp(Memory,'needFill',{});
    let targets = this.room.find(FIND_STRUCTURES,{
        filter :
            (s) =>
            Memory.needFill[s.id] ||(
            s.structureType ==  STRUCTURE_SPAWN ||
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
    var id = roomConfig[this.memory.home].storage[this.memory.remote || ''];
    var target = Game.getObjectById(id);
    if (!target){
        console.log(this.name + 'no target found in store')
        return false;
    }
    if (_.sum(target.store) == target.storeCapacity){
        return false;
    }
    this.do(this.transfer,[target,RESOURCE_ENERGY]);
    return true;
}



/*##############################################################################
                              FIGHTING
##############################################################################*/
Creep.prototype.standby = function(){
    var flags = _.filter(Game.flags,(f)=>f.color == this.memory.squad && f.secondaryColor == COLOR_WHITE);
    if (flags.length > 0){
        this.go(flags[0]);
    }
}

Creep.prototype.march = function(){
    var flags =  _.filter(Game.flags,(f)=>f.color == this.memory.squad);
    flags.sort(function(a,b){
        let p1 = COLORS_ALL.indexOf(a.secondaryColor);
        let p2 = COLORS_ALL.indexOf(b.secondaryColor);
        return p1 - p2;
    });
    if (flags.length < 1){
        return true;
    }
    var flag = flags[0];
    if (!flag.room || this.room.name != flag.room.name){
        this.go(flag);
        return true;
    }
}

Creep.prototype.attacking = function(){
    const priority = [FIND_HOSTILE_CREEPS,FIND_HOSTILE_SPAWNS,FIND_HOSTILE_STRUCTURES];
    for (let type of priority){
        var target = this.pos.findClosestByPath(type,{
            filter : (s) => s.structureType != STRUCTURE_CONTROLLER
        });
        if (target){
            this.do(this.attack,[target]);
            return true;
        }
    }
}

Creep.prototype.claiming = function(){
    var controller = this.room.controller
    var flag = this.room.find(FIND_FLAGS,{
        filter : (f) => f.color == this.memory.squad
    })[0];
    if (controller.my){
        flag.remove();
    } else {
        this.do(this.claimController,[controller])
    }

}
