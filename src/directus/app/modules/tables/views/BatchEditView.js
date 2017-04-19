define([
  'app',
  'backbone',
  'core/directus',
  'core/BasePageView',
  'core/widgets/widgets'
],

function(app, Backbone, Directus, BasePageView, Widgets) {

  return BasePageView.extend({

    headerOptions: {
      route: {
        title: 'Batch Edit'
      },
      leftToolbar: true,
      rightToolbar: true
    },

    leftToolbar: function() {
      this.saveWidget = new Widgets.SaveWidget({widgetOptions: {basicSave: true}});
      this.saveWidget.setSaved(false);
      return [
        this.saveWidget
      ];
    },

    events: {
      'click .saved-success': 'saveConfirm'
    },

    saveConfirm: function() {
      var that = this,
          itemCount = this.batchIds.length;

      app.router.openModal({type: 'confirm', text: 'This will affect ' + itemCount + ' records. Continue?', callback: function() {
        that.save();
      }});
    },

    save: function() {
      var model = this.model,
          itemCount = this.batchIds.length,
          failRequestCount = 0,
          successRequestCount = 0;

      // Serialize the entire form
      var data = this.editView.data();

      // Get an attribute whitelist based on the checkboxes
      var attrWhitelist = $("input[name='batchedit']:checked").map(function() {
        return $(this).data('attr');
      }).toArray();

      // Set data to model inorder to include relationships etc
      model.set(this.model.diff(data));

      // Changed attributes based on whitelist
      var changedAttributes = _.pick(model.toJSON(), attrWhitelist);

      var checkIfDone = function() {
        var totalRequest = successRequestCount + failRequestCount;
        if (totalRequest === itemCount) {
          var route = Backbone.history.fragment.split('/');
          route.pop();
          alert(successRequestCount + " items have been updated. " + failRequestCount + " items failed to update");
          app.router.go(route);
        }
      };

      var success = function() {
        successRequestCount++;
        checkIfDone();
      };

      var error = function() {
        failRequestCount++;
        checkIfDone();
      };

      // Save all batch id's
      _.each(this.batchIds, function(id) {
        var modelToUpdate = model.getNewInstance({collection: model.collection});
        modelToUpdate.set(_.extend(
          {id: id},
          changedAttributes
        ), {parse: true});

        modelToUpdate.save({}, {
          success: success,
          error: error,
          wait: true,
          //patch: true,
          includeRelationships: true,
          validate: false
        });
      });
    },

    afterRender: function() {
      this.setView('#page-content', this.editView);
      this.editView.render();
    },

    initialize: function(options) {
      this.batchIds = options.batchIds;
      this.editView = new Directus.EditView({model: this.model, batchIds: options.batchIds});
      this.headerOptions.route = {title: "Batch Edit (" + this.batchIds.length + ")", breadcrumbs:[{ title: 'Tables', anchor: '#tables'}, {title: this.model.collection.table.id, anchor: "#tables/" + this.model.collection.table.id}]};
    }

  });

});