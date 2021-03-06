import {promisify} from "util";
import query from "../../db/query";
import fs from "fs"
import path from "path"
import sharp from "sharp";
const exif = require('exif-reader');

export default (db: (sql : string, values : any) => Promise<any>, root: string) => {
    return {
        run: async() => {
            const photos = await db(query.allConvertedPhoto, []);
            let res: string[] = []
            for (const photo of photos) {
                await promisify(fs.unlink)(path.join(root, 'uploads', photo.id + '.preview.jpg')).then(
                    () => {
                        res.push("Deleting preview photo " + photo.name + " (" + photo.id + "), finished.")
                    }
                ).catch(
                    (err) => {
                        res.push("Deleting preview photo " + photo.name + " (" + photo.id + "), skipped.")
                    }
                )
            }
            for (const photo of photos) {
                try {
                    const t = sharp(path.join(root, 'uploads', photo.id + '.jpg'));
                    const metadata = await t.metadata();
                    if (!metadata.width) throw "Can't get the size";
                    await t.clone().resize(Math.min(metadata.width, 1000)).rotate().toFile(path.join(root, 'uploads', photo.id + '.preview.jpg'));
                    res.push("Generating preview photo " + photo.name + " (" + photo.id + "), finished.")
                    await db(query.reconvertPhoto, [
                        (!metadata.orientation || (metadata.orientation >= 1 && metadata.orientation <= 4)) ? metadata.height : metadata.width,
                        (!metadata.orientation || (metadata.orientation >= 1 && metadata.orientation <= 4)) ? metadata.width : metadata.height,
                        metadata.exif && exif(metadata.exif).exif.DateTimeOriginal ? exif(metadata.exif).exif.DateTimeOriginal.getTime()/1000 + (new Date()).getTimezoneOffset() * 60: null, photo.id]
                    );
                    res.push("Configuring preview photo " + photo.name + " (" + photo.id + "), finished.")
                } catch {
                    res.push("Generating preview photo " + photo.name + " (" + photo.id + "), failed.")
                }
            }
            console.log("reload_preview run")
            return res.join("<br>")
        },
        callback: async() => {
            console.log("reload_preview callback")
        },
    }
}