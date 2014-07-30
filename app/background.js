(function($) {
  'use strict';

  var backgroundTask = {

    results: {},
    queries: [],
    pollingTask: null,

    start: function() {
      this.getQueries().then(this.pollResults.bind(this));
      var restart = function(changes, areaName) {
        if (changes.queries) this.restart();
      }.bind(this);
      var clean = function(changes, areaName) {
        if (!changes.queries) return;
        changes.queries.oldValue.map(function(query) {
          delete this.results[query.url];
        }.bind(this));
        chrome.storage.local.set({ results: this.results });
      }.bind(this);
      chrome.storage.onChanged.addListener(clean);
      chrome.storage.onChanged.addListener(restart);
    },

    stop: function() {
      clearInterval(this.pollingTask);
      this.pollingTask = null;
    },

    restart: function() {
      this.stop();
      this.start();
    },

    getQueries: function() {
      return new Promise(function(resolve, reject) {
        chrome.storage.local.get('queries', function(data) {
          this.queries = data.queries || [];
          resolve();
        }.bind(this));
      }.bind(this));
    },

    pollResults: function() {
      this.executeQueries();
      this.pollingTask = setInterval(this.executeQueries.bind(this), 3e5);
    },

    executeQueries: function() {
      this.queries.forEach(function(query) {
        $.get(query.url).success(this.scrapResults.bind(this, query));
      }.bind(this));
    },

    scrapResults: function(query, page) {
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
      this.saveResults(query.url, results);
    },

    saveResults: function(query, results) {
      this.results[query] = results;
      chrome.storage.local.set({ results: this.results });
    }

  };

  backgroundTask.start();

})(jQuery);
