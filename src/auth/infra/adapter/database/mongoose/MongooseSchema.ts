import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { IToken, TokenType } from '#auth/domain/entity/token.interface';

@Schema()
export class TokenSchema implements IToken {
  // Populated by Mongoose's schema machinery, not this class's constructor.
  @Prop({ required: true, index: true, type: String, unique: true })
  id!: string;

  @Prop({ required: true, index: true, type: String })
  userId!: string;

  @Prop({ required: true, type: Number })
  expireTime!: number;

  @Prop({ required: true, type: Date })
  lastRefresh!: Date;

  @Prop({ required: true, type: Date })
  expires!: Date;

  @Prop({ required: true, type: Boolean })
  revoked!: boolean;

  @Prop({ required: true, type: String })
  type!: TokenType;
}

export type TokenDocument = TokenSchema & Document;
export const tokenSchema = SchemaFactory.createForClass(TokenSchema);

// One token per user per type: enforces the invariant `create()` relies on.
tokenSchema.index({ userId: 1, type: 1 }, { unique: true });
