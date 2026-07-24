export abstract class BaseEntity{
    protected readonly _id: string;
    protected readonly createdAt: Date;

    protected constructor(id: string, createdAt?: Date){
        this._id = id;
        this.createdAt = createdAt ?? new Date();
    }

    get id(): string {
        return this._id;
    }

    get creationDate(): Date {
        return this.createdAt
    }
}