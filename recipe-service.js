angular.module('recipe.service', [])

    .factory("DBService", function ($q, $ionicPopup, $state) {
        var db = null;

        function createDB() {   
            var deferred = $q.defer();
            var version = 1;
            var request = window.indexedDB.open("recipeDB", version);

            request.onupgradeneeded = function(e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;

                if(db.objectStoreNames.contains("recipeData")) {
                    db.deleteObjectStore("recipeData");
                }

                var store = db.createObjectStore("recipeData", { keyPath: "id", autoIncrement:true });
            };

            request.onsuccess = function(e) {
                db = e.target.result;
                deferred.resolve();
            };

            request.onerror = function(e){
                deferred.reject("Error creating database.");
                console.dir(e);
            };

            return deferred.promise;
        }

        function getRecipe(){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["recipeData"], "readwrite");
                var store = trans.objectStore("recipeData");
                var recipes = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function(e) {
                    var result = e.target.result;
                    if(result === null || result === undefined){
                        deferred.resolve(recipes);
                    }else{
                        recipes.push(result.value);
                        result.continue();
                    }
                };

                cursorRequest.onerror = function(e){
                    deferred.reject("Error retrieving records " + e.value);
                };
            }
            return deferred.promise;
        }

        function getRecipeById(recipeId){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var transaction = db.transaction(["recipeData"], "readwrite");
                var objectStore = transaction.objectStore("recipeData");
                var request = objectStore.get(Number(recipeId));

                var recipes = [];

                request.onsuccess = function(event) {
                    var recipe = request.result;
                    recipes.push(recipe);
                    deferred.resolve(recipes);
                };

                request.onerror = function(e){
                    deferred.reject("Error retrieving records " + e.value);
                };
            }
            return deferred.promise;
        }

        function saveRecipe(recipe){
            var recipe_name = recipe.name;
            var recipe_category = recipe.category;
            var recipe_instructions = recipe.instructions;

            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["recipeData"], "readwrite");
                var store = trans.objectStore("recipeData");

                var request = store.add({
                    "recipe_name": recipe_name,
                    "recipe_category": recipe_category,
                    "recipe_instructions": recipe_instructions
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Recipe added successfully.'
                    });
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error saving recipe.");
                };
            }
            return deferred.promise;
        }

        function delRecipe(recipeId){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["recipeData"], "readwrite");
                var store = trans.objectStore("recipeData");

                var request = store.delete(recipeId);

                request.onsuccess = function(e) {
                    deferred.resolve();
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error deleting recipe.");
                };
            }
            return deferred.promise;
        }

        function updateRecipe(recipe, recipeId){
            var recipe_name = recipe.name;
            var recipe_category = recipe.category;
            var recipe_instructions = recipe.instructions;

            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["recipeData"], "readwrite");
                var store = trans.objectStore("recipeData");

                var request = store.put({
                    "recipe_name": recipe_name,
                    "recipe_category": recipe_category,
                    "recipe_instructions": recipe_instructions,
                    "id":Number(recipeId)
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Recipe updated successfully.'
                    }).then(function(res) {
                        $state.go('recipemenu.all-recipe');
                    });
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error updated recipe.");
                };
            }
            return deferred.promise;
        }

        return {
            setup: function() {
                return createDB();
            },
            getRecipe: function(){
                return getRecipe();
            },
            getRecipeById: function(recipeId){
                return getRecipeById(recipeId);
            },
            saveRecipe: function(recipe){
                return saveRecipe(recipe);
            },
            delRecipe: function(recipeId){
                return delRecipe(recipeId);
            },
            updateRecipe: function(recipe, recipeId){
                return updateRecipe(recipe, recipeId);
            }
        }

    });

                
