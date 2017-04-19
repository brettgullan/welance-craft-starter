//  Numeric core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com

define([
  'app',
  'underscore',
  'core/UIComponent',
  'core/UIView',
  'core/t'
], function(app, _, UIComponent, UIView, __t) {

  'use strict';

  var template = '<input type="text" value="{{value}}" placeholder="{{placeholder}}" name="{{name}}" id="{{name}}" class="{{size}}" {{#if readonly}}readonly{{/if}}/>';

  var Input = UIView.extend({
    templateSource: template,

    events: {
      'keyup input': 'checkChars',
      'blur input': 'checkChars'
    },

    checkChars: function() {
      var numeric = this.$el.find('input');
      var value = numeric.val();
      value = value.replace(/[^0-9-.]/ig, ""); // @TODO: regex needs to reflect datatype (no "." for INT, etc)
      numeric.val(value);
    },

    serialize: function() {
      var value = '';
      if(!isNaN(this.options.value)) {
        value = this.options.value;
      }

      // Fill in default value
      if (
        this.options.value === undefined &&
        this.options.schema.has('default_value')) {
          value = this.options.schema.get('default_value');
      }

      return {
        value: value,
        name: this.options.name,
        size: this.options.settings.get('size'),
        placeholder: (this.options.settings) ? this.options.settings.get('placeholder_text') : '',
        comment: this.options.schema.get('comment'),
        readonly: !this.options.canWrite
      };
    },

    initialize: function() {
      // this.hasDecimals = (['float', 'decimal', 'numeric'].indexOf(this.options.schema.get('type')) > -1);
    }
  });

  var Component = UIComponent.extend({
    id: 'numeric',
    dataTypes: [
      'TINYINT',
      'SMALLINT',
      'MEDIUMINT',
      'INT',
      'NUMERIC',
      'FLOAT',
      'YEAR',
      'VARCHAR',
      'CHAR',
      'DOUBLE',
      'BIGINT'
    ],
    variables: [
      {id: 'size', type: 'String', default_value: 'large', ui: 'select', options: {options: {'large':__t('size_large'),'medium':__t('size_medium'),'small':__t('size_small')} }},
      {id: 'placeholder_text', type: 'String', default_value: '', ui: 'textinput', char_length:200},
      {id: 'allow_null', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'localized', type: 'Boolean', default_value: true, ui: 'checkbox', comment: __t('numeric_localized_comment')}
    ],
    Input: Input,
    validate: function(value, options) {
      // _.isEmpty (in the installed version) does not support INTs properly
      if (options.schema.isRequired() && value != 0 && !value) {
        return __t('this_field_is_required');
      }
    },
    list: function (options) {
      var value = options.value;

      if (_.isNumber(value)) {
        value = Number(value);

        if (options.settings.get('localized')) {
          value = value.toLocaleString();
        }
      } else {
        value = '<span class="silver">--</span>';
      }

      return value;
    }
  });

  return Component;
});
