"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const builder_util_1 = require("builder-util");
const electron_publish_1 = require("electron-publish");
const fs_extra_p_1 = require("fs-extra-p");
const path_1 = require("path");
class GCSPublisher extends electron_publish_1.HttpPublisher {
    constructor(context, useSafeArtifactName) {
        super(context);
        this.providerName = 'gcs';
        this.useSafeName = true;
        const config = this.getConfig();
        this.useSafeName = useSafeArtifactName || true;
        this.storage = new storage_1.Storage({
            autoRetry: true,
            credentials: config.serviceAccount,
            projectId: config.serviceAccount.project_id
        });
        this.bucket = this.storage.bucket(config.bucket);
    }
    async upload(task) {
        const fileName = (this.useSafeName ? task.safeArtifactName : null) || path_1.basename(task.file);
        const os = task.packager['platform'].name;
        await this.doUpload(fileName, task.file, task.arch || builder_util_1.Arch.x64, os);
    }
    async doUpload(fileName, filePath, arch, os) {
        const config = this.getConfig();
        const appInfo = this.context.packager.appInfo;
        const archName = builder_util_1.Arch[arch];
        const key = config.path
            .replace(/\${name}/g, appInfo.name)
            .replace(/\${os}/g, os)
            .replace(/\${arch}/g, archName)
            .replace(/\${filename}/g, fileName);
        this.context.cancellationToken.createPromise((resolve, reject) => {
            const file = this.bucket.file(key).createWriteStream({
                public: config.public,
                resumable: config.resumable
            });
            fs_extra_p_1.createReadStream(filePath).pipe(file);
            file.on('finish', resolve);
            file.on('error', reject);
        });
    }
    toString() {
        return `${this.providerName} (bucket: ${this.getBucketName()})`;
    }
    getConfig() {
        const packageContent = require(path_1.join(this.context.packager.appDir, 'package.json'));
        const config = Object.assign({ path: '/${name}/${os}/${arch}/${filename}', public: true, resumable: true }, packageContent['publish-gcs']);
        if (typeof process.env.GCS_SERVICE_ACCOUNT === 'string') {
            config.serviceAccount = JSON.parse(process.env.GCS_SERVICE_ACCOUNT);
        }
        else if (typeof config.serviceAccount === 'string') {
            config.serviceAccount = require(config.serviceAccount);
        }
        console.log(config);
        return config;
    }
    getBucketName() {
        return this.getConfig().bucket;
    }
}
exports.default = GCSPublisher;
//# sourceMappingURL=index.js.map