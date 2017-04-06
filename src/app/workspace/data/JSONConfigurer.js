const jsonConfig = require('json!../config.json');

const JSONConfigurer = {

    createMetaInformation(): Object {
        return {
            baseURL: jsonConfig.baseURL,
            timeout: jsonConfig.timeout,
            headers: jsonConfig.headers
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
            key: object[to].key
        }
    },

    getSelectedFromKeys(selectedKeys: []): [] {
        return jsonConfig.objectTypes.filter(objType => selectedKeys.includes(objType));
    },

    generateOptions(selectedOptions: [] = null): [] {
        const options = [];
        let sourceArray = [];
        if (selectedOptions) {
            sourceArray = selectedOptions;
        } else {
            sourceArray = Object.keys(jsonConfig.objectTypes);
        }
        sourceArray.map(
            (objectType) => {
                let object = this.getObjectByItsType(objectType);
                options.push(
                    {
                        value: objectType,
                        label: object.label
                    }
                )
            }
        );
        return options;
    },

    //TODO: make this generic and use config
    generateLinks(nodes: [], selectedObjectTypes: []): [] {
        const links = [];

        let index = 0;
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
            objectRelationships.filter(relation => selectedObjectTypes.includes(relation));

            //iterate current values, which are nodes of currently processed object type
            for (let j = 0; j < value.length; j++) {
                let currentObject = value[j];

                //iterate relationships and check the Map we have for connection among objects, using the key from config
                for (let i = 0; i < objectRelationships.length; i++) {
                    let currentObjectRelationship = this.getRelationship(objectRelationships[i]);

                    let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                        .find(x => x._uuid === this.getDottedValue(currentObject, currentObjectRelationship.key));
                    if (relatedObject && relatedObject._uuid) {
                        links.push({"id": index, "source": currentObject._uuid, "target": relatedObject._uuid, "value": 1});
                        index++;
                    }
                }
            }
        });

        return links;
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