/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.spawn');
 * mod.thing == 'a thing'; // true
 */


Spawn.prototype.createCustomCreep = function(bodyParts,data){
    let cost = _.sum(bodyParts,(part)=>BODYPART_COST[part]);
    let total = this.room.energyCapacityAvailable;
    let body = []
    let numBodyParts = Math.floor(total/cost)
    for (let part of bodyParts){
        for (let i = 0; i < numBodyParts; i++) {
            body.push(part);
        }
    }
    data.home = this.room.name;
    data.state = 'idle'
    this.createCreep(body,undefined,data)
}
