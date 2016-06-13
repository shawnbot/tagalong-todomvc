(function (window) {
  'use strict';

  const KEY_ENTER = 13;
  // returns a function that only applies the callback if the event's `keyCode`
  // === `KEY_ENTER`.
  const onEnter = function(fn) {
    return function(event) {
      if (event.keyCode === KEY_ENTER) {
        return fn.apply(this, arguments);
      }
    };
  };

  /**
   * our Todo class
   */
  const Todo = function(props) {
    this.completed = false;
    for (var prop in props) {
      this[prop] = props[prop];
    }
    this.editing = false;

    if (this.id > Todo.nextId) {
      Todo.nextId = this.id + 1;
    } else if (!this.id) {
      this.id = Todo.nextId++;
    }
  };

  // the next Todo unique id
  Todo.nextId = 1;

  /**
   * Our model represents the data structure.
   */
  const model = {
    todos: [],

    // get the total number of todos
    get total() {
      return this.todos.length;
    },

    // get the number of remaining (totals - completed) todos
    get remaining() {
      return this.total - this.completed.length;
    },

    // get a filtered list of the completed todos
    get completed() {
      return this.todos.filter(function(todo) {
        return todo.completed;
      });
    },

    _destroy: function(todo) {
      var index = this.todos.indexOf(todo);
      if (index === -1) {
        throw new Error('no such todo found: ' + todo.id);
      }
      this.todos.splice(index, 1);
    },

    _create: function(text) {
      var todo = new Todo({text: text});
      this.todos.push(todo);
      return todo;
    }
  };

  // a list of available filters
  const FILTERS = [
    {id: 'all', slug: '', label: 'All'},
    {id: 'active', slug: 'active', label: 'Active'},
    {id: 'completed', slug: 'completed', label: 'Completed'}
  ];

  // filter functions
  const FILTERS_BY_ID = {
    all: function(todo) {
      return true;
    },
    active: function(todo) {
      return !todo.completed;
    },
    completed: function(todo) {
      return todo.completed;
    }
  };

  // the "all" filter
  const ALL_FILTER = 'all';

  /**
   * our controller exposes all of the app's actions,
   * which update the model and re-render when
   * appropriate.
   */
  const controller = {

    // our flag for whether to select or de-select all
    // todos when the user clicks the "toggle all"
    // button
    allChecked: false,

    // show all todos by default
    filter: ALL_FILTER,

    // get the list of filtered todos
    get filteredTodos() {
      var filter = FILTERS_BY_ID[this.filter];
      return model.todos.filter(filter);
    },

    // get a list of the filters with the `selected`
    // property set to match the current filter
    get filters() {
      return FILTERS.map(function(filter) {
        filter.selected = (filter.id === this.filter);
        return filter;
      }, this);
    },

    // insert a new todo when the user presses the enter key
    insertOnEnter: onEnter(function(event) {
      var text = event.target.value;
      if (text.trim().length) {
        var todo = model._create(text);
        syncAndRender();
      } else {
        console.warn('text is empty:', text);
      }
    }),

    // save the target todo item when the user presses the enter key
    saveOnEnter: onEnter(function(event, todo) {
      todo.text = event.target.value;
      todo.editing = false;
      syncAndRender();
    }),

    // toggle the allChecked property, set the `completed` flag on all of the
    // todos, then sync and render
    toggleAll: function() {
      var checked = (this.allChecked = !this.allChecked);
      model.todos.forEach(function(todo) {
        todo.completed = checked;
      });
      syncAndRender();
    },

    // clear the completed todos, then sync and render
    clearCompleted: function() {
      model.completed.forEach(function(todo) {
        model._destroy(todo);
      });
      syncAndRender();
    },

    // set the checked state of a single todo
    setChecked: function(todo, checked) {
      todo.completed = checked;
      syncAndRender();
    },

    // set the editing flag for a single todo, sync and
    // render, then focus and select its text input
    edit: function(todo) {
      // revert editing on the other elements
      model.todos.forEach(function(todo) {
        todo.editing = false;
      });
      todo.editing = true;
      render();
      var input = document.querySelector('#todo-' + todo.id + ' .edit');
      input.focus();
      input.select();
    },

    // destoy a todo, then sync and render
    destroy: function(todo) {
      model._destroy(todo);
      syncAndRender();
    }
  };

  // look for saved todos in localStorage
  var todos = localStorage.todos;
  if (todos) {
    model.todos = JSON.parse(todos).map(function(props) {
      return new Todo(props);
    });
  }

  // sync the model todos to localStorage
  const sync = function() {
    var todos = model.todos.slice().map(function(todo) {
      return Object.assign({}, todo, {
        checked: false,
        editing: false
      });
    });
    localStorage.todos = JSON.stringify(todos);
  };

  // render and get the render function for future updates
  const render = tagalong.render('.todoapp', model,
                                 controller)
    .bind(null, model);

  // sync and render in one call
  const syncAndRender = function() {
    sync();
    render();
  };

  // a simple hashchange "router"
  const hashchange = function() {
    var match = location.hash.match(/^#\/(\w*)$/);
    if (match && match[1] in FILTERS_BY_ID) {
      controller.filter = match[1];
    } else {
      controller.filter = ALL_FILTER;
    }
    render();
  };

  // update the filter on hashchange
  window.addEventListener('hashchange', hashchange);
  // fire the hashchange handler if there's a hash
  if (location.hash) {
    hashchange();
  }

})(window);
