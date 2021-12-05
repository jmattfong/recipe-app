import { v4 as uuid } from 'uuid';

export class Recipe {

    constructor(
                public title: string,
                public subtitle: string= "",
                public description: string= "",
                public ingredients: Ingredient[],
                public steps: Step[],
                public imageUrls: string[] = [],
                public id: string = uuid()) {
    }
}

export class Ingredient {

    constructor(public name: string,
                public amount: Amount = new Amount(1)) {
    }
}

export class Step {

    constructor(public title: string,
                public steps: string[]) {
    }
}

export class Amount {

    constructor(public amount: number,
                public unit: string = "") {
    }

    public hasUnit(): boolean {
        return this.unit.length > 0
    }
}
