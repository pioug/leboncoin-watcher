(function($) {
  'use strict';

  window.backgroundTask = {

    results: {},

    start: function() {
      this.getQueries()
        .then(this.executeQueries);
    },

    getQueries: function() {
      var that = this;
      return new Promise(function(resolve, reject) {
        chrome.storage.sync.get(['results', 'queries'], function(data) {
          that.results = data.results || {};
          resolve(data.queries);
        });
      });
    },

    executeQueries: function(queries) {
      queries.forEach(function(query) {
        setInterval(function() {
          $.get(query.url).success(backgroundTask.scrapResults);
        }, 36e5);
      });
    },

    scrapResults: function(page) {
      var articlesElements = $(page).find('.lbc');
      var results = [];
      articlesElements.each(function(index, el) {
        var $el = $(el);
        var temp, article = {};

        article.url = $el.parent().attr('href');
        article.category = $el.find('.category')[0].innerText.trim();
        article.date = $el.find('.date')[0].innerText.trim().replace(/[ ]{2,}/g, '').replace(/\n/g, ' - ');
        article.placement = $el.find('.placement')[0].innerText.trim();

        temp = $el.find('.title')[0];
        article.title = temp.innerText.trim();
        temp = $el.find('.price')[0];
        article.price = temp ? temp.innerText.trim() : null;
        temp = $($el.find('img')[0]);
        if (temp.hasClass('lazy')) {
          temp = temp.attr('data-original');
        } else if (temp[0]) {
          temp = temp[0].src;
        } else {
          temp = null;
        }
        article.imageSrc = temp;

        results.push(article);
      });
      backgroundTask.compareResults(this.url, results);
    },

    compareResults: function(query, results) {
      var that = this;
      if (this.results.hasOwnProperty(query)) {
        results.map(function(result) {
          var isNew = !_.find(that.results[query], { url: result.url });
          if (isNew) {
            that.displayNotification(result);
          }
        });
      }
      this.results[query] = results;
    },

    saveResults: function(query, results) {
      chrome.storage.sync.set({ query: results });
    },

    displayNotification: function(data) {
      var options = {
        type: 'basic',
        title: data.title,
        message: data.price || '',
        iconUrl:  data.imageSrc || 'icon512.png'
      };
      var d = new Date().getTime().toString();
      var notification = chrome.notifications.create(d, options, function() { });
      chrome.notifications.onClicked.addListener(function (id) {
        if (id === d) {
          window.open(data.url);
        }
      });
    }

  };

  backgroundTask.start();

})(jQuery);
