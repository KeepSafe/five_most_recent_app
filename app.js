(function() {
  return {
    events: {
      'app.activated':'init',
      'fullUserData.done': 'handleUserResults',
      'requiredProperties.ready': 'getUserData'
    },

    requests: {
      fullUserData: function(userID) {
        return {
          url: helpers.fmt("/api/v2/users/%@/tickets/requested.json?sort_order=desc", userID),
          dataType: 'json'
        };
      }
    },

    init: function(data) {
      if (!data.firstLoad) {
        return;
      }
      _.defer((function() {
        this.trigger('requiredProperties.ready');
      }).bind(this));
    },

    getUserData: function() {
      this.ajax( 'fullUserData', this.ticket().requester().id() );
    },

    handleUserResults: function(data) {
      var lastestFive = _.first(data.tickets, 5).sort(function(a,b) {
        var aID = a.id;
        var bID = b.id;
        return (aID === bID) ? 0 : (aID < bID) ? 1 : -1;
      });
      this.switchTo('lastfive', {
        lastestFiveArr: lastestFive
      });
    },

    safeGetPath: function(propertyPath) {
      return _.inject(propertyPath.split('.'), function(context, segment) {
        if (context == null) { return context; }
        var obj = context[segment];
        if ( _.isFunction(obj) ) { obj = obj.call(context); }
        return obj;
      }, this);
    },

    validateRequiredProperty: function(propertyPath) {
      var value = this.safeGetPath(propertyPath);
      return value != null && value !== '' && value !== 'no';
    }
  };
}());
