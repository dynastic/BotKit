"use strict";
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.alt = function (alt) {
    return this.trim().length > 1 ? this : alt;
};
String.prototype.equalsIgnoreCase = function (str) {
    return this.toLowerCase() === str.toLowerCase();
};
Array.prototype.insert = function (index, items) {
    for (let i = index; i < index + items.length; i++) {
        this[i] = items[i - index];
    }
};
Array.prototype.remove = function (o) {
    const index = this.indexOf(o);
    if (index === -1)
        return this;
    this.splice(index, 1);
    return o;
};
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.dedupe = function () {
    return this.filter((value, index, arr) => arr.indexOf(value) === index);
};
Array.prototype.duplicates = function () {
    return this.filter((value, index, arr) => arr.indexOf(value) !== index);
};
//# sourceMappingURL=node-additions.js.map