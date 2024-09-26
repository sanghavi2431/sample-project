import {HealthCheckModel} from '../Models/HealthCheck.model';

const healthCheck = async () => {
    try {
        const dbStatus = await new HealthCheckModel().heathCheck();
        console.log("TIME : ",  dbStatus);
        return dbStatus;
    } catch (e) {
        return e;
    }
};

export default {
    healthCheck
};
