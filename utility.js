/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utility');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    getPropWithDefault : function(object,subset){
        ret = {};
        if (!object[subset]){
            return object.default;
        }
        for (let prop in object.default){
            let value = object[subset][prop];
            if (value === undefined){
                value = object.default[prop];
            }
            ret[prop] = _.cloneDeep(value);
        }
        return ret;
    },

    initProp : function(object,prop,init){
        if(!object[prop]){
            object[prop] = init;
        }
    },


    getPropRecursively : function(object,propArray,defret){
        for (let prop of propArray){
            object = object[prop];
            if (object === undefined){
                return defret;
            }
        }
        return object;
    }
};
