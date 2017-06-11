/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.E91N51');
 * mod.thing == 'a thing'; // true
 */
var config = require('config')
module.exports = {
    roles : {
        repairer : 2,
        upgrader : 4,
        builder : 0
    },
    sources : {
        '58dbc55e8283ff5308a40586' : {
            method : config.CONTAINER_MINING,
            containers : ['593b1a18232f08c861f89bf6']
        },
        '58dbc55e8283ff5308a40585' : {
            method : config.CONTAINER_MINING,
            containers : ['593b315f18122c7955a4a101']
        }
    },
    supplies : {
        '593b1a18232f08c861f89bf6' : 'container',
        '593b315f18122c7955a4a101' : 'container'
    }



};
