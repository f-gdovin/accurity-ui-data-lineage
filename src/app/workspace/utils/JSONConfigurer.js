const jsonConfig = require('json-loader!../config.json');
import DataStore from "../utils/DataStore";

const JSONConfigurer = {

    createMetaInformation(): Object {
        const settings = DataStore.getSettings();
        return {
            baseURL: settings.baseUrl,
            timeout: settings.timeout,
            headers: {
                authorization: settings.token
            }
        };
    },

    getObjectTypes(): [] {
        return jsonConfig.objectTypes.keys;
    },

    getObjectByItsType(type: String): Object {
        return jsonConfig.objectTypes[type];
    },

    getObjectName(object: Object): String {
        return Object.keys(object)[0] + "";
    },

    getRelationship(object: Object): Object {
        const to = this.getObjectName(object);
        return {
            to: to,
            isAnArray: object[to].isAnArray,
            key: object[to].key,
            innerKey: object[to].innerKey
        }
    },

    getSelectedFromKeys(selectedKeys: []): [] {
        return jsonConfig.objectTypes.filter(objType => selectedKeys.includes(objType));
    },

    generateOptions(generateBusinessModel: boolean = true): [] {
        const options = [];
        Object.keys(jsonConfig.objectTypes).map(
            (objectType) => {
                let object = this.getObjectByItsType(objectType);
                //TODO: triple-check this when dealing with Non-business models
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
    },

    generateLinks(nodes: [], selectedObjectTypes: []): [] {
        const links = [];

        let totalLinkCount = 0;
        const sortedNodes = new Map();

        //now take nodes one by one, check relationships and build links
        for (let i = 0; i < selectedObjectTypes.length; i++) {
            let objectType = selectedObjectTypes[i];
            const objectTypeNodes = nodes.filter(x => x._type === objectType);
            sortedNodes.set(objectType, objectTypeNodes);
        }

        sortedNodes.forEach((value, key) => {
            //get relationships for certain object type
            let objectRelationships = this.getObjectByItsType(key)['relation_to'];

            //only keep those which are relevant to selected object types
            objectRelationships = objectRelationships.filter(relation => selectedObjectTypes.includes(this.getObjectName(relation)));

            //iterate current values, which are nodes of currently processed object type
            for (let j = 0; j < value.length; j++) {
                let currentObject = value[j];

                //iterate relationships and check the Map we have for connection among objects, using the key from config
                let currentObjectRelationship;
                for (let i = 0; i < objectRelationships.length; i++) {
                    currentObjectRelationship = this.getRelationship(objectRelationships[i]);

                    if (currentObjectRelationship.isAnArray) {
                        const relatedObjects = [];
                        const arrayProperty = this.getDottedValue(currentObject, currentObjectRelationship.key);
                        for (let i = 0; i < arrayProperty.length; i++) {
                            let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                                .find(x => x._uuid === this.getDottedValue(arrayProperty[i], currentObjectRelationship.innerKey));
                            relatedObjects.push(relatedObject);
                        }
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, relatedObjects);
                    } else {
                        let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                            .find(x => x._uuid === this.getDottedValue(currentObject, currentObjectRelationship.key));
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, [relatedObject]);
                    }
                }
            }
        });
        return links;
    },

    createLinks(links: [], totalLinkCount: number, currentObject: Object, relatedObjects: []): number {
        let index = totalLinkCount;
        for (let i = 0; i < relatedObjects.length; i++) {
            let relatedObject = relatedObjects[i];

            if (relatedObject && relatedObject._uuid) {
                links.push({
                    "id": index,
                    "source": (currentObject._uuid),
                    "target": (relatedObject._uuid),
                    "value": 1
                });
                index++;
            }
        }
        return index + 1;
    },

    generateRequest(objectTypes: []): [] {
        const APIs = [];
        Object.keys(jsonConfig.objectTypes)
            .filter(objType => objectTypes.includes(objType))
            .map(objectType => {
                    let object = jsonConfig.objectTypes[objectType];
                    APIs.push(object.api + "/");
                }
            );
        return APIs;
    },

    getDottedValue(obj: Object, str: String): Object {
        str = str.split(".");
        for (let i = 0; i < str.length; i++) {
            if (!obj) {
                break;
            }
            obj = obj[str[i]];
        }
        return obj;
    }
};

export default JSONConfigurer;