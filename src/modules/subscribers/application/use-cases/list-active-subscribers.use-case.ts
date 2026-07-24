import { Inject, Injectable } from "@nestjs/common";
import { SUBSCRIBER_REPOSITORY } from "../../domain/repositories/subscriber.repository.interface";
import type { ISubscriberRepository } from "../../domain/repositories/subscriber.repository.interface";
import { IUseCase } from "src/shared/application/use-case.interface";

export interface ActiveSubscriberView {
  id: string;
  email: string;
  subscribedAt: Date;
}

@Injectable()
export class ListActiveSubscribersUseCase implements IUseCase<void, ActiveSubscriberView[]>{
    constructor(
        @Inject(SUBSCRIBER_REPOSITORY)
        private readonly subscriberRepository: ISubscriberRepository
    ){}

    async execute(): Promise<ActiveSubscriberView[]>{
        const subscribers = await this.subscriberRepository.findAllActive();
        return subscribers.map((s) => ({
            id: s.id,
            email: s.email,
            subscribedAt: s.creationDate
        }));
    }
}