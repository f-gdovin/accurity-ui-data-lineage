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

    getSelectedFromKeys(selectedKeys: []): [] {
        return jsonConfig.objectTypes.filter(objType => selectedKeys.includes(objType));
    },

    generateOptions(): [] {
        const options = [];
        Object.keys(jsonConfig.objectTypes).map(
            (objectType) => {
                let object = jsonConfig.objectTypes[objectType];
                console.log("Creating option from " + object);
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
    generateLinks(nodes: []): [] {
        const subjectAreaNodes = nodes.filter(x => x._type === "subjectArea");
        const entityNodes = nodes.filter(x => x._type === "entity");
        const SA_ENT_Links = [];
        let index = 0;

        for (let i = 0; i < entityNodes.length; i++) {
            let entity = entityNodes[i];
            let usedSubjectArea = subjectAreaNodes.find(x => x._uuid === entity.subjectArea._uuid);

            if (usedSubjectArea && usedSubjectArea._uuid) {
                SA_ENT_Links.push({"id": index, "source": usedSubjectArea._uuid, "target": entity._uuid, "value": 1});
                index++;
            }
        }

        return SA_ENT_Links;
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
};

export default JSONConfigurer;