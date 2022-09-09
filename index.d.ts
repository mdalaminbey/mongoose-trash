import { HydratedDocument, Schema, Query } from "mongoose";
export declare const MongooseTrash: (schema: Schema) => void;
export declare type ModelQuery<P> = Query<any, HydratedDocument<P>, MongooseTrashQueryHelpers<P>> & MongooseTrashQueryHelpers<P>;
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
