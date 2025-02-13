// User Contract Data
class User {
    constructor(certificatesList = [], certifiedCertificates = []) {
        this.certificatesList = certificatesList; // Certificates owned by user
        this.certifiedCertificates = certifiedCertificates; // Certificates certified by user
    }
}
export { User };