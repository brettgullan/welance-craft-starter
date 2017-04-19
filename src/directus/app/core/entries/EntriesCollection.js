define(function(require, exports, module) {

  "use strict";

  var Backbone = require("backbone"),
      ModelHelper = require('helpers/model'),
      Collection = require("core/collection"),
      EntriesModel = require("core/entries/EntriesModel");

  var EntriesCollection = module.exports = Collection.extend({

    model: EntriesModel,

    rowsPerPage: 100,

    toJSON: function(options) {
      options = options || {};
      var result = EntriesCollection.__super__.toJSON.apply(this, [options]);
      if (options.changed) {
        result = _.filter(result, function(obj) { return !_.isEmpty(obj); });
      }
      return options.insideRows === true ? {rows: result} : result;
    },

    getColumns: function() {
      var filters = this.getFilters();
      var columns = [];
      var structure = this.structure;

      if (filters.columns_visible === undefined) {
        columns = structure.pluck('id');
      } else {
        columns = filters.columns_visible;
        // @todo: ensure that this always be an array everywhere.
        if (typeof columns === 'string') {
          columns = columns.split();
        }
      }

      columns = columns.filter(function(column) {
        return structure.get(column) && !structure.get(column).get('hidden_list');
      });

      if (this.preferences) {
        columns = _.intersection(columns, this.preferences.get('columns_visible').split(','));
      }

      return columns;
    },

    getFilter: function(key) {
      return (this.preferences && this.preferences.has(key)) ? this.preferences.get(key) : this.filters[key];
    },

    getFilters: function() {
      var preferences = this.preferences ? this.preferences.toJSON() : {};
      var filters = _.clone(this.filters);

      //Temporary fix to turn columns_visible into an array. @todo: Move this to the preferences object
      if (preferences.hasOwnProperty('columns_visible')) {
        preferences.columns_visible = preferences.columns_visible.split(',');
      }

      var result = _.extend(filters, _.pick(preferences, 'columns_visible', 'sort', 'sort_order', 'status'));

      // preferences normally trump filters, this is an edge case
      // @todo fix the data structure to make this logic less wierd
      if (this.filters.hasOwnProperty('columns_visible')) {
        result.columns_visible = this.filters.columns_visible;
      }

      return result;
    },

    updateActiveCount: function(diff) {
      if(!this.table.has('active')) {
        return;
      }

      switch (this.getFilter('status')) {
        case '1':
          this.table.set({'active': this.table.get('active') - diff});
          break;
        case '2':
          this.table.set({'inactive': this.table.get('inactive') - diff});
          break;
        case '0':
          this.table.set({'trash': this.table.get('trash') - diff});
          break;
      }
    },

    saveAll: function(options) {
      return this.save(this.models, options);
    },

    save: function(models, options) {
      options = options || {};
      var originalURL = this.url;
      var collection = this;
      var method = options.patch ? 'patch' : 'update';
      var success = options.success;

      // if there's not models set
      // get all the collection models
      if (!models) {
        models = collection.models;
      }

      if (method === 'patch') {
        options.attrs = {rows: models.map(function(model) {
          return model.toJSON({changed: true});
        })};
      } else {
        // @note: to support the API expecting a all rows inside rows property.
        options.insideRows = true;
      }

      var sync = function () {
        collection.trigger('sync');
      };

      options.success = function(resp) {
        if (options.wait) {
          sync();
        }

        if (success) {
          success(collection, resp, options);
        }
      };

      this.url += '/bulk';
      var xhr = this.sync(method, this, options);
      this.url = originalURL;
      // @removed we need to wait on success
      // to trigger sync
      // -----------------------------------
      // This was removed due to a issue with sorting
      // On listing page.
      // It will save the sort correctly
      // But it will render with old values
      // but will stay as reference if something happen soon
      // and reveal the reason why it was here.
      // this.trigger('sync');
      // waiting should do the trick :)

      if (!options.wait) {
        sync();
      }

      return xhr;
    },

    destroy: function(models, options) {
      options || (options = {});
      var collection = this;
      var originalURL = this.url;
      var success = options.success;

      if (!models) {
        models = collection.models;
      }

      options.data = JSON.stringify({rows: models});

      var destroy = function() {
        _.each(models, function(model) {
          if (!(model instanceof Backbone.Model)) {
            model = collection.get(model);
          }

          model.trigger('destroy', model, model.collection, options);
        });

        collection.trigger('destroy sync');
      };

      options.success = function(resp) {
        if (options.wait) {
          destroy();
        }

        if (success) {
          success(collection, resp, options);
        }
      };

      this.url += '/bulk';
      this.sync('delete', this, options);
      this.url = originalURL;

      if (!options.wait) {
        destroy();
      }
    },

    destroyAll: function(options) {
      this.destroy(this.toJSON(), options);
    },

    clone: function() {
      var options = {
        table: this.table,
        structure: this.structure,
        privileges: this.privileges,
        rowsPerPage: this.rowsPerPage
      };

      return new this.constructor(this.models, _.extend(options, {
        model: this.model,
        comparator: this.comparator
      }));
    },

    setFilter: function(key, value, options) {
      var attrs, preferencesHasChanged = false;
      if (key === null || typeof key === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = value;
      }
      _.each(attrs, function(value, key) {
        if (this.preferences && this.preferences.has(key)) {
          preferencesHasChanged = true;
          this.preferences.set(key, value, {silent: true});
        } else {
          this.filters[key] = value;
        }
      },this);

      if (preferencesHasChanged) this.preferences.save();
    },

    hasColumn: function(columnName) {
      return this.structure.get(columnName) !== undefined;
    },

    hasPermission: function(permissionType) {
      var permissionLevel = 1;
      var permissionName = permissionType;
      if (permissionType.indexOf('big') === 0) {
        permissionLevel = 2;
        permissionName = permissionType.substr(3);
      }

      if (this.privileges && this.privileges.has('allow_' + permissionName) && permissionLevel <= this.privileges.get('allow_' + permissionName)) {
        return true;
      }

      return false;
    },

    getFieldBlacklist: function(permission) {
      var fieldBlacklist = [];
      if (this.privileges) {
        fieldBlacklist = this.privileges.get(permission + '_field_blacklist') || '';
        fieldBlacklist = fieldBlacklist.split(',');
      }

      return fieldBlacklist;
    },

    can: function(permission) {
      var privileges = this.privileges;
      if (permission.indexOf('allow_') !== 0) {
        permission = 'allow_' + permission;
      }

      return (privileges && this.privileges.get(permission) > 0);
    },

    canView: function() {
      return this.can('view');
    },

    canEdit: function() {
      return this.can('edit');
    },

    canAdd: function() {
      return this.can('add')
    },

    canDelete: function() {
      return this.can('delete');
    },

    getWriteFieldBlacklist: function() {
      return this.getFieldBlacklist('write');
    },

    getReadFieldBlacklist: function() {
      return this.getFieldBlacklist('read');
    },

    isWriteBlacklisted: function(attribute) {
      return _.contains(this.getWriteFieldBlacklist(), attribute);
    },

    isReadBlacklisted: function(attribute) {
      return _.contains(this.getReadFieldBlacklist(), attribute);
    },

    initialize: function(models, options) {
      this.structure = options.structure;
      this.privileges = options.privileges;
      this.table = options.table;

      this.listenTo(this, 'sync', ModelHelper.setIdAttribute);

      if (options.rowsPerPage) this.rowsPerPage = options.rowsPerPage;
      if (options.filters) this.filters = options.filters;

      this.url = options.url || this.table.get('url') + '/rows';

      this.active = this.table.get('active');

      this.filters = _.extend({
        currentPage: 0,
        perPage: this.rowsPerPage,
        sort: 'id',
        sort_order: 'ASC'
      }, this.filters);

      // do we got a sort column?
      // let sort it by that instead please
      if(this.structure.get('sort')) {
        this.filters['sort'] = 'sort';
      }

      this.filters['status'] = '1,2';

      if (options.preferences) {
        this.preferences = options.preferences;
        this.preferences.on('change', function() { this.trigger('change'); }, this);
      }
    },

    getNewInstance: function(options) {
      options = options || {};

      var entriesOptions = {
        structure: this.structure,
        table: this.table,
        privileges: this.privileges,
        url: this.url,
        filters: this.filters,
        preferences: this.preferences
      };

      if (options.omit) {
        entriesOptions = _.omit(entriesOptions, options.omit);
      }

      return new EntriesCollection([], entriesOptions);
    },

    parseHeaders: function(response) {
      if (response.total !== undefined) {
        this.table.set('total', response.total, {silent: true});
      }
      var that = this;
      app.statusMapping.mapping.forEach(function(status) {
        if(response[status.name]) {
          that.table.set(status.name, response[status.name], {silent: true});
        }
      });
    },

    parse: function(response) {
      if (_.isEmpty(response)) return;

      // Parse table headers
      this.parseHeaders(response);

      return response.rows;
    },

    constructor: function EntriesCollection(data, options) {
      EntriesCollection.__super__.constructor.call(this, data, options);
    }

  });

});
