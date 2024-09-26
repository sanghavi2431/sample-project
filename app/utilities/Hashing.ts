import bcrypt from "bcrypt";


export default class Hashing {
    constructor() {
    }

    public async generateHash (password: string, saltRounds: number): Promise<any> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, (err: any, hash: any) => {
                if (!err) {
                    resolve(hash);
                }
                reject(err);
            });
        });
    }

    public async verifypassword (password: string, hashPassword: string): Promise<any> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashPassword, (err: any, hash: any) => {
                if (!err) {
                    resolve(hash);
                }
                reject(err);
            });
        });
    }

    public  generatePassword () {
        const length = 12; // Change the length of the password as needed
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
        let password = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        return password
    }

}