import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { IToken, TokenType } from '@tokens/domain/entity/token.interface';

@Schema()
export class TokenSchema implements Omit<IToken, 'id'> {
  @Prop({ required: true, index: true, unique: true, type: Types.ObjectId })
  _id: string;

  @Prop({ required: true, index: true, type: String })
  userId: string;

  @Prop({ required: true, type: Date })
  lastRefresh: Date;

  @Prop({ required: true, type: Date })
  expires: Date;

  @Prop({ required: true, type: Boolean })
  revoked: boolean;

  @Prop({ required: true, type: Number })
  type: TokenType;
}

export type TokenDocument = TokenSchema & Document;
export const tokenSchema = SchemaFactory.createForClass(TokenSchema);
