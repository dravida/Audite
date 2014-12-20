// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("",
                   "");

  // TxtMsg Model
  // ----------

  // Our basic TxtMsg model has `message`, `order`, and `selected` attributes.
  var TxtMsg = Parse.Object.extend("Text", {
    // Default attributes for the txtMsg.
    defaults: {
      message: "",
      selected: false
    },

    // Ensure that each txtMsg created has `message`.
    initialize: function() {
      if (!this.get("message")) {
        this.set({"message": this.defaults.message});
      }
    },

    // Toggle the `selected` state of this txtMsg item.
    toggle: function() {
      this.save({selected: !this.get("selected")});
    }
  });

  // This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });

  // TxtMsg Collection
  // ---------------

  var TxtMsgList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: TxtMsg,

    // Filter down the list of all txtMsg items that are finished.
    selected: function() {
      return this.filter(function(txtMsg){ return txtMsg.get('selected'); });
    },

    // Filter down the list to only txtMsg items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.selected());
    },

    // We keep the TxtMsgs in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // TxtMsgs are sorted by their original insertion order.
    comparator: function(txtMsg) {
      return txtMsg.get('order');
    }

  });

  // TxtMsg Item View
  // --------------

  // The DOM element for a txtMsg item...
  var TxtMsgView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"              : "toggleDone",
      "dblclick label.todo-content" : "edit",
      "click .todo-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The TxtMsgView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a TxtMsg and a TxtMsgView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },

    // Re-render the contents of the txtMsg item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');

      return this;
    },

    // Toggle the `"selected"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the txtMsg.
    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
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

  // The Application
  // ---------------

  // The main view that lets a user manage their txtMsg items
  var ManageTxtMsgsView = Parse.View.extend({

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete",
      "click .log-out": "logOut",
      "click ul#filters a": "selectFilter"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the `TxtMsgs`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllComplete', 'logOut', 'createOnEnter');

      // Main txtMsg management template
      this.$el.html(_.template($("#manage-todos-template").html()));
      
      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      // Create our collection of TxtMsgs
      this.txtMsgs = new TxtMsgList;

      //var text = Parse.Object.extend('Text');
      var query = new Parse.Query(TxtMsg);

      query.select('message', 'selected');
      query.descending("createdAt");
      query.find({
        success: function(results) {
          self.txtMsgs.add(results);
          for (var i = 0; i < results.length; i++) {
            var txtMsg = new TxtMsg({message: results[i].get('message'), selected: results[i].get('selected')});
            self.addOne(txtMsg);
          }
        }
      });

      this.txtMsgs.bind('reset',   this.addAll);
      this.txtMsgs.bind('all',     this.render);

      state.on("change", this.filter, this);
    },

    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new AppView();
      $("#login-button").show();
      this.undelegateEvents();
      delete this;
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var selected = this.txtMsgs.selected().length;
      var remaining = this.txtMsgs.remaining().length;

      this.$('#todo-stats').html(this.statsTemplate({
        total:      this.txtMsgs.length,
        selected:       selected,
        remaining:  remaining
      }));

      this.delegateEvents();

      this.allCheckbox.checked = !remaining;
    },

    // Filters the list based on which type of filter is selected
    selectFilter: function(e) {
      var el = $(e.target);
      var filterValue = el.attr("id");
      state.set({filter: filterValue});
      Parse.history.navigate(filterValue);
    },

    filter: function() {
      var filterValue = state.get("filter");
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#" + filterValue).addClass("selected");
      if (filterValue === "all") {
        this.addAll();
      } else if (filterValue === "completed") {
        this.addSome(function(item) { return item.get('selected') });
      } else {
        this.addSome(function(item) { return !item.get('selected') });
      }
    },

    // Resets the filters to display all txtMsgs
    resetFilters: function() {
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#all").addClass("selected");
      this.addAll();
    },

    // Add a single txtMsg item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(txtMsg) {
      var view = new TxtMsgView({model: txtMsg});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the TxtMsgs collection at once.
    addAll: function(collection, filter) {
      this.$("#todo-list").html("");
      this.txtMsgs.each(this.addOne);
    },

    // Only adds some txtMsgs, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#todo-list").html("");
      this.txtMsgs.chain().filter(filter).each(function(item) { self.addOne(item) });
    },

    // If you hit return in the main input field, create new TxtMsg model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;

      this.txtMsgs.create({
        content: this.input.val(),
        order:   this.txtMsgs.nextOrder(),
        selected:    false,
        user:    Parse.User.current(),
        ACL:     new Parse.ACL(Parse.User.current())
      });

      this.input.val('');
      this.resetFilters();
    },

    // Clear all selected txtMsg items, destroying their models.
    clearCompleted: function() {
      _.each(this.txtMsgs.selected(), function(txtMsg){ txtMsg.destroy(); });
      return false;
    },

    toggleAllComplete: function () {
      var selected = this.allCheckbox.checked;
      this.txtMsgs.each(function (txtMsg) { txtMsg.save({'selected': selected}); });
    }
  });

  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp"
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          new ManageTxtMsgsView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },

    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new ManageTxtMsgsView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(_.escape(error.message)).show();
          self.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });

  var AudienceView = Parse.View.extend({
    el: ".content",
    
    initialize: function() {
      var self = this;
      this.render();

      //var text = Parse.Object.extend('Text');
      var query = new Parse.Query(TxtMsg);

      query.select('message');
      query.equalTo('selected', true);
      query.descending('createdAt');

      query.find({
        success: function(results) {
          for (var i = 0; i < results.length; i++) {
            var txtMsg = new TxtMsg({message: results[i].get('message')});
            self.addOne(txtMsg);
          }
        }
      });
    },

    addOne: function(txtMsg) {
      var view = new TxtMsgView({model: txtMsg});
      this.$("#todo-list").append(view.render().el);
    },

    render: function() {
      this.$el.html(_.template($("#audience-view-template").html()));
    }
  });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#auditeApp"),

    initialize: function() {
      var self = this;
      this.render();

      this.$("#login-button").click(function() {
        $("#login-button").hide();
        new LogInView();
      });
    },

    render: function() {
      if (Parse.User.current()) {
        new ManageTxtMsgsView();
      } else {
        new AudienceView();
      }
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      "active": "active",
      "completed": "completed"
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    },

    active: function() {
      state.set({ filter: "active" });
    },

    completed: function() {
      state.set({ filter: "completed" });
    }
  });

  var state = new AppState;

  new AppRouter;
  new AppView;
  Parse.history.start();
});
