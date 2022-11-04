import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { IToken, TokenType } from '@tokens/domain/entity/token.interface';

@Schema()
export class TokenSchema implements IToken {
  @Prop({ required: true, index: true, type: String, unique: true })
  id: string;

  @Prop({ required: true, index: true, type: String })
  userId: string;

  @Prop({ required: true, type: Number })
  expireTime: number;

  @Prop({ required: true, type: Date })
  lastRefresh: Date;

  @Prop({ required: true, type: Date })
  expires: Date;

  @Prop({ required: true, type: Boolean })
  revoked: boolean;

  @Prop({ required: true, type: String })
  type: TokenType;
}

export type TokenDocument = TokenSchema & Document;
export const tokenSchema = SchemaFactory.createForClass(TokenSchema);
