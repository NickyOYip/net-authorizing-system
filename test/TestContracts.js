const { expect } = require('chai');
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

const Factory = artifacts.require('Factory');
const User = artifacts.require('User');
const Certificate = artifacts.require('Certificate');

contract('Factory, User, and Certificate Contracts', (accounts) => {
    const [owner, user1, user2, attacker] = accounts;
    let factory, user, certificate;

    const publicKey = "user1_public_key";
    const activeCode = "secure_activation_code";
    const hash = web3.utils.keccak256("certificate_data");

    before(async () => {
        factory = await Factory.new({ from: owner });

        // Deploy User contract via Factory
        const tx = await factory.createUser(publicKey, { from: user1 });
        const userAddress = tx.logs[0].args.userAddress;
        user = await User.at(userAddress);

        // Deploy Certificate contract
        certificate = await Certificate.new(user1, activeCode, user.address, hash, { from: owner });
    });

    describe('Factory Contract Tests', () => {
        it('should create a new User contract', async () => {
            const userAddress = await factory.userAddress(user1);
            expect(userAddress).to.not.equal('0x0000000000000000000000000000000000000000');
        });

        it('should not allow creating multiple User contracts for the same address', async () => {
            await expectRevert(
                factory.createUser("new_key", { from: user1 }),
                "User already exists."
            );
        });
    });

    describe('User Contract Tests', () => {
        it('should initialize with correct public key', async () => {
            const key = await user.publicKey();
            expect(key).to.equal(publicKey);
        });

        it('should allow the owner to add a certificate address', async () => {
            await user.addCertificateAddress(certificate.address, "encrypted_view_code", { from: user1 });
            const viewCode = await user.getViewCode(certificate.address, { from: user1 });
            expect(viewCode).to.equal("encrypted_view_code");
        });

        it('should prevent non-owners from modifying data', async () => {
            await expectRevert(
                user.addCertifiedCertificateAddress(certificate.address, { from: attacker }),
                "Ownable: caller is not the owner"
            );
        });
    });

    describe('Certificate Contract Tests', () => {
        it('should initialize in the Inactive state', async () => {
            const state = await certificate.state();
            expect(state.toString()).to.equal('0'); // Inactive
        });

        it('should activate the certificate with correct active code', async () => {
            await certificate.activateCertificate(user1, activeCode, { from: user1 });
            const state = await certificate.state();
            expect(state.toString()).to.equal('1'); // Active
        });

        it('should fail to activate with wrong code or after time limit', async () => {
            await expectRevert(
                certificate.activateCertificate(user1, "wrong_code", { from: user1 }),
                "Invalid activation code."
            );

            const expiredCert = await Certificate.new(user1, activeCode, user.address, hash, { from: owner });
            await time.increase(time.duration.days(2)); // Move forward 2 days

            await expectRevert(
                expiredCert.activateCertificate(user1, activeCode, { from: user1 }),
                "Activation time expired."
            );
        });

        it('should allow owner to update certificate state', async () => {
            await certificate.updateState(2, time.latest() + time.duration.days(1), { from: owner }); // Disabled
            const state = await certificate.state();
            expect(state.toString()).to.equal('2'); // Disabled
        });

        it('should return certificate data and hash only when active', async () => {
            const certActive = await Certificate.new(user1, activeCode, user.address, hash, { from: owner });
            await certActive.activateCertificate(user1, activeCode, { from: user1 });

            const certData = await certActive.getCertificate();
            expect(certData[1]).to.equal(hash); // Check hash
        });

        it('should restrict data updates to the certificate owner', async () => {
            await expectRevert(
                certificate.updateData("new_data", { from: attacker }),
                "Unauthorized: Only the user can update data."
            );

            await certificate.updateData("new_data", { from: user1 });
            const certData = await certificate.getCertificate();
            expect(certData[0]).to.equal("new_data");
        });
    });
});
