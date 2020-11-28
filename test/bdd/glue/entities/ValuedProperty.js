class ValuedProperty {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    buildKeyValuePropertyInput() {
        return {
            name: this.name,
            value: this.value,
        };
    }
}

exports.ValuedProperty = ValuedProperty;
