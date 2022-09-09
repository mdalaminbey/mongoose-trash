# Mongoose Trash For Softdelete/Trash For MongoDB
<p align="center">
  <a href="https://npmcharts.com/compare/mongoose-trash?minimal=true"><img src="https://img.shields.io/npm/dm/mongoose-trash.svg?sanitize=true" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/mongoose-trash"><img src="https://img.shields.io/npm/v/mongoose-trash.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/mongoose-trash"><img src="https://img.shields.io/npm/l/mongoose-trash.svg?sanitize=true" alt="License"></a>
</p>

```sh
npm i mongoose-trash
```

## TypeScript Integration
1. Create an interface representing a document in MongoDB With Mongoose Trash Document.

    ```typescript
    import { MongooseTrashDocument } from 'mongoose-trash';

    interface User extends MongooseTrashDocument {
      name: string;
      email: string;
    }
    ```
2. Create a model with Mongoose Trash Query Helper 
    ```typescript
    import { Model } from "mongoose";
    import { MongooseTrashQueryHelpers } from 'mongoose-trash';

    type UserModelType = Model<User, MongooseTrashQueryHelpers<User>>;
    ```
3. Create a Schema corresponding to the document interface with MongooseTrash And MongooseTrashQueryHelpers.
    ```typescript
    import { Schema } from "mongoose";
    import { MongooseTrashQueryHelpers, MongooseTrash } from 'mongoose-trash';

    const userSchema = new Schema<User, UserModelType, {}, MongooseTrashQueryHelpers<User>>({
      name: { type: String, required: true },
      email: { type: String, required: true },
    }).plugin(MongooseTrash);
    ```
4. Create a model and trash many items
    ```typescript
    const User = model<User, UserModelType>("User", userSchema);

    const userIds = ["631b08391a4e2f00c19368d4", "631b08391a4e2f00c19368d6"];

    await User.find({
      _id: {
        $in: userIds,
      },
    }).trashMany();
    ```


## NestJS Integration

1. `user.schema.ts` File
    ```typescript 
    import { Prop, SchemaFactory } from '@nestjs/mongoose';
    import { Document } from 'mongoose';
    import { MongooseTrash, MongooseTrashDocument } from 'mongoose-trash';

    export type UserDocument = User & MongooseTrashDocument & Document;

    export class User {
      @Prop()
      field: string;
    }

    export const UserSchema = SchemaFactory.createForClass(User).plugin(MongooseTrash);

    ```
2. `user.service.ts` Injecting mongoose trash in user model

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model } from 'mongoose';
    import { MongooseTrashQueryHelpers } from 'mongoose-trash';

    @Injectable()
    export class UserService {
      constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<
          UserDocument,
          MongooseTrashQueryHelpers<UserDocument>
        >,
      ) {}
    }
    ```
3. Trash many crud items given by mongo ids, like: ["6319ecec4131dd1b32e7441c", "6319ed3b4131dd1b32e7441f"]
    ```typescript
    async trashMany(ids: String[]) {
      const trashUser = await this.userModel
        .find({
          _id: {
            $in: ids,
          },
        })
        .trashMany();
      return trashUser;
    }
    ```