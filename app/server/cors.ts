import cors from "cors";

export default class Cors {
    static instance: Cors = new Cors();

    private constructor() {

    }

    isOriginAccepted(origin: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            //if count @ > 1 >>> throw exception
            if(!origin) origin = "";
            origin = origin.split("@")[0];

            const array = ["http://localhost", "https://localhost"];
            resolve(!!array.find(a => origin.startsWith(a)));
        });
    }

    cors() {
        return cors({
            origin: (origin: string, callback: (e: Error|undefined|null, a?: boolean) => void) => {
                Cors.instance.isOriginAccepted(origin)
                .then(accepted => callback(null, accepted))
                .catch(err => callback(err));
            }
        });
    }
}