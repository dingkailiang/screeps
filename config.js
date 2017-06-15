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
        'E91N51' : {
            roles : {
                '': {
                    repairer : 1,
                    builder : 3,
                    upgrader : 1
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
                },

                raids : {
                    'E94N53' : {
                        attacker : 3,
                        healer : 1
                    }
                }


            },
            supplies : {
                '' : {
                    default : {
                        id : '59404d1cf3c9a06ceca2f53d',
                        type : 'storage'
                    }
                },

                'E92N51' : {
                    default : {
                        id : '5940dce5529dc88f4795c597',
                        type : 'container'
                    }
                }
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
static = {
    rooms = {
        roles : {
          count : 0
        }

        source : {
          id : {
              worker : 3
              count : 1
            }
        }

        container : {
          id : {worker : 3}
        }


    }
}
*/
