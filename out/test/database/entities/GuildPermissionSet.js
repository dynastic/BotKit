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
const src_1 = require("../../../src");
const typeorm_1 = require("typeorm");
let GuildPermissionSet = class GuildPermissionSet extends src_1.DBEntity {
    get json() {
        return {
            guild: this.guild,
            name: this.name,
            roles: this.roles,
            members: this.members,
            grantedPermissions: this.grantedPermissions,
            negatedPermissions: this.negatedPermissions
        };
    }
    delTarget(target, ...ids) {
        ids.forEach(id => this[target + "s"].remove(id));
    }
    addTarget(target, ...ids) {
        ids = ids.filter(id => !!id);
        this[target + "s"] = this[target + "s"].concat(ids);
    }
    /**
     * Grant a permission to the set, automatically un-negating it if it is negated.
     * @param node the node to grant
     */
    grant(node) {
        if (!node)
            return;
        if (this.negatedPermissions.includes(node)) {
            this.negatedPermissions.remove(node);
        }
        if (!this.grantedPermissions.includes(node)) {
            this.grantedPermissions.push(node);
        }
    }
    /**
     * Negate a permission from the set, automatically un-granting it if it is granted.
     * @param node the node to negate
     */
    negate(node) {
        if (!node)
            return;
        if (this.grantedPermissions.includes(node)) {
            this.grantedPermissions.remove(node);
        }
        if (!this.negatedPermissions.includes(node)) {
            this.negatedPermissions.push(node);
        }
    }
    /**
     * Reset a permission in the set
     * @param node the node to reset
     */
    reset(node) {
        this.grantedPermissions.remove(node);
        this.negatedPermissions.remove(node);
    }
};
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GuildPermissionSet.prototype, "guild", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GuildPermissionSet.prototype, "name", void 0);
__decorate([
    typeorm_1.Column("text", { array: true }),
    __metadata("design:type", Array)
], GuildPermissionSet.prototype, "roles", void 0);
__decorate([
    typeorm_1.Column("text", { array: true }),
    __metadata("design:type", Array)
], GuildPermissionSet.prototype, "members", void 0);
__decorate([
    typeorm_1.Column("text", { array: true }),
    __metadata("design:type", Array)
], GuildPermissionSet.prototype, "grantedPermissions", void 0);
__decorate([
    typeorm_1.Column("text", { array: true }),
    __metadata("design:type", Array)
], GuildPermissionSet.prototype, "negatedPermissions", void 0);
GuildPermissionSet = __decorate([
    typeorm_1.Entity()
], GuildPermissionSet);
exports.GuildPermissionSet = GuildPermissionSet;
//# sourceMappingURL=GuildPermissionSet.js.map