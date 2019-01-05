"use strict";
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
Array.prototype.insert = function (index, items) {
    for (let i = index; i < index + items.length; i++) {
        this[i] = items[i - index];
    }
    return this;
};
Array.prototype.remove = function (o) {
    const index = this.indexOf(o);
    if (index === -1)
        return this;
    this.splice(index, 1);
    return this;
};
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
//# sourceMappingURL=node-additions.js.map