var module = angular.module ('hesperides.properties');

/**
 * This directive will display only the iterable properties
 * This support iterable of iterable properties !
 *
 * Added by Tidiane SIDIBE on 09/02/2017
 */
module.directive('iterablePropertiesContainer', [function (){

    return {
             restrict: 'E',
             scope: {
                iterables: '=',
                iterablesModel: '='
             },

             templateUrl: 'properties/iterable-properties-container.html',
             controller : ['$scope', function ($scope){

                /**
                 * Private function for searching the iterable containing the item that's _id is id.
                 * This makes use of recursion
                 * @param {Object} iterable : the iterable property the item will be search in.
                 * @param {Integer} id : the id of the item to be searched
                 */
                var findInIterable = function (iterable, id){

                   var parent = undefined;

                    _(iterable.iterable_valorisation_items).each(function (item){
                        if ( item._id == id ){
                            parent = iterable;
                        }

                        if ( !_.isUndefined (parent) ){
                            return false;
                        }

                        // recur here : on values of iterable
                        _( item.values ).each (function ( value ){
                            parent = findInIterable ( value, id );

                            if ( !_.isUndefined (parent) ){
                                return false;
                            }
                        });
                    });

                    return parent;
                };

                /**
                 * Private function for searching the parent of item that's _id is id
                 * @param {Object} iterable : the iterable property the item will be search in.
                 * @param {Integer} id : the id of the item to be searched
                 */
                var findParent = function(iterables, id){
                    var parent = undefined;

                    _(iterables).each(function (iterable){
                        parent = findInIterable (iterable, id);

                        if ( !_.isUndefined (parent) ){
                            return false;
                        }
                    });

                    return parent;
                };

                /**
                 * Private function for searching the model in sub model fields.
                 * This makes use of recursion
                 * @param {Object} iterableModel : is the model of the sub iterable.
                 * @param {String} name : is the name of the iterable to find
                 */
                var findModelInFields = function (iterableModel, name){
                    var model = _.find(iterableModel.fields, {name: name});

                    if ( _.isUndefined (model) ){
                        _(iterableModel.fields).each(function (field){
                            model = findModelInFields (field, name);

                            if ( !_.isUndefined (model) ){
                                return false;
                            }
                        })
                    }

                    return model;
                };

                /**
                 * Private function for searching the model in the fields.
                 * @param {Object} iterableModel : is the model of the iterable.
                 * @param {String} name : is the name of the iterable to find
                 */
                var findModel = function (iterablesModel, name){
                    var model = _.find(iterablesModel, {name : name});

                    if ( _.isUndefined (model) ){
                        _(iterablesModel).each(function(iterableModel){
                            model = findModelInFields (iterableModel, name);
                            if ( !_.isUndefined(model) ){
                                return false;
                            }
                        });
                    }

                    return model;
                };

                /**
                 * Function for adding a new bloc.
                 * @param {Object} property : is the property the new bloc should be added to.
                 */
                $scope.addOne = function (property){
                    // find the model
                    var model = findModel ($scope.iterablesModel, property.name);

                    // add value from the model
                    addFromModel (property, model);

                };

                /**
                 * Function for deleting a bloc.
                 * @param {Object} item : is the property item to be deleted.
                 */
                $scope.deleteOne = function (item){

                    // 1 - find the parent of this item
                    var parent = findParent($scope.iterables, item._id);

                    // 2 - delete the item
                    if ( _.isUndefined (parent) ){
                        console.error("Item of id :" + item._id + " was not found :(. This is an error !");
                    }

                    _.remove(parent.iterable_valorisation_items, {_id: item._id});

                };
             }],

             link: function (scope, element, attrs){

             }
         };

}])