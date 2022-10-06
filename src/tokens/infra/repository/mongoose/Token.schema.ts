import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IToken } from '@tokens/domain/entity/token.interface';
import { Types } from 'mongoose';

@Schema()
export class TokenSchema implements IToken {
  @Prop({ required: true, index: true, unique: true, type: Types.ObjectId })
  id: string;

  @Prop({ required: true, index: true, type: String })
  userId: string;

  @Prop({ required: true, type: Date })
  lastRefresh: Date;

  @Prop({ required: true, type: Date })
  expires: Date;

  @Prop({ required: true, type: Boolean })
  revoked: boolean;
}

export type TokenDocument = TokenSchema & Document;
export const tokenSchema = SchemaFactory.createForClass(TokenSchema);
