import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  // Types
  type Utensil = {
    id : Nat;
    name : Text;
    type_ : Text;
    size : Text;
  };

  type Recipe = {
    id : Nat;
    name : Text;
    ingredients : [Text];
    steps : [Text];
  };

  type HistoryEntry = {
    timestamp : Time.Time;
    ingredients : [Text];
    aiResponse : Text;
  };

  // Storage
  var nextUtensilId = 0;
  var nextRecipeId = 0;

  let utensilId = Map.empty<Nat, Principal>();
  let utensils = Map.empty<Nat, Utensil>();
  let recipes = Map.empty<Nat, Recipe>();
  let historyList = List.empty<HistoryEntry>();
  let userUtensils = Map.empty<Principal, List.List<Nat>>();
  let userRecipes = Map.empty<Principal, List.List<Nat>>();

  // Utensil Management
  public shared ({ caller }) func addUtensil(name : Text, type_ : Text, size : Text) : async Nat {
    let utensil : Utensil = {
      id = nextUtensilId;
      name;
      type_;
      size;
    };

    let callerUtensils = switch (userUtensils.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?existing) { existing };
    };

    utensilId.add(nextUtensilId, caller);
    utensils.add(nextUtensilId, utensil);
    callerUtensils.add(nextUtensilId);
    userUtensils.add(caller, callerUtensils);
    nextUtensilId += 1;

    utensil.id;
  };

  public shared ({ caller }) func updateUtensil(id : Nat, name : Text, type_ : Text, size : Text) : async () {
    if (not utensils.containsKey(id)) {
      Runtime.trap("Utensil does not exist");
    };

    // Check if the caller is the owner of the utensil
    switch (utensilId.get(id)) {
      case (null) { Runtime.trap("Utensil does not exist") };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("You are not the owner of this utensil");
        };
      };
    };

    let updatedUtensil : Utensil = {
      id;
      name;
      type_;
      size;
    };

    utensils.add(id, updatedUtensil);
  };

  public shared ({ caller }) func deleteUtensil(id : Nat) : async () {
    if (not utensils.containsKey(id)) {
      Runtime.trap("Utensil does not exist");
    };

    // Check if the caller is the owner of the utensil
    switch (utensilId.get(id)) {
      case (null) { Runtime.trap("Utensil does not exist") };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("You are not the owner of this utensil");
        };
      };
    };

    utensils.remove(id);
  };

  public query ({ caller }) func getUtensil(id : Nat) : async Utensil {
    switch (utensils.get(id)) {
      case (null) { Runtime.trap("Utensil does not exist") };
      case (?utensil) { utensil };
    };
  };

  public query ({ caller }) func getUserUtensils() : async [Utensil] {
    let callerUtensilIds = switch (userUtensils.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?ids) { ids };
    };
    callerUtensilIds.values().toArray().map(func(id) { utensils.get(id) }).filter(func(opt) { opt != null }).map(func(opt) { switch (opt) { case (null) { Runtime.trap("Utensil not found") }; case (?utensil) { utensil } } });
  };

  // Recipe Management
  public shared ({ caller }) func addRecipe(name : Text, ingredients : [Text], steps : [Text]) : async Nat {
    let recipe : Recipe = {
      id = nextRecipeId;
      name;
      ingredients;
      steps;
    };

    let callerRecipes = switch (userRecipes.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?existing) { existing };
    };

    recipes.add(nextRecipeId, recipe);
    callerRecipes.add(nextRecipeId);
    userRecipes.add(caller, callerRecipes);
    nextRecipeId += 1;

    recipe.id;
  };

  public shared ({ caller }) func deleteRecipe(id : Nat) : async () {
    if (not recipes.containsKey(id)) {
      Runtime.trap("Recipe does not exist");
    };

    let callerRecipes = switch (userRecipes.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?recipes) {
        if (recipes.isEmpty()) {
          return;
        } else {
          let filteredRecipes = recipes.values().toArray().filter(func(recipeId) { recipeId != id });
          if (filteredRecipes.size() == recipes.size()) {
            return;
          };
          if (filteredRecipes.isEmpty()) {
            let newRecipes = List.empty<Nat>();
            userRecipes.add(caller, newRecipes);
          } else {
            switch (userRecipes.get(caller)) {
              case (null) {};
              case (?recipes) {
                if (recipes.isEmpty()) {
                  let newRecipes = List.empty<Nat>();
                  userRecipes.add(caller, newRecipes);
                } else {
                  userRecipes.add(caller, List.fromArray<Nat>(filteredRecipes));
                };
              };
            };
          };
        };
      };
    };

    recipes.remove(id);
  };

  public query ({ caller }) func getRecipe(id : Nat) : async Recipe {
    switch (recipes.get(id)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) { recipe };
    };
  };

  public query ({ caller }) func getUserRecipes() : async [Recipe] {
    let callerRecipeIds = switch (userRecipes.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?ids) { ids };
    };
    callerRecipeIds.values().toArray().map(func(id) { recipes.get(id) }).filter(func(opt) { opt != null }).map(func(opt) { switch (opt) { case (null) { Runtime.trap("Recipe not found") }; case (?recipe) { recipe } } });
  };

  // Session History
  public shared ({ caller }) func addHistoryEntry(ingredients : [Text], aiResponse : Text) : async () {
    let entry : HistoryEntry = {
      timestamp = Time.now();
      ingredients;
      aiResponse;
    };

    historyList.add(entry);

    while (historyList.size() > 10) {
      switch (historyList.removeLast()) {
        case (null) {};
        case (_) {};
      };
    };
  };

  public query ({ caller }) func getHistory() : async [HistoryEntry] {
    historyList.toArray();
  };
};
