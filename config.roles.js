/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('config.roles');
 * mod.thing == 'a thing'; // true
 */
var roomConfig = require('config.rooms');
var utility = require('utility');
module.exports = {



/*******************************************************************************
                                MINNING
*******************************************************************************/
    harvester : {
        working : ['maintain','fill','building','upgrading'],
        eating : ['maintain','eat'],//,'findSpot'],
        bodyParts : [WORK,CARRY,MOVE],
        ignoreCreeps : false
    },
    miner : {
        changeState : 'changeStatePosition',
        eating : ['maintain','findContainer'],
        working : ['maintain','eat'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [WORK,WORK,MOVE],
        limit : 2,
        priority : 1,
        dynamic : false
    },

    minerR : {
        changeState : 'changeStatePosition',
        eating : ['maintain','remoting','findContainer'],
        working : ['maintain','eat'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [WORK,WORK,MOVE],
        limit : 2,
        priority : 3,
        dynamic : false
    },

    helpMiner : {
        changeState : 'changeStateNone',
        eating : ['maintain','fillAround','eat'],
        priority : 3,
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [WORK,WORK,MOVE]
    },

    mover : {
        working : ['maintain','store','checkBlock'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE],
        ignoreCreeps : true,
        priority : 2,
        limit :5
    },

    moverR : {
        eating : ['maintain','remoting','eat'],
        working : ['maintain','store','checkBlock'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE],
        ignoreCreeps : true,
        priority : 4
    },

    roomKeeper : {
        working : ['maintain','fill','upgrading','checkBlock'],
        priority : 0,
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [CARRY,CARRY,MOVE],
        timer : 100
    },

    upgrader : {
        working : ['maintain','upgrading'],
        bodyParts : [WORK,CARRY,MOVE,MOVE]
    },

    upgraderF : {
        changeState : 'changeStateDefault',
        eating : ['maintain','eat','flaging'],
        working : ['maintain','building','flaging','upgrading'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [WORK,WORK,MOVE]
    },

    upgraderC : {
        changeState : 'changeStatePosition',
        eating : ['maintain','findContainer'],
        working : ['maintain','containerControll','upgrading','eat'],
        bodyBase : [WORK,CARRY,MOVE],
        bodyParts : [WORK,WORK,MOVE],
        dynamic : false
    },

    builder : {
        working : ['maintain','building','upgrading','checkBlock'],
        eating : ['maintain','eat','checkBlock'],
        bodyParts : [WORK,CARRY,MOVE]
    },

    builderR : {
        eating : ['maintain','remoting','eat'],
        working : ['maintain','building','store','checkBlock'],
        bodyParts : [WORK,CARRY,MOVE]
    },

    bricker : {
        working : ['maintain','bricking'],
        bodyBase : [WORK,MOVE,MOVE],
        bodyParts :[CARRY,MOVE,MOVE]
    },

    reserver : {
        bodyParts : [CLAIM,MOVE],
        eating : ['remoting','reserve'],
        changeState : 'changeStateNone',
        priority : 5
    },

    attacker : {
        bodyParts : [ATTACK,MOVE],
        eating : ['attacking','flaging'],
        changeState : 'changeStateNone',
        flag : COLOR_RED
    },


    default : {
        working : [],
        eating : ['maintain','eat','checkBlock'],
        standby : ['standby'],
        fighting : ['march','attacking'],
        bodyBase : [],
        bodyParts : [WORK,CARRY,MOVE],
        priority : 100,
        ignoreCreeps : false,
        limit : 100,
        changeState : 'changeStateDefault',
        timer : 0,
        flag : COLOR_WHITE,
        dynamic : true
    },

    changeStateNone : function(){},

    changeStateDefault : function(){
        if (this.memory.state == 'eating' && this.carry.energy == this.carryCapacity){
            this.say('🛠️ work');
            this.memory.state = 'working';
        } else if (this.memory.state == 'working' && this.carry.energy == 0){
            this.say('🍔 eat');
            this.memory.state = 'eating'
        }
    },

    changeStatePosition : function(){
        if (this.memory.state == 'eating'){
            if (this.memory.target && this.pos.isEqualTo(Game.getObjectById(this.memory.target))){
                this.memory.state = 'working';
                utility.initProp(Game.rooms[this.memory.home].memory,'timer',{});
                let timer = Game.rooms[this.memory.home].memory.timer;
                utility.initProp(timer,this.memory.supply,this.memory.timer);
                timer[this.memory.supply] = Math.floor((timer[this.memory.supply] + this.memory.timer)/2);
            } else {
                utility.initProp(this.memory,'timer',0);
                ++ this.memory.timer;
            }
        }
    },

    changeStateFighter: function(){
/*
        if (this.memory.state != 'standby'){
            return;
        }
        var squad = this.room.memory.squad;
        if (this.name == 'destroyer451'){console.log(JSON.stringify(this.room.memory))}
        if(!squad){
            return;
        }
        var roleNeeds = roomConfig.rooms[this.memory.home].squad.roles;

        for (let role in roleNeeds){
            if (!squad[role] || squad[role] <roleNeeds[role]){
                return;
            }
        }
        */
        this.memory.state = 'fighting';
    }

};
