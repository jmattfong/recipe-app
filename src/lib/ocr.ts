import { createWorker, Rectangle } from 'tesseract.js';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("ocr")
let worker = createWorker({
    logger: m => log.debug(JSON.stringify(m))
});

export async function initializeOCRWorkers() {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
}

export async function recognizeCharacters(imageUrl: string, rectangle: Rectangle | null = null): Promise<string> {
    if (rectangle) {
        return worker.recognize(imageUrl, { rectangle }).then(({ data: { text } }) => {
            return text
        })
    } else {
        return worker.recognize(imageUrl).then(({ data: { text } }) => {
            return text
        })
    }
}
