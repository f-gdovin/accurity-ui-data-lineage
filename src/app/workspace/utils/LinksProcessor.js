import JSONConfigProvider from "./JSONConfigProvider";
import ObjectTransformer from "./ObjectTransformer";

class LinksProcessor {

    static generateLinks(nodes: [], selectedObjectTypes: []): [] {
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
            let objectRelationships = JSONConfigProvider.getObjectByItsType(key)['relation_to'];

            //only keep those which are relevant to selected object types
            objectRelationships = objectRelationships.filter(relation =>
                selectedObjectTypes.includes(ObjectTransformer.getObjectName(relation)));

            //iterate current values, which are nodes of currently processed object type
            for (let j = 0; j < value.length; j++) {
                let currentObject = value[j];

                //iterate relationships and check the Map we have for connection among objects, using the key from config
                let currentObjectRelationship;
                let relatedObjectKey;
                for (let i = 0; i < objectRelationships.length; i++) {
                    currentObjectRelationship = this.getRelationship(objectRelationships[i]);
                    relatedObjectKey = currentObjectRelationship.relatedObjectKey ?
                        currentObjectRelationship.relatedObjectKey : "_uuid";

                    if (currentObjectRelationship.isAnArray) {
                        const relatedObjects = [];
                        const arrayProperty = ObjectTransformer.getDottedPropertyValue(currentObject, currentObjectRelationship.key);
                        for (let i = 0; i < arrayProperty.length; i++) {
                            let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                                .find(x => x[relatedObjectKey] === ObjectTransformer.getDottedPropertyValue(arrayProperty[i], currentObjectRelationship.innerKey));
                            relatedObjects.push(relatedObject);
                        }
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, relatedObjects);
                    } else {
                        let relatedObject = sortedNodes.get(currentObjectRelationship.to)
                            .find(x => x[relatedObjectKey] === ObjectTransformer.getDottedPropertyValue(currentObject, currentObjectRelationship.key));
                        totalLinkCount += this.createLinks(links, totalLinkCount, currentObject, [relatedObject]);
                    }
                }
            }
        });
        return links;
    }

    static createLinks(links: [], totalLinkCount: number, currentObject: Object, relatedObjects: []): number {
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
    }

    static getRelationship(object: Object): Object {
        const to = ObjectTransformer.getObjectName(object);
        return {
            to: to,
            key: object[to].key,
            relatedObjectKey: object[to].relatedObjectKey,
            isAnArray: object[to].isAnArray,
            innerKey: object[to].innerKey
        }
    }
}

export default LinksProcessor;