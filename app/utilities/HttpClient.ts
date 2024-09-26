import axios from 'axios';

export default class HttpClient {
    constructor() { }
    public static async api(method: string, url: string, options: any): Promise<any> {
        let config: any = {
            method: method,
            url: url,
            responseType: 'json',
            maxBodyLength: Infinity,
            params: options.params || {},
        };
        if (options.data) {
            config.data = JSON.parse(options.data);
        }
        return new Promise((resolve, reject) => {
            axios(config)
                .then(function (response) {
                    if (response.status == 200) {
                        resolve(response.data);
                    } else {
                        reject(new Error("Something went wrong !!"));
                    }
                })
                .catch(function (error) {
                    reject(error);
                })
        });
    }
}
