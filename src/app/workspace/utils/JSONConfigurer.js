// const jsonConfig = require('json-loader!../config.json');
const jsonConfig = require('json5-loader!../config.json5');
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

    wrapAsNamedObject(value): {} {
        return {name: value};
    },

    wrapAsNamedObjects(array: []): [] {
        const wrapped = [];
        array.forEach(element => {
            wrapped.push(this.wrapAsNamedObject(element));
        });
        return wrapped;
    },

    getRelationship(object: Object): Object {
        const to = this.getObjectName(object);
        return {
            to: to,
            key: object[to].key,
            relatedObjectKey: object[to].relatedObjectKey,
            isAnArray: object[to].isAnArray,
            innerKey: object[to].innerKey
        }
    },

    getSelectedFromKeys(selectedKeys: []): [] {
        return jsonConfig.objectTypes.filter(objType => selectedKeys.includes(objType));
    },

    generateOptionsFromObjectTypes(generateBusinessModel: boolean = true): [] {
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

    generateOptions(values: []): [] {
        const options = [];
        if (!values) {
            values = [];
        }
        values.forEach(
            (value) => {
                options.push(
                    {
                        value: value.name,
                        label: value.name,
                        selected: false
                    }
                )

            }
        );
        return options;
    },

    generateLinks(nodes: [], selectedObjectTypes: []): [] {
        const links = [];

        let totalLinkCount = 0;
        const sortedNodes = new Map();

        selectedObjectTypes = selectedObjectTypes.filter(objType => typeof objType === 'string' || objType instanceof String);

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
                let relatedObjectKey;
                for (let i = 0; i < objectRelationships.length; i++) {
                    currentObjectRelationship = this.getRelationship(objectRelationships[i]);
                    relatedObjectKey = currentObjectRelationship.relatedObjectKey ? currentObjectRelationship.relatedObjectKey : "_uuid";

                    if (currentObjectRelationship.isAnArray) {
                        const relatedObjects = [];
                        const arrayProperty = this.getDottedValue(currentObject, currentObjectRelationship.key);
                        for (let i = 0; i < arrayProperty.length; i++) {
                            let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                                .find(x => x[relatedObjectKey] === this.getDottedValue(arrayProperty[i], currentObjectRelationship.innerKey));
                            relatedObjects.push(relatedObject);
                        }
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, relatedObjects);
                    } else {
                        let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                            .find(x => x[relatedObjectKey] === this.getDottedValue(currentObject, currentObjectRelationship.key));
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, [relatedObject]);
                    }
                }
            }
        });
        return links;
    },

    computeFlow(initData: {}): {} {
        const links = [];

        const originNodes = initData.originNodes;
        const targetNodes = initData.targetNodes;

        let originIndex = 0;
        let targetIndex = originNodes.length;

        for (let i = 0; i < originNodes.length; i++) {
            const originNode = originNodes[i];

            for (let j = 0; j < targetNodes.length; j++) {
                const targetNode = targetNodes[j];
                links.push({
                    source: originIndex,
                    target: targetIndex,
                    value: 50 + 5*originIndex + 5*targetIndex
                });
                targetIndex++;
            }
            originIndex++;
        }

        return {
            links: links,
            nodes: []
        };
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
                    if (object.alsoLoad) {
                        let objectWithChild = {
                            api: null,
                            children: []
                        };
                        objectWithChild.api = object.api + "/";

                        object.alsoLoad.forEach(toLoad => {
                            let relatedName = jsonConfig.objectTypes[this.getObjectName(toLoad)];
                            let child = {
                                api: relatedName.api + "/",
                                parentType: objectType,
                                childType: this.getObjectName(toLoad),
                                key: toLoad[this.getObjectName(toLoad)].key,
                                intoProperty: toLoad[this.getObjectName(toLoad)].intoProperty
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