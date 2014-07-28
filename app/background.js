(function($) {
  'use strict';

  window.backgroundTask = {

    results: {},
    pollingTasks: [],

    start: function() {
      var that = this;
      this.getQueries().then(this.executeQueries.bind(this));
      var restart = _.debounce(function(changes, areaName) {
        if (changes.queries) that.restart();
      }, 5e3)
      chrome.storage.onChanged.addListener(restart);
    },

    stop: function() {
      this.pollingTasks.map(function(task) {
        clearInterval(task);
      });
      this.pollingTasks = [];
    },

    restart: function() {
      this.stop();
      this.start();
    },

    getQueries: function() {
      var that = this;
      return new Promise(function(resolve, reject) {
        chrome.storage.local.get(['results', 'queries'], function(data) {
          that.results = data.results || {};
          resolve(data.queries);
        });
      });
    },

    executeQueries: function(queries) {
      var that = this;
      queries.forEach(function(query) {
        that.pollingTasks.push(setInterval(function() {
          $.get(query.url).success(backgroundTask.scrapResults);
        }, 36e5));
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
      backgroundTask.saveResults(this.url, results);
    },

    saveResults: function(query, results) {
      this.results[query] = results;
      this.saveResults();
      chrome.storage.local.set({ results: this.results });
    }

  };

  backgroundTask.start();

})(jQuery);
