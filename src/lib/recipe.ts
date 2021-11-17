
export class Recipe {

    constructor(public id: string,
                public title: string,
                public subtitle: string,
                public description: string,
                public image_urls: string[],
                public ingredients: Ingredient[],
                public steps: Step[]) {
    }
}

export class Ingredient {

    constructor(public name: string,
                public amount: Amount) {
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
}