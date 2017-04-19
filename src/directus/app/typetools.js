//@todo: Make vanilla-js (not a require module) and move to vendor folder
define(['moment', 'core/t'], function(moment, __t) {

  "use strict";

  var typetools = {

    numberWithCommas: function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    capitalize: function(string, seperator, keepDirectus) {
      var idIndex;

      if (!string) return '';

      if (seperator === undefined) {
        seperator = "_";
      }

      var directusIndex = string.indexOf("directus_");

      if (directusIndex === 0 && !keepDirectus) {
        string = string.substring(9);
      }

      idIndex = string.lastIndexOf("_id");

      if (string.length > 2 && string.length - idIndex === 3) {
        string = string.substring(0, idIndex);
      }

      var output = _.map(string.split(seperator), function(word) { return word.charAt(0).toUpperCase() + word.slice(1); }).join(' ');

      // Replace all custom capitalization here
      _.each(typetools.caseSpecial, function(correctCase) {
        output = output.replace(new RegExp("\\b"+correctCase+"\\b", "gi"), correctCase);
      });

      // Make all prepositions and conjunctions lowercase, except for the first word
      _.each(typetools.caseLower, function(correctCase) {
        output = output.replace(new RegExp(" "+correctCase+"\\b", "gi"), " "+correctCase);
      });

      return output;
    },

    caseSpecial: [
      'IDs',
      'SSN',
      'EIN',
      'NDA',
      'API',
      'CMS',
      'FAQ',
      'iPhone',
      'iPad',
      'iPod',
      'iOS',
      'iMac',
      'PDF',
      'PDFs',
      'URL',
      'IP',
      'UI',
      'FTP',
      'DB',
      'WYSIWYG',
      'CV',
      'ID',
      'pH',
      'PHP',
      'HTML',
      'JS',
      'CSS',
      'SKU',
      'DateTime',
      'ISO',
      'RNGR',
      'CC',
      'CCV'
    ],

    // Conjunctions and prepositions should be lowercase
    caseLower: [
      'a',
      'an',
      'the',
      'and',
      'of',
      'but',
      'or',
      'for',
      'nor',
      'with',
      'on',
      'at',
      'to',
      'from',
      'by'
    ],

    actionMap: {
      'ADD':    __t('action_added'),
      'DELETE': __t('action_deleted'),
      'UPDATE': __t('action_updated')
    },

    prepositionMap: {
      'ADD':    __t('preposition_to'),
      'DELETE': __t('preposition_from'),
      'UPDATE': __t('preposition_within')
    },

    bytesToSize: function(bytes, precision) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        var posttxt = 0;
        bytes = parseInt(bytes,10);
        if (bytes === 0) return 'n/a';
        while( bytes >= 1024 ) {
            posttxt++;
            bytes = bytes / 1024;
        }
        return bytes.toFixed(precision) + " " + sizes[posttxt];
      },

    seconds_convert: function (s) {
      var m = Math.floor(s/60); //Get remaining minutes
      s = s%60;
      s = (s < 10) ? '0' + s : s;
      return m+":"+s; //zero padding on minutes and seconds
    },

    contextualDate: function(value) {
      if (value === undefined) {
        return '';
      }
      //@todo: convert value to correct timezone
      value = (value.substr(-1).toLowerCase() === 'z') ? value : value + 'z';
      return moment(value).fromNow();
    },

    dateYYYYMMDD: function(date) {
        return date.toISOString().slice(0,10);
    },

    replaceAll: function(find, replace, str) {
      return str.replace(new RegExp(find, 'g'), replace);
    }

  };

  return typetools;
});
