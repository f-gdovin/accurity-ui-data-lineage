class ObjectTransformer {

    static wrapAsOptions(values: []): [] {
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
                        object: value,
                        selected: false
                    }
                )

            }
        );
        return options;
    }

    static getObjectName(object: Object): String {
        return Object.keys(object)[0] + "";
    }

    static getDottedPropertyValue(obj: Object, property: String) {
        let arr = property.split(".");
        while (arr.length && obj) {
            obj = obj[arr.shift()];
        }
        return obj;
    }

    static removeDuplicitiesByUUID(nodes: []): [] {
        const set = [];
        for (let i = 0; i < nodes.length; i++) {
            const element = nodes[i];
            const existing = set.find(x => x._uuid === element._uuid);
            if (!existing) {
                set.push(element);
            }
        }
        return set;
    }

    static removeDuplicitiesBySourceAndTarget(links: []): [] {
        const set = [];
        for (let i = 0; i < links.length; i++) {
            const element = links[i];
            if (!set.find(x => x.source === element.source && x.target === element.target)) {
                set.push(element);
            }
        }
        return set;
    }
}
export default ObjectTransformer;