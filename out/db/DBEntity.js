"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const util_1 = require("../util");
class DBEntity extends typeorm_1.BaseEntity {
    get openedOnUnix() {
        return Math.floor(this.openedOn.getTime() / 1000);
    }
    static async create(entity) {
        const obj = super.create(entity);
        obj.id = await util_1.Security.snowflake();
        return obj;
    }
}
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], DBEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], DBEntity.prototype, "openedOn", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], DBEntity.prototype, "updatedOn", void 0);
exports.DBEntity = DBEntity;
//# sourceMappingURL=DBEntity.js.map