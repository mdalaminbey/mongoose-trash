import { HydratedDocument, Schema, Query } from "mongoose";
export declare const MongooseTrash: (schema: Schema) => void;
export declare type ModelQuery<P> = Query<any, HydratedDocument<P>, MongooseTrashQueryHelpers<P>> & MongooseTrashQueryHelpers<P>;
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
