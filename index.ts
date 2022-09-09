import { HydratedDocument, Schema, Query } from "mongoose";

export const MongooseTrash = (schema: Schema) => {
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

  schema.methods.trashOne = function (callback: any) {
    this.trashed = true;
    this.trashedAt = new Date();
    this.save(callback);
    return this;
  };

  schema.methods.restore = function (callback: any) {
    this.trashed = false;
    this.trashedAt = null;
    this.save(callback);
  };

  const queryHelpers = {
    findTrashed(trashed: boolean): any {
      if (typeof trashed === "undefined") {
        trashed = true;
      }
      // @ts-ignore
      return this.find({ trashed });
    },
    trashMany(): any {
      // @ts-ignore
      return this.updateMany({ trashed: true, trashedAt: new Date() });
    },
    restoreMany(): any {
      // @ts-ignore
      return this.where("withTrashed", true).updateMany({
        trashed: false,
        trashedAt: null,
      });
    },
    withTrashed(): any {
      // @ts-ignore
      return this.where("withTrashed", true);
    },
    onlyTrashed(): any {
      // @ts-ignore
      return this.where("onlyTrashed", true);
    },
  };

  schema.query = { ...schema.query, ...queryHelpers };

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
  const Middleware = async function (
    this: any
  ) {
    if (this._conditions.withTrashed) {
        delete this._conditions.withTrashed;
        return;
    } else if (this._conditions.onlyTrashed) {
      delete this._conditions.onlyTrashed;
      this.where({ trashed: true });
      return;
    }
    this.where({ trashed: false });
    return;
  };

  findQueryMiddleware.forEach((type: any) => {
    schema.pre(type, Middleware);
  });
};

export type ModelQuery<P> = Query<
  any,
  HydratedDocument<P>,
  MongooseTrashQueryHelpers<P>
> &
  MongooseTrashQueryHelpers<P>;

export interface MongooseTrashQueryHelpers<P> {
  trashMany(this: ModelQuery<P>): ModelQuery<P>;
  restoreMany(this: ModelQuery<P>): ModelQuery<P>;
  withTrashed(this: ModelQuery<P>): ModelQuery<P>;
  onlyTrashed(this: ModelQuery<P>): ModelQuery<P>;
  findTrashed(this: ModelQuery<P>): ModelQuery<P>;
}

export interface MongooseTrashDocument {
  trashed: Boolean;
  trashedAt: Date;
  trashOne: () => void;
  restore: () => void;
}
