import { BaseEntity } from "src/shared/domain/base-entity";

export class InvalidEmailError extends Error {
    constructor(email: string) {
        super(`Invalid email adress: ${email}`);
        this.name = 'InvalidEmailError';
    }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Subscriber extends BaseEntity{
    private _email: string;
    private _active: boolean;
    private _unsubscribedAt: Date | null;

    private constructor(
        id: string,
        email: string,
        active: boolean,
        unsubscribedAt: Date | null,
        createdAt?: Date
    ){
        super(id, createdAt);
        this._email = email;
        this._active = active;
        this._unsubscribedAt = unsubscribedAt;
    }

    static create(id: string, email: string): Subscriber{
        
        const normalized = email.trim().toLocaleLowerCase();
        
        if(!EMAIL_REGEX.test(normalized)) throw new InvalidEmailError(email);

        return new Subscriber(id, normalized, true, null)
    }

    static restore(
        id: string,
        email: string,
        active: boolean,
        unsubscribedAt: Date | null,
        createdAt: Date,
    ): Subscriber {
        return new Subscriber(id, email, active, unsubscribedAt, createdAt);
    }

    unsubscribe(): void{
        this._active = false;
        this._unsubscribedAt = new Date();
    }

    resubscribe(): void{
        this._active = true;
        this._unsubscribedAt = null;
    }

    get email(): string{
        return this._email;
    }

    get isActive(): boolean{
        return this._active;
    }

    get unsubscribedAt(): Date | null {
        return this._unsubscribedAt;
    }
}