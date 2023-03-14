import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { IUser } from '@user/domain/entity/user.interface';

@Schema()
export class UserSchema implements IUser {
  @Prop({ required: true, type: String, unique: true })
  id: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;
}

export type UserDocument = UserSchema & Document;
export const userSchema = SchemaFactory.createForClass(UserSchema);
