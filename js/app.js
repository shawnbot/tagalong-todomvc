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
   * Our model represents the data structure.
   */
  const model = {
    todos: [],

    get total() {
      return this.todos.length;
    },

    get completed() {
      return this.todos.filter(function(todo) {
        return todo.completed;
      });
    },

    get remaining() {
      return this.total - this.completed.length;
    },

    get nextId() {
      return model.todos.length
        ? model.todos.map(function(todo) { return todo.id; })
            .sort()
            .pop() + 1
        : 1;
    },

    _destroy: function(todo) {
      var index = this.todos.indexOf(todo);
      if (index === -1) {
        throw new Error('no such todo found: ' + todo.id);
      }
      this.todos.splice(index, 1);
    },

    _create: function(text) {
      var todo = {
        id: this.nextId,
        text: text,
        completed: false,
        checked: false,
        editing: false
      };
      this.todos.push(todo);
      return todo;
    }
  };

  const FILTERS = [
    {id: 'all', slug: '', label: 'All'},
    {id: 'active', slug: 'active', label: 'Active'},
    {id: 'completed', slug: 'completed', label: 'Completed'}
  ];

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

  const controller = {

    allChecked: false,

    // the filter function (used in the template)
    filter: 'all',

    get filteredTodos() {
      var filter = FILTERS_BY_ID[this.filter];
      return model.todos.filter(filter);
    },

    // this is a template helper that returns a list of the filters
    // with the `selected` property set to match the current filter
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

    clearCompleted: function() {
      model.completed.forEach(function(todo) {
        model._destroy(todo);
      });
      syncAndRender();
    },

    setChecked: function(todo, checked) {
      todo.completed = checked;
      syncAndRender();
    },

    edit: function(todo) {
      todo.editing = true;
      render();
      var input = document.querySelector('#todo-' + todo.id + ' .edit');
      input.focus();
      input.select();
    },

    destroy: function(todo) {
      model._destroy(todo);
      syncAndRender();
    }
  };

  var todos = localStorage.todos;
  if (todos) {
    model.todos = JSON.parse(todos);
  }

  const sync = function() {
    var todos = model.todos.slice().map(function(todo) {
      return Object.assign({}, todo, {
        checked: false,
        editing: false
      });
    });
    localStorage.todos = JSON.stringify(todos);
  };

  const render = tagalong.render('.todoapp', model, controller)
    .bind(null, model);

  const syncAndRender = function() {
    sync();
    render();
  };

  const hashchange = function() {
    switch (location.hash) {
      case '':
      case '#':
      case '#/':
        controller.filter = 'all';
        break;
      case '#/active':
        controller.filter = 'active';
        break;
      case '#/completed':
        controller.filter = 'completed';
        break;
    }
    render();
  };

  window.addEventListener('hashchange', hashchange);
  if (location.hash) {
    hashchange();
  }

})(window);
