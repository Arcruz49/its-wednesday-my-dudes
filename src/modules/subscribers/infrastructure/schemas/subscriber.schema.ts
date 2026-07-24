import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SubscriberDocument = SubscriberModel & Document;

@Schema({ collection: 'subscriber'})
export class SubscriberModel {
    @Prop({ required: true})
    domainId!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, default: true })
    active!: boolean;

    @Prop({ type: Date, default: null })
    unsubscribedAt!: Date | null;

    @Prop({ required: true })
    createdAt!: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(SubscriberModel);