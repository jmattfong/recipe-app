import { parse } from 'ts-command-line-args';
import { getLogger, setLogLevel } from './lib/logging'
import { CategoryLogger, LogLevel } from 'typescript-logging';
import { initializeOCRWorkers, recognizeCharacters } from './lib/ocr';

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

    recognizeRawRecipe("http://localhost:3000/recipes/raw-recipes/img20200322_16552432.jpg",
                    "http://localhost:3000/recipes/raw-recipes/img20200322_16555410.jpg")
}

async function recognizeRawRecipe(recipeFrontUrl:string, recipeBackUrl:string) {
    log.info(`Recognizing raw recipe ${recipeFrontUrl} and back side ${recipeBackUrl}`)
    let title = recognizeCharacters(recipeFrontUrl, { left: 50, top: 70, width: 1200, height: 100 })
    let subTitle = recognizeCharacters(recipeFrontUrl, { left: 50, top: 165, width: 1200, height: 125 })

    log.info(await title)
    log.info(await subTitle)
}

main();
