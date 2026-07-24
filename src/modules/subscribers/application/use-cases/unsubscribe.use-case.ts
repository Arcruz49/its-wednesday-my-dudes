import { IUseCase } from "src/shared/application/use-case.interface";
import type { ISubscriberRepository } from "../../domain/repositories/subscriber.repository.interface";
import { SUBSCRIBER_REPOSITORY } from "../../domain/repositories/subscriber.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { NotFoundError } from "rxjs";

export interface UnsubscribeRequest{
    email: string;
}

@Injectable()
export class UnsubscribeUseCase implements IUseCase<UnsubscribeRequest, void>{
    constructor(
        @Inject(SUBSCRIBER_REPOSITORY)
        private readonly subscriberRepository: ISubscriberRepository
    ){}

    async execute(request: UnsubscribeRequest): Promise<void>{
        const subscriber = await this.subscriberRepository.findByEmail(request.email.trim().toLocaleLowerCase());

        if(!subscriber){
            throw new NotFoundException('Email não encotnrado');
        }

        subscriber.unsubscribe();
        await this.subscriberRepository.update(subscriber);
    }
}