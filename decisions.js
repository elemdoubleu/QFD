// A simple Backbone application to manage decision process.
// Based on a simple todo application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This app uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Criteria Model
  // ----------

  var Criteria = Backbone.Model.extend({

    // Default attributes for the criteria item.
    defaults: function() {
      return {
        title: "empty criteria...",
        order: Criterias.nextOrder(),
		value: 0
      };
    }

  });
  
  // Choice Model
  // ----------

  var Choice = Backbone.Model.extend({

    // Default attributes for the option item.
    defaults: function() {
      return {
        title: "empty option...",
        order: Choices.nextOrder()
      };
    }

  });
  
  // Score Model
  // ----------

  var Score = Backbone.Model.extend({
	  
      // Default attributes for the option item.
      defaults: function() {
        return {
          score: 0
        };
      }

  });

  // Criteria Collection
  // ---------------

  // The collection of criterias is backed by *localStorage* instead of a remote
  // server.
  var CriteriaList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Criteria,

    // Save all of the criteria items under the `"criterias-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("criterias-backbone"),

    // We keep the Criterias in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // sorted by their original insertion order.
    comparator: 'order'

  });
  
  // Criteria Collection
  // ---------------

  // The collection of options is backed by *localStorage* instead of a remote
  // server.
  var ChoicesList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Choice,

    // Save all of the criteria items under the `"options-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("options-backbone"),

    // We keep the Choices in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // sorted by their original insertion order.
    comparator: 'order'

  });
  
  // Score Collection
  // ---------------

  // The collection of scores is backed by *localStorage* instead of a remote
  // server.
  var ScoresList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Score,

    // Save all of the score items under the `"scores-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("scores-backbone"),
	
	comparator: 'choiceId'

  });

  // Create our global collection of **Criterias**.
  var Criterias = new CriteriaList;
  
  // Create our global collection of **Choices**.
  var Choices = new ChoicesList;
  
  // Create our global collection of **Scores**.
  var Scores = new ScoresList;

  // Criteria Item View
  // --------------

  // The DOM element for a criteria item...
  var CriteriaView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#criteria-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
	  "keypress .editval"  : "updateOnEnter"
    },

    // The CriteriaView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Criteria** and a **CriteriaView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the criteria item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
	  this.value = this.$('.editval');
      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the criteria.
    close: function() {
      var input = this.input.val();
	  var value = this.value.val();
      if (!input) {
        this.clear();
      } else {
        this.model.save({title: input, value: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });
  
  // The DOM element for a option item...
  var ChoiceView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#option-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit_choice"  : "updateOnEnter"
    },

    // The ChoiceView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Choice** and a **ChoiceView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the choice item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit_choice');
      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the criteria.
    close: function() {
      var input = this.input.val();
      if (!input) {
        this.clear();
      } else {
        this.model.save({title: input});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });
  
  // The DOM element for a criteria item...
  var ScoreView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#score-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"  : "edit",
      "keypress .edit_score"  : "updateOnEnter"
    },
	

    // The ScoreView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Score** and a **ScoreView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
	
    // Re-render the score item.
    render: function() {  
	  var choice = Choices.findWhere({id: this.model.get('choiceId')});
	  var criteria = Criterias.findWhere({id: this.model.get('criteriaId')});  
	  this.$el.html(this.template({choice: choice.get('title'), criteria: criteria.get('title'), score: this.model.get('score')}));  
      this.input = this.$('.edit_score');
      return this;
    },
	
    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the criteria.
    close: function() {
      var input = this.input.val();
      if (!input) {
        this.clear();
      } else {
        this.model.save({score: input});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
	
  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#criteriaapp"),

    // Delegated events for creating new items
    events: {
      "keypress #new-value":  "createOnEnter",
	  "keypress #new-option": "createChoiceOnEnter",
	  "click #compute": "computeScores"
    },

    // At initialization we bind to the relevant events on the `Criterias`and 'Choices'
    // collections, when items are added or changed. Kick things off by
    // loading any preexisting items that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-criteria");
	  this.value = this.$("#new-value");
	  this.option = this.$("#new-option");

      this.listenTo(Criterias, 'add', this.addOne);
      this.listenTo(Criterias, 'reset', this.addAll);
      this.listenTo(Criterias, 'all', this.render);
	  
	  this.listenTo(Choices, 'add', this.addOneChoice);
	  this.listenTo(Choices, 'reset', this.addAllChoices);
	  this.listenTo(Choices, 'all', this.render);
	  
	  this.listenTo(Scores, 'add', this.addOneScore);
	  this.listenTo(Scores, 'reset', this.addAllScores);
	  this.listenTo(Scores, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');
	  this.main_options = $('#main-options');

      Criterias.fetch();
	  Choices.fetch();
	  Scores.fetch();
	  
    },

    // Re-rendering the App doesn't really do anything.
    render: function() {

      if (Criterias.length || Choices.length) {
        this.main.show();
		this.main_options.show();
        this.footer.show();
      } else {
        this.main.hide();
		this.main_options.hide();
        this.footer.hide();
      }
	  
    },

    // Add a single criteria item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(criteria) {
      var view = new CriteriaView({model: criteria});
      this.$("#criteria-list").append(view.render().el);
    },
	
    // Add a single option item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOneChoice: function(option) {
      var view = new ChoiceView({model: option});
      this.$("#option-list").append(view.render().el);
    },
	
    // Add a single score item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOneScore: function(score) {
      var view = new ScoreView({model: score});
      this.$("#score-list").append(view.render().el);
    },

    // Add all items in the **Criterias** collection at once.
    addAll: function() {
      Criterias.each(this.addOne, this);
    },
	
    // Add all items in the **Choices** collection at once.
    addAllChoices: function() {
      Choices.each(this.addOneChoice, this);
    },
	
    // Add all items in the **Choices** collection at once.
    addAllScores: function() {
      Scores.each(this.addOneScore, this);
    },

    // If you hit return in the main input field, create new **Criteria** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;
	  if (!this.value.val()) return;

      var criteria = Criterias.create({title: this.input.val(), value: this.value.val()});
      this.input.val('');
	  this.value.val('');
	  
	  Choices.each( function(choice) {
		Scores.create({choiceId: choice.id , criteriaId: criteria.id, score: 0 });
	  });
    },
	
    // If you hit return in the create option field, create new **Choice** model,
    // persisting it to *localStorage*.
    createChoiceOnEnter: function(e) {	
      if (e.keyCode != 13) return;
      if (!this.option.val()) return;

      var choice = Choices.create({title: this.option.val()});
      this.option.val('');
	  
	  Criterias.each( function(criteria) {
		Scores.create({choiceId: choice.id , criteriaId: criteria.id, score: 0 });
	  });
	},
	  
	  
	computeScores: function(e) {
  	  Choices.each( function(choice) {
		var scores = Scores.where({choiceId: choice.get('id')});
		var choiceScore = 0;
		console.log('CHOICE: ' + choice.get('title'));
		scores.forEach(function(score) {
			var criteriaId = score.get('criteriaId');
			var criteria = Criterias.findWhere({id: criteriaId}); 
			var weight = criteria.get('value');
			var criteriaScore = weight * score.get('score');
			choiceScore = choiceScore + criteriaScore;
			console.log('criteria: ' + criteria.get('title') + ' weight: ' + weight + " score: " + score.get('score') + ' criteriaScore: ' + criteriaScore + '<br />');
		});	
		console.log('choiceScore: ' + choiceScore)
  	  });
		
	}  
	  
	  
    

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
