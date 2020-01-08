class TemplateBuilder {
    constructor() {
        this.name = 'config';
        this.namespace = '';
        this.filename = 'config.json';
        this.location = '/etc';
        this.content = '';
        this.rights = TemplateBuilder.getRights();
        this.versionId = 0;
    }

    setContent(content) {
        this.content = content;
    }

    build() {
        return {
            name: this.name,
            namespace: this.namespace,
            filename: this.filename,
            location: this.location,
            content: this.content,
            rights: this.rights,
            version_id: this.versionId,
        };
    }

    static getRights() {
        return {
            user: {
                read: true,
                write: true,
                execute: true,
            },
            group: {
                read: true,
                write: true,
                execute: true,
            },
            other: {
                read: true,
                write: true,
                execute: true,
            },
        };
    }
}

exports.TemplateBuilder = TemplateBuilder;
