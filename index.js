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
    schema.add({ trashed: Boolean });
    schema.add({ trashedAt: Date });
    schema.pre("save", function (next) {
        if (!this.trashed) {
            this.trashed = false;
        }
        if (!this.trashedAt) {
            this.trashedAt = null;
        }
        next();
    });
    schema.methods.trashOne = function (callback) {
        this.trashed = true;
        this.trashedAt = new Date();
        this.save(callback);
        return this;
    };
    schema.methods.restore = function (callback) {
        this.trashed = false;
        this.trashedAt = null;
        this.save(callback);
    };
    const queryHelpers = {
        findTrashed(trashed) {
            if (typeof trashed === "undefined") {
                trashed = true;
            }
            // @ts-ignore
            return this.find({ trashed });
        },
        trashMany() {
            // @ts-ignore
            return this.updateMany({ trashed: true, trashedAt: new Date() });
        },
        restoreMany() {
            // @ts-ignore
            return this.where("withTrashed", true).updateMany({
                trashed: false,
                trashedAt: null,
            });
        },
        withTrashed() {
            // @ts-ignore
            return this.where("withTrashed", true);
        },
        onlyTrashed() {
            // @ts-ignore
            return this.where("onlyTrashed", true);
        },
    };
    schema.query = Object.assign(Object.assign({}, schema.query), queryHelpers);
    const findQueryMiddleware = [
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
    const Middleware = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._conditions.withTrashed) {
                delete this._conditions.withTrashed;
                return;
            }
            else if (this._conditions.onlyTrashed) {
                delete this._conditions.onlyTrashed;
                this.where({ trashed: true });
                return;
            }
            this.where({ trashed: false });
            return;
        });
    };
    findQueryMiddleware.forEach((type) => {
        schema.pre(type, Middleware);
    });
};
exports.MongooseTrash = MongooseTrash;
