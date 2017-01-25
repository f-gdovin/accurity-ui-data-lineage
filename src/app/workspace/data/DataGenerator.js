import _ from 'underscore';
/**
 * DataGenerator class provides a randomly-generated data to populate graphs with.
 */
const DataGenerator = {

    randomData(nodes, width, height) {
        const oldNodes = nodes;
        // generate some data randomly
        nodes = _.chain(_.range(_.random(10, 100)))
            .map(function() {
                const node = {};
                node.group = _.random(1, 10);
                node.id = "Node: " + node.group;
                return node;
            }).uniq(function(node) {
                return node.key;
            }).value();

        if (oldNodes) {
            let add = _.initial(oldNodes, _.random(0, oldNodes.length));
            add = _.rest(add, _.random(0, add.length));

            nodes = _.chain(nodes)
                .union(add).uniq(function(node) {
                    return node.key;
                }).value();
        }

        let links = _.chain(_.range(_.random(15, 100)))
            .map(function () {
                const link = {};
                link.source = _.random(0, nodes.length - 1);
                link.target = _.random(0, nodes.length - 1);
                link.value = _.random(1, 10);
                link.id = "Link: " + link.source + '>' + link.target + "(" + link.value + ")";
                return link;
            }).uniq((link) => link.key)
            .value();

        this.maintainNodePositions(oldNodes, nodes, width, height);

        return {nodes: nodes, links: links};
    },

    maintainNodePositions(oldNodes, nodes, width, height) {
        const kv = {};
        _.each(oldNodes, function (d) {
            kv[d.key] = d;
        });
        _.each(nodes, function (d) {
            if (kv[d.key]) {
                // if the node already exists, maintain current position
                d.x = kv[d.key].x;
                d.y = kv[d.key].y;
            } else {
                // else assign it a random position near the center
                d.x = width / 2 + _.random(-150, 150);
                d.y = height / 2 + _.random(-25, 25);
            }
        })
    }
};

// export DataGenerator as singleton
module.exports = DataGenerator;