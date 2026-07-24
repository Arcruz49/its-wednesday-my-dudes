import { Injectable } from "@nestjs/common";
import { SubscriberDocument, SubscriberModel } from "../schemas/subscriber.schema";
import { ISubscriberRepository } from "../../domain/repositories/subscriber.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Subscriber } from "../../domain/entities/subscriber.entity";


@Injectable()
export class SubscriberRepository implements ISubscriberRepository{
    constructor(
        @InjectModel(SubscriberModel.name)
        private readonly model: Model<SubscriberDocument>
    ){}

    async save(subscriber: Subscriber): Promise<void>{
        await this.model.create({
            domainId: subscriber.id,
            email: subscriber.email,
            active: subscriber.isActive,
            unsubscribedAt: subscriber.unsubscribedAt,
            createdAt: subscriber.creationDate,
        })
    }
    async update(subscriber: Subscriber): Promise<void>{
        await this.model.updateOne(
            { domainId: subscriber.id },
            {
                active: subscriber.isActive,
                unsubscribedAt: subscriber.unsubscribedAt
            }
        )
    }
    async findByEmail(email: string): Promise<Subscriber | null>{
        const doc = await this.model.findOne({ email: email }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAllActive(): Promise<Subscriber[]>{
        const docs = await this.model.find({ active: true }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async findById(id: string): Promise<Subscriber | null>{
        const doc = await this.model.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    private toDomain(doc: SubscriberDocument): Subscriber {
        return Subscriber.restore(
        doc.domainId,
        doc.email,
        doc.active,
        doc.unsubscribedAt,
        doc.createdAt,
        );
    }
}