/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('strategy');
 * mod.thing == 'a thing'; // true
 */

var config = require('config');
var utility = require('utility');

for (let room in config.rooms){
    let supplies = config.rooms[room].supplies
    for (let remote in supplies){
        Game.rooms[remote||room].memory.supply = supplies[remote].default.id;
    }
}

module.exports = {
    stat : {rooms : {}},



    getStat : function(data){
        // stat
        let room = data.home;
        let role = data.role;
        utility.initProp(this.stat.rooms,room,{});
        let roomStat = this.stat.rooms[room];

        // count roles assign on each object
        for (let type of ['remote','source','container']){
            let objectId = data[type];
            if (!(objectId===undefined)){
                utility.initProp(roomStat,type,{});
                utility.initProp(roomStat[type],objectId,{count:0});
                let objectStat = roomStat[type][objectId];
                utility.initProp(objectStat,role,0);
                ++objectStat[role];
                ++objectStat.count;
            }
        }
    },

    fillQueue : function(spawn){
        var result;
        utility.initProp(spawn.memory,'queue',[]);
        var queue = spawn.memory.queue;
        var roomName = spawn.room.name;

        for (let func of [this.jumpQueue,this.fillProducer,this.fillConsumer]){
            func.call(this,queue,roomName);
        }
    },

    jumpQueue : function(queue,roomName){
        return
    },

    fillConsumer : function(queue,roomName){
        var strategy = config.rooms[roomName];
        var roomStat = utility.getPropRecursively(this.stat,['rooms',roomName],{});
        var remoteStat = roomStat.remote||{};

        for (let remote in strategy.roles){
            for (let role in strategy.roles[remote]){
                let current = utility.getPropRecursively(remoteStat,[remote,role],0);
                while (current < strategy.roles[remote][role]){
                    let data = {
                        type : 'worker',
                        role : role,
                        home : roomName,
                        state : 'eating',
                        remote : remote
                    };
                    let remoteSupplies = (strategy.supplies[remote] || strategy.supplies['']);
                    let supply = utility.getPropWithDefault(remoteSupplies,role);
                    let supplyId = supply.id;
                    /*
                    var min;
                    for (let id in supplies){
                        let type = supplies[id];
                        let supplyStat = utility.getPropRecursively(roomStat,[type,id],{});
                        if(!supplyId || supplyStat.count < min){
                            supplyId = id;
                            min = supplyStat.count;
                        }
                    }
                    */
                    var supplyType = supply.type;
                    data.supplyType = supplyType;
                    data[supplyType] = supplyId;
                    utility.initProp(roomStat,supplyType,{});
                    utility.initProp(roomStat[supplyType],supplyId,{count:0});
                    ++roomStat[supplyType][supplyId].count;
                    ++roomStat[supplyType][supplyId][role];
                    queue.push(JSON.stringify(data));
                    ++current;
                }
            }
        }
    },



    fillProducer : function(queue,roomName){


        // spawn miner/harvester for each source
        var strategy = config.rooms[roomName];
        var roomStat = this.stat.rooms[roomName] || {};
        var role;
        for (let remote in strategy.sources){
            for (let sourceId in strategy.sources[remote]){
                let sourceStrategy = strategy.sources[remote][sourceId];
                if (sourceStrategy.method === 'container'){
                    for (let containerId of sourceStrategy.containers){
                        role = remote ? "remoteMover" : 'mover';
                        let currentMover = utility.getPropRecursively(roomStat,['container',containerId,role],0);
                        if (currentMover < sourceStrategy[role]){
                            let data = {
                                type : 'worker',
                                role : role,
                                container : containerId,
                                home : roomName,
                                state : 'eating',
                                remote : remote,
                                supplyType : 'container'
                            };
                            queue.unshift(JSON.stringify(data));
                        }

                        role = remote ? "remoteMiner" : 'miner';
                        let currentMiner = utility.getPropRecursively(roomStat,['container',containerId,role],0);
                        if (currentMiner < 1){
                            let data = {
                                type : 'worker',
                                role : role,
                                source : sourceId,
                                container : containerId,
                                home : roomName,
                                state : 'eating',
                                remote : remote,
                                supplyType : 'source'
                            };
                            queue.unshift(JSON.stringify(data));
                        }
                    }
                }
            }
        }
    },



};
