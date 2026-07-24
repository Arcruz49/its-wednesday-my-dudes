import { SubscribeDTO } from "../application/dtos/subscribe.dto";
import { SubscribeUseCase } from "../application/use-cases/subscribe.use-case";
import { UnsubscribeUseCase } from "../application/use-cases/unsubscribe.use-case";
import { ListActiveSubscribersUseCase } from "../application/use-cases/list-active-subscribers.use-case";
import { Controller, Post, Body, HttpCode, Get, Delete } from "@nestjs/common";

@Controller('subscribers')
export class SubscribersController {
    constructor(
        private readonly subscribeUseCase: SubscribeUseCase,
        private readonly unsubscribeUseCase: UnsubscribeUseCase,
        private readonly listActiveSubscribersUseCase: ListActiveSubscribersUseCase,
    ){}

    @Post()
    async subscribe(@Body() dto: SubscribeDTO){
        return this.subscribeUseCase.execute({ email: dto.email})
    }

    @Delete()
    @HttpCode(204)
    async unsubscribe(@Body() dto: SubscribeDTO){
        await this.unsubscribeUseCase.execute({ email: dto.email })
    }

    @Get()
    async listActive() {
        return this.listActiveSubscribersUseCase.execute();
    }
}