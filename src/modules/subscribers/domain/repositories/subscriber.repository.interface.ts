import { Subscriber } from "../entities/subscriber.entity";

export const SUBSCRIBER_REPOSITORY = Symbol('SUBSCRIBER_REPOSITORY');

export interface ISubscriberRepository{
    save(subscriber: Subscriber): Promise<void>;
    update(subscriber: Subscriber): Promise<void>;
    findByEmail(email: string): Promise<Subscriber | null>;
    findAllActive(): Promise<Subscriber[]>;
    findById(id: string): Promise<Subscriber | null>;
}