import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubscriberModel, SubscriberSchema } from "../infrastructure/schemas/subscriber.schema";
import { SubscribersController } from "./subscribers.controller";
import { SubscribeUseCase } from "../application/use-cases/subscribe.use-case";
import { UnsubscribeUseCase } from "../application/use-cases/unsubscribe.use-case";
import { ListActiveSubscribersUseCase } from "../application/use-cases/list-active-subscribers.use-case";
import { SUBSCRIBER_REPOSITORY } from "../domain/repositories/subscriber.repository.interface";
import { SubscriberRepository } from "../infrastructure/repositories/subscriber.repository";

@Module({
    imports:[
        MongooseModule.forFeature([
            {name: SubscriberModel.name, schema: SubscriberSchema},
        ]),
    ],
    controllers: [SubscribersController],
    providers: [
        SubscribeUseCase,
        UnsubscribeUseCase,
        ListActiveSubscribersUseCase,
        { provide: SUBSCRIBER_REPOSITORY, useClass: SubscriberRepository},
    ],
    exports: [SUBSCRIBER_REPOSITORY],
})
export class SubscriberModule {}