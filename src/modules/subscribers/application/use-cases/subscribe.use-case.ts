import { IUseCase } from "src/shared/application/use-case.interface";
import { Subscriber } from "../../domain/entities/subscriber.entity";
import type { ISubscriberRepository } from "../../domain/repositories/subscriber.repository.interface";
import { SUBSCRIBER_REPOSITORY } from "../../domain/repositories/subscriber.repository.interface";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export interface SubscribeRequest{
    email: string;
}

export interface SubscribeResponse{
    id: string;
    email: string;
}

@Injectable()
export class SubscribeUseCase implements IUseCase<SubscribeRequest, SubscribeResponse>{
    constructor(
        @Inject(SUBSCRIBER_REPOSITORY)
        private readonly subscriberRepository: ISubscriberRepository
    ){}

    async execute(request: SubscribeRequest): Promise<SubscribeResponse>{
        const existing = await this.subscriberRepository.findByEmail(request.email.trim().toLocaleLowerCase());

        if(existing && existing.isActive){
            throw new ConflictException('Este email já existe');
        }

        if(existing && !existing.isActive){
            existing.resubscribe();
            await this.subscriberRepository.update(existing);
            return { id: existing.id, email: existing.email };
        }

        const subscriber = Subscriber.create(randomUUID(), request.email);
        await this.subscriberRepository.save(subscriber);

        return { id: subscriber.id, email: subscriber.email};
    }

}