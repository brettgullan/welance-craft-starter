//  Text Input Core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com
/*jshint multistr: true */

define(['app', 'handlebars', 'core/UIComponent', 'core/UIView', 'core/overlays/overlays'], function(app, Handlebars, UIComponent, UIView, Overlays) {

  'use strict';

   Handlebars.registerHelper('newlineToBr', function(text){
       return new Handlebars.SafeString(text.string.replace(/\n/g, '<br/>'));
   });

  var template = '<style type="text/css"> \
                  div.ui-thumbnail { \
                    float: left; \
                    margin-top: 8px; \
                    max-height: 200px; \
                    padding: 10px; \
                    background-color: #ffffff; \
                    border: 1px solid #ededed; \
                    -webkit-border-radius:3px; \
                    -moz-border-radius:3px; \
                    border-radius:3px; \
                    color: #ededed; \
                    text-align: center; \
                    cursor: pointer; \
                  } \
                  div.ui-thumbnail.empty { \
                    width: 300px; \
                    height: 100px; \
                    background-color: #ffffff; \
                    border: 2px dashed #ededed; \
                    padding: 9px; \
                    font-size: 16px; \
                    font-weight: 600; \
                    line-height: 100px; \
                  } \
                  div.ui-thumbnail.empty.dragover, \
                  div.ui-thumbnail.empty:hover { \
                    background-color: #fefefe; \
                    border: 2px dashed #cccccc; \
                    cursor: pointer; \
                  } \
                  div.ui-thumbnail img { \
                    max-height: 200px; \
                  } \
                  .wysiwyg-ui iframe { \
                    padding: 0; \
                  } \
                  </style> \
                  <div class="wysiwyg-ui"> \
                    <div id="wysihtml5-toolbar-{{name}}" class="btn-toolbar" style="display: none;"> \
                    <div class="btn-group btn-white btn-group-attached btn-group-action wysiwyg-toolbar active"> \
                      {{#if bold}}<button data-wysihtml5-command="bold" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "bold"}}"><i class="material-icons">format_bold</i></button>{{/if}} \
                      {{#if italic}}<button data-wysihtml5-command="italic" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "italic"}}"><i class="material-icons">format_italic</i></button>{{/if}} \
                      {{#if underline}}<button data-wysihtml5-command="underline" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "underline"}}"><i class="material-icons">format_underlined</i></button>{{/if}} \
                      {{#if strikethrough}}<button data-wysihtml5-command="strikethrough" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "strikethrough"}}"><i class="material-icons">strikethrough_s</i></button>{{/if}} \
                      {{#if h1}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1" type="button" class="btn btn-small btn-silver" data-tag="H1" rel="tooltip" data-placement="bottom" title="H1">H1</button>{{/if}} \
                      {{#if h2}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" type="button" class="btn btn-small btn-silver" data-tag="H2" rel="tooltip" data-placement="bottom" title="H2">H2</button>{{/if}} \
                      {{#if h3}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h3" type="button" class="btn btn-small btn-silver" data-tag="H3" rel="tooltip" data-placement="bottom" title="H3">H3</button>{{/if}} \
                      {{#if h4}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h4" type="button" class="btn btn-small btn-silver" data-tag="H4" rel="tooltip" data-placement="bottom" title="H4">H4</button>{{/if}} \
                      {{#if h5}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h5" type="button" class="btn btn-small btn-silver" data-tag="H5" rel="tooltip" data-placement="bottom" title="H5">H5</button>{{/if}} \
                      {{#if h6}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h6" type="button" class="btn btn-small btn-silver" data-tag="H6" rel="tooltip" data-placement="bottom" title="H6">H6</button>{{/if}} \
                      {{#if blockquote}}<button data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="blockquote" type="button" class="btn btn-small btn-silver" data-tag="Quote" rel="tooltip" data-placement="bottom" title="{{t "quote"}}"><i class="material-icons">format_quote</i></button>{{/if}} \
                      {{#if ul}}<button data-wysihtml5-command="insertUnorderedList" type="button" class="btn btn-small btn-silver" data-tag="UL" rel="tooltip" data-placement="bottom" title="{{t "bullet_list"}}"><i class="material-icons">format_list_bulleted</i></button>{{/if}} \
                      {{#if ol}}<button data-wysihtml5-command="insertOrderedList" type="button" class="btn btn-small btn-silver" data-tag="OL" rel="tooltip" data-placement="bottom" title="{{t "number_list"}}"><i class="material-icons">format_list_numbered</i></button>{{/if}} \
                      {{#if rule}}<button data-wysihtml5-command="insertHTML" data-wysihtml5-command-value="<hr>" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "insert_rule"}}"><i class="material-icons">remove</i></button>{{/if}} \
                      {{#if createlink}} \
                      <button data-wysihtml5-command="createLink" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "create_link"}}"><i class="material-icons">insert_link</i></button> \
                      <div data-wysihtml5-dialog="createLink" style="display: none;z-index:108" class="directus-alert-modal"> \
                        <div class="directus-alert-modal-message">{{t "please_insert_a_link"}}</div> \
                        <input type="text" data-wysihtml5-dialog-field="href" value="http://"> \
                        <div class="directus-alert-modal-buttons"> \
                          <button data-wysihtml5-dialog-action="cancel" type="button">{{t "cancel"}}</button> \
                          <button data-wysihtml5-dialog-action="save" type="button" class="primary">{{t "ok"}}</button> \
                        </div> \
                      </div> \
                      {{/if}} \
                      {{#if insertimage}} \
                        <button data-wysihtml5-command="insertImage" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "insert_image"}}"><i class="material-icons">insert_photo</i></button> \
                        <div data-wysihtml5-dialog="insertImage" style="display: none;z-index:108" class="directus-alert-modal"> \
                          <div><button id="existingFileButton" type="button" class="btn" style="float:none;margin-bottom:10px;background-color: #F4F4F4;font-weight:600;width:100%;border: none;">{{t "choose_existing_file"}}</button></div> \
                          <div style="position:relative;margin-bottom:10px;width:100%;background-color:#F4F4F4;text-align:center;font-weight:600;padding-top:10px;padding-bottom:10px;">{{t "choose_from_computer"}}<input id="fileAddInput" type="file" class="large" style="position:absolute;top:0;left:0;cursor:pointer;opacity:0.0;width:100%;height:100%;z-index:9;" /></div> \
                          <div><input type="text" data-wysihtml5-dialog-field="src" id="insertImageInput" value="http://" style="font-weight:600;"></div> \
                          <div class="directus-alert-modal-buttons"> \
                            <button data-wysihtml5-dialog-action="cancel" type="button">{{t "cancel"}}</button> \
                            <button data-wysihtml5-dialog-action="save" id="insertImageButton" type="button" class="primary">{{t "ok"}}</button> \
                          </div> \
                        </div> \
                      {{/if}} \
                      {{#if embedVideo}} \
                        <button data-wysihtml5-command="embedVideo" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "embed_video"}}"><i class="material-icons">movie</i></button> \
                        <div data-wysihtml5-dialog="embedVideo" style="display: none;z-index:108" class="directus-alert-modal"> \
                          <div><button id="existingLinkButton" type="button" class="btn" style="float:none;margin-bottom:10px;background-color: #F4F4F4;font-weight:600;width:100%;border: none;">{{t "choose_existing_link"}}</button></div> \
                          <div><input type="text" class="videoEmbedWidth" id="embedWidthInput" value="{{embed_width}}" style="font-weight:600;"></div><br/> \
                          <div><input type="text" class="videoEmbedHeight" id="embedHeightInput" value="{{embed_height}}" style="font-weight:600;"></div><br/> \
                          <div><input type="text" class="videoEmbedInput" data-type="youtube" id="insertYoutubeEmbedInput" placeholder="{{t "youtube_video_id"}}" style="font-weight:600;"></div><br/> \
                          <div><input type="text" class="videoEmbedInput" data-type="vimeo" id="insertVimeoEmbedInput" placeholder="{{t "vimeo_video_id"}}" style="font-weight:600;"></div> \
                          <div><input type="hidden"  data-wysihtml5-dialog-field="src" id="insertEmbedInput"></div> \
                          <div><input type="hidden"  data-wysihtml5-dialog-field="data-type" id="insertEmbedInputType"></div> \
                          <div class="directus-alert-modal-buttons"> \
                            <button data-wysihtml5-dialog-action="cancel" type="button">{{t "cancel"}}</button> \
                            <button data-wysihtml5-dialog-action="save" id="insertEmbedButton" type="button" class="primary">{{t "ok"}}</button> \
                          </div> \
                        </div> \
                      {{/if}} \
                      {{#if html}} \
                        <button data-wysihtml5-action="change_view" type="button" class="btn btn-small btn-silver" data-tag="bold" rel="tooltip" data-placement="bottom" title="{{t "toggle_html"}}"><i class="material-icons">code</i></button> \
                      {{/if}} \
                    </div> \
                  </div> \
                  <div style="display:none;z-index:998;position:absolute;width:100%;height:100%;top:-5px;left:-5px;" id="iframe_blocker"></div> \
                  <textarea id="wysihtml5-textarea-{{name}}" class="wysihtml5-style" style="height:{{height}}px" placeholder="{{t "placeholder_enter_your_text"}}" value="{{markupValue}}"></textarea> \
                  <input type="hidden" name="{{name}}" class="hidden_input" value="{{{markupValue}}}">\
                </div>';
  var Input = UIView.extend({
    templateSource: template,

    events: {
      'input textarea' : 'textChanged',
      'change input[type=file]': function(e) {
        var file = $(e.target)[0].files[0];
        var self = this;
        var model = new app.files.model({}, {collection: app.files});
        app.sendFiles(file, function(data) {
          _.each(data, function(item) {
            item[app.statusMapping.status_name] = app.statusMapping.active_num;
            item.id = undefined;
            item.user = self.userId;

            model.save(item, {success: function(e) {
              var url = model.makeFileUrl(false);
              var title = model.attributes.title;
              self.$el.find('#insertImageInput').val(url);
              self.$el.find('input[type=file]').val("");
              self.editor.composer.commands.exec("insertImage", { src: url, alt: title, title: title});
              $('.directus-alert-modal').addClass('hide'); //  manually close modal
            }});
          });
        });
      },
      'click #existingFileButton': function(e) {
        var collection = app.files;
        var model;
        var fileModel = new app.files.model({}, {collection: collection});
        collection.fetch();
        var view = new Overlays.ListSelect({collection: collection, selectable: false});
        app.router.overlayPage(view);
        var self = this;

        view.itemClicked = function(e) {
          var id = $(e.target).closest('tr').attr('data-id');
          model = collection.get(id);
          app.router.removeOverlayPage(this);
          var url = model.makeFileUrl(false);
          var title = model.attributes.title;
          self.editor.composer.commands.exec("insertImage", { src: url, alt: title, title: title});
          $('.directus-alert-modal').addClass('hide'); //  manually close modal
        };
      },
      'click #existingLinkButton': function(e) {
        var collection = app.files;
        var model;
        var fileModel = new app.files.model({}, {collection: collection});
        collection.setFilter('adv_search', [{id:'type',type:'like',value:'embed/'}]);
        collection.fetch();
        var view = new Overlays.ListSelect({collection: collection, selectable: false});
        app.router.overlayPage(view);
        var self = this;

        view.itemClicked = function(e) {
          var id = $(e.target).closest('tr').attr('data-id');
          model = collection.get(id);
          app.router.removeOverlayPage(this);
          if(model.get('type') === "embed/youtube" || model.get('type') === "embed/vimeo" ) {
            var url = model.get('url');

            if(model.get('type') === "embed/vimeo") {
              self.$el.find('#insertEmbedInputType').val('vimeo');
            } else {
              self.$el.find('#insertEmbedInputType').val('youtube');
            }

            self.$el.find('#insertEmbedInput').val(url);
            self.$el.find('#insertEmbedButton').click();
          }
        };
      },
      'change .videoEmbedInput': function(e) {
        var target = $(e.target);

        if(target.val()) {
          this.$el.find('#insertEmbedInput').val(target.val());
          this.$el.find('#insertEmbedInputType').val(target.attr('data-type'));
        }
      }
    },

    textChanged: function(view) {
      if(view.editor){
        try {
          view.$('.hidden_input').val(view.editor.getValue());
        } catch (err){
          console.error(err.message);
        }
      }
    },

    serialize: function() {
      var length = this.options.schema.get('char_length');
      var value = this.options.value || '';

      return {
        height: this.options.settings.get('height'),
        bold: (this.options.settings.get('bold') === true),
        italic: (this.options.settings.get('italic') === true),
        underline: (this.options.settings.get('underline') === true),
        strikethrough: (this.options.settings.get('strikethrough') === true),
        rule: (this.options.settings.get('rule') === true),
        h1: (this.options.settings.get('h1') === true),
        h2: (this.options.settings.get('h2') === true),
        h3: (this.options.settings.get('h3') === true),
        h4: (this.options.settings.get('h4') === true),
        h5: (this.options.settings.get('h5') === true),
        h6: (this.options.settings.get('h6') === true),
        blockquote: (this.options.settings.get('blockquote') === true),
        ul: (this.options.settings.get('ul') === true),
        ol: (this.options.settings.get('ol') === true),
        orderedList: (this.options.settings.get('orderedList') === true),
        createlink: (this.options.settings.get('createlink') === true),
        insertimage: (this.options.settings.get('insertimage') === true),
        embedVideo: (this.options.settings.get('embedVideo') === true),
        embed_width: this.options.settings.get('embed_width'),
        embed_height: this.options.settings.get('embed_height'),
        html: (this.options.settings.get('html') === true),
        markupValue: String(value).replace(/"/g, '&quot;'),
        value: new Handlebars.SafeString(value),
        name: this.options.name,
        maxLength: length,
        characters: length - value.length
      };
    },

    initialize: function() {
      this.userId = app.users.getCurrentUser().id;
    },

    afterRender: function() {
      var that = this;
      $.ajax({
        url: window.location.origin + window.directusData.path +"assets/js/libs/wysihtml5.js",
        dataType: "script",
        success: function() {
          that.initEditor();
        }
      });
    },

    initEditor: function() {
      var that = this;
      var isReadOnly = this.options.settings.get('readonly') === true;
      this.editor = new wysihtml5.Editor("wysihtml5-textarea-" + this.options.name, { // id of textarea element
        toolbar:      !isReadOnly ? "wysihtml5-toolbar-" + this.options.name : null, // id of toolbar element
        stylesheets: app.PATH + "assets/css/wysiwyg.css",
        parserRules:  wysihtml5ParserRules // defined in parser rules set
      });
      var value = this.options.value || '';
      this.editor.setValue(String(value).replace(/"/g, '&quot;'));
      this.editor.on('change', function() {
        that.textChanged(that);
      });
      this.editor.on('load', function() {
        if (that.options.settings.get('readonly') === true) {
          that.editor.disable();
        }
      });

      var timer;
      var $dropzone = this.$el;
      var self = this;
      var model = new app.files.model({}, {collection: app.files});
      $dropzone.on('dragover', function(e) {
        self.$el.find('#iframe_blocker').show();
        clearInterval(timer);
        e.stopPropagation();
        e.preventDefault();
        $dropzone.addClass('dragover');
      });

      $dropzone.on('dragleave', function(e) {
        clearInterval(timer);
        timer = setInterval(function(){
          self.$el.find('#iframe_blocker').hide();
          $dropzone.removeClass('dragover');
          clearInterval(timer);
        },50);
      });


      $dropzone[0].ondrop = _.bind(function(e) {
        e.stopPropagation();
        e.preventDefault();
        self.$el.find('#iframe_blocker').hide();
        if (e.dataTransfer.files.length > 1) {
          alert('One file only please');
          return;
        }
        this.editor.focus();
        app.sendFiles(e.dataTransfer.files, function(data) {
          _.each(data, function(item) {
            item[app.statusMapping.status_name] = app.statusMapping.status_num;
            item.id = undefined;
            item.user = self.userId;

            model.save(item, {success: function(e) {
              var url = model.makeFileUrl(false);
              try {
                self.editor.composer.commands.exec("insertImage", { src: url, alt: model.get('title'), title: model.get('title')});
              } catch(ex) {}

            }});
          });
        });
        $dropzone.removeClass('dragover');
      }, this);

      this.$el.find('.wysihtml5-sandbox').contents().find('body').on('dragover', function(e) {
        self.$el.find('#iframe_blocker').show();
      });

      wysihtml5.commands.embedVideo = {
        exec: function(composer, command, value) {
          var doc   = composer.doc,
                      image;

          var width = that.$el.find('#embedWidthInput').val();
          var height = that.$el.find('#embedHeightInput').val();

          image = doc.createElement("iframe");
          image.setAttribute('width', width);
          image.setAttribute('height', height);
          image.setAttribute('frameborder', '0');
          image.setAttribute('allowfullscreen', '1');

          var type = "youtube";
          if(value['data-type']) {
            type = value['data-type'];
          }

          for (var i in value) {
            if(i === "src") {
              if(type === 'youtube') {
                value[i] = "//youtube.com/embed/" + value[i];
              } else {
                value[i] = "//player.vimeo.com/video/" + value[i] + "?title=0&amp;byline=0&amp;portrait=0&amp;color=c9ff23";
              }
            }
            if(i === "data-type") {
              continue;
            }
            image.setAttribute(i === "className" ? "class" : i, value[i]);
          }

          composer.selection.insertNode(image);
          composer.selection.setAfter(image);

          that.textChanged(that);
        },
      };

      wysihtml5.commands.createLink.triggerEvent = function() {
        that.textChanged(that);
      };

      this.editor.on('aftercommand:composer', function() {
        that.textChanged(that);
      });
    }
  });

  var Component = UIComponent.extend({
    id: 'wysiwyg',
    dataTypes: ['VARCHAR', 'TEXT'],
    variables: [
      // Disables editing of the field while still letting users see the value
      {id: 'readonly', type: 'Boolean', default_value: false, ui: 'checkbox'},
      // The input's height in pixels before scrolling. Default: 500px
      {id: 'height', type: 'Number', default_value: 500, ui: 'numeric'},
      {id: 'bold', type: 'Boolean', default_value: true, ui: 'checkbox'},
      {id: 'italic', type: 'Boolean', default_value: true, ui: 'checkbox'},
      {id: 'underline', type: 'Boolean', default_value: true, ui: 'checkbox'},
      {id: 'strikethrough', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'rule', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'createlink', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'insertimage', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'embedVideo', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'embed_width', type: 'Number', default_value: 300, ui: 'numeric'},
      {id: 'embed_height', type: 'Number', default_value: 200, ui: 'numeric'},
      {id: 'html', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'orderedList', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h1', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h2', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h3', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h4', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h5', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'h6', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'blockquote', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'ul', type: 'Boolean', default_value: false, ui: 'checkbox'},
      {id: 'ol', type: 'Boolean', default_value: false, ui: 'checkbox'}
    ],
    Input: Input,
    validate: function(value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return 'This field is required';
      }
    },
    list: function(options) {
      return (options.value) ? options.value.toString().replace(/(<([^>]+)>)/ig, '').substr(0,100) : '';
    }
  });

  return Component;
});




var wysihtml5ParserRules = {
    /**
     * CSS Class white-list
     * Following CSS classes won't be removed when parsed by the wysihtml5 HTML parser
     */
    "classes": {
        "wysiwyg-clear-both": 1,
        "wysiwyg-clear-left": 1,
        "wysiwyg-clear-right": 1,
        "wysiwyg-color-aqua": 1,
        "wysiwyg-color-black": 1,
        "wysiwyg-color-blue": 1,
        "wysiwyg-color-fuchsia": 1,
        "wysiwyg-color-gray": 1,
        "wysiwyg-color-green": 1,
        "wysiwyg-color-lime": 1,
        "wysiwyg-color-maroon": 1,
        "wysiwyg-color-navy": 1,
        "wysiwyg-color-olive": 1,
        "wysiwyg-color-purple": 1,
        "wysiwyg-color-red": 1,
        "wysiwyg-color-silver": 1,
        "wysiwyg-color-teal": 1,
        "wysiwyg-color-white": 1,
        "wysiwyg-color-yellow": 1,
        "wysiwyg-float-left": 1,
        "wysiwyg-float-right": 1,
        "wysiwyg-font-size-large": 1,
        "wysiwyg-font-size-larger": 1,
        "wysiwyg-font-size-medium": 1,
        "wysiwyg-font-size-small": 1,
        "wysiwyg-font-size-smaller": 1,
        "wysiwyg-font-size-x-large": 1,
        "wysiwyg-font-size-x-small": 1,
        "wysiwyg-font-size-xx-large": 1,
        "wysiwyg-font-size-xx-small": 1,
        "wysiwyg-text-align-center": 1,
        "wysiwyg-text-align-justify": 1,
        "wysiwyg-text-align-left": 1,
        "wysiwyg-text-align-right": 1
    },
    "tags": {
        "tr": {
            "add_class": {
                "align": "align_text"
            }
        },
        "strike": 1,
        // "strike": {
        //     "remove": 1
        // },
        "form": {
            "rename_tag": "div"
        },
        "rt": {
            "rename_tag": "span"
        },
        "code": {},
        "acronym": {
            "rename_tag": "span"
        },
        "br": {
            "add_class": {
                "clear": "clear_br"
            }
        },
        "details": {
            "rename_tag": "div"
        },
        "h4": {
            "add_class": {
                "align": "align_text"
            }
        },
        "em": {},
        "title": {
            "remove": 1
        },
        "multicol": {
            "rename_tag": "div"
        },
        "figure": {
            "rename_tag": "div"
        },
        "xmp": {
            "rename_tag": "span"
        },
        "small": {
            "rename_tag": "span",
            "set_class": "wysiwyg-font-size-smaller"
        },
        "area": {
            "remove": 1
        },
        "time": {
            "rename_tag": "span"
        },
        "dir": {
            "rename_tag": "ul"
        },
        "bdi": {
            "rename_tag": "span"
        },
        "command": {
            "remove": 1
        },
        "ul": {},
        "progress": {
            "rename_tag": "span"
        },
        "dfn": {
            "rename_tag": "span"
        },
        "figcaption": {
            "rename_tag": "div"
        },
        "a": {
            "check_attributes": {
                "href": "url" // if you compiled master manually then change this from 'url' to 'href'
            },
            "set_attributes": {
                "rel": "nofollow",
                "target": "_blank"
            }
        },
        "img": {
            "check_attributes": {
                "width": "numbers",
                "alt": "alt",
                "src": "url", // if you compiled master manually then change this from 'url' to 'src'
                "height": "numbers"
            },
            "add_class": {
                "align": "align_img"
            }
        },
         "iframe": {
            "check_attributes": {
                "width": "numbers",
                "src": "url",
                "height": "numbers",
                "frameborder": "numbers"
            },
            "set_attributes": {
              "frameborder": "0",
              "allowfullscreen": ""
            }
        },
        "rb": {
            "rename_tag": "span"
        },
        "footer": {
            "rename_tag": "div"
        },
        "noframes": {
            "remove": 1
        },
        "abbr": {
            "rename_tag": "span"
        },
        "u": 1,
        "bgsound": {
            "remove": 1
        },
        "sup": {
            "rename_tag": "span"
        },
        "address": {
            "rename_tag": "div"
        },
        "basefont": {
            "remove": 1
        },
        "nav": {
            "rename_tag": "div"
        },
        "h1": {
            "add_class": {
                "align": "align_text"
            }
        },
        "head": {
            "remove": 1
        },
        "tbody": {
            "add_class": {
                "align": "align_text"
            }
        },
        "dd": {
            "rename_tag": "div"
        },
        "s": 1,
        // "s": {
        //     "rename_tag": "span"
        // },
        "li": {},
        "td": {
            "check_attributes": {
                "rowspan": "numbers",
                "colspan": "numbers"
            },
            "add_class": {
                "align": "align_text"
            }
        },
        "object": {
            "remove": 1
        },
        "div": {
            "add_class": {
                "align": "align_text"
            }
        },
        "option": {
            "rename_tag": "span"
        },
        "select": {
            "rename_tag": "span"
        },
        "i": {},
        "track": {
            "remove": 1
        },
        "wbr": {
            "remove": 1
        },
        "fieldset": {
            "rename_tag": "div"
        },
        "big": {
            "rename_tag": "span",
            "set_class": "wysiwyg-font-size-larger"
        },
        "button": {
            "rename_tag": "span"
        },
        "noscript": {
            "remove": 1
        },
        "svg": {
            "remove": 1
        },
        "input": {
            "remove": 1
        },
        "table": {},
        "keygen": {
            "remove": 1
        },
        "h5": {
            "add_class": {
                "align": "align_text"
            }
        },
        "meta": {
            "remove": 1
        },
        "map": {
            "rename_tag": "div"
        },
        "isindex": {
            "remove": 1
        },
        "mark": {
            "rename_tag": "span"
        },
        "caption": {
            "add_class": {
                "align": "align_text"
            }
        },
        "tfoot": {
            "add_class": {
                "align": "align_text"
            }
        },
        "base": {
            "remove": 1
        },
        "video": {
            "remove": 1
        },
        "strong": {},
        "canvas": {
            "remove": 1
        },
        "output": {
            "rename_tag": "span"
        },
        "marquee": {
            "rename_tag": "span"
        },
        "b": {},
        "q": {
            "check_attributes": {
                "cite": "url"
            }
        },
        "applet": {
            "remove": 1
        },
        "span": {},
        "rp": {
            "rename_tag": "span"
        },
        "spacer": {
            "remove": 1
        },
        "source": {
            "remove": 1
        },
        "aside": {
            "rename_tag": "div"
        },
        "frame": {
            "remove": 1
        },
        "section": {
            "rename_tag": "div"
        },
        "body": {
            "rename_tag": "div"
        },
        "ol": {},
        "nobr": {
            "rename_tag": "span"
        },
        "html": {
            "rename_tag": "div"
        },
        "summary": {
            "rename_tag": "span"
        },
        "var": {
            "rename_tag": "span"
        },
        "del": {
            "remove": 1
        },
        "blockquote": {
            "check_attributes": {
                "cite": "url"
            }
        },
        "style": {
            "remove": 1
        },
        "device": {
            "remove": 1
        },
        "meter": {
            "rename_tag": "span"
        },
        "h3": {
            "add_class": {
                "align": "align_text"
            }
        },
        "textarea": {
            "rename_tag": "span"
        },
        "embed": {
            "remove": 1
        },
        "hgroup": {
            "rename_tag": "div"
        },
        "font": {
            "rename_tag": "span",
            "add_class": {
                "size": "size_font"
            }
        },
        "tt": {
            "rename_tag": "span"
        },
        "noembed": {
            "remove": 1
        },
        "thead": {
            "add_class": {
                "align": "align_text"
            }
        },
        "blink": {
            "rename_tag": "span"
        },
        "plaintext": {
            "rename_tag": "span"
        },
        "xml": {
            "remove": 1
        },
        "h6": {
            "add_class": {
                "align": "align_text"
            }
        },
        "param": {
            "remove": 1
        },
        "th": {
            "check_attributes": {
                "rowspan": "numbers",
                "colspan": "numbers"
            },
            "add_class": {
                "align": "align_text"
            }
        },
        "legend": {
            "rename_tag": "span"
        },
        "hr": {},
        "label": {
            "rename_tag": "span"
        },
        "dl": {
            "rename_tag": "div"
        },
        "kbd": {
            "rename_tag": "span"
        },
        "listing": {
            "rename_tag": "div"
        },
        "dt": {
            "rename_tag": "span"
        },
        "nextid": {
            "remove": 1
        },
        "pre": {},
        "center": {
            "rename_tag": "div",
            "set_class": "wysiwyg-text-align-center"
        },
        "audio": {
            "remove": 1
        },
        "datalist": {
            "rename_tag": "span"
        },
        "samp": {
            "rename_tag": "span"
        },
        "col": {
            "remove": 1
        },
        "article": {
            "rename_tag": "div"
        },
        "cite": {},
        "link": {
            "remove": 1
        },
        "script": {
            "remove": 1
        },
        "bdo": {
            "rename_tag": "span"
        },
        "menu": {
            "rename_tag": "ul"
        },
        "colgroup": {
            "remove": 1
        },
        "ruby": {
            "rename_tag": "span"
        },
        "h2": {
            "add_class": {
                "align": "align_text"
            }
        },
        "ins": {
            "rename_tag": "span"
        },
        "p": {
            "add_class": {
                "align": "align_text"
            }
        },
        "sub": {
            "rename_tag": "span"
        },
        "comment": {
            "remove": 1
        },
        "frameset": {
            "remove": 1
        },
        "optgroup": {
            "rename_tag": "span"
        },
        "header": {
            "rename_tag": "div"
        }
    }
};
