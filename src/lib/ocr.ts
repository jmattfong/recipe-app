import { createWorker, createScheduler, Rectangle } from 'tesseract.js';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("ocr")
let worker = createWorker({
    logger: m => log.debug(JSON.stringify(m))
});
let scheduler = createScheduler()

export async function initializeOCRWorkers() {
    for (let i = 0; i < 4; i++) {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        scheduler.addWorker(worker)
    }
}

export async function terminateOCR() {
    await scheduler.terminate(); // It also terminates all workers.
}

export async function recognizeCharacters(imageUrl: string, rectangle: Rectangle | null = null): Promise<string> {
    if (rectangle) {
        let text: Promise<string> = scheduler.addJob('recognize', imageUrl, { rectangle }).then(({ data: { text } }) => {
            return text
        })
        return text;
    } else {
        let text: Promise<string> = scheduler.addJob('recognize', imageUrl).then(({ data: { text } }) => {
            return text
        })
        return text;
    }
}
