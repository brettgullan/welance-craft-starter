define([
  'app',
  'backbone',
  'core/entries/EntriesCollection',
  'core/t',
  'modules/users/UsersModel'
],

function(app, Backbone, EntriesCollection, __t, UsersModel) {

  return EntriesCollection.extend({

    model: UsersModel,

    getCurrentUser: function() {
      var authenticatedUser = app.authenticatedUserId;
      return this.get(authenticatedUser.id);
    },

    get: function(id) {
      var user = EntriesCollection.__super__.get.call(this, id);
      if (!_.isObject(id) && !user) {
        user = new UsersModel({
          id: id,
          first_name: __t('a_missing_or_removed_user'),
          last_name: ''
        });
      }

      return user;
    },

    initialize: function() {
      EntriesCollection.prototype.initialize.apply(this, arguments);
    }

  });

});
