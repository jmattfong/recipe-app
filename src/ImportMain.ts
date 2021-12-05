import { parse } from 'ts-command-line-args';
import { getLogger, setLogLevel } from './lib/logging'
import { CategoryLogger, LogLevel } from 'typescript-logging';
import { initializeOCRWorkers, recognizeCharacters, terminateOCR } from './lib/ocr';
import { Ingredient, Recipe } from './lib/recipe';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { sys } from 'typescript';

const log: CategoryLogger = getLogger("main")

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IRecipeArgs {
    debug: boolean,
    help?: boolean;
}

async function main() {
    const { env } = process

    const args = parse<IRecipeArgs>(
        {
            debug: { type: Boolean, alias: "d", description: "Turn on debug logging" },
            help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
        },
        {
            helpArg: 'help',
            headerContentSections: [{ header: 'Import Recipes', content: 'Yum!' }]
        },
    );

    const logLevel = args.debug ? LogLevel.Debug : LogLevel.Info;
    setLogLevel(logLevel);

    log.info(`input args: ${JSON.stringify(args)}\n`)

    log.info('Initilizing OCR workers')
    await initializeOCRWorkers()

    await recognizeRawRecipeFormat1('http://localhost:3000/recipes/raw-recipes/format1/img20200322_16552432.jpg',
                    'http://localhost:3000/recipes/raw-recipes/format1/img20200322_16555410.jpg')
    await readAllRecipes()

    await terminateOCR()
}

async function readAllRecipes() {
    let directory = 'public/recipes/raw-recipes/format1/'
    let files = fs.readdirSync(directory);
    log.debug(`Recognizing all recipes from list: ${JSON.stringify(files)}`)
    let i = 0
    let recipeFront = ''
    for (var file of files) {
        if (i++ % 2 == 0) {
            recipeFront = `http://localhost:3000/recipes/raw-recipes/format1/${file}`
        } else {
            let recipeBack = `http://localhost:3000/recipes/raw-recipes/format1/${file}`
            await recognizeRawRecipeFormat1(recipeFront, recipeBack)
        }
    }
}

async function recognizeRawRecipeFormat1(recipeFrontUrl:string, recipeBackUrl:string): Promise<Recipe> {
    log.info(`Recognizing raw recipe ${recipeFrontUrl} and back side ${recipeBackUrl}`)
    let title = recognizeCharacters(recipeFrontUrl, { left: 50, top: 70, width: 1200, height: 100 })
    let subtitle = recognizeCharacters(recipeFrontUrl, { left: 50, top: 165, width: 1200, height: 125 })
    let keywords = recognizeCharacters(recipeFrontUrl, { left: 1370, top: 80, width: 290, height: 140 })
    let time = recognizeCharacters(recipeFrontUrl, { left: 105, top: 370, width: 200, height: 50 })
    let servings = recognizeCharacters(recipeFrontUrl, { left: 290, top: 370, width: 170, height: 50 })
    let description = recognizeCharacters(recipeFrontUrl, { left: 50, top: 420, width: 580, height: 300 })

    let ingredientWidth = 220
    let ingredientHeight = 140
    let row1 = 1600
    let row2 = 1850
    let maxIngredients = 12
    let left = 60
    let ingredient_promises: Promise<string>[] = []
    for (let i = 0; i < maxIngredients; i++) {
        let ingredient
        if (i % 2 == 0) {
            ingredient = recognizeCharacters(recipeFrontUrl, { left: left, top: row1, width: ingredientWidth, height: ingredientHeight })
        } else {
            ingredient = recognizeCharacters(recipeFrontUrl, { left: left, top: row2, width: ingredientWidth, height: ingredientHeight })
            left += ingredientWidth
        }
        ingredient_promises[i] = ingredient
    }

    log.info(`Title: ${await title}`)
    log.info(`Subtitle: ${await subtitle}`)
    log.info(`Keywords: ${await keywords}`)
    log.info(`Time: ${await time}`)
    log.info(`Servings: ${await servings}`)
    log.info(`Description: ${await description}`)

    let ingredients: Ingredient[] = []
    ingredient_promises.forEach(async promise => {
        let ingredient = await promise
        log.info(`Ingredient: ${await ingredient}`)
        ingredients.push(new Ingredient(ingredient))
    })

    return new Recipe(await title,
        await subtitle,
        await description,
        ingredients,
        [],
        [recipeFrontUrl, recipeBackUrl],
        uuid())
}

main();
