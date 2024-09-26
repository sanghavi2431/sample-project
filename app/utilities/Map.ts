import HttpClient from './HttpClient';
import config = require("../config");
import _ from 'lodash';
export default class Map {
    constructor() {

    }

    public static async fetchDistance(source:string, destination:string, mode : any): Promise<any> {
        let url : string = `${config.GoogleMap.distanceMatrixUrl}`;
        return new Promise((resolve, reject) => {
            HttpClient.api('GET', url, {params : {origins : source, destinations : destination, mode : mode, key : config.GoogleMap.key}})
                .then(function (response){
                    if( _.has(response, 'rows[0].elements[0].distance.value')){
                        resolve({
                            distance : response.rows[0].elements[0].distance.value,
                            duration : response.rows[0].elements[0].duration.value
                        });
                    }else{
                        resolve({
                            distance : -1,
                            duration : -1
                        })
                    }
                })
                .catch(function (error){
                    reject(error);
                })
        });
    }
}
