const jsonConfig = require('json5-loader!../config.json5');
import ObjectTransformer from "../utils/ObjectTransformer";
import DataStore from "../utils/DataStore";

class JSONConfigProvider {

    static createMetaInformation(): Object {
        const settings = DataStore.getSettings();
        return {
            baseURL: settings.baseUrl,
            timeout: settings.timeout,
            headers: {
                authorization: settings.token
            }
        };
    }

    static getObjectTypes(): [] {
        return jsonConfig.objectTypes.keys;
    }

    static getObjectByItsType(type: String): Object {
        return jsonConfig.objectTypes[type];
    }

    static getSelectedFromKeys(selectedKeys: []): [] {
        return jsonConfig.objectTypes.filter(objType => selectedKeys.includes(objType));
    }

    static generateOptionsFromObjectTypes(generateBusinessModel: boolean = true): [] {
        const options = [];
        Object.keys(jsonConfig.objectTypes).map(
            (objectType) => {
                let object = this.getObjectByItsType(objectType);
                if (generateBusinessModel === object.partOfBusinessModel) {
                    options.push(
                        {
                            value: objectType,
                            label: object.label,
                            selected: false
                        }
                    )
                }
            }
        );
        return options;
    }

    static generateRequest(objectTypes: []): [] {
        const APIs = [];
        Object.keys(jsonConfig.objectTypes)
            .filter(objType => objectTypes.includes(objType))
            .map(objectType => {
                    let object = jsonConfig.objectTypes[objectType];
                    if (object.alsoLoad) {
                        let objectWithChild = {
                            api: null,
                            children: []
                        };
                        objectWithChild.api = object.api + "/";

                        object.alsoLoad.forEach(toLoad => {
                            let relatedName = jsonConfig.objectTypes[ObjectTransformer.getObjectName(toLoad)];
                            let child = {
                                api: relatedName.api + "/",
                                parentType: objectType,
                                childType: ObjectTransformer.getObjectName(toLoad),
                                key: toLoad[ObjectTransformer.getObjectName(toLoad)].key,
                                intoProperty: toLoad[ObjectTransformer.getObjectName(toLoad)].intoProperty
                            };
                            objectWithChild.children.push(child);
                        });
                        APIs.push(objectWithChild);
                    } else {
                        APIs.push(object.api + "/");
                    }
                }
            );
        return APIs;
    }
}
export default JSONConfigProvider;