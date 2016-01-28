angular.module('RecipeBook', ['ionic', 'recipe.service'])

    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('recipemenu', {
                url: "/recipeURL",
                abstract: true,
                templateUrl: "event-menu.html"
            })
            .state('recipemenu.home', {
                url: "/home",
                views: {
                    'menuContent' :{
                        templateUrl: "home.html"
                    }
                }
            })

            .state('recipemenu.home/:recipeId', {
                url: "/recipe-detail/:recipeId",
                views: {
                    'menuContent' :{
                        templateUrl: "home.html",
                        controller: 'RecipeDetailCtrl'
                    }
                }
            })

            .state('recipemenu.all-recipe', {
                url: "/all-recipe",
                views: {
                    'menuContent' :{
                        templateUrl: "all-recipe.html",
                        controller: "AllRecipeCtrl"
                    }
                }
            })
            .state('recipemenu.add-recipe', {
                url: "/add-recipe",
                views: {
                    'menuContent' :{
                        templateUrl: "add-recipe.html",
                        controller: "AddRecipeCtrl"
                    }
                }
            })
            .state('recipemenu.edit-recipe/:recipeId', {
                url: "/edit-recipe/:recipeId",
                views: {
                    'menuContent' :{
                        templateUrl: "add-recipe.html",
                        controller: "AddRecipeCtrl"
                    }
                }
            })
            .state('recipemenu.about', {
                url: "/about",
                views: {
                    'menuContent' :{
                        templateUrl: "about.html"
                    }
                }
            })

        $urlRouterProvider.otherwise("/recipeURL/home");
    })

    .controller('MainCtrl', function($scope, $state, $ionicPopup, $ionicSideMenuDelegate, DBService) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.headertxt = 'Random Recipe';

        $scope.getRandomRecipe = function() {
            DBService.getRecipe().then(function (results) {

                if(results.length === 0){
                    $ionicPopup.alert({
                        title: "Warning",
                        template: "No recipe to display. Please add a recipe."
                    }).then(function(res) {
                        $state.go('recipemenu.add-recipe');
                    });
                }else{
                    var random_recipe = [];
                    random_recipe.push(results[Math.floor(Math.random()* results.length)]);
                    $scope.recipe = random_recipe;
                }
            });
        }

        DBService.setup().then(function(){
            $scope.getRandomRecipe();
        });

    })

    .controller('RecipeDetailCtrl', function($scope, $state, $stateParams, $ionicPopup, DBService) {
        $scope.headertxt = 'Recipe Detail';

        $scope.init = function() {
            DBService.getRecipeById($stateParams.recipeId).then(function (results) {
                $scope.recipe = results;
            });
        }

        $scope.init();
    })

    .controller('AllRecipeCtrl', function($scope, $state, $ionicPopup, $ionicActionSheet, DBService) {
        $scope.loadRecipe = function() {
            DBService.getRecipe().then(function (results) {

                if(results.length === 0){
                    $ionicPopup.alert({
                        title: "Warning",
                        template: "No recipe to display. Please add a recipe."
                    }).then(function(res) {
                        $state.go('recipemenu.add-recipe');
                    });
                }else{
                    $scope.recipe = results;
                }
            });
        }

        $scope.loadRecipe();

        $scope.delRecipe = function(recipeId){
            $ionicActionSheet.show({
                titleText: 'Confirm Delete',
                destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function() {
                    //console.log('CANCELLED');
                },
                destructiveButtonClicked: function() {
                    DBService.delRecipe(recipeId).then(function () {
                        $ionicPopup.alert({
                            title: "Success",
                            template: "Recipe deleted."
                        }).then(function(res) {
                            $scope.loadRecipe();
                        });
                    });
                    return true;
                }
            });
        }

        $scope.editRecipe = function(recipe_Id){
            $state.go('recipemenu.edit-recipe/:recipeId',{recipeId:recipe_Id});
        }
    })

    .controller('AddRecipeCtrl', function($scope, $ionicPopup, $stateParams, DBService) {

        $scope.recipe = {};

        if($stateParams.recipeId === undefined){
            $scope.action = 'Add';
            $scope.btnaction = 'Submit';
        }else{
            $scope.action = 'Edit';
            $scope.btnaction = 'Update';

            DBService.getRecipeById($stateParams.recipeId).then(function (results) {
                $scope.recipe.name = results[0].recipe_name;
                $scope.recipe.category = results[0].recipe_category;
                $scope.recipe.instructions = results[0].recipe_instructions;
            });
        }

        $scope.saveRecipe = function(recipe){
            if(recipe === undefined || recipe.name === null || recipe.name === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please enter recipe name.'
                });
            }else if (recipe.category === undefined || recipe.category === null || recipe.category === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please select a category.'
                });
            }else if (recipe.instructions === undefined || recipe.instructions === null || recipe.instructions === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please enter instructions.'
                });
            }else{
                if($stateParams.recipeId === undefined) {
                    DBService.saveRecipe(recipe);
                }else{
                    DBService.updateRecipe(recipe, $stateParams.recipeId);
                }

                $scope.recipe.name = '';
                $scope.recipe.category = '';
                $scope.recipe.instructions = '';
            }
        }
    });


                
