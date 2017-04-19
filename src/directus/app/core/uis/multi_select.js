//  Text Input Core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com
/*jshint multistr: true */

define(['app', 'core/UIComponent', 'core/UIView', 'core/t'], function(app, UIComponent, UIView, __t) {

  'use strict';

  var template = '{{#if cb_list}} \
                    {{#options}} \
                            <input style="margin-top:1px;display: inline-block;" id="multi_select_{{name}}_{{key}}" name="{{key}}" type="checkbox" {{#if selected}}checked{{/if}}/>\
                            <label for="multi_select_{{name}}_{{key}}">{{value}}</label> \
                    {{/options}} \
                  {{else}} \
                    <select multiple> \
                        {{#options}} \
                            <option value="{{key}}" {{#if selected}}selected{{/if}}>{{value}}</option> \
                        {{/options}}</select> \
                  {{/if}} \
                  <input type="hidden" name="{{name}}">';

  var Input = UIView.extend({
    templateSource: template,

    events: {
      'click select': function(e) {
        this.updateValue(true);
      },
      'change input[type=checkbox]': function(e) {
        this.updateValue(false);
      }
    },

    updateValue: function(select) {
      var values, out, i;
      if(select) {
        values = this.$el.find('select').val();
        out = "";
        if(values) {
          for (i=0; i<values.length; i++) {
            out += values[i] + this.options.settings.get('delimiter');
          }
        }
      } else {
        values = this.$el.find('input[type=checkbox]:checked');
        out = "";
        for (i=0; i<values.length; i++) {
          out += $(values[i]).attr('name') + this.options.settings.get('delimiter');
        }
      }

      out = out.substr(0, out.length - 1);
      this.$el.find('input').val(out);
    },

    afterRender: function() {
      if(this.options.value) {
        this.updateValue((this.options.settings.get('type') !== "cb_list"));
      }
    },

    serialize: function() {
      var value = this.options.value || '';
      var values = value.split(this.options.settings.get('delimiter'));
      var options = this.options.settings.get('options');
      var cb_list = this.options.settings.get('type') === "cb_list";

      if (_.isString(options)) {
        options = $.parseJSON(options);
      }

      options = _.map(options, function(value, key) {
        var item = {};
        item.value = value;
        item.key = key;
        item.selected = ($.inArray(item.key, values) !== -1);
        return item;
      });

      return {
        name: this.options.name,
        comment: this.options.schema.get('comment'),
        options: options,
        cb_list: cb_list
      };
    }
  });

  var Component = UIComponent.extend({
    id: 'multi_select',
    dataTypes: ['VARCHAR', 'TEXT'],
    variables: [
      {id: 'type', type: 'String', default_value: 'select_list', ui: 'select', options: {options: {'select_list':__t('select_list'),'cb_list':__t('checkbox_list')} }},
      {id: 'delimiter', type: 'String', default_value: ',', ui: 'textinput', char_length:1, required: true  },
      {id: 'options', type: 'String', default_value: '', ui: 'textarea', options:{'rows': 25}  }
    ],
    Input: Input,
    validate: function(value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return __t('this_field_is_required');
      }
    },
    list: function(options) {
      return (options.value) ? options.value.toString().replace(/<(?:.|\n)*?>/gm, '').substr(0,100) : '';
    }
  });

  return Component;
});
