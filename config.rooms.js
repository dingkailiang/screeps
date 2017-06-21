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
    'E97S68' : {
        flag : COLOR_WHITE,
        storage : {
            '' : '594af2055659551f61c24688',
            'E97S69' : '594af2055659551f61c24688',
            'E97S67' : '594af2055659551f61c24688'
        },

        supplies : {
            '58dbc6248283ff5308a41a04' : {
                method : 'harvest',
                assign : {
                    miner : 1
                }
            },

            '58dbc6248283ff5308a41a05' : {
                method : 'harvest',
                assign : {
                    miner : 1
                }
            },

            //upper container
            '5948f83a3e27eb973cf20794' : {
                method : 'withdraw',
                assign : {
                    mover : 1
                }
            },

            //lower container
            '5949040b0ed8461f4f185ec7' : {
                method : 'withdraw',
                assign : {
                    mover : 1
                }
            },

            //storage
            '594af2055659551f61c24688': {
                method : 'withdraw',
                assign : {
                    builder : 3,
                    bricker : 1,
                    roomKeeper : 1
                }
            },

            //upgraderContainer
            '594a3881954da02359e7ad1c' : {
                method : 'withdraw',
                assign : {
                    upgraderC : 1,
                }
            },

            // lowremote Upper source
            '58dbc6248283ff5308a41a07' : {
                method : 'harvest',
                remote : 'E97S69',
                assign : {
                    minerR : 1
                }
            },

            '5949c0b00da72f23ecb4aea7' : {
                method : 'withdraw',
                remote : 'E97S69',
                assign : {
                    moverR : 1
                }
            },

            // lowremote Lowwer source
            '58dbc6248283ff5308a41a09' : {
                method : 'harvest',
                remote : 'E97S69',
                assign : {
                    minerR : 1,
                    reserver : 1
                }
            },

            '5949a683026cbfc7224c820d' : {
                method : 'withdraw',
                remote : 'E97S69',
                assign : {
                    moverR : 2
                }
            },


            // upremote up source
            '58dbc6248283ff5308a419ff' : {
                method : 'harvest',
                remote : 'E97S67',
                assign : {
                    minerR : 1,
                    reserver : 1
                }
            },

            '594a5a5c16f1886e10036099' : {
                method : 'withdraw',
                remote : 'E97S67',
                assign : {
                    moverR : 3
                }
            },



            // upremote low source
            '58dbc6248283ff5308a41a01' : {
                method : 'harvest',
                remote : 'E97S67',
                assign : {
                    minerR : 1
                }
            },

            '594a5b985f2e44ca0df88cb8' : {
                method : 'withdraw',
                remote : 'E97S67',
                assign : {
                    moverR : 2
                }
            }
            //
        }
    }
}
