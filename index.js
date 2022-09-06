"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseTrash = void 0;
const MongooseTrash = (schema) => {
    schema.add({ deleted: Boolean });
    schema.add({ deletedAt: Date });
    schema.pre("save", function (next) {
        if (!this.deleted) {
            this.deleted = false;
        }
        if (!this.deletedAt) {
            this.deletedAt = null;
        }
        next();
    });
    schema.methods.softDeleteOne = function (callback) {
        this.deleted = true;
        this.deletedAt = new Date();
        this.save(callback);
        return this;
    };
    schema.methods.restore = function (callback) {
        this.deleted = false;
        this.deletedAt = null;
        this.save(callback);
    };
    const queryHelpers = {
        isDeleted(cond) {
            if (typeof cond === "undefined") {
                cond = true;
            }
            // @ts-ignore
            return this.find({
                deleted: cond,
            });
        },
        softDeleteMany() {
            // @ts-ignore
            return this.updateMany({ deleted: true, deletedAt: new Date() });
        },
        restoreMany() {
            // @ts-ignore
            return this.where("withDeleted", true).updateMany({
                deleted: false,
                deletedAt: null,
            });
        },
        withDeleted() {
            // @ts-ignore
            return this.where("withDeleted", true);
        },
        onlyDeleted() {
            // @ts-ignore
            return this.where("onlyDeleted", true);
        },
    };
    schema.query = Object.assign(Object.assign({}, schema.query), queryHelpers);
    const typesFindQueryMiddleware = [
        "count",
        "find",
        "findOne",
        "findOneAndDelete",
        "findOneAndRemove",
        "findOneAndUpdate",
        "update",
        "updateOne",
        "updateMany",
    ];
    const excludeInFindQueriesIsDeleted = function (next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._conditions.withDeleted) {
                delete this._conditions.withDeleted;
                next();
            }
            else if (this._conditions.onlyDeleted) {
                delete this._conditions.onlyDeleted;
                this.where({ deleted: true });
                next();
            }
            this.where({ deleted: false });
            next();
        });
    };
    typesFindQueryMiddleware.forEach((type) => {
        schema.pre(type, excludeInFindQueriesIsDeleted);
    });
};
exports.MongooseTrash = MongooseTrash;
