(function (window) {
  'use strict';

  const KEY_ENTER = 13;
  const onEnter = function(fn) {
    return function(event) {
      if (event.keyCode === KEY_ENTER) {
        return fn.apply(this, arguments);
      }
    };
  };

  const model = {
    todos: [],

    allChecked: false,

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

  const filter = {
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

  const FILTERS = [
    {name: '', label: 'All', op: filter.all},
    {name: 'active', label: 'Active', op: filter.active},
    {name: 'completed', label: 'Completed', op: filter.completed}
  ];

  const controller = {

    filter: filter.all,

    get filters() {
      return FILTERS.map(function(filter) {
        filter.selected = filter.op === this.filter;
        return filter;
      }, this);
    },

    insertOnEnter: onEnter(function(event) {
      var text = event.target.value;
      if (text.trim().length) {
        var todo = model._create(text);
        syncAndRender();
      } else {
        console.warn('text is empty:', text);
      }
    }),

    saveOnEnter: onEnter(function(event, todo) {
      todo.text = event.target.value;
      todo.editing = false;
      syncAndRender();
    }),

    toggleAll: function() {
      var checked = model.allChecked = !model.allChecked;
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
        controller.filter = filter.all;
        break;
      case '#/active':
        controller.filter = filter.active;
        break;
      case '#/completed':
        controller.filter = filter.completed;
        break;
    }
    render();
  };

  window.addEventListener('hashchange', hashchange);
  if (location.hash) {
    hashchange();
  }

})(window);
