/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('config');
 * mod.thing == 'a thing'; // true
 */

 /*
  * Module code goes here. Use 'module.exports' to export things:
  * module.exports.thing = 'a thing';
  *
  * You can import it from another modules like this:
  * var mod = require('setting');
  * mod.thing == 'a thing'; // true
  */

 module.exports = {
    rooms : {
/*##############################################################################
                          FIRST ROOM
##############################################################################*/
        'E91N51' : {
            roles : {
                '': {
                    roomkeeper : 2,
                    builder : 2,
                    staticUpgrader : 2
                },

                'E92N51' :{
                    remoteBuilder : 0,
                    reserver : 1
                }
            },
            sources : {
                'E92N51' : {
                    '58dbc5818283ff5308a40815' : {
                        method : 'container',
                        containers : ['5940dce5529dc88f4795c597'],
                        remoteMover : 2
                    }
                },

                '' : {
                    '58dbc55e8283ff5308a40586' : {
                        method : 'container',
                        containers : ['593b1a18232f08c861f89bf6'],
                        mover : 1
                    },
                    '58dbc55e8283ff5308a40585' : {
                        method : 'container',
                        containers : ['593b315f18122c7955a4a101'],
                        mover : 1
                    }
                }

            },
            supplies : {
                '' : {
                    default : {
                        id : '59404d1cf3c9a06ceca2f53d',
                        type : 'storage'
                    },

                    staticUpgrader : {
                        id : '594424664c0ef1247a78a452',
                        type : 'link'
                    }
                },

                'E92N51' : {
                    default : {
                        id : '5940dce5529dc88f4795c597',
                        type : 'container'
                    }
                }
            },

            raids : {
                'E94N53' : {
                    attacker : 3,
                    healer : 1
                }
            },

            links : {
                '59441bced1b40e34709c42fb' : ['594424664c0ef1247a78a452']
            }
        }
     }
 };



/*
Memory = {
    creeps : {
        creepName : {
          type : worker
          role	:	builder
          container	:	593b315f18122c7955a4a101
          supplyType	:	container
          home	:	E91N51
          state	:	eating
          remote	:	E91N52
        }
    }

}
*/


/*
stat
{"rooms":{
    "E91N51":{
        "remote":{
            "":{
                "count":9,
                "mover":2,
                "miner":2,
                "upgrader":1,
                "roomkeeper":1,
                "builder":3
            },

            "E92N51":{
                "count":4,
                "remoteMiner":1,
                "remoteMover":2,
                "reserver":1
            }
        },
        "container":{
            "593b315f18122c7955a4a101":{
                "count":2,
                "mover":1,
                "miner":1
            },

            "593b1a18232f08c861f89bf6":{
                "count":2,
                "miner":1,
                "mover":1
            },

            "5940dce5529dc88f4795c597":{
                "count":4,
                "remoteMiner":1,
                "remoteMover":2,
                "reserver":1
            }
      },

      "source":{
          "58dbc55e8283ff5308a40585":{
              "count":1,
              "miner":1
          },

          "58dbc55e8283ff5308a40586":{
              "count":1,
              "miner":1
          },

          "58dbc5818283ff5308a40815":{
              "count":1,
              "remoteMiner":1}
          }
        }
    }
}
*/
