import * as fs from "fs";
import * as optimist from "optimist";

export class ConfigLoader {

    static init(configObject:any, configFilePath?:string) {
        this.processConfigFile(configFilePath, configObject);
        this.processArguments(configObject);
        this.processEnvVariables(configObject);

    }

    private static processEnvVariables(configObject:any) {
        this.loadObject(configObject, process.env);
    };

    private static processArguments(configObject:any) {
        let argv = optimist.argv;
        delete(argv._);
        delete(argv.$0);
        let config = {};

        Object.keys(argv).forEach((key)=> {
            let keyArray = key.split("-");
            let value = argv[key];

            let setObject = (object, keyArray, value) => {
                let key = keyArray.shift();
                object[key] = {};
                if (keyArray.length == 0) {
                    object[key] = value;
                    return;
                }
                return setObject(object[key], keyArray, value);
            };
            setObject(config, keyArray, value);

        });
        this.loadObject(configObject, config);
    };

    private static processConfigFile(configFilePath:string, configObject:any) {
        if (typeof configFilePath !== 'undefined') {
            if (ConfigLoader.loadConfigFile(configFilePath, configObject) === false) {
                ConfigLoader.saveConfigFile(configFilePath, configObject);
            }
        }
    };

    private static loadConfigFile(configFilePath, configObject):boolean {
        if (fs.existsSync(configFilePath) === false) {
            return false;
        }
        try {
            let config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

            this.loadObject(configObject, config);
            return true;
        } catch (err) {

        }
        return false;
    }


    private static saveConfigFile(configFilePath, configObject) {
        try {
            fs.writeFileSync(configFilePath, JSON.stringify(configObject, null, 4));
        } catch (err) {

        }
    }

    private static loadObject(targetObject, sourceObject) {
        Object.keys(sourceObject).forEach((key)=> {
            if (typeof targetObject[key] === "undefined") {
                return;
            }
            if (typeof targetObject[key] === "object") {
                this.loadObject(targetObject[key], sourceObject[key]);
            } else {
                targetObject[key] = sourceObject[key];
            }
        });
    }
}