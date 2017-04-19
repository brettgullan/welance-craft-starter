define([
  "app",
  "backbone",
  'handlebars',
  "core/directus",
  'core/BasePageView',
  'core/widgets/widgets',
  'core/t',
  'moment'
],

function(app, Backbone, Handlebars, Directus, BasePageView, Widgets, __t, moment) {

  "use strict";

  var BodyView = Backbone.Layout.extend({

    tagName: 'span',

    events: {
      'click .header-image, .primary-info': function(e) {
        var id = $(e.target).closest('li.card').attr('data-id');
        var user = app.users.getCurrentUser();
        var userGroup = user.get('group');

        //@todo fix this so it respects ACL instead of being hardcoded
        if (!(parseInt(id,10) === user.id || userGroup.id === 1)) {
          return;
        }

        app.router.go('#users', id);
      }
    },

    template: Handlebars.compile(
      '{{#groups}}' +
      '<div class="section-header"><span class="big-label-text">{{title}}</div>' +
      '<ul class="cards row">' +
      '{{#rows}}' +
      '<li class="card card-shadow col-2 gutter-bottom {{#if online}}active{{/if}} {{#if inactive}}inactive{{/if}}" data-id="{{id}}" data-cid="{{cid}}">' +
        '<div class="header-image add-color-border rounded-corners">' +
          '{{avatar}} <div class="tool-item large-circle"><i class="material-icons">edit</i></div></div>' +
        '<div class="info rounded-corners">' +
          '<div class="featured">' +
            '<div class="primary-info">' +
              '<div>{{first_name}}</div>' +
              '<div>{{last_name}}</div>' +
            '</div>' +
            '<div title="{{position}}" class="secondary-info ellipsis">{{#if position}}{{position}}{{else}}<span class="secondary-info">--</span>{{/if}}</div>' +
          '</div>' +
          '<ul class="extra">' +
            '<li title="{{location}}">{{#if location}}{{location}}{{else}}<span class="secondary-info">--</span>{{/if}}<span class="icon icon-home"></span></li>' +
            '<li title="{{phone}}">{{#if phone}}{{phone}}{{else}}<span class="secondary-info">--</span>{{/if}}<span class="icon icon-phone"></span></li>' +
            '<li title="{{email}}">{{#if email}}<a href="mailto:{{email}}" target="_blank">{{email}}</a>{{else}}<span class="secondary-info">--</span>{{/if}}<span class="icon icon-mail"></span></li>' +
          '</ul>' +
        '</div>' +
      '</li>' +
      '{{/rows}}</ul>{{/groups}}' +
      '{{#unless groups}}' +
        '<div class="nothing-here secondary-info">' +
        '<h1>{{t "listing_items_not_found"}}</h1>' +
        '<!-- Maybe add a new file? -->' +
        '</div>' +
      '{{/unless}}'
    ),

    serialize: function() {
      var rows = this.collection.map(function(model) {

        var data = {
          "id": model.get('id'),
          "cid": model.cid,
          'avatar': model.getAvatar(),
          'avatar_file_id': model.get('avatar_file_id'),
          'first_name': model.get('first_name'),
          'last_name': model.get('last_name'),
          'email': model.get('email'),
          'position': model.get('position'),
          'location': model.get('location'),
          'phone': model.get('phone'),
          'online': (moment(model.get('last_access')).add('m', 5) > moment()),
          'group_id': model.get('group').id,
          'group_name': model.get('group').get('name'),
          'inactive': false
        };

        // Put non-active users into the Inactive Group.
        var hasStatusColumn = model.has(app.statusMapping.status_name);
        var statusValue = model.get(app.statusMapping.status_name);
        if (hasStatusColumn && statusValue !== app.statusMapping.active_num) {
          data.group_id = 0;
          data.group_name = 'Inactive';
          data.inactive = true;
        }

        var avatarSmall = model.getAvatar();

        data.avatar = new Handlebars.SafeString('<img src="' + avatarSmall + '" style="width:200px;height:200px"/>');

        return data;
      });

      rows = _(rows).sortBy('first_name');

      var groupedData = [];

      rows.forEach(function(group) {
        if(!groupedData["group_" + group.group_id]) {
          groupedData["group_" + group.group_id] = {title: group.group_name, rows: []};
        }
        groupedData["group_" + group.group_id].rows.push(group);
      });

      var data = [];

      for(var group in groupedData) {
        // skip inactive group
        // and push it at the end
        if (group !== 'group_0') {
          data.push(groupedData[group]);
        }
      }

      // if exists, push inactive users group at the end
      if (_.has(groupedData, 'group_0')) {
        data.push(groupedData['group_0']);
      }

      return {groups: data};
    },

    initialize: function(options) {
      this.collection.on('sort', this.render, this);
      this.listenTo(this.collection, 'sync', function(model, resp, options) {
        if (options.silent) return;
        this.render();
      });
    }

  });

  var ListBodyView = Backbone.Layout.extend({

    tagName: 'tbody',

    template: Handlebars.compile(
      '{{#rows}}' +
      '<tr data-id="{{id}}" data-cid="{{cid}}">' +
      '<td>{{avatar}}</td>' +
      '<td>{{first_name}}</td>' +
      '<td>{{last_name}}</td>' +
      '<td>{{email}}</td>' +
      '<td>{{position}}</td>' +
      '<td>{{last_access}}</td>' +
      '</tr>' +
      '{{/rows}}'
    ),

    serialize: function() {
      var rows = this.collection.map(function(model) {

        var data = {
          "id": model.get('id'),
          "cid": model.cid,
          'avatar': model.getAvatar(),
          'first_name': model.get('first_name'),
          'last_name': model.get('last_name'),
          'email': model.get('email'),
          'position': model.get('position'),
          'last_access': model.get('last_access')
        };

        if (data.avatar !== null) {
            //@todo this is a hack, maybe change avatar so it only includes a hash?
            var avatarSmall = data.avatar.replace('?s=100','?s=50');
            data.avatar = new Handlebars.SafeString('<img src="' + avatarSmall + '" style="max-width:none!important;"/>');
        }

        return data;

      });

      return {rows: rows};
    },

    initialize: function(options) {
      this.collection.on('sort', this.render, this);
    }

  });


  var ListView = Directus.Table.extend({

    TableBody: ListBodyView,

    navigate: function(id) {
      var user = app.users.getCurrentUser();
      var userGroup = user.get('group');

      //@todo fix this so it respects ACL instead of being hardcoded
      if (!(parseInt(id,10) === user.id || userGroup.id === 1)) {
        return;
      }

      app.router.go('#users', id);
    }
  });


  var View = BasePageView.extend({

    headerOptions: {
      route: {
        title: __t('users'),
      }
    },
    leftToolbar: function() {
      if(app.users.getCurrentUser().get('group').id === 1) {
        return [
          new Widgets.ButtonWidget({widgetOptions: {buttonId: "addBtn", iconClass: "add", buttonClass: "", buttonText: __t('new_user')}})
        ];
      }
      return [];
    },
    rightToolbar: function() {
      return [
        //new Widgets.SearchWidget(),
        //new Widgets.ButtonWidget({widgetOptions: {active: this.viewList, buttonId: "listBtn", iconClass: "icon-list"}}),
        //new Widgets.ButtonWidget({widgetOptions: {active: !this.viewList, buttonId: "gridBtn", iconClass: "icon-layout"}})
      ];
    },
    leftSecondaryToolbar: function() {
      if(!this.widgets.visibilityWidget) {
        this.widgets.visibilityWidget = new Widgets.VisibilityWidget({collection: this.collection, basePage: this});
      }
      if(!this.widgets.filterWidget) {
        this.widgets.filterWidget = new Widgets.FilterWidget({collection: this.collection, basePage: this});
      }

      return [this.widgets.visibilityWidget, this.widgets.filterWidget];
    },
    events: {
      'click #addBtn': function() {
        app.router.go('#users','new');
      },
      'click #gridBtn': function() {
        if(this.viewList) {
          this.viewList = false;
          $('#listBtn').parent().removeClass('active');
          $('#gridBtn').parent().addClass('active');
          this.table = new BodyView({collection:this.collection});
          this.render();
        }
      },
      'click #listBtn': function() {
        if(!this.viewList) {
          this.viewList = true;
          $('#listBtn').parent().addClass('active');
          $('#gridBtn').parent().removeClass('active');
          this.table = new ListView({collection:this.collection, selectable: false});
          this.render();
        }
      }
    },

    afterRender: function() {
      this.setView('#page-content', this.table);
      var status = this.collection.preferences.get('status');
      // Ignore preferences and get all users
      // @todo: make a better solution
      this.collection.preferences.unset('status');
      this.collection.filters['status'] = '0,1,2';
      this.collection.fetch();
      this.collection.preferences.set('status', status);
    },

    initialize: function() {
      this.viewList = false;
      this.table = new BodyView({collection:this.collection});
      this.widgets = [];
    }
  });


  return View;

});
