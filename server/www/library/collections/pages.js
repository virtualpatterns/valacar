var pagesPrototype = Object.create([]);

pagesPrototype.addToTop = function(page) {
  this.unshift(page);
};

pagesPrototype.removeFromTop = function() {
  return this.shift();
};

pagesPrototype.top = function() {
  return this[0];
};

pagesPrototype.isNotEmpty = function() {
  return this.length > 0;
};

pagesPrototype.isNotAlmostEmpty = function() {
  return this.length > 1;
};

var Pages = Object.create(Array);

Pages.createPages = function(prototype) {
  return Object.create(prototype || pagesPrototype);
};

Pages.isPages = function(pages) {
  return pagesPrototype.isPrototypeOf(pages);
};

Pages.getPagesPrototype = function() {
  return pagesPrototype;
};

module.exports = Pages;
