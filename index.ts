import {
  CallbackWithoutResultAndOptionalError,
  HydratedDocument,
  Schema,
  Query,
} from "mongoose";

export const MongooseTrash = (schema: Schema) => {
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

  schema.methods.softDeleteOne = function (callback: any) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.save(callback);
    return this;
  };

  schema.methods.restore = function (callback: any) {
    this.deleted = false;
    this.deletedAt = null;
    this.save(callback);
  };

  const queryHelpers = {
    isDeleted(cond: any): any {
      if (typeof cond === "undefined") {
        cond = true;
      }
      // @ts-ignore
      return this.find({
        deleted: cond,
      });
    },
    softDeleteMany(): any {
      // @ts-ignore
      return this.updateMany({ deleted: true, deletedAt: new Date() });
    },
    restoreMany(): any {
      // @ts-ignore
      return this.where("withDeleted", true).updateMany({
        deleted: false,
        deletedAt: null,
      });
    },
    withDeleted(): any {
      // @ts-ignore
      return this.where("withDeleted", true);
    },
    onlyDeleted(): any {
      // @ts-ignore
      return this.where("onlyDeleted", true);
    },
  };

  schema.query = { ...schema.query, ...queryHelpers };

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
  const excludeInFindQueriesIsDeleted = async function (
    this: any,
    next: CallbackWithoutResultAndOptionalError
  ) {
    if (this._conditions.withDeleted) {
      delete this._conditions.withDeleted;
      next();
    } else if (this._conditions.onlyDeleted) {
      delete this._conditions.onlyDeleted;
      this.where({ deleted: true });
      next();
    }
    this.where({ deleted: false });
    next();
  };

  typesFindQueryMiddleware.forEach((type: any) => {
    schema.pre(type, excludeInFindQueriesIsDeleted);
  });
};

export type ModelQuery<P> = Query<
  any,
  HydratedDocument<P>,
  MongooseTrashQueryHelpers<P>
> &
  MongooseTrashQueryHelpers<P>;

export interface MongooseTrashQueryHelpers<P> {
  softDeleteMany(this: ModelQuery<P>): ModelQuery<P>;
  restoreMany(this: ModelQuery<P>): ModelQuery<P>;
  withDeleted(this: ModelQuery<P>): ModelQuery<P>;
  onlyDeleted(this: ModelQuery<P>): ModelQuery<P>;
}

export interface MongooseTrashDocument {
  deleted: Boolean;
  deletedAt: Date;
  softDeleteOne: () => void;
  restore: () => void;
}
